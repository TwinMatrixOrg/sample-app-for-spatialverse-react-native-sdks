# 10 — Per-module readiness with typed not-ready errors

**What to build:** Each Core module reports whether it is usable and names what it is missing, derived from attached platform slots and the existing published-data status vocabulary (wrapped, not replaced). The runtime aggregates these into one observable store. A not-ready host call fails immediately with a typed error — it is not silently queued to fire later. Navigation start gains a not-ready code. No queueing, with the one named exception already in CameraDirector: the bootstrap focus camera stop.

**Blocked by:** 09 — Runtime owns Routing Manager and NavigationEngine

**Status:** done

- [x] Per-module readiness is `{ready, missing[]}`, naming the absent dependency instead of throwing a generic initialization error.
- [x] The runtime exposes an aggregate readiness view as one observable store, following the taxonomy-update store pattern.
- [x] Not-ready calls throw typed errors. The navigation start error type includes a not-ready code.
- [x] There is no queueing of not-ready host calls. The only coalesced pending work remains the director’s bootstrap focus camera stop.
- [x] Attach/detach updates readiness; tests can observe the aggregate going not-ready when a required platform handle detaches.
- [x] Typecheck and the offline suite stay green. The public handle’s method names are unchanged in this ticket.
