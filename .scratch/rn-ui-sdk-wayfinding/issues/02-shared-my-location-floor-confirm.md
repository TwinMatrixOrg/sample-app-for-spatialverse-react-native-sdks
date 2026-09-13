# 02 — Shared my-location floor confirm chrome

**What to build:** One shared my-location floor confirm chrome matching web RWS presentation: focus levels plus area/zone name suffixes when GPS intersects venue geofence areas (`FLOOR · ZONE…` style). The same primitive is ready for Onboarding (after successful find) and NavBridge (before my-location WithinTerminal compute). Host can override strings; paint follows theming Phases 1–3.

**Blocked by:** None — can start immediately.

**Status:** done

- [x] Shared confirm lists floors from focus levels, not floor codes alone.
- [x] When GPS intersects geofence area map objects, labels include relevant area/zone name suffixes in the RWS pattern.
- [x] Copy/layout follow web RWS chrome UX for this modal; host string overrides work.
- [x] Theming uses tokens / `theme.components` / `props.styles` (Phases 1–3); no parallel appearance-mode API on the confirm.
- [x] Onboarding and NavBridge can both mount/drive the same primitive without forking unrelated modals.
