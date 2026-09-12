import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { spawn, type ChildProcess } from "node:child_process";
import { once } from "node:events";
import { mkdtemp, rm, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, sep } from "node:path";
import { IntakeService } from "../src/requests/intake.js";
import { Store } from "../src/requests/store.js";
import type { FinancingRequest } from "../src/shared/intake.js";

const example = () => ({
  clientRequestId: "request-" + randomUUID(),
  requestedDrops: "100000001",
  requestedDays: 30,
  purpose: "inventory",
  synthetic: true,
});
async function clean(directory: string) {
  const target = resolve(directory);
  assert.ok(
    target.startsWith(resolve(tmpdir()) + sep) &&
      target.includes("recognitium-intake-test-"),
  );
  await rm(target, { recursive: true, force: true });
}
test("intake keeps exact details immutable and does not rewind broker review on retry", async () => {
  const directory = await mkdtemp(join(tmpdir(), "recognitium-intake-test-"));
  try {
    const service = new IntakeService(new Store<FinancingRequest>(directory)),
      input = example();
    for (const mutation of [
      { requestedDrops: "1.1" },
      { requestedDrops: "999999" },
      { requestedDays: 0 },
      { purpose: ["inventory"] },
      { synthetic: false },
      { document: "unaccepted content" },
    ])
      await assert.rejects(service.create({ ...input, ...mutation }));
    const first = await service.create(input);
    await assert.rejects(
      service.create({ ...input, requestedDrops: "200000000" }),
      /different details/,
    );
    const decision = {
      expectedRevision: 1,
      requestDigest: first.requestDigest,
      decision: "start-review",
    };
    const reviewed = await service.review(first.clientRequestId, decision);
    assert.equal(reviewed.status, "UNDER_REVIEW");
    assert.equal(reviewed.revision, 2);
    assert.deepEqual(
      await service.review(first.clientRequestId, decision),
      reviewed,
    );
    assert.deepEqual(await service.create(input), reviewed);
    await assert.rejects(
      service.review(first.clientRequestId, {
        ...decision,
        decision: "finish-review",
      }),
      /changed/,
    );
    const final = await service.review(first.clientRequestId, {
      ...decision,
      expectedRevision: 2,
      decision: "finish-review",
    });
    assert.equal(final.status, "REVIEWED");
    assert.equal(final.history.length, 3);
    assert.equal((await service.list()).length, 1);
    assert.equal("agreementHash" in final, false);
    assert.equal("transaction" in final, false);
  } finally {
    await clean(directory);
  }
});
test(
  "borrower and broker HTTP clients share persisted intake after restart, with role and origin checks and no loan",
  { timeout: 30000 },
  async () => {
    const directory = await mkdtemp(join(tmpdir(), "recognitium-intake-test-"));
    const port = 36000 + Math.floor(Math.random() * 10000),
      base = "http://127.0.0.1:" + port;
    const tokens = {
      borrower: "R".repeat(32),
      broker: "B".repeat(32),
      operator: "O".repeat(32),
    };
    let child: ChildProcess | undefined;
    async function start() {
      child = spawn(process.execPath, ["dist/src/server/index.js"], {
        env: {
          ...process.env,
          PORT: String(port),
          RECOGNITIUM_DATA_DIR: directory,
          RECOGNITIUM_WALLET_DIR: join(directory, "wallets"),
          DASHBOARD_LIVE_CHECKS: "0",
          TRACK1_MENTOR_OPEN_ENDED_TRIAL: "0",
          RECOGNITIUM_API_KEY: "",
          PROTOTYPE_BORROWER_TOKEN: tokens.borrower,
          PROTOTYPE_BROKER_TOKEN: tokens.broker,
          PROTOTYPE_OPERATOR_TOKEN: tokens.operator,
        },
        stdio: ["ignore", "pipe", "pipe"],
        windowsHide: true,
      });
      await Promise.race([
        once(child.stdout!, "data"),
        once(child, "exit").then(() => {
          throw Error("Server exited");
        }),
        new Promise((_, reject) => {
          const timer = setTimeout(
            () => reject(Error("Server startup timeout")),
            10000,
          );
          timer.unref();
        }),
      ]);
    }
    async function stop() {
      if (child && child.exitCode === null) {
        const done = once(child, "exit");
        child.kill();
        await done;
      }
    }
    const call = (
      path: string,
      role: "borrower" | "broker" | "operator",
      input?: unknown,
      origin?: string,
    ) =>
      fetch(base + path, {
        method: input ? "POST" : "GET",
        headers: {
          Authorization: "Bearer " + tokens[role],
          ...(input ? { "Content-Type": "application/json" } : {}),
          ...(origin ? { Origin: origin } : {}),
        },
        ...(input ? { body: JSON.stringify(input) } : {}),
      });
    try {
      await start();
      const input = example();
      assert.equal((await fetch(base + "/api/intake?role=broker")).status, 401);
      assert.equal((await call("/api/intake", "broker", input)).status, 401);
      assert.equal(
        (
          await call(
            "/api/intake",
            "borrower",
            input,
            "https://untrusted.invalid",
          )
        ).status,
        409,
      );
      const responses = await Promise.all([
        call("/api/intake", "borrower", input),
        call("/api/intake", "borrower", input),
      ]);
      assert.ok(responses.some((r) => r.status === 200));
      assert.ok(responses.every((r) => [200, 409].includes(r.status)));
      assert.equal((await call("/api/intake", "borrower", input)).status, 200);
      const inbox = await (
        await call("/api/intake?role=broker", "broker")
      ).json();
      assert.equal(inbox.requests.length, 1);
      const request = inbox.requests[0];
      assert.equal(
        (
          await call(
            "/api/intake/" + request.clientRequestId + "/review",
            "borrower",
            {
              expectedRevision: 1,
              requestDigest: request.requestDigest,
              decision: "start-review",
            },
          )
        ).status,
        401,
      );
      assert.equal(
        (
          await call(
            "/api/intake/" + request.clientRequestId + "/review",
            "broker",
            {
              expectedRevision: 1,
              requestDigest: request.requestDigest,
              decision: "start-review",
            },
          )
        ).status,
        200,
      );
      assert.ok(
        !(await readdir(directory)).includes("writer.lock"),
        "Acknowledged writes have released their lock",
      );
      await stop();
      await start();
      const borrower = await (
        await call("/api/intake?role=borrower", "borrower")
      ).json();
      assert.notEqual(borrower.instanceId, inbox.instanceId);
      assert.equal(borrower.requests.length, 1);
      assert.equal(borrower.requests[0].status, "UNDER_REVIEW");
      const state = await (await fetch(base + "/api/state")).json();
      assert.equal(state.connected, false);
      assert.equal(state.health.ledger.status, "unchecked");
      assert.equal(state.requests.length, 0);
      assert.equal(state.cycle, null);
      assert.doesNotMatch(
        JSON.stringify(state),
        new RegExp(request.clientRequestId),
      );
      assert.ok(!(await readdir(directory)).includes("wallets"));
      const retried = await call("/api/intake", "borrower", input);
      assert.equal(retried.status, 200, JSON.stringify(await retried.json()));
      assert.equal(
        (await (await call("/api/intake?role=borrower", "borrower")).json())
          .requests[0].revision,
        2,
      );
    } finally {
      await stop();
      await clean(directory);
    }
  },
);
