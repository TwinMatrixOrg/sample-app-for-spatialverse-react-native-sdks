# 05 — Phase E: RWS/Vivo denylist + venue-tier sort in default

**What to build:** Bake RWS/Vivo-oriented suggestion denylist filtering and venue-tier sort into the portable smart default (plus general skytrain shuttle-style excludes). Update CONTEXT Smart search default config to allow these portable hygiene tables.

**Blocked by:** 04 — Phase D keyword / parking.

**Status:** done

- [x] Denylist filtering drops junk / disallowed suggestion classes in the smart default pipeline.
- [x] Venue-tier sort matches locked RWS-like ordering (without TIC pick priority).
- [x] CONTEXT glossary updated to allow portable hygiene tables in Smart search default config.
- [x] Seam tests cover filter drops and sort order via fake capabilities / place fixtures.
