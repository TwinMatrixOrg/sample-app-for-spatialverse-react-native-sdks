# 01 — Implement headless live multi-where navigation Core scenario

**What to build:** Opt-in Jest headless Core scenario tests per `.scratch/metaatlascore-live-multi-where-nav/spec.md`: live MetaAtlasCore bootstrap, routing-core compute from env start/dest, real NavigationEngine + GPSController + AutoFocusManager behind fake collaborators, GPS walk with stubbed rAF, portal propose → accept → where-taxonomy update (nav), arrival, and host floor change (rebind + reroute request).

**Blocked by:** none

**Status:** ready-for-agent

- [ ] Helpers: live bootstrap, nav collaborators, rAF clock, route walk
- [ ] Happy path: compute multi-where route → start → L1 follow → portal propose → accept → L2 follow → onNavigationComplete
- [ ] Host floor: notifyManualFloorChange on-route rebind; no-navigable → requestRerouteFromPosition
- [ ] Env-gated describe.skip; document required env vars; PDR off; no RN shell

## Spec

See [spec.md](../spec.md).
