# 03 — Phase C: Nearest UX outputs (catalog/strategy seam only)

**What to build:** Express web-like nearest shell as PlaceCatalog / smart-strategy outputs (ranked nearest places, GPS-needed / not-ready signal, submit-label / nearest-submit candidate). SearchBar may wire those to NavBridge later; strategy never starts navigation. No second test seam / no SearchBar mount tests.

**Blocked by:** 02 — Phase B readiness.

**Status:** done

- [x] Nearest intent exposes ranked candidates (+ distance labels when scored) at the strategy/catalog seam.
- [x] GPS-needed / not-ready and nearest-submit affordance signals are observable without mounting SearchBar.
- [x] Wiring path to NavBridge / Directions is documented as consumer-side; strategy tests assert zero navigation starts.
