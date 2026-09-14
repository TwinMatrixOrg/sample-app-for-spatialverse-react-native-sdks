# 02 — Phase B: GPS / floor readiness for nearest

**What to build:** Nearest intents that require GPS gate or retry until GPS + stable floor/where are ready (web-like readiness), instead of immediately returning weak lexical-only results. Behavior visible at the fake `SearchMapCapabilities` seam.

**Blocked by:** 01 — Phase A ranking adapter.

**Status:** done

- [x] Nearest + requires-GPS waits/retries until snapshot is ready (controllable in fake map).
- [x] When readiness never arrives within policy, degrade safely without crashing.
- [x] Seam tests cover not-ready → ready → ranked nearest; no `startNavigation` from strategy.
