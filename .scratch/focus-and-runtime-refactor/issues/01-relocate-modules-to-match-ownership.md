# 01 — Relocate modules to match ownership

**What to build:** Folder membership matches what the modules actually do. AutoFocusManager, AltitudeManager, and the taxonomy-update store live in the focus module; UserLocationController lives in the sensor module. Exported names are unchanged. Hosts and tests keep compiling against the same public types.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [x] AutoFocusManager, AltitudeManager, and the taxonomy-update store are members of the focus module.
- [x] UserLocationController is a member of the sensor module, not re-exported from the Core root as if it belonged there.
- [x] Public type and class names are unchanged (`AutoFocusManager`, `TaxonomyUpdateStore`, proposal types, `UserLocationController`).
- [x] The Core membership boundary test’s expected-path list matches the new layout.
- [x] Typecheck and the offline test suite stay green; this ticket changes no behaviour.
