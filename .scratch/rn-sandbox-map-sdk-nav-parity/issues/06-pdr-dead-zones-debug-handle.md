# 06 — PDR in dead-zones plus debug handle section

**What to build:** Indoor pedestrian stretches use PDR inside dead-zones and GPS outside, matching web-rws. Platform QA can toggle loc-mode, dead-zone overlays, PDR configure, and synthetic GPS on the **same** imperative ref without those knobs appearing in product host docs. Debug APIs compile in release-like builds (not `__DEV__`-stripped). Tests drive hybrid loc-mode through `emitSyntheticGpsSampleForTesting` and the debug loc-mode / dead-zone surface — not NavigationEngine private fields.

**Blocked by:** 03 — Grow name-compatible RN GPS / compass / motion / visualizer twins; 04 — WithinTerminal live startNavigation (GPS → place)

**Status:** ready-for-agent

- [ ] During live WithinTerminal nav, loc-mode is PDR inside dead-zones and GPS outside (placeholder dead-zone config may be applied internally as web RWS does).
- [ ] Debug methods live on the same handle, named/grouped as debug: at least `configureNavigationPdr`, `setPdrNavigationAllowed`, `setNavigationDeadZoneDebugVisible`, `emitSyntheticGpsSampleForTesting`, `getRouteFollowingDebug`, plus loc-mode / dead-zone overlay callbacks.
- [ ] Those debug methods are always compiled (usable on release-like device builds). They are not documented as product host API.
- [ ] Handle-level tests exercise GPS↔PDR using the debug seam (`emitSyntheticGpsSampleForTesting` and loc-mode / dead-zone APIs), not engine internals, rAF, or MapLibre layer ids except where a debug method is specified to show them.
- [ ] Host-facing `configureNavigationPdr` remains debug; product `start*` does not grow extra PDR setup arguments.
