# 05 — Land the MetaAtlasRuntime skeleton

**What to build:** Core owns a composition root. MetaAtlasRuntime constructs MapDataService and FocusManager in declared order, exposes an idempotent bootstrap and a single platform attach/detach pair, and warns in development if a second concurrent bootstrap is attempted. The shell creates one runtime per mounted map and stops constructing those two modules itself. The runtime holds no domain logic. The public imperative handle stays in the shell. This extends the existing Null Object plus explicit-attach decision.

**Blocked by:** 02 — FocusManager owns focused-where reads; 03 — Extract style-core and rename the data service

**Status:** done

- [x] MetaAtlasRuntime is the composition root for MapDataService and FocusManager. Construction order is declared in the runtime, not inferred from which “ensure” helper throws.
- [x] Bootstrap is idempotent. Attach and detach are a named pair; repeated mount (Fast Refresh / StrictMode) replaces rather than stacks subscriptions.
- [x] A second concurrent bootstrap emits a development-only warning. Multi-map support is not delivered.
- [x] The shell creates the runtime once per mounted map and attaches platform handles as views commit. It no longer constructs MapDataService or FocusManager.
- [x] Membership test lists the runtime, bans barrel self-imports on it (same rule Routing Manager already follows), and keeps the React / React Native import ban.
- [x] The composition-root decision record lands (extends the Null Object and attach record; also records the MapDataService rename).
- [x] Typecheck and the offline test suite stay green. The public handle is unchanged.
