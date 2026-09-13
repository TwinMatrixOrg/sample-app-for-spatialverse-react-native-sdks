# 05 — Wayfinding live WithinTerminal → arrival

**What to build:** From the Wayfinding preview, the user starts live WithinTerminal navigation and gets RWS-like chrome: live HUD/top bar (now, then, ETA, pause/arrive affordances), manual step advance when RWS does, surfaced reroute / off-route / snap / loc-mode status, stop / recenter, then arrival and dismiss that ends the NavBridge session cleanly.

**Blocked by:** 04 — NavBridge + Wayfinding draft → preview.

**Status:** done

- [x] Start from preview enters live nav; HUD binds to NavBridge session (not host-fed one-offs as the recommended path).
- [x] Manual step advance works where RWS WithinTerminal does.
- [x] Reroute / off-route / snap / loc-mode status is visible in chrome without host glue.
- [x] Stop and recenter work during navigation.
- [x] Arrival experience + dismiss clears session visibility cleanly.
- [x] Seam tests with a fake map handle cover start → HUD/complete → dismiss.
