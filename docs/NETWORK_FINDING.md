# Track 1 connectivity: venue failure, hotspot success

Technical observation record, not the participant-written final report.
All diagnostics were read-only and kept certificate verification enabled.

## Controlled comparison on September 12, 2026

Same computer, Node 24.19.0, xrpl.js 5.2.0, code and advertised event endpoints.

| Test | Venue Wi-Fi, 11:59 UTC | Phone hotspot, 12:23 UTC |
|---|---|---|
| HTTP server_info, port 51234 | UND_ERR_CONNECT_TIMEOUT, 10,840 ms | success, 960 ms |
| Native WebSocket server_info, port 51233 | error, 10,723 ms | success, 986 ms |
| xrpl.js server_info, port 51233 | NotConnectedError / read ECONNRESET, 21,657 ms | success, 1,582 ms |
| npm HTTPS control, port 443 | HTTP 200, 326 ms | HTTP 200, 699 ms |
| Node TLS on 51233/51234 | TCP connects, TLS stalls 12-15 seconds | valid certificates, TLS succeeds in 816/809 ms |

The first successful event ledger reports rippled `3.4.0-rc1`, network ID `4001`,
server state `full`, ledger 65244, base reserve 10 XRP and incremental reserve
2 XRP. The reserve values differ from the generic workshop slide's 1/0.2 XRP.
Live server settings govern the test-funded build.

## Causal conclusion and limits

Changing to the hotspot resolved the failure without changing endpoints, SDK,
TLS validation or application code. This strongly localizes the blocker to the
venue network path. It does not isolate congestion, firewall filtering, traffic
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
