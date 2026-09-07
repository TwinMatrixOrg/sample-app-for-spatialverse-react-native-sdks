# 07 — Focus-depth on the same imperative handle

**What to build:** An RWS RN host can drive floor/site pickers from the MetaAtlasSDK ref using the web 3.1.8 focus-depth surface — `getRootNodes`, `getChildNodes`, `getNodesAtDepth`, `getNodeDepth`, `getSubtreeMaxRelativeDepth`, `getSelectorTierCount`, `findNodeByTaxonomy`, `getAncestors`, `FocusNodeInfo` — without a React `useFocus` hook. Typings match the handle.

**Blocked by:** 01 — Freeze the typed MetaAtlasSDK handle and fail-loud routing contract

**Status:** ready-for-agent

- [ ] The listed focus-depth getters (and `FocusNodeInfo`) are implemented on the imperative handle and declared in public typings.
- [ ] Hosts can list roots, children, nodes at a depth, depths/subtree depth, selector tier count, find by taxonomy, and read ancestors without a `useFocus` hook.
- [ ] Handle-level tests show the methods are present and return listings consistent with the loaded focus tree (external behavior only — not private tree internals).
- [ ] This ticket does not add web React hooks (`useFocus`, `useRouting`, …) or change routing/nav.
