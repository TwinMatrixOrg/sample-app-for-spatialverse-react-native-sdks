# 07 — CameraDirector arbitrates camera writes

**What to build:** One camera writer for all Core-driven motion. CameraDirector owns the camera port and arbitrates stops submitted by UserLocationController and FocusManager with a declared reason. It resolves the handle per call (MapLibre re-mints it on every re-render), holds the map-loaded gate, and keeps at most one coalesced pending stop with last-write-wins semantics. The deferred-initial-camera dance is no longer duplicated in the shell. The follow-breaking side effect that the shell currently applies after a focus flight moves into the director’s arbitration. Blue-dot following during navigation is unchanged from the user’s point of view. This supersedes the part of the existing camera-ownership record that claimed the controller owns the camera outright.

**Blocked by:** 06 — FocusManager owns the commit

**Status:** done

- [x] UserLocationController and FocusManager submit camera stops to CameraDirector; neither writes the camera port directly. Reasons are at least `user-location` and `focus`.
- [x] The director resolves the camera handle per call, not by capturing it.
- [x] Before map-loaded, stops coalesce to at most one pending stop (last-write-wins) and flush when the map reports loaded. This is the named exception to no-queueing.
- [x] The shell no longer defers the initial focus camera in two places; it tells the director when the map has loaded.
- [x] Follow-breaking after a focus flight is director arbitration, not a shell after-effect.
- [x] Attach/detach of the camera port stays Null Object plus explicit attach; a remount is a named transition.
- [x] The camera-arbitration decision record lands and explicitly supersedes the “controller owns the camera” claim.
- [x] Tests assert on the camera adapter: which stops were submitted and in what order, including map-loaded gating and coalescing. Follow and mode behaviour that used to assert on a fake camera passed to the controller moves up to this seam (or waits for the runtime seam in ticket 11); throttle and heading hysteresis may stay at the controller seam.
- [x] Typecheck and the offline suite stay green. Local sign-off: live multi-where navigation still follows the blue dot and camera while navigating, when credentials are present.
