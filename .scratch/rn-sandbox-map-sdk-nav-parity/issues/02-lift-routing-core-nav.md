# 02 — Lift web-rws routing-core navigation into MetaAtlasCore and port its tests

**What to build:** RN MetaAtlasCore routing-core holds the web-rws navigation engine as a lift-and-shift: NavigationEngine, route following, PDR along-route, dead-zones, route-segment decomposition, and `forRealtime` on compute config — without changing snap / reroute / PDR math. The existing web-rws routing-core tests (dead-zones, segment decomposition) run against the lifted modules so engine math stays pinned the way RWS already proved it. The imperative handle does **not** start this engine yet.

**Blocked by:** None — can start immediately (parallel with 01).

**Status:** claimed

- [x] Routing-core nav modules from `web-rws_tic` are lifted into RN MetaAtlasCore routing-core (engine, following, PDR along-route, dead-zones, segment decomposition). Snap / reroute / PDR flow math is not rewritten.
- [x] `forRealtime` exists on the compute/config types the engine already uses; hosts do not need a second flag on the handle.
- [x] NavigationEngine is **not** split into loc-mode / follower / rerouter this ticket.
- [x] Existing web-rws routing-core tests for dead-zones and route-segment decomposition are ported and pass against the lifted modules (same test style, not a new RN-only engine test harness).
- [x] MapLibre, RoutingVisualizer, GPS, compass, motion, and blue-dot stay out of this lift; engine still talks to those collaborators by the method names it already calls.
- [x] No new publishable core package.

## Comments

Lifted the web-rws routing-core nav modules (engine, following, PDR along-route, dead-zones, segment decomposition) and ported the existing dead-zone / segment-decomposition tests (`jest` + `BABEL_ENV=test`). `forRealtime` is on `BaseRouteConfig` and is honored in compute reconstruction. The SDK handle does not construct or `start` the lifted engine yet. Name-compatible collaborator shells exist outside MetaAtlasCore so the engine module graph resolves; ticket 03 grows real RN GPS / motion / visualizer / MapLibre behavior behind those same names.
