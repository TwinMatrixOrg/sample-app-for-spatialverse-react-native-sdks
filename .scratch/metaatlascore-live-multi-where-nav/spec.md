# MetaAtlasCore headless live multi-where navigation scenario tests

**Status:** ready-for-agent

**Effort:** MetaAtlasCore scenario-test pillar (routing-core first; later Core modules extend the same harness pattern)

**Related:** MetaAtlasCore `CONTEXT.md` glossary; ADR 0001 live-network Core scenario tests

---

## Problem Statement

Routing-core and live navigation math are large, high-risk to refactor, but existing Jest coverage is thin: membership fences, tiny pure helpers, and shell/handle tests with a mocked engine. Passing the suite does not show that live multi-where navigation still works—compute a real WithinTerminal route across floors, follow along the tracking line, emit a portal floor proposal, accept it, rebind after a where-taxonomy update (nav), and arrive—nor that a host floor change via AutoFocusManager updates live nav correctly. Without a headless Core scenario test, refactors rely on device walks and guesswork.

## Solution

Add an opt-in headless Core scenario test that bootstraps a real MetaAtlasCore (class) against a live EMP/published-data environment (credentials and scenario inputs from env), computes a live multi-where navigation route with routing-core, drives a real NavigationEngine with real GPSController and AutoFocusManager behind fake map/sensor collaborators, walks synthetic GPS along the route, accepts portal floor proposals, asserts where-taxonomy update (nav) behavior, completes arrival, and covers host floor change (on-route rebind and no-navigable reroute request). Default CI skips when env is missing; an optional job can run with secrets. This is the first MetaAtlasCore scenario pillar—focused on routing-core live nav—not a claim that every routing-core change is covered.

## User Stories

1. As a Core maintainer, I want a headless Core scenario test for live multi-where navigation, so that I can refactor routing-core with evidence beyond membership and helper unit tests.
2. As a Core maintainer, I want the scenario to start from MetaAtlasCore (class) with credentials I provide, so that published routing and map-object data match a real environment.
3. As a Core maintainer, I want auth then focus-tree, routing, and map-object search setup to reach Ready before compute, so that the test mirrors the online shell bootstrap path.
4. As a Core maintainer, I want route compute to use my start GPS coordinates, start where-taxonomy (L1), and destination map-object id (L2), so that the route is produced by actual routing-core functions—not a hand-built Route fixture.
5. As a Core maintainer, I want compute to fail loudly if the live result is not a live multi-where navigation route (L1 walk, portal block, L2 walk), so that bad scenario env inputs are obvious.
6. As a Core maintainer, I want NavigationEngine constructed at the existing collaborator seam with fakes for map/visualizer/markers/motion/compass and a fake GPS manager under a real GPSController, so that the RN shell stays out of the test.
7. As a Core maintainer, I want a real AutoFocusManager wired so NavigationEngine portal floor proposals and accept/publish use production proposal-bus behavior, so that portal and host floor paths are not stubbed away.
8. As a Core maintainer, I want PDR disabled for this first scenario, so that GPS-only live multi-where navigation stays the focus.
9. As a Core maintainer, I want startNavigation after setActiveRoute with the computed route and L1 lock where, so that the engine session matches live WithinTerminal start semantics without the RN handle.
10. As a Core maintainer, I want onNavigationStart and initial where/segment state on L1 after start, so that session bootstrap is verified.
11. As a Core maintainer, I want synthetic GPS walked along the L1 tracking line at fixed spacing, so that “stay along route” is automatic from computed geometry.
12. As a Core maintainer, I want requestAnimationFrame and related timers stubbed and flushed after GPS samples, so that visual/progress gates, portal vicinity, and post-accept republish actually run in Jest.
13. As a Core maintainer, I want no portal floor proposal until the walker is in portal vicinity, so that early false proposals fail the test.
14. As a Core maintainer, I want a portal floor proposal for L2 when near the portal, so that NavigationEngine → AutoFocusManager proposeFromNavigation is covered.
15. As a Core maintainer, I want portal progress hold while a proposal is pending in vicinity, so that frozen progress until accept is covered.
16. As a Core maintainer, I want the test to call AutoFocusManager.acceptProposal (host UI stand-in), so that accept uses the real proposal bus—not notifyManualFloorChange for the portal case.
17. As a Core maintainer, I want where-taxonomy update (nav) after accept to set current where to L2, clear portal hold, invalidate tracking, and call setReferenceRouteForTracking on the active route, so that engine behavior—not only AFM publish—is asserted.
18. As a Core maintainer, I want no requestRerouteFromPosition when L2 has navigable segments on the active route after accept, so that the happy path does not falsely reroute.
19. As a Core maintainer, I want subsequent GPS/rAF progress to snap and highlight on L2 tracking-line geometry, so that “route line follows” after the where-taxonomy update (nav) is observable.
20. As a Core maintainer, I want walking to continue on L2 until onNavigationComplete, so that arrival is part of the pillar.
21. As a Core maintainer, I want onNavigationComplete to fire at most once for the session until stop/reroute, so that arrival latch behavior is respected.
22. As a Core maintainer, I want a host floor change via notifyManualFloorChange to an on-route where with navigable segments, so that tracking rebinds without a portal proposal.
23. As a Core maintainer, I want a host floor change to a where with no navigable segments to invoke requestRerouteFromPosition, so that the offline-floor branch of where-taxonomy update (nav) is covered.
24. As a Core maintainer, I want v1 offline-floor coverage to assert the reroute request (full reroute completion optional later), so that the first pillar stays shippable.
25. As a Core maintainer, I want credentials and scenario inputs only from environment variables, so that secrets are never committed.
26. As a Core maintainer, I want the describe block skipped when any required env var is missing, so that default CI stays offline and green.
27. As a Core maintainer, I want an optional CI/job path that injects secrets and runs only this scenario, so that live confidence can be automated when desired.
28. As a Core maintainer, I want LocalStorage/persistence dependencies of published-data load mocked for Node Jest as needed, so that bootstrap works without RN device storage.
29. As a Core maintainer, I want AutoFocusManager’s focus collaborator to read current focus from the MetaAtlasCore (class) instance under test, so that proposal suppression against “already focused” matches production.
30. As a Core maintainer, I want assertions to prefer UI handlers, getRouteFollowingDebug, visualizer spies, and AFM listeners over private engine fields, so that tests stay at external behavior.
31. As a Core maintainer, I want test helpers for bootstrap, collaborators, rAF clock, and route walking reusable for later Core scenarios, so that gps-core/focus-core pillars can extend the same pattern.
32. As a Core maintainer, I want existing tiny routing-core unit tests and membership tests to remain, so that this pillar adds confidence without deleting fences.
33. As a Core maintainer, I want documentation of required env vars next to Core or map-sdk test docs, so that another engineer can run the live scenario locally.
34. As a Core maintainer, I want the confidence claim documented as a live multi-where WithinTerminal pillar—not “any routing-core change”—so that overclaim is avoided.
35. As a future Core maintainer, I want PDR/dead-zone and Airside scenarios as later files, so that this ticket does not balloon.
36. As a Core maintainer, I want TaxonomyUpdateStore out of this test, so that UI popup glue is not required to prove engine/AFM behavior.
37. As a Core maintainer, I want MetaAtlasSDK / sample-app harness / Detox out of this test, so that the suite stays a headless Core scenario test.
38. As a Core maintainer, I want long Jest timeouts appropriate for live fetch, so that auth and published-data download do not flake on timing alone.
39. As a Core maintainer, I want forRealtime on the live compute config used in the scenario, so that compute matches live-nav compute semantics.
40. As a Core maintainer, I want public coordinates to remain [lng, lat] throughout the harness, so that coordinate-order bugs are caught.

## Implementation Decisions

- Suite lives under the MetaAtlasCore boundary as headless Core scenario tests; first focus is routing-core live navigation; later scenarios for other Core modules reuse helpers.
- Primary injection seam is the existing NavigationEngine collaborator contracts: real NavigationEngine, real GPSController, real AutoFocusManager; fake visualizer/map/blue-dot/motion/compass and fake GPS manager under GPSController. No new production test hooks on engine privates.
- Bootstrap uses MetaAtlasCore (class): init with env creds → authenticate → setupFocusTree → setupRouting → setupMapObjectSearch; wait until routing and search status are Ready (ADR: live network, opt-in).
- Route compute uses routing-core compute path equivalent to the visualizer’s FromLocation assembly: Coordinate start (lng/lat + L1 where) + MapObject destination, WithinTerminal, forRealtime true. Do not mount the RN RoutingVisualizer component or MetaAtlasSDK shell.
- Scenario env supplies start lng/lat, start where (L1), and destination map-object id (on L2). If the computed route is not live multi-where navigation, fail the test with a clear message.
- PDR allowed is forced off for this pillar; start-anchor PDR is not required for the happy path.
- Portal accept is AutoFocusManager.acceptProposal after listening for a portal floor proposal; do not simulate portal accept via notifyManualFloorChange.
- Where-taxonomy update (nav) assertions follow real engine behavior: update current where, clear portal progress hold, invalidate tracking cache, setReferenceRouteForTracking(active route), reroute only if no navigable segments for the new where, then refresh progress; subsequent progress/highlight reflects the new where’s tracking line—not a filtered Route rewrite on the first update tick alone.
- Host floor change coverage includes (1) notifyManualFloorChange to an on-route where with navigable segments → rebind without reroute, and (2) notifyManualFloorChange to a where with no navigable segments → requestRerouteFromPosition; completing a full reroute loop is optional follow-up.
- Ending of the happy path is onNavigationComplete (arrival threshold), not merely stopNavigation.
- GPS advance samples the active/tracking polyline at fixed spacing and calls GPSController.simulatePosition; flush stubbed requestAnimationFrame/timers after samples until progress/proposal/debug stabilize.
- Credentials and scenario inputs are environment variables only; missing any required var → describe.skip. Never commit secrets.
- Mock Node-incompatible persistence (LocalStorage/MMKV-style) as needed so published-data load works in Jest node environment.
- Keep AFM focus collaborator pointing at the same MetaAtlasCore (class) instance (getCurrentFocus) used for bootstrap and currentFocus alignment with L1 at start.
- Prefer observing NavigationUIHandlers, getRouteFollowingDebug, visualizer method spies, and AFM proposal/updated listeners; avoid asserting private fields unless a minimal last-resort peek is unavoidable for hold (prefer observable freeze/resume of progress instead).
- Glossary and ADR already recorded under MetaAtlasCore; implementation must respect MetaAtlasCore membership (no MapLibre/RN shell imports inside Core).

## Testing Decisions

- Good tests assert external behavior at the collaborator and handler surfaces: proposals emitted, where published, debug where path, visualizer calls, progress/complete/reroute callbacks, snap/follow along L1 then L2—not internal cache key strings or private field values.
- Modules under test: MetaAtlasCore (class) bootstrap against live data; routing-core compute; NavigationEngine live session; GPSController simulate path; AutoFocusManager portal propose/accept and notifyManualFloorChange. Fakes are only platform collaborators outside Core.
- Prior art: MetaAtlasCore membership boundary test; routing-core dead-zones / sensors / segment-decomposition units; gps nav-adapter twins and taxonomy-update-store tests (AFM propose/accept patterns); handle within-terminal-live-start tests (orchestration with mocked engine—this pillar inverts that by real engine + fake shell). Sample-app throwaway harness remains device QA, not a substitute for this suite.
- Structure: shared helpers (live bootstrap, collaborators, rAF clock, route walk) + one primary live-multi-where scenario file with happy path and host-floor cases; long timeout; skip without env.
- Precondition guard: assert multi-where + portal structure on computed route before walking.

## Out of Scope

- PDR, dead zones, start-anchor PDR, and quality-recovery PDR
- Airside / ToTerminal / FromTerminal modes
- Mounting MetaAtlasSDK, routing handle, or sample-app harness
- Detox/Maestro or device walkthrough as the gate for this ticket
- TaxonomyUpdateStore / popup UI
- Checked-in published-data fixtures as the primary path (live env is the decision; fixtures would be a later optional hybrid)
- Completing full requestRerouteFromPosition → new route → notifyReroute loop in v1 (assert invoke is enough)
- Claiming green means every routing-core change is safe
- Changing production NavigationEngine APIs solely for testability
- Publishing a separate npm MetaAtlasCore package

## Further Notes

- Required env (indicative names): API URL, token, secret, host, tileserver role, start lng/lat, start where, dest map-object id.
- Confidence claim: this is a live multi-where WithinTerminal navigation regression pillar for MetaAtlasCore/routing-core. Expand with separate scenario files later (PDR, Airside, snap/reroute thresholds).
- Coordinate order remains [lng, lat] everywhere in the harness.
- Related device QA (sample harness / venue walk) stays complementary, not replaced by this ticket.
