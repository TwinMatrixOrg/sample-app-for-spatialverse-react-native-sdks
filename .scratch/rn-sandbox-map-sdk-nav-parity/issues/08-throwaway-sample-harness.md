# 08 — Throwaway sample-app debug harness

**What to build:** The sample app has a disposable debug/test chrome that starts and stops product `start*` and exercises the debug PDR / synthetic-GPS / overlay knobs on a device, so venue sign-off can run before real nav UI. It is not product chrome, not MapBridge/NavBridge, and is intended to be deleted when RWS/sample nav UI lands.

**Blocked by:** 04 — WithinTerminal live startNavigation (GPS → place); 05 — Live startNavigationFromCoordinates with dest floor; 06 — PDR in dead-zones plus debug handle section

**Status:** ready-for-agent

- [ ] Sample app can start WithinTerminal live nav to a place (`startNavigation`) and to coordinates (`startNavigationFromCoordinates`) with the required start floor, then `stopNavigation` / `recenterCamera`.
- [ ] Sample app can drive debug APIs used for device QA (synthetic GPS, PDR allow/configure, dead-zone overlay visibility, loc-mode readout) without those knobs being treated as product UI.
- [ ] Fail-loud modes are visible enough for a host engineer to confirm To/From and Airside errors without parsing log strings.
- [ ] Harness is clearly throwaway (not a HUD, not UI SDK MapBridge / PlaceCatalog / NavBridge). UI SDK and RWS product nav chrome stay out of this ticket.
