# 06 — Phase F: Drop whole-config replace; docs = custom strategy only

**What to build:** Remove whole-smart-config replace promises from CONTEXT and hub docs. Public customization = custom `PlaceSearchStrategy` only. Confirm smart is documented as default. No new host config-replace API.

**Blocked by:** 05 — Phase E denylist / venue sort (CONTEXT hygiene wording can land with E; this ticket finishes replace-API cleanup).

**Status:** done

- [x] CONTEXT no longer promises host whole-config replace for smart search.
- [x] Hub PlaceCatalog / MapExperience docs: smart default; customize via custom strategy only.
- [x] Research backlog / glossary language no longer advertises a non-exported config replace API.
