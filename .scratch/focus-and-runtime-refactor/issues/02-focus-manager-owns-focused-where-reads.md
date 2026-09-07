# 02 — FocusManager owns focused-where reads

**What to build:** A FocusManager in the focus module is the answer for every derived read of the focused where-taxonomy (focused building, focused floor, viewport building, viewport check, camera-stop resolution from the tree). AutoFocusManager — including the disabled-but-compiled altitude-proposal path — and Routing Manager read it directly instead of through shell-synthesized ports. Duplicate bounds and floor-band helpers collapse onto the focus module’s shared versions. Commit still goes through the shell; this ticket does not yet fix the silent-notify path.

**Blocked by:** 01 — Relocate modules to match ownership

**Status:** done

- [x] FocusManager is a class plus a module-level accessor; the focus tree itself remains a module-level singleton.
- [x] Derived focus reads that today live on the data-service class become one-line delegates onto FocusManager (or move entirely); callers that are Core modules stop going through the shell.
- [x] AutoFocusManager reads FocusManager directly; the nested accessor object the shell synthesizes for it is gone.
- [x] The unreachable altitude-proposal evaluation still compiles and reads focus from FocusManager; it is not commented out.
- [x] Routing Manager reads FocusManager directly; the focus-read member leaves its platform contract, and platform-level Routing Manager tests are retargeted.
- [x] Duplicate bounds-polygon and floor-band helpers in the proposal bus collapse onto the focus module’s shared versions.
- [x] Typecheck and the offline test suite stay green. Local sign-off: live multi-where navigation still passes when credentials are present.
