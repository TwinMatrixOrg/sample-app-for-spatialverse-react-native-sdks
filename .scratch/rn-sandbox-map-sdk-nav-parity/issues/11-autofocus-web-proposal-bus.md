# 11 — Port web AutoFocus proposal bus to RN (altitude path copied, not enabled)

**What to build:** RN AutoFocusManager matches web **proposal/accept** behavior. Portal and (copied, disabled) altitude paths emit proposals; the map focuses only after accept. GPS altitude is plumbed for a later flip. No sample-app floor popup.

**Blocked by:** 03 — RN adapter twins (AutoFocus is a commit bus today)

**Status:** ready-for-agent

**Testing seam (confirm before coding if this is wrong):** one seam — `AutoFocusManager` public API, same place as existing GPS adapter twin tests. Do not mount the map. Do not assert MapLibre filters. Dead `evaluate()` is only asserted as “GPS ticks do not emit proposals.”

---

## Problem Statement

On web, AutoFocus is a proposal bus: navigation (and later GPS altitude) **asks** to change floor; the host **accepts**; then `focusTo` updates map focus. On RN, AutoFocus **commits immediately** and only filters route layers. Hosts cannot show a confirm UI, cannot reject, and live-nav portal floors do not go through the same accept → focus path as web. GPS fixes also drop altitude, so the copied altitude path cannot be turned on later without another GPS pass.

## Solution

Port the web AutoFocusManager collaborator contract onto RN: proposals, accept/reject/override, suppression, cooldowns. Wire `updated` to existing `focusTo`. Copy `evaluate()` **including the stub `return`** so altitude floor mapping is present but **off**. Copy AltitudeManager and plumb GPS `altitude` so that stub can be deleted later. Floor-band and bounds helpers in the copied `evaluate` body use RN `FocusNode` (children, `altMin`/`altMax`, `bounds`) — do not invent web `building.floors`. No sample FloorChangePopup and no SDK auto-accept.

## User Stories

1. As a map SDK host, I want portal floor changes as **proposals** with an id, so that I can confirm or dismiss them.
2. As a map SDK host, I want accept to apply focus via existing `focusTo`, so that basemap and route layers match the new where-taxonomy.
3. As a map SDK host, I want reject to leave the current floor, so that a false portal ping does not switch the map.
4. As a map SDK host, I want `manualOverride` to accept a different where-taxonomy than proposed, so that the user can pick another floor.
5. As a map SDK host, I want `notifyManualFloorChange` to notify AutoFocus and the navigation engine, so that a user floor pick during nav can reroute.
6. As a map SDK host, I want `onWhereTaxonomyUpdated` after a successful accept, so that I can sync chrome without polling.
7. As a map SDK host, I want `onWhereTaxonomyUpdateProposed` before any map change, so that I can render my own confirm UI later.
8. As a map SDK host, I want no map focus change until accept, so that RN matches web when I have not built a popup yet.
9. As a navigation user approaching an escalator, I want the engine to propose the destination floor, so that turn-by-turn can change levels.
10. As a navigation user, I want duplicate portal proposals for the same portal key suppressed, so that the UI is not spammed.
11. As a navigation user after a reroute, I want portal suppression reset, so that a new route can propose floors again.
12. As a navigation user on Android live nav, I want GPS-altitude floor proposals **off**, so that altitude does not fight portal proposals.
13. As a navigation user after `stopNavigation`, I want altitude switching allowed again (`setShouldSwitchFloor(true)`), so that roaming can use altitude later.
14. As an iOS navigation user, I want real-device altitude proposals skipped (same as web production), so that bad barometer/GPS altitude does not flip floors.
15. As a host on iOS, I want `isIOSDevice` / `notifyManualFloorChange`, so that I can drive floors from a picker instead of altitude.
16. As a GPS consumer, I want each fix to include `altitude` and `altitudeAccuracy` when the device reports them, so that AltitudeManager can map floors when `evaluate` is enabled later.
17. As a future maintainer, I want `evaluate()` copied with the leading stub `return`, so that enabling altitude is deleting one line plus trusting FocusNode helpers—not rewriting GPS.
18. As a future maintainer, I want floor bands built from FocusNode leaves with `altMin`/`altMax`, so that enabling altitude does not require a web `Building`/`Floor` type on RN.
19. As a future maintainer, I want building/site **bounds** checks to use FocusNode `bounds`, so that off-site GPS cannot propose floors when evaluate is live.
20. As a QA engineer, I want GPS ticks while evaluate is stubbed to emit **no** altitude proposals, so that we do not silently enable the feature.
21. As a NavigationEngine, I want `proposeFromNavigation` to return whether a proposal was emitted, so that portal visual hold still aligns with a real proposal.
22. As a NavigationEngine, I want `addWhereTaxonomyUpdatedListener` to fire only after accept/manual paths, so that tracking-line and PDR rebind run when focus actually changes.
23. As a NavigationEngine, I want live-nav `setShouldSwitchFloor(false)` on Android unchanged, so that portal proposals remain the floor source during follow.
24. As a host calling `focusTo` after accept with default `shouldMoveCamera` false, I want the follow camera to stay with the navigation engine, so that accept does not fly the map away from the user.
25. As a host, I want `getAutoFocusLastAcceptedWhereTaxonomyPath`, so that start-floor context can prefer last accepted AutoFocus where.
26. As a host, I want `setShouldSwitchFloor` / `toggleAltitudeInGPSCalculation` on the SDK handle, so that I can pause altitude later without forking AutoFocus.
27. As a host, I want `getAutoFocusManager` for advanced listeners, so that I am not blocked if the handle wrappers miss an edge.
28. As a TypeScript host, I want `WhereTaxonomyProposal` as a discriminated `altitude | portal` union on the public typings, so that my UI can branch on `kind`.
29. As a developer of adapter twin tests, I want `proposeFromNavigation` **not** to invoke `updated` listeners, so that the old RN commit-bus test is replaced.
30. As a developer, I want accept of a portal proposal to invoke `updated` with the proposed where-taxonomy, so that host `focusTo` is testable without a map.
31. As a developer, I want a second identical portal key to be ignored until `resetPortalProposalSuppression`, so that suppression is specified.
32. As a developer, I want `setShouldSwitchFloor(false)` to still allow portal `proposeFromNavigation`, so that we do not regress Android live-nav.
33. As a map user whose host never accepts, I want the floor to stay put, so that web’s pending-proposal contract is honored (blue-dot portal hold may freeze until accept—same as web).
34. As a SDK maintainer, I do not want AltitudeDataGenerator or localStorage altitude QA, so that production GPS altitude is the only new sensor field.
35. As a SDK maintainer, I do not want a sample-app FloorChangePopup in this ticket, so that the SDK contract is shippable without product UI.

## Implementation Decisions

- Replace RN AutoFocusManager’s immediate-`updated` portal path with the web collaborator: constructor `(gpsController, altitudeManager, routingVisualizerLike)`, `start`/`stop`, proposal listeners, `updated` listeners, accept/reject/manualOverride, `notifyManualFloorChange`, `resetPortalProposalSuppression`, `setShouldSwitchFloor`, `proposeFromNavigation` (proposal only), `evaluate` copied **with** the leading stub `return`.
- iOS flag via `Platform.OS === 'ios'` (not `navigator.userAgent`).
- RoutingVisualizer collaborator: thin `main.metaAtlasCore` facade exposing `getCurrentFocus`, `getCurrentFocusBuilding`, `getUserViewportBuilding` so the copied `evaluate` body can compile. Do not add a web `site.buildings.floors` model.
- Copied `evaluate` helpers that map altitude → floor and GPS-in-polygon bounds must use RN `FocusNode`: leaf children + `altMin`/`altMax` (from existing altitude-config merge), and `bounds` on building or parent. They do not run until the stub `return` is removed.
- Copy AltitudeManager as-is (floor ranges + `updateAltitude` + `getCurrentFloor`). Do not copy AltitudeDataGenerator or GPS altitude simulation toys.
- Plumb `altitude` and `altitudeAccuracy` on GPSPosition through watch/getCurrent/simulate/trigger paths. `simulatePosition` may omit altitude (undefined). Add `isSyntheticGpsEmitActive(): false` on GPSController so copied `evaluate` typechecks; do not implement synthetic altitude QA.
- Call `AutoFocusManager.start()` when the manager is constructed (GPS subscribe), matching web lifecycle even though `evaluate` no-ops.
- Host wiring: `updated` → existing `focusTo(path, shouldMoveCamera)` (basemap style rewrite + route-layer filter + optional camera + focus subscribers). Remove the route-layers-only AutoFocus listener.
- `acceptProposal` uses web default `shouldMoveCamera = false`.
- Public MetaAtlasSDK handle (and typings) grows web-parity methods: `onWhereTaxonomyUpdateProposed`, `onWhereTaxonomyUpdated`, `onWhereTaxonomyAutoRejected`, `acceptProposal`, `rejectProposal`, `manualOverride`, `notifyManualFloorChange`, `setShouldSwitchFloor`, `toggleAltitudeInGPSCalculation`, `isIOSDevice`, `getAutoFocusLastAcceptedWhereTaxonomyPath`, `getAutoFocusManager`. `GPSPosition` on the public type gains optional `altitude` / `altitudeAccuracy`.
- NavigationEngine keeps current AutoFocus calls (`proposeFromNavigation`, `setShouldSwitchFloor`, `resetPortalProposalSuppression`, where-taxonomy listener). Do not change snap/PDR/camera math.
- No SDK auto-accept if zero proposal listeners.
- NavigationEngine `NavigationAutoFocusManagerLike` may widen to the real manager; engine must not require proposal-UI types.

Proposal shape (from web, lock this):

```ts
type WhereTaxonomyProposal =
  | {
      kind: 'altitude';
      whereTaxonomyPath: string;
      id: string;
      autoAcceptCooldownMs: number;
    }
  | {
      kind: 'portal';
      whereTaxonomyPath: string;
      id: string;
      autoAcceptCooldownMs: number;
      portal: {
        segmentIndex?: number;
        instructionLine?: string;
        portalName?: string;
        description?: string;
      };
    };
```

## Testing Decisions

- Good tests observe **external** AutoFocus behavior: which listener channel fires, proposal `kind`/`id`/`whereTaxonomyPath`, accept/reject effects, suppression, `setShouldSwitchFloor` not blocking portals, GPS callback + stub `evaluate` emitting no proposals. Do not assert internal maps, cooldowns as magic numbers unless they change observable emit/skip, or MapLibre layer filters.
- Primary module: AutoFocusManager. Prior art: existing AutoFocus/GPS/motion cases in the GPS adapter twin tests — **rewrite** the AutoFocus case (today it expects `updated` on `proposeFromNavigation`).
- Optional same-file GPS cases: a mapped device position preserves `altitude` / `altitudeAccuracy` when present.
- Do not add NavigationEngine or MapView tests for this ticket.
- Do not test the dead `evaluate` body (bands/bounds) beyond “no altitude proposal on GPS tick.”

## Out of Scope

- Sample-app FloorChangePopup / TaxonomyUpdateContext
- SDK auto-accept or cooldown auto-accept
- Enabling `evaluate` (removing the stub `return`)
- AltitudeDataGenerator, localStorage/Changi altitude QA, synthetic GPS altitude emit
- Changing NavigationEngine snap, reroute, PDR, or camera-follow
- Web `setFilter` MapLibre GL JS path; RN keeps `focusTo` / style JSON
- Shared package between web and RN AFM
- `getAltitudeManager` (web handle currently returns null)

## Further Notes

Ticket 03 left AutoFocus as a **commit** bus (“portal `proposeFromNavigation` stays live”). This ticket **reverses that** to web’s proposal bus. Live-nav floors will not change in the sample app until a host calls `acceptProposal` (or `manualOverride` / `notifyManualFloorChange`). That is intentional.

Enabling altitude later: delete `evaluate`’s stub `return`, confirm FocusNode bands/bounds, keep Android live-nav `setShouldSwitchFloor(false)`.

- [ ] AutoFocusManager is a proposal bus: `proposeFromNavigation` hits proposal listeners, not `updated`
- [ ] accept/reject/manualOverride/`notifyManualFloorChange` match web
- [ ] Host `updated` → `focusTo`; public handle + typings for proposal APIs
- [ ] GPSPosition carries altitude fields; AltitudeManager copied; `evaluate` copied with stub `return`
- [ ] FocusNode helpers for bands/bounds in the copied body (unused at runtime)
- [ ] Android live-nav still `setShouldSwitchFloor(false)`
- [ ] Twin tests rewritten; no MapLibre mount
