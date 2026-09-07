# 12 — Batch the public handle breaks

**What to build:** Hosts upgrade once. The two deliberate handle changes plus the previously untyped viewport-focus method land in one release with a migration note. The layer-filter handle method is removed; the replacement is the focus method with camera movement disabled. The follow-state query is renamed to say it reports camera follow, not floors. The viewport-focus method is properly typed. The UI SDK bridge contract updates in the same change because both packages ship together. Everything else on the imperative handle keeps working. Independently re-verify that no React Native consumer still calls the removed method — the earlier audit found none, but vendored SDK copies in the demo app and the legacy front end make that search noisy.

**Blocked by:** 08 — Align follow-state vocabulary; 10 — Per-module readiness with typed not-ready errors; 11 — Headless scenario seam on the real runtime

**Status:** done

- [x] The layer-filter handle method is gone. The documented replacement is the existing focus method with camera movement disabled. Re-audit RN consumers, including vendored SDK copies, before deleting.
- [x] The public follow-state query uses the glossary name. The old query name is removed from typings and the handle.
- [x] The viewport-focus method is fully typed (no `any` default floor).
- [x] The UI SDK bridge type and its follow-state / focus-change usage compile against the new handle. Floor-rail subscription is still `subscribeToFocusChange` only.
- [x] A migration note lists the three breaks and the inverted-boolean trap on the follow setter (already converted internally in ticket 08; hosts that called the old setter via PORTING surfaces are called out).
- [x] Glossary, Core README, PORTING notes, and remaining CONTEXT entries that still mention the old handle names or the two-headed data-service name are updated. Decision records from earlier tickets are not rewritten here.
- [x] Characterisation tests at the runtime seam pass with the new names. Typecheck and the offline suite stay green.
