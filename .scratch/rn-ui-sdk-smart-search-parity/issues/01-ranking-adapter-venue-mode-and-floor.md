# 01 — Phase A: Ranking adapter (Venue mode + autofocus floor)

**What to build:** SearchMapCapabilities closest-by-route ranking sets Venue routing mode before closest-by-route, and GPS snapshots prefer autofocus-accepted where when available (else current focus). Observable via fake capabilities in PlaceCatalog Search strategy tests.

**Blocked by:** None (default-smart already shipped).

**Status:** done

- [x] Closest-by-route ranking sets Venue routing mode before scoring candidates.
- [x] GPS snapshot prefers autofocus-accepted where path when present; falls back to current focus.
- [x] Seam tests with fake `SearchMapCapabilities` cover mode-before-rank and floor preference; strategy still never starts navigation.
