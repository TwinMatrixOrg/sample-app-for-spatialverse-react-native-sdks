# 09 — Runtime owns Routing Manager and NavigationEngine

**What to build:** Core-to-Core wiring for routing and live navigation is declared, not lazily sorted. The runtime constructs Routing Manager first, hands it to NavigationEngine, then attaches the engine to the manager. Neither touches the other during construction. Phantom Core-to-Core ports and the never-called collaborator member are gone; remaining platform ports are sensors, camera, marker, routing display, and style. NavigationEngine subscribes to FocusManager, drops its subscription to the proposal bus, and its where-taxonomy update (nav) entry point loses its parameter and reads current focus on demand — so the tracking line cannot be rebuilt from a stale copy. Shell `ensure*` helpers disappear. A host floor change during navigation keeps the session; a portal floor proposal still leaves the view alone until accept.

**Blocked by:** 04 — Move published-data stores into Core; 05 — Land the MetaAtlasRuntime skeleton; 06 — FocusManager owns the commit; 07 — CameraDirector arbitrates camera writes

**Status:** done

- [x] Runtime owns Routing Manager, NavigationEngine, UserLocationController, AutoFocusManager, and the taxonomy-update store in addition to MapDataService, FocusManager, and CameraDirector. Construction order is in one place.
- [x] Routing Manager is constructed first and handed to NavigationEngine; the runtime then attaches the engine. No lazy factory callbacks, no `ensure*` helpers in the shell.
- [x] Phantom Core-to-Core port types are deleted (route collaborator, user-location-controller-like, auto-focus-like, compass-like, motion-like, GPS-manager-like, and the related deprecated camera/marker aliases). The never-called collaborator member is removed. The five engine-relay members leave the platform contract.
- [x] NavigationEngine subscribes to FocusManager and does not cache the focused where-taxonomy. Where-taxonomy update (nav) reads current focus instead of taking it as a parameter. The engine no longer listens to the proposal bus for this.
- [x] AutoFocusManager remains the proposal bus and never writes focus. Portal floor proposals still wait for accept/override. `notifyManualFloorChange` still rebinds the tracking line without ending the session.
- [x] Platform-level Routing Manager tests target the reduced platform contract.
- [x] Typecheck and the offline suite stay green. Local sign-off: live multi-where navigation still covers portal accept → where-taxonomy update (nav) and host floor change, when credentials are present.
