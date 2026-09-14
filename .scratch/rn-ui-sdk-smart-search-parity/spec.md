# RN UI SDK — Smart search parity (PlaceCatalog strategy depth)

**Status:** ready-for-agent

**Effort:** UI SDK follow-on to PlaceCatalog search strategies P1 — deepen the default **smart** Search strategy toward web RWS smart search, without breaking MapBridge / PlaceCatalog / NavBridge ownership or dumb widgets.

**Related:** `sdk/ui-sdk/CONTEXT.md` (Search strategy, SearchMapCapabilities, Smart search default config, Venue routing); `docs/research/rws-parity/02-smart-search-delta-vs-web-rws.md`; prior ticket `.scratch/rn-ui-sdk-wayfinding/issues/09-placecatalog-search-strategies-p1.md`; AGENTS.md (PlaceCatalog owns filtered lists; strategies must not hold raw map handles).

**Already shipped (do not redo):** PlaceCatalog / `MapExperience.Root` default Search strategy is **`smart`** (substring remains opt-in). Hub docs and CONTEXT Search strategy glossary already note smart as default.

**Grill lock-in (2026-09-14):**
- Nearest product shell = thin SDK helpers wired through SearchBar / PlaceCatalog outputs; strategy never starts navigation.
- RWS/Vivo denylist, venue-tier sort, parking-escalator sanitize, expanded keyword tables → **portable smart default**.
- TIC 2026 venue aliases/priority → **out** (RWCC-only expansion stays).
- Whole-config replace API → **drop** from glossary; customization = custom `PlaceSearchStrategy` only.
- Ship order **A → B → C → D → E → F → G**.
- **Test seam:** PlaceCatalog Search strategy + fake `SearchMapCapabilities` only (no SearchBar mount / no second seam).

---

## Problem Statement

Map end users and RWS-like hosts get a smart PlaceCatalog pipeline by default, but it still behaves thinner than web RWS smart search: closest-by-route ranking can miss Venue routing mode and stable floor context; nearest intents do not wait for GPS/floor readiness; there is no nearest “Route to…” / GPS-needed path that still respects “strategy never starts navigation”; keyword tables, parking sanitization, and venue suggestion hygiene lag web; area/floor subtitles on results are weaker; and CONTEXT still implies hosts can replace the whole smart config even though the public API only allows a custom strategy.

## Solution

Deepen the built-in **smart** Search strategy and MapBridge-injected **SearchMapCapabilities** so ranking, readiness, nearest-intent outputs, default keyword/hygiene tables, and result enrichment match the locked RWS-parity decisions—while keeping PlaceCatalog as the UI data source, widgets dumb, and NavBridge as the only owner of starting Venue routing. Express nearest UX as **catalog/strategy-facing outputs** (ranked place, GPS-needed / submit affordance signals) that SearchBar can wire to NavBridge, so all behavior remains testable at the existing fake-`SearchMapCapabilities` seam. Update CONTEXT so Smart search default config may include portable product hygiene tables (still excluding TIC 2026) and no longer promises whole-config replace.

## User Stories

1. As a map end user, I want PlaceCatalog search to use the smart strategy by default, so that nearest/category-aware ranking works without a host flag.
2. As a host app developer, I want to opt into substring with an explicit strategy choice, so that portable plain typeahead remains available.
3. As a map end user, I want closest-by-route ranking to run in Venue routing mode, so that nearest results match web RWS distance order.
4. As a map end user, I want nearest ranking to prefer a stable accepted autofocus floor when GPS is on, so that floor context matches web RWS.
5. As a map end user, I want nearest search to wait or retry until GPS and floor context are ready, so that I do not get a weak lexical fallback when location is still resolving.
6. As a map end user, I want typing “nearest toilet” (and sibling intents) to surface the closest matching place with a distance label, so that I can pick the right amenity quickly.
7. As a map end user, I want a “Route to …” style nearest-submit affordance when lexical hits are empty but a nearest intent is active, so that I can still proceed like on web.
8. As a map end user, I want a clear GPS-needed signal when nearest requires location and GPS is off, so that I can enable location without the strategy starting navigation by itself.
9. As a host app developer, I want nearest resolution to expose the best `PlaceItem` for NavBridge / Directions wiring, so that SearchBar can open Venue routing without the strategy calling `startNavigation`.
10. As a UI SDK maintainer, I want strategies to never start a navigation session, so that NavBridge remains the session owner.
11. As a map end user, I want broader category keyword matching (transport, F&B extras, and similar web groups, including multilingual keywords where web has them), so that whole-word category search finds the right what-taxonomies.
12. As a map end user, I want parking-related queries to canonicalize to car park and drop escalator noise, so that parking suggestions stay useful.
13. As a map end user, I want RWCC venue alias expansion and floor priority to keep working, so that convention-centre queries stay ranked sensibly.
14. As a map end user, I do not want TIC 2026 event aliases baked into the SDK default, so that dated event strings do not pollute portable search.
15. As a map end user, I want RWS / VivoCity-oriented denylist and venue-tier suggestion ordering in the portable smart default, so that junk models/geofence/signage noise ranks like web.
16. As a map end user, I want skytrain shuttle-service style excludes where web has them (without requiring TIC aliases), so that transport nearest results stay clean.
17. As a map end user, I want search result rows to show useful area/floor subtitle enrichment when available, so that I can tell floors apart.
18. As a host app developer, I want to replace ranking only via a custom PlaceCatalog Search strategy, so that I am not told I can replace a whole smart config that is not a public API.
19. As a UI SDK maintainer, I want CONTEXT’s Smart search default config glossary to allow portable hygiene tables and to drop whole-config replace language, so that docs and glossary agree.
20. As a host app developer, I want hub docs to describe smart as default and customization via custom strategy only, so that integration guidance matches the product.
21. As a UI SDK maintainer, I want MapBridge to remain the only owner of the map handle behind SearchMapCapabilities, so that strategies stay free of raw MetaAtlas imports.
22. As a UI SDK maintainer, I want category chips to keep filtering after the strategy runs, so that PlaceCatalog coexistence is unchanged.
23. As a map end user, I want destination-field typed search to keep reusing the same PlaceCatalog strategy, so that draft edits and SearchBar share ranking behavior.
24. As a host app developer, I want host-supplied `places` / `source` / custom strategy to still win, so that explicit props disable auto-wiring.
25. As a UI SDK maintainer, I want offline / no-map fallback to keep working for smart search, so that catalog text match still returns something without MetaAtlas.
26. As a UI SDK maintainer, I want stale in-flight strategy generations to be ignored, so that older async ranking cannot overwrite newer queries.
27. As a map end user, I want distance trailing labels on nearest results when route scoring succeeds, so that I can compare candidates.
28. As a QA / agent, I want all of the above verifiable through PlaceCatalog Search strategy tests with a fake SearchMapCapabilities, so that MetaAtlas is not required in CI.
29. As a UI SDK maintainer, I want fuzzy matching and title match-span highlighting to remain out of scope, so that this ticket does not invent web features that neither codebase has.
30. As a UI SDK maintainer, I want saved-locations suggestion rows and Explore/assistant search to remain out of scope, so that this stays a PlaceCatalog smart-search depth ticket.
31. As a map end user, I want dropoff vs entrance include/exclude rules and nearest candidate caps to keep working, so that existing smart behavior does not regress.
32. As a map end user, I want floor-order prioritization among candidates to keep working before closest-by-route, so that same-floor amenities still prefer correctly.
33. As a host app developer, I want Venue routing vocabulary in docs (not wire `WithinTerminal` names) when describing ranking mode, so that host-facing language stays consistent with CONTEXT.
34. As a UI SDK maintainer, I want implementation to proceed A→B→C→D→E→F→G, so that ranking correctness lands before chrome signals and product tables.
35. As a sample host, I want no required sample-only `searchStrategy="smart"` prop, so that omitting the prop already yields smart behavior.
36. As a map end user, I want unsupported nearest intents to degrade safely (lexical / keyword filter) without crashing, so that odd queries still search.
37. As a UI SDK maintainer, I want existing substring strategy behavior preserved when selected, so that opting out of smart is stable.
38. As a map end user, I want SearchBar keyboard dismiss on result select to keep working alongside smarter results, so that selection UX does not regress.
39. As a UI SDK maintainer, I want enrichment of UI-only fields (distanceLabel, subtitle) to stay compatible with PlaceItem identity via metaFeature, so that selection and Directions still resolve the same place.
40. As an agent implementing this spec, I want phased scratch issues under this folder, so that each A–G slice can be closed with checkboxes without reopening the parent grill.

## Implementation Decisions

1. **Default Search strategy remains `smart`** (already shipped). Do not revert to substring. Substring stays a named built-in opt-in.
2. **Ship order is mandatory:** A → B → C → D → E → F → G. Do not start later phases until earlier phase checkboxes are done (or explicitly unblocked).
3. **Phase A — Ranking adapter:** When ranking closest-by-route, SearchMapCapabilities must set Venue routing mode on the map handle before closest-by-route (host docs say Venue routing; map wire may still be WithinTerminal). GPS snapshot for ranking prefers autofocus-accepted where path when available, else current focus (match web precedence).
4. **Phase B — GPS/floor readiness:** For nearest intents that require GPS, smart strategy / capabilities retry or gate until GPS + stable floor/where are available (web-like retry limit/interval semantics), instead of immediately returning weak lexical-only results. Behavior must be observable via fake capabilities (controllable ready/not-ready snapshots).
5. **Phase C — Nearest UX via catalog/strategy outputs (seam 1 only):** Do not add a second test seam or require SearchBar mount tests. Express web-equivalent nearest shell as PlaceCatalog / strategy-facing outputs, for example: ranked nearest `PlaceItem`s; a GPS-needed / not-ready signal; a submit-label / nearest-submit candidate when appropriate. SearchBar (or thin helpers it calls) wires those outputs to user chrome and may call NavBridge / Directions paths — **never** from inside the strategy. No `startNavigation` on the strategy path.
6. **Phase D — Default keyword / alias depth:** Expand portable smart default category keyword/taxonomy tables toward web (transport, F&B extras, multilingual keywords as on web). Add parking escalator sanitization after parking alias canonicalization. Keep RWCC venue aliases. **Do not** add TIC 2026 expansion or TIC pick priority.
7. **Phase E — Portable hygiene in default:** Bake RWS/Vivo-oriented suggestion denylist filtering and venue-tier sort into the portable smart default (grill Q2). Include skytrain shuttle-style excludes where they are general hygiene, not TIC-specific. Update CONTEXT Smart search default config to allow these portable product hygiene tables.
8. **Phase F — Glossary / docs alignment:** Remove “host may replace the whole config” / whole-config replace promises from CONTEXT and hub docs. Public customization path = custom `PlaceSearchStrategy` only. Do not newly export a whole-config factory as a host API in this ticket. Document smart as default.
9. **Phase G — Subtitle enrichment:** Enrich PlaceItem subtitle (or equivalent UI field consumed by SearchResultsList) with area/floor formatting parity where data exists—still via strategy/catalog outputs, not widget MetaAtlas imports.
10. **Architecture invariants (non-negotiable):** Strategies do not hold raw `MapSdkHandle`. MapBridge owns capabilities injection. PlaceCatalog remains central UI data source for SearchBar / lists / chips. Host props win. Widgets stay dumb. Category chips filter after strategy. Destination field search continues to reuse PlaceCatalog `searchPlaces`.
11. **Vocabulary:** Prefer “Venue routing” in host-facing prose; do not teach hosts the wire enum name.
12. **Research note:** Treat `docs/research/rws-parity/02-smart-search-delta-vs-web-rws.md` as the delta inventory; mark backlog items done as phases land (do not treat the research file as the constitution over CONTEXT).

## Testing Decisions

1. **Good tests** assert external behavior only: given query + places + fake `SearchMapCapabilities`, the strategy/catalog returns the expected ordered `PlaceItem`s, labels, enrichment, readiness gating outcomes, and never invokes navigation-start. Do not assert private helper names, timers’ internal structure, or MetaAtlas internals.
2. **Single seam:** PlaceCatalog Search strategy tests with fake `SearchMapCapabilities` (extend prior art from PlaceCatalog search strategy tests). No SearchBar mount, no device, no second seam for nearest UX—nearest signals must be visible at this seam.
3. **Prior art:** Existing PlaceCatalog search strategy tests already fake map name/taxonomy/GPS/rankClosestByRoute and assert `startNavigationCalls === 0`. Reuse that fake; extend it for Venue mode calls, autofocus-accepted where, readiness transitions, denylist/sort, escalator drop, subtitle enrichment, and nearest-submit / GPS-needed outputs if those are catalog-visible.
4. **Coverage targets by phase:** A — mode set before rank + floor snapshot preference; B — not-ready then ready yields ranked nearest; C — nearest outputs / GPS-needed without nav start; D — keyword hits + parking sanitization + no TIC; E — denylist drops + venue-tier order; G — subtitle enrichment. F is docs/CONTEXT review (no new runtime seam required).
5. **Regression:** Keep substring strategy tests green; keep “strategy never starts navigation” assertions.

## Out of Scope

- Fuzzy / typo-tolerant search and query match-span highlighting in titles (neither web nor RN engines have these today).
- TIC 2026 venue aliases or TIC pick priority in the SDK default.
- Exporting a public whole-smart-config replace API / `createSmartSearchStrategy(config)` as a host feature (custom strategy only).
- Saved-locations suggestion rows; Explore / assistant / admin search; stamp rally; TIC UI tour.
- Changing MapExperience credentials / theme ownership; unmounting the map for search.
- Full RWS mobile shell (curated CategoriesBar product chrome beyond PlaceCatalog chips).
- In-search analytics/telemetry pipelines.
- Replacing NavBridge session ownership or allowing strategies to call `startNavigation`.
- Map SDK Core changes beyond what SearchMapCapabilities already needs from the registered handle (prefer adapter-side use of existing handle methods).

## Further Notes

- Parent research inventory: `sdk/ui-sdk/docs/research/rws-parity/02-smart-search-delta-vs-web-rws.md`.
- Phased agent tickets live beside this spec under `issues/` (01–07 mapping to A–G). Each issue should stay `ready-for-agent` until done, then mark checkboxes and set status `done`.
- Default-to-smart is complete; Phase A is the first implementation slice for agents.
