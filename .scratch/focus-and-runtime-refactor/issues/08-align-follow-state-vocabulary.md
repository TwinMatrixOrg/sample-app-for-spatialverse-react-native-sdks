# 08 — Align follow-state vocabulary

**What to build:** Follow-state naming in code matches the glossary. Internals speak follow, not “out of focus” or “auto focus”. The public handle gains a follow-named query alongside the old name; the old name is removed in ticket 12. The retired setter and its replacement take a boolean with opposite meaning — call sites must be converted individually. A find-and-replace would invert follow behaviour silently, and the symptom (a camera that will not track, or will not stop tracking) would not point back at the rename.

**Blocked by:** 07 — CameraDirector arbitrates camera writes

**Status:** done

- [x] Internal follow-state readers and writers use the glossary spellings (`isFollowing` / `setFollow`). Former spellings (out-of-focus, auto-focus as names for this state) are gone from Core internals.
- [x] Every setter call site is converted by hand so the boolean meaning is not inverted. No project-wide replace of the old setter.
- [x] The public handle exposes the new follow query alongside the old name. Removal of the old name waits for ticket 12.
- [x] Host-facing behaviour is unchanged: follow still means the camera is tracking the user, mode-dependent as the glossary already defines.
- [x] Typecheck and the offline suite stay green. Tests that read follow state use the new internal names; public-handle tests still cover the old query until ticket 12.
