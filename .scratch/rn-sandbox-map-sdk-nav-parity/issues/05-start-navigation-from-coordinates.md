# 05 — Live startNavigationFromCoordinates with dest floor

**What to build:** The same live WithinTerminal engine path as `startNavigation`, but the dest is a `CoordinateLocation` (coords + dest floor) and the start floor is required `startWhereDimension`. Dest floor is never guessed or hardcoded to airside. Optional `useInternalGPS` and `startAnchorLngLat` behave as on `startNavigation`. Preview from coordinates remains `compute*` only.

**Blocked by:** 04 — WithinTerminal live startNavigation (GPS → place)

**Status:** ready-for-agent

- [ ] `startNavigationFromCoordinates` takes a `CoordinateLocation` dest (coords + dest `whereDimension`) and required `startWhereDimension`; dest floor is not inferred.
- [ ] It shares the live WithinTerminal path: `forRealtime`, NAVIGATION mode, engine start with start-anchor lock on the host start floor, GPS/compass enable, handlers.
- [ ] `useInternalGPS` and `startAnchorLngLat` match `startNavigation` (internal GPS default true; omitted anchor = GPS start; external last-known GPS when internal is false).
- [ ] Public dest coords are `[lng, lat]`. To/From still throw `UNSUPPORTED_ROUTE_MODE`; Airside still throws `MISSING_ROUTING_DATA`.
- [ ] Handle-level tests cover required start floor, dest `CoordinateLocation` floor, and that this `start*` starts follow (not preview).
