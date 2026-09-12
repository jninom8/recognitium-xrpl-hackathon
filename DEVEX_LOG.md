# Recognitium developer-experience log

## LIVE-001: mentor-guided native origination succeeded

- September 12, network 4001, rippled 3.4.0-rc1, stable xrpl.js 5.2.0.
  Same event endpoint, hotspot transport, explicit mentor-authorized open-ended
  trial. Enabled V1.1 did not prevent vault/broker creation or this LoanSet.
- Founder approved both synthetic roles and exact agreement/transaction hashes.
  LoanSet `54A285546C2F2A4374C698E2EA00CC82778F408163D30C49898A28B8C4FB75FA`
  validated `tesSUCCESS` at ledger 66253. Borrower AccountRoot delta:
  100000000 drops (100 test XRP). No separate draw transaction.
- Direct Recognitium receipt issuance returned HTTP 403. The authorized hosted
  MCP sealed the agreement once (1 tick), receipt
  `DG-05926b4f9e004086811e36045a5ae5a2`; the application independently checked
  commitment/chain consistency and the official receipt lookup before signing.
  Execution receipt `DG-e3db6da409604aea9e120f3f8a9ad01f` cost 1 tick and was
  attached after validated funding. No retry of the denied direct issuance.

## LIVE-002: available liquidity refusal, then late-payment recovery

- With 200 test XRP deposited and 100 lent, VaultWithdraw of 200 test XRP
  validated `tecINSUFFICIENT_FUNDS`:
  `91155FEB49C6029CDAA0A63D360A26203B5D95299FD57B2EB17BBFDEAC76333E`.
  Vault state was identical before/after; available assets were 100000000 drops.
  This is expected protocol protection, not a fabricated bug.
- `npm run cycle -- repay --mentor-confirmed-open-ended` submitted normal
  LoanPay for stored debt 100000020 drops. It validated `tecEXPIRED` at ledger
  66325, hash `4B4FBAEAC1897449A0551DC2156F18BEE795D5DD531FB366988BF686132E4421`.
- Cause: the 60-second payment due date had passed during the interactive
  evidence/receipt workflow. XLS-66 section 3.11.4 documents `tecEXPIRED` for
  late payments without `tfLoanLatePayment`; installed SDK exposes this flag
  as 0x00040000. This is application scheduling friction, not connection failure.
- Correction: preserve the conclusively refused transaction and use a separate
  durable `repay-late` journal with the late-payment flag. Only this confirmed
  refusal permits the new payment; unresolved submissions never do. This demo's
  approved late fee and late interest rate are both zero. The corrected call
  completed successfully; final withdrawal and measured yield are checked next.
- Developer lesson: a 60-second loan plus manual verification can exceed its
  due date. Show ledger payment status and support explicit late payments in
  examples. Keep actual refusal and recovery visible in the journey.

## HOOK-004: continued runtime delivery

- Identity audit: display name Recognitium, normalized team `recognitium`,
  consent recorded 11:05:54 UTC, earliest retained event 11:11:29 UTC. All
  106 sent records agree with this team. No identity/invite values exported.

- At 13:18:08 UTC, `node scripts/hook-status.mjs --flush` delivered 62 existing
  captured events, HTTP 200; cumulative accepted events 106, buffer zero.
  Hook version 2.4.0, project hooks registered. No invented events or manual
  participant report submitted. Raw logs, invite and identity remain ignored.

## LIVE-003: completed repayment, withdrawal and independent reproduction

- Corrected late LoanPay validated `tesSUCCESS`, ledger 66381,
  `36E9486F270C529802A27D66EBAD42AEA5D5F58985DEC20F04695ECC3E07DE1E`.
- VaultWithdraw validated `tesSUCCESS`, ledger 66407,
  `D6B0DE03F46ED7AC320079B05366331F05048C9F49D09D22D6EFA909DA215C72`.
  Actual proceeds 200000020 drops, deposit 200000000, realised gross interest
  20 drops. Withdrawal transaction fee 12 drops, separately reconciled.
- `npm run verify -- data/exports/synthetic-supplier-001.json --online
  --mentor-confirmed-open-ended` passed: both signatures valid, content and
  receipt chain consistent, official authority records verified, all saved
  native transactions matched fresh validated XRPL lookups.
- Public-safe synthetic bundle retained under `evidence/`. A recursive export
  field check excluded seeds, secrets, signed blobs, identity/invite fields.
  The synthetic document text was reviewed before copying. No source deck,
  private company document, wallet or raw hook log is published.

## BUILD-001: real SDK install and endpoint rechecks

Resolved transport blocker: hotspot comparison at 12:23 UTC succeeds on the same
endpoints and SDK. See [controlled network investigation](docs/NETWORK_FINDING.md).
Venue path strongly implicated; congestion versus filtering remains unisolated.
The separate 443 faucet-only certificate is not the advertised-port blocker.

- September 12, 2026, fresh implementation session; integration lead with Codex.
- Node `v24.19.0`, npm `11.17.0`. `npm view xrpl version --fetch-retries=0
  --fetch-timeout=12000` returned `5.2.0` outside the sandbox. The first attempt
  returned `EACCES` inside the network sandbox; this is host policy, not an XRPL bug.
- Installed exact `xrpl@5.2.0` and explicit codec/keypair versions `2.11.0`/`3.1.0`.
  The initial xrpl installation reported 17 packages in 39 seconds, zero audit
  vulnerabilities. Source uses TypeScript with the same JavaScript SDK recommended
  on workshop p.9; the event matrix specifies stable for Track 1.
- Reproduction: `node scripts/probe.mjs` outside the sandbox. At
  `2026-09-12T11:19:42.608Z`, HTTP server_info failed in 10,914 ms with
  `UND_ERR_CONNECT_TIMEOUT`; native WebSocket failed in 10,777 ms. No accounts
  funded and no signed transaction submitted.
- After mentor feedback, `node scripts/probe.mjs --long`, at
  `2026-09-12T11:30:30.720Z`: HTTP failed in 10,810 ms with
  `UND_ERR_CONNECT_TIMEOUT`; native WebSocket failed in 10,725 ms; actual
  `xrpl.js@5.2.0` failed in 19,248 ms with `NotConnectedError: read ECONNRESET`.
  HTTPS 443 control `https://registry.npmjs.org/xrpl/latest` returned HTTP 200,
  version 5.2.0, in 318 ms. Fetch's connection timeout fired before the larger
  overall deadline; simply increasing that deadline did not solve connectivity.
- Founder relayed mentor's explanation that crowded venue Wi-Fi is responsible
  and this should be recorded in the developer journey. That explanation is
  attributed; the measurements do not distinguish port filtering, congestion,
  upstream reset or event-server availability. Hotspot comparison requested.
- Local exact JSON is under ignored `data/probes/`. Endpoints remain those in
  the event Track 1 brief; no switch to generic Testnet or Track 2 was made.
- Proposal: supply the same health command in onboarding with transport/SDK
  timings, amendment checks and a venue/hotspot comparison, plus mentor-confirmed
  port requirements or a supported 443 endpoint if nonstandard ports are blocked.

## BUILD-002: verified mandatory hook runtime and delivery

- Hook 2.4.0, already consented, project-local and trusted through supported UI.
- Live lifecycle flush: 4 events accepted at `2026-09-12T11:15:55.330Z`.
- `node scripts/hook-status.mjs --flush` uses the installed hook's own buffer API.
  At `2026-09-12T11:30:36.930Z`, it reported `ok:true`, `sent:14`, `remaining:0`,
  `status:200`. Total sent became 18. Later counters show actual tool_result and
  package_install capture. This is more than registration or fabricated smoke data.
- Raw hook records, invite, identity and participant mapping remain ignored.
  The helper reports its own check time; upstream `last_flush_at` reflects earlier
  lifecycle flushes. Automatic capture is distinct from the human-written report.

## BUILD-003: SDK co-signing and local recovery checks

- `npm test` compiles with exact TypeScript 7.0.2 then uses Node's test runner.
  Expanded run: 11 tests, 11 passed, 0 failed; Node reported 4,467.7937 ms.
- Actual stable SDK `signLoanSetByCounterparty` is available. Independently
  verifying the broker and borrower signing encodings succeeds; changing Data,
  principal, counterparty, NetworkID, fee or LastLedgerSequence invalidates both.
  These are real local signatures, not evidence of an event-ledger LoanSet.
- The installed SDK validators accept all seven native transaction builders.
- Explicit simulated tests reject changed document/amount/network/expiry/metadata,
  wrong approval hashes and missing agreement receipts. A simulated submission
  reset followed by restart, validated funding and receipt outage retains the same
  signed transaction and recovers the missing receipt without another origination.
- API tests show disconnected state, reject unauthenticated/wrong-role writes and
  cross-origin approval, and do not serve wallet files. These checks are scoped to
  the local prototype, not a production authentication/security audit.
- Initial `tsx` invocation failed on this host with `ERR_SYSTEM_ERROR:
  uv_os_get_passwd returned ENOMEM`. Removed the unnecessary runtime dependency;
  compiling TypeScript and running ordinary JavaScript avoids it. TypeScript also
  required explicit rootDir and SubmittableTransaction typing; corrected locally.
- Positive SDK behavior: typed native transaction models and a dedicated second
  signature helper are available in the prescribed stable package. No raw codec
  patch or beta substitution was required for local serialization.

## BUILD-004: real Recognitium adapter probe, no lending claim

- Authorized one-tick synthetic hash seal at `2026-09-12T11:31:11Z` through the
  existing MCP. Text: `Recognitium XRPL integration probe v1; synthetic; no loan
  or payment asserted.` SHA-256:
  `5d1f5422917315e16a2b119d91c275b7085af2f56103f6914b3d9a444cbcc10a`.
- Receipt `DG-8ab218c99d844c4a92b0385f87475887`, authority sequence 166320.
  Public GET `/v1/verify/receipt/<id>` returned HTTP 200; historical chain_at at
  166320 returned the matching tip. Current service identifies as classical.
- `node dist/scripts/receipt-probe.js` passed against the public API at
  `2026-09-12T11:45:49.483Z`: content consistent, chain hash consistent, official
  authority record online-verified, XRPL validation not applicable.
- The issuance JSON timestamp is an unsafe JS Number if parsed normally. The
  adapter preserves raw wire text and Node 24 JSON reviver source; receipt lookup
  supplies the nanosecond timestamp as a string. A test guards exact preservation.
- A self-consistent fake chain link is not sufficient authority evidence. The
  application additionally retrieves the receipt by ID from the official TLS
  origin and compares its bound fields. Offline verification says online lookup
  required; this does not claim an independent external anchor or key signature.
- No idempotency key is assumed for metered receipt issuance. Ambiguous issuance
  is durable and recoverable by ID; automatic recharging and relending are blocked.

## BUILD-005: advertised Track 1 server has V1.1 enabled

- After the hotspot fixed connectivity, `npm run cycle -- setup` connected,
  inspected the validated Amendments ledger object and stopped before creating
  or funding wallets: `Lending V1.1 detected; Track 1 requires mentor review`.
- Independent read-only confirmation: `node scripts/environment-probe.mjs`,
  `2026-09-12T12:45:35.197Z` to `12:45:36.845Z`, network 4001, server 3.4.0-rc1,
  validated ledger 65683. Both the Amendments object and `feature` RPC report
  LendingProtocolV1_1 enabled and supported. Amendment ID:
  `A360E2BFD775A5B0DCE1C36C16DF31B72735A57584FD163655D2F9564F8E7AC8`.
- SingleAssetVault and LendingProtocol also enabled. The generic workshop's
  reserve amounts do not match this server: live base 10 XRP, increment 2 XRP.
  The adapter uses actual autofill fees and permits VaultCreate's special
  owner-reserve fee within a separate test-only cap.
- Event matrix expectation: custom endpoint serves V1 for open-ended Track 1.
  Official current [closed-ended vault documentation](https://opensource.ripple.com/docs/lending-protocol-v1-1/closed-ended-vaults)
  says V1.1 restricts LoanBrokerSet on open-ended vaults. Existing open-ended
  loans retain servicing paths; it is inaccurate to say every LoanSet or LoanPay
  is categorically disabled on every old open-ended vault.
- Classification: confirmed event-matrix/amendment mismatch, not a witnessed
  on-chain transaction refusal. We have not spent test funds to manufacture a
  predictable failure or claimed that the application's gate is native rejection.
- Asked founder to obtain mentor guidance: V1 endpoint, or coordinated Track 2
  switch including beta SDK and phase acceptance tests. Track remains unchanged.
- Proposed fix: publish an environment preflight checking enabled amendments,
  not just a reachable WebSocket, and keep the event SDK/network matrix current.

Founder subsequently relayed explicit mentor guidance: open-ended lending works
on the advertised endpoint despite the documentation; test it there. A scoped
trial flag now permits V1.1 on event network 4001 without switching Track 1 or
the stable SDK. This is authorization to test, not evidence of ledger success.

Subsequent real trial: VaultCreate, VaultDeposit, LoanBrokerSet and
LoanBrokerCoverDeposit all validated tesSUCCESS (ledgers 66039, 66041, 66043,
66044). The mentor's guidance holds for broker creation on this event server.
The enabled amendment name alone did not predict its behavior; the published
open-ended LoanBrokerSet restriction did not apply in this observed case.

## BUILD-006: local checkpoint

- Latest full local run before publication: 13 tests passed, zero failed.
  Scope includes installed SDK signatures, receipt integrity and authority
  comparisons, state recovery, repeated signed-blob reuse, writer locks and API
  access checks. These are not validated native lending results.
- Mandatory hook at 12:03:55 UTC: HTTP 200 accepted 26 additional events,
  44 cumulative sent, zero buffered at that observation. Automatic capture
  remains active. Official participant report was not generated.

Keep raw observations here. Promote only reproduced, clearly scoped findings
to the final three-page report. Never include wallet seeds, API credentials,
private invoices or unrelated project data.

## Entry template

- ID and time:
- Reporter / role:
- Track, endpoint, exact SDK and server version:
- Category: client libraries / UX / missing primitive / documentation / other
- Attempted action:
- Expected result and source of expectation:
- Observed result, exact code and relevant metadata:
- Minimal reproduction command or transaction link:
- Impact and time lost:
- Workaround:
- Proposed fix:
- Reproduction status:
- Positive behavior worth preserving:

## PRE-001: custom Track 1 RPC did not respond during planning

- Date: 12 September 2026, before implementation.
- Endpoint: `https://lending-hackathon.dev.ripplex.io:51234/`.
- Request: HTTP POST, JSON `{"method":"server_info","params":[{}]}`.
- Tool: Python requests; no xrpl.js installed for this probe.
- Expected: a server_info response from the endpoint listed in the event brief.
- Actual: read timeout after 18 seconds.
- Separate read-only probe: native Node 24.19.0 WebSocket connection to
  `wss://lending-hackathon.dev.ripplex.io:51233` also timed out after 10 seconds.
  No funded account or signed transaction was involved in either probe.
- Classification: untriaged connectivity observation, not a confirmed XRPL defect.
- Next check: compare the same request on the venue network and mentor machine;
  confirm the event endpoint and examine WebSocket connectivity.
- Suggested improvement if reproduced as an onboarding issue: publish a
  one-command health check and verified environment/version matrix.

## Candidate experiments, not findings yet

- First-loss cover field names versus actual behavior.
- Broker/borrower co-signing order and helper availability.
- Insufficient available liquidity versus sufficient total vault assets.
- Accrued yield, realised repayment and withdrawable capital in the UI.
- Wrong network/SDK combination and the resulting error.
- Timeout recovery without duplicate submission or disbursement.
- Documentation/example/explorer differences from validated ledger results.

Do not prewrite expected result codes as if observed. Do not report a missing
feature until checking the current SDK, documentation and a mentor's explanation.

## DOC-001: presentation duration differs between supplied sources

- Date: 12 September 2026, workshop-material review.
- Challenge PDF, page 6: "5 min presentation + live demo" and "3 min Q&A".
- Source: `reference/XRPL Lending Protocol Hackathon Challenge.pdf`.
- The public Notion brief lists four minutes of demo and two minutes of Q&A.
- Source: https://holly-pixie-8e9.notion.site/XRPL-Lending-Protocol-Hackathon-3152f6835886823ab31f01cd9d1f6ded
- Classification: confirmed event-document discrepancy, not a protocol defect.
- Status: awaiting mentor confirmation; neither version treated as superseded.
- Impact: affects live-demo pacing. No measured implementation time lost.
- Suggested fix: synchronize the two sources and announce one current duration.

## EXP-001: withdrawal eligibility versus available liquidity

- Status: designed experiment, not executed and not a confirmed bug.
- Starting observation: the introductory slides, page 12, describe open-ended
  withdrawals as always permitted without a lock.
- The official VaultWithdraw reference separately specifies
  `tecINSUFFICIENT_FUNDS` when liquidity cannot fill a withdrawal request:
  https://xrpl.org/docs/references/protocol/transactions/types/vaultwithdraw
- Experiment: deposit, lend a substantial fraction, then attempt a withdrawal
  within the depositor's share value but above available vault liquidity.
- Record current event-server behavior; do not assume its exact error code.
- UI candidate: show share value and available cash as separate quantities,
  explain the native rejection, then repeat after repayment restores liquidity.
- Feedback target: whether the examples make this distinction easy to discover.
  A correct protocol refusal is positive evidence, not a vulnerability.

## PRE-002: isolated project and hook readiness

- Date: 12 September 2026, before application implementation.
- New Desktop Git repository contains the hackathon-only plan and handoff.
- Hook version 2.4.0 downloaded at revision
  `6b1f4755e1de8520d23f4c9b6e404c6c9c75fe4d`.
- Read-only invite check: organiser endpoint reachable, invite-only event.
- Local status: no identity, hooks unregistered, zero captured/sent events.
- This is setup evidence, not proof that capture works. Plan review precedes
  activation; a real fresh-session event and accepted flush must be checked.
