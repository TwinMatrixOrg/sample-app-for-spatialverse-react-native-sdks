# 07 — Phase G: Area/floor subtitle enrichment

**What to build:** Enrich PlaceItem subtitle (or equivalent field SearchResultsList already shows) with area/floor formatting when data exists. Remains strategy/catalog output; widgets stay dumb. Verified at fake `SearchMapCapabilities` / strategy seam.

**Blocked by:** 06 — Phase F docs (soft; may proceed after E if docs lag, but prefer F first per locked order).

**Status:** done

- [x] Smart results enrich area/floor subtitle when source data allows.
- [x] Selection identity (`metaFeature` / place id) remains stable after enrichment.
- [x] Seam tests assert enriched subtitle on fixtures; no widget MetaAtlas imports introduced.
