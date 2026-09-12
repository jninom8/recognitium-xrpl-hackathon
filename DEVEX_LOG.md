# Recognitium developer-experience log

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
