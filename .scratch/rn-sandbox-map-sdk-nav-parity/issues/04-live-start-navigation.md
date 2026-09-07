# 04 — WithinTerminal live startNavigation (GPS → place)

**What to build:** A pedestrian host starts live turn-by-turn from device GPS to a map-object place with `startNavigation(destId, undefined, handlers, { userWhereDimension })`. The SDK honors `setRoutingMode`, injects `forRealtime: true`, computes GPS → dest on the host-provided start floor, switches into NAVIGATION (no public `switchToNavigationMode`), and starts the engine with `startAnchorLngLat` (default = GPS start) and `lockWhereTaxonomyPath` = that start floor. GPS and compass turn on if needed; the normal blue-dot hides so the engine owns follow. `stopNavigation` restores normal GPS; `recenterCamera` follows the engine while navigating and GPS otherwise. `NavigationUIHandlers` receive progress, reroute, complete, loc-mode, and snap. `compute*` still only draws preview — it does not start the engine.

**Blocked by:** 01 — Freeze the typed MetaAtlasSDK handle and fail-loud routing contract; 02 — Lift web-rws routing-core navigation into MetaAtlasCore and port its tests; 03 — Grow name-compatible RN GPS / compass / motion / visualizer twins

**Status:** ready-for-agent

- [x] WithinTerminal `startNavigation` to a map-object id starts the live engine (follow + route), not a preview-only draw.
- [x] Omitted config defaults to wheelchair false and overview/start/end segments true; SDK always injects `forRealtime: true` on the live compute. `compute*` does not inject `forRealtime`.
- [x] `userWhereDimension` is required and used as start floor; `lockWhereTaxonomyPath` is that same host-provided floor (never inferred).
- [x] `useInternalGPS` defaults to true; GPS and compass enable if needed. When `useInternalGPS` is false, an external last-known GPS position can start nav.
- [x] Optional `startAnchorLngLat` defaults to the GPS start coords (`[lng, lat]`). Public coords stay `[lng, lat]` with no airside `where` hardcode on start.
- [x] Live start hides the normal GPS blue-dot; the engine owns camera follow. `stopNavigation` restores normal GPS mode. `recenterCamera` uses the engine in NAVIGATION and GPS in NORMAL.
- [x] `NavigationUIHandlers` on `start*` expose progress, reroute, complete, loc-mode, and snap so a later HUD can bind without map internals.
- [x] Handle-level tests: `start*` starts follow and `compute*` does not; required floor; `forRealtime` only on live compute; no airside hardcode; `[lng, lat]`. Indoor PDR / debug knobs / coordinate-dest start are later tickets.

## Comments

Wired WithinTerminal live `startNavigation` at the routing handle: omitted config defaults + always-injected `forRealtime`, host `userWhereDimension` as compute start floor and `lockWhereTaxonomyPath`, GPS/compass enable when `useInternalGPS` is true, last-known external GPS when it is false, default `startAnchorLngLat` = GPS start `[lng, lat]`, NORMAL/NAVIGATION switch behind `start*` / `stopNavigation` / `recenterCamera`. Product handlers map onto the engine (`onLocModeChange` → `onNavigationLocModeChange`, `onSnap` → `onSnapStateChange`). `startNavigationFromCoordinates` stays unwired until ticket 05.
