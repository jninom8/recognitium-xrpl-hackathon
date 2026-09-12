# Track 1 connectivity: reproduced failure and recovery across network changes

Technical observation record, not the participant-written final report.
All diagnostics were read-only and kept certificate verification enabled.

## Controlled comparison on September 12, 2026

Same computer, Node 24.19.0, xrpl.js 5.2.0, code and advertised event endpoints.

| Test | Venue Wi-Fi, 11:59 UTC | Phone hotspot, 12:23 UTC | Back on venue Wi-Fi, 14:20 UTC |
|---|---|---|---|
| HTTP server_info, port 51234 | UND_ERR_CONNECT_TIMEOUT, 10,840 ms | success, 960 ms | UND_ERR_CONNECT_TIMEOUT, 10,857 ms |
| Native WebSocket server_info, port 51233 | error, 10,723 ms | success, 986 ms | connection error, 10,758 ms |
| xrpl.js server_info, port 51233 | NotConnectedError / read ECONNRESET, 21,657 ms | success, 1,582 ms | NotConnectedError / read ECONNRESET, 21,699 ms |
| npm HTTPS control, port 443 | HTTP 200, 326 ms | HTTP 200, 699 ms | HTTP 200, 335 ms |
| Node TLS on 51233/51234 | TCP connects, TLS stalls 12-15 seconds | valid certificates, TLS succeeds in 816/809 ms | Dedicated TLS probe not repeated |

After another founder-reported Wi-Fi change, the same probe succeeded at
**15:01:56.944-15:01:57.841 UTC**: HTTP 573 ms, native WebSocket 553 ms, xrpl.js
766 ms, npm HTTPS control HTTP 200 in 318 ms. The event server remained network
4001, rippled 3.4.0-rc1, state full, validated ledger 68408. The new Wi-Fi's
identity is not recorded or needed for this public evidence. Certificate
validation and the official event endpoints remained unchanged.

The first successful event ledger reports rippled `3.4.0-rc1`, network ID `4001`,
server state `full`, ledger 65244, base reserve 10 XRP and incremental reserve
2 XRP. The reserve values differ from the generic workshop slide's 1/0.2 XRP.
Live server settings govern the test-funded build.

## Causal conclusion and limits

Changing to the hotspot resolved the failure without changing endpoints, SDK,
TLS validation or application code. The founder then returned to venue Wi-Fi;
the same probe reproduced the failure at 14:20:00-14:20:22 UTC (16:20 Paris).
This venue/hotspot/venue comparison strengthens attribution to the network path,
although it is sequential, not a simultaneous controlled comparison. It does
not isolate congestion, firewall filtering, traffic
inspection or another intermediary. The mentor's congestion explanation remains
attributed rather than independently proven. No XRPL protocol defect is claimed.

Local DNS, Google Public DNS over HTTPS and Cloudflare returned the same five
IPv4 addresses. TLS 1.2 and 1.3 stalled on venue Wi-Fi; three resolved addresses
behaved alike. Plaintext read-only server_info also received no application
response and was never used as an application workaround.

A separate control found that the ledger hostname on **port 443** presents a
certificate covering only `lending-hackathon-faucet.dev.ripplex.io`. Node returned
ERR_TLS_CERT_ALTNAME_INVALID and Windows curl returned SEC_E_WRONG_PRINCIPAL.
Port 443 is not the published RPC/WSS endpoint. Successful TLS on 51233/51234
over the hotspot demonstrates that the 443 mismatch was not the blocker there.
Do not present that separate observation as the cause of the lending outage.

## Reproduction and proposal

```sh
node scripts/probe.mjs --long
node scripts/transport-probe.mjs
node scripts/dns-probe.mjs
```

Run the same commands on venue Wi-Fi and a known-working network. Exact private
outputs are timestamped in ignored data/probes/. Deeper optional probes are
scripts/diagnose-event.mjs and scripts/certificate-probe.mjs. No credentials,
faucet requests or transactions are involved.

Proposed onboarding improvement: test event WSS/RPC from venue Wi-Fi before
opening the event, publish a supported fallback network or port-443 endpoint,
and provide a one-command transport/SDK/amendment check. Mentor/network-operator
logs would be needed to identify the exact venue policy or failing component.

The DevEx hook uses a different destination and remained reachable on venue
Wi-Fi: HTTP 200 accepted another 18 captured events at 14:29:35 UTC, reaching
187 cumulative accepted events. Ledger connection failure does not imply hook
delivery failure. Local recovery tests and source review continued without
using another ledger network or moving additional test funds.
