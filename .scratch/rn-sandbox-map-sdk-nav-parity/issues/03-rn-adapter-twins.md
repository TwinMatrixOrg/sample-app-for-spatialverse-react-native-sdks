# 03 — Grow name-compatible RN GPS / compass / motion / visualizer twins

**What to build:** The lifted navigation engine compiles and can call RN GPS, compass, motion, blue-dot, auto-focus, and RoutingVisualizer using the **same method names** the web-rws engine already uses. MapLibre-only debug layers are an RN equivalent or a no-op **behind those names**, so the engine does not grow a second debug path. If growing a twin (or extracting a Port) would change snap / reroute / PDR / camera-follow math, stop and keep the existing coupling.

**Blocked by:** 02 — Lift web-rws routing-core navigation into MetaAtlasCore and port its tests

**Status:** claimed

- [x] RN GPS, compass, motion, blue-dot, auto-focus, and RoutingVisualizer twins cover the method names the lifted engine calls (duck-typed; no formal Port layer unless twins cannot compile).
- [x] Motion / PDR collaborator methods the web engine calls are present on RN — PDR is not stubbed by missing names.
- [x] MapLibre-only debug overlay/layer calls used by the engine have an RN equivalent or no-op on the same names.
- [x] Adapter work does not change snap, reroute, PDR, or camera-follow math; if it would, the extract is deferred and the ticket records that stop.
- [x] GPS, compass, motion, blue-dot, auto-focus, visualizer, and MapLibre remain outside MetaAtlasCore.

## Comments

Grew duck-typed RN twins outside MetaAtlasCore: GPSController (already name-complete), CompassManager (already name-complete), MotionSensorManager (`start`/`stop`/`requestPermission`/`isSupported`), BlueDotMarker, AutoFocusManager, RoutingVisualizer route state + `highlightRouteSegment`, and `NavMapLike` (`addSource`/`addLayer`/`getLayer`/`getSource`/`setLayoutProperty`/`easeTo`/`getZoom`/`getContainer`/`on`/`off`). Debug overlay calls are in-memory no-ops behind those MapLibre names. `setShouldSwitchFloor` is altitude-only; portal `proposeFromNavigation` stays live (matches Android live-nav vs web).

**Stop recorded:** no RN IMU axis remap (`react-native-sensors` gyro → DeviceMotion `rotationRate`). Mapping would change PDR vs web DeviceMotion; `start()` still binds DeviceMotion-shaped samples when `DeviceMotionEvent` exists. Live IMU wiring waits for a DeviceMotion-equivalent source.
