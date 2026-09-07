# 03 — Extract style-core and rename the data service

**What to build:** Layer-filter and layer-style logic is its own Core module. The credentials / authentication / published-data / search class is named MapDataService so the glossary can drop the two-headed MetaAtlasCore entry. A deprecated alias keeps the old class name for one release for external consumers; internal tests migrate immediately. Style-sheet commit stays outside Core — Core computes, the platform applies — recorded as a decision and enforced by a React / React Native import ban, not by a guard against importing style assets.

**Blocked by:** 01 — Relocate modules to match ownership

**Status:** done

- [x] Where-filter and layer-style computation lives in its own Core module, not on the data-service class.
- [x] The data-service class is MapDataService (credentials, auth, published routing/search/offline data, map-object search). A deprecated alias export of the old name remains for external consumers.
- [x] Internal tests use MapDataService immediately; they do not keep exercising the alias.
- [x] The style-commit-stays-outside-Core decision is recorded. Membership test bans React and React Native imports anywhere in Core. There is deliberately no ban on importing style assets.
- [x] Typecheck and the offline test suite stay green; search and published-data fetch behaviour is unchanged.
