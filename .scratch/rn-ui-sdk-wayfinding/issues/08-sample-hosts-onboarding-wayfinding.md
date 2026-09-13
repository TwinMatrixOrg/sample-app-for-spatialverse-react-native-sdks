# 08 — Sample hosts Onboarding + Wayfinding; remove harness

**What to build:** The sample app composes `MapExperience.Onboarding` and `MapExperience.Wayfinding` as always-mounted Chrome siblings alongside discover features. Credentials stay on Canvas; theme on Root. Sample passes exact RWS web welcome/onboarding copy via Onboarding props/slots. `ThrowawayNavHarness` and host `directionsOpen` are removed. Hub docs for RN UI developers describe the host integration surface.

**Blocked by:** 03 — MapExperience.Onboarding + MMKV persistence; 05 — Wayfinding live WithinTerminal → arrival; 06 — Chrome coexistence for routing session; 07 — Onboarding → routing gate.

**Status:** ready-for-agent

- [x] Sample mounts Onboarding and Wayfinding always when those flows are desired (omit-by-not-mounting; no feature-flag APIs).
- [x] Sample passes exact RWS web onboarding copy via props/slots.
- [x] `ThrowawayNavHarness` and host `directionsOpen` orchestration are gone.
- [x] Map stays mounted under onboarding and routing overlays in the sample composition.
- [x] Hub `for-rn-ui-developers/` docs cover Onboarding, Wayfinding, NavBridge, MMKV peer, and chrome coexistence at host level.
