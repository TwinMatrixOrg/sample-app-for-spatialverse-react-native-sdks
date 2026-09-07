# 10 — Device walkthrough vs web-rws (human gate)

**What to build:** This round is not tests-only. A human walks the same pedestrian + PDR scenarios on device against `web-rws_tic`, using the sample throwaway harness, and confirms live follow, indoor PDR / outdoor GPS, start/stop/recenter, and debug knobs. Later rounds treat tests as the primary gate; this ticket is the venue sign-off for *this* phase.

**Blocked by:** 08 — Throwaway sample-app debug harness

**Status:** ready-for-human

- [ ] Device walkthrough of the same pedestrian + PDR scenarios as `web-rws_tic` (indoor dead-zone PDR, outdoor GPS, snap/reroute/arrival as exercised in RWS).
- [ ] Live `startNavigation` (GPS → place) and `startNavigationFromCoordinates` both complete a guided walk and `stopNavigation` returns the map to normal GPS.
- [ ] Recenter during nav follows the engine; after stop it follows GPS.
- [ ] Debug knobs needed for sign-off (synthetic GPS / loc-mode / dead-zone overlay as used in QA) work on a release-like build, not only `__DEV__`.
- [ ] Outcome is recorded so later maintainers can rely on handle + routing-core tests rather than repeating venue walks as the primary gate.
