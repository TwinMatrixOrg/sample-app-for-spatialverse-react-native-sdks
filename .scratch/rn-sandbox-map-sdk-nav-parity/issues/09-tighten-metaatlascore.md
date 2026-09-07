# 09 — Tighten in-repo MetaAtlasCore membership

**What to build:** After the nav lift and focus-depth landing, MetaAtlasCore is a disciplined in-repo cut for a later package split — not a new npm package. It contains published-data/auth, focus-core (including depth utils), routing compute, NavigationEngine, PDR, dead-zones, follow, and shared types (`metaFeature`, `FocusTree`, `Route`, `RouteMode`, routing configs). MapLibre, visualizer, sensors, blue-dot, auto-focus, and the RN component shell stay out.

**Blocked by:** 02 — Lift web-rws routing-core navigation into MetaAtlasCore and port its tests; 03 — Grow name-compatible RN GPS / compass / motion / visualizer twins; 07 — Focus-depth on the same imperative handle

**Status:** ready-for-agent

- [x] MetaAtlasCore membership matches what is actually shared: auth/published-data, focus-core, routing compute + NavigationEngine + PDR/dead-zones/follow, shared types.
- [x] MapLibre style/layers, RoutingVisualizer, GPS, compass, motion, blue-dot, auto-focus, and the RN SDK shell remain outside core.
- [x] No new publishable `@twinmatrix/meta-atlas-core` (or similar) package is created.
- [x] Moving files does not change public handle behavior from tickets 01–07 (nav math and host-facing names stay put).

## Answer

Tightened the in-repo boundary: moved MapLibre route layer specs to `styles/routeLayers.ts`; added `MetaAtlasCore/README.md` and `routing-core/collaborator-types.ts` so NavigationEngine depends on duck-typed contracts instead of importing GPS/visualizer/blue-dot/motion adapters; shell now injects `BlueDotMarker` + `MotionSensorManager` when constructing the engine; removed the circular `DownloadCallbacks` import from `meta-atlas-sdk-rn`; added `MetaAtlasCore/__tests__/membership.test.ts`. All 45 map-sdk tests pass; public handle unchanged.
