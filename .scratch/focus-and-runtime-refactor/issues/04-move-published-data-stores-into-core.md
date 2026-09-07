# 04 — Move published-data stores into Core

**What to build:** Airside and template lookups stop being classified as platform concerns just because the store files sat outside Core. Published-data stores live inside Core as a role-keyed module-global cache (one live map is supported; this ticket does not lift that limit). Routing Manager no longer asks the host for those lookups.

**Blocked by:** 01 — Relocate modules to match ownership

**Status:** done

- [x] Published routing, map-object, and offline stores are Core members.
- [x] Airside-data and template-default lookups leave the Routing Manager platform contract; Routing Manager reads the Core stores directly.
- [x] Platform-level Routing Manager tests no longer stub those three host members.
- [x] The Core membership boundary test’s expected-path list includes the relocated stores.
- [x] Typecheck and the offline test suite stay green; fetch, decrypt, and cache behaviour is unchanged.
