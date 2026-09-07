# 01 — Freeze the typed MetaAtlasSDK handle and fail-loud routing contract

**What to build:** A TypeScript RWS/sample host sees one frozen MetaAtlasSDK imperative handle (not props-only): atoms-shaped names, all four routing modes, `compute*` preview, `startNavigation` / `startNavigationFromCoordinates` with required start floor and `[lng, lat]`, `NavigationUIHandlers`, and typed start errors. Calling `start*` in ToTerminal or FromTerminal throws `UNSUPPORTED_ROUTE_MODE`; Airside throws `MISSING_ROUTING_DATA` until roads/network data exists. Omitting `userWhereDimension` / `startWhereDimension` fails without using `getCurrentFocus()`. `setRoutingMode` and `compute*` stay callable. Live WithinTerminal follow is **not** this ticket.

Frozen product signatures (from the approved spec, not a runtime prototype):

```ts
startNavigation(
  endMapObjectId: string,
  config?: RoutingConfig,
  handlers?: NavigationUIHandlers,
  options: {
    userWhereDimension: string; // required
    useInternalGPS?: boolean; // default true
    startAnchorLngLat?: [number, number]; // [lng, lat]; default = GPS start
  },
): Promise<Route>;

startNavigationFromCoordinates(
  endLocation: CoordinateLocation, // dest coords + dest whereDimension
  config?: RoutingConfig,
  handlers?: NavigationUIHandlers,
  options: {
    startWhereDimension: string; // required
    useInternalGPS?: boolean;
    startAnchorLngLat?: [number, number];
  },
): Promise<Route>;
```

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [x] Public typings declare the product handle: `setRoutingMode`, `compute*` / `computeRoutesFromLocation`, both `start*` methods, `stopNavigation`, `recenterCamera`, `NavigationUIHandlers`, focus-depth method names, and a debug-handle section (methods may be stubs until later tickets).
- [x] `CoordinateLocation` public coords are `[lng, lat]`; comments/types that claimed `[lat, lng]` are corrected.
- [x] There is no `startMapObjectId` on live `start*`.
- [x] Missing required start floor throws; the implementation never infers it from `getCurrentFocus()`.
- [x] `start*` with ToTerminal or FromTerminal throws a typed error with `code` `UNSUPPORTED_ROUTE_MODE` and `mode` (not a boolean `onRoutingStatusUpdate`).
- [x] `start*` with Airside throws a typed error with `code` `MISSING_ROUTING_DATA` and `mode` while sandbox roads/network data is absent.
- [x] `setRoutingMode` for all four modes remains callable; `compute*` remains allowed for preview (including To/From when data exists).
- [x] Handle-level tests cover missing start floor, WithinTerminal-only live `start*`, To/From and Airside error codes, and `compute*` still allowed. Live follow / PDR / harness are out of scope.

## Comments

Implemented on the map SDK branch: public `MetaAtlasSDKHandle` in `typings/index.d.ts`, fail-loud `start*` via `createMetaAtlasRoutingHandle`, required start floor, `[lng, lat]` `CoordinateLocation`. Live WithinTerminal follow remains unwired (ticket 04).
