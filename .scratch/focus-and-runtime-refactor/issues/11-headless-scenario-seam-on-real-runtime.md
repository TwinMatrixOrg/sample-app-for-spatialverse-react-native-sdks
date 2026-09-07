# 11 — Headless scenario seam on the real runtime

**What to build:** One high seam drives the whole Core graph. Headless Core scenario tests construct a real MetaAtlasRuntime, attach fake sensor, camera, marker, style, and display adapters from a shared factory, and assert on what those fakes received — layer filters committed, camera stops submitted and in what order, display routes set, subscribers told. They do not assert on which Core module called which other Core module. The old harness that hand-assembles Core modules and fake collaborators is replaced. Follow and mode behaviour is asserted at this seam; throttle and heading hysteresis stay at the controller seam.

**Blocked by:** 09 — Runtime owns Routing Manager and NavigationEngine

**Status:** done

- [x] A shared fake-platform factory produces Null-Object-compatible adapters for sensors, camera, marker, style, and routing display.
- [x] Headless Core scenario tests bootstrap a real MetaAtlasRuntime, attach those fakes, and drive the public surface. Assertions are on adapter receipts and subscriber notifications.
- [x] The hand-assembled collaborator harness is gone. Per-module tests that only duplicated what this seam covers fold into it.
- [x] Follow and SDK-mode behaviour that used to assert on a fake camera passed to UserLocationController now asserts at this seam. Throttle and heading hysteresis remain at the controller seam.
- [x] Runtime tests cover attach/detach idempotency under repeated mount and (if ticket 10 has landed) readiness aggregation; if ticket 10 has not landed, readiness assertions wait for it.
- [x] Adapter fakes are trustworthy in the same way the existing adapter-twin tests made platform fakes trustworthy: a fake that would drift from the real adapter is a test bug.
- [x] Typecheck and the offline suite stay green, including the rewritten scenarios. Live multi-where navigation still self-skips without credentials; this ticket does not build the credential-free fixture.
