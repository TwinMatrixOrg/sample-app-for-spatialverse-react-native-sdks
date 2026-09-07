# 06 — FocusManager owns the commit

**What to build:** The focused where-taxonomy has exactly one writer. FocusManager commits in one path — write state, compute where-filters, hand layer data to the style port, submit a camera stop when a move was requested, then notify subscribers. Commit strictly precedes notification. Every commit notifies, including the path that previously moved focus silently, so the UI SDK floor rail stays in sync no matter which method moved focus. The shell’s self-referential handle indirection (there only so Core could call back in to commit) is deleted. Routing Manager writes focus through FocusManager, so the focus-write member leaves its platform contract. The routing display adapter becomes a focus-change subscriber rather than something the commit calls. The public layer-filter handle method remains as a deprecated delegate until ticket 12.

**Blocked by:** 02 — FocusManager owns focused-where reads; 03 — Extract style-core and rename the data service; 05 — Land the MetaAtlasRuntime skeleton

**Status:** done

- [x] One commit operation owns write → where-filters → style port → optional camera submission → notify, in that order. A subscriber reading focus inside its own handler always sees the committed value.
- [x] Every commit notifies. The previously silent layer-filter path now notifies, so a host that takes that path no longer leaves the floor rail stale.
- [x] Focus-change subscription remains the single notification channel; consumers do not also have to listen to the proposal bus to stay current.
- [x] The style port (layer read + layer commit) is attached through the runtime’s platform attach, using Null Object plus explicit attach. Core computes; the platform applies.
- [x] Routing Manager writes focus through FocusManager; the focus-write member leaves its platform contract.
- [x] The routing display adapter subscribes to focus-change; the commit does not call it.
- [x] The shell’s self-referential handle indirection and its own subscriber set are gone; FocusManager owns the subscribers.
- [x] The public layer-filter handle method still exists as a deprecated delegate onto FocusManager (camera movement disabled). Removal waits for ticket 12.
- [x] The focus-ownership-and-commit decision record lands.
- [x] Characterisation tests assert on what the style port received and what subscribers were told — not on which Core module called which other. Typecheck and the offline suite stay green. Local sign-off: live multi-where navigation still passes when credentials are present. First-load still arrives at the right building and floor.
