# Project Rules

## 1. Investigation Strategy

**Read the working equivalent first.**
Before investigating a broken component, find an analogous component that already works correctly and read how it solves the same problem. This is always faster than searching from scratch.

**Prefer a single broad read over repeated narrow greps.**
If a `grep` does not resolve the question within 3 attempts, stop and read the relevant file section directly (50–100 lines). Repeated narrow searches on the same file compound token cost without producing new information.

**State a hypothesis before executing each command.**
Before running a shell command, write explicitly: "I expect to find X at location Y." If the result does not match, update the hypothesis. Do not run a variation of the same command.

---

## 2. Debugging Loop Prevention

**Hard limit: 3 attempts per sub-problem.**
If the same investigation approach has not produced a clear answer after 3 commands, switch strategy — read the full file, check a working equivalent, or invoke the debug tool for a fresh-context diagnosis.

**Recognize the loop signal.**
More than 5 commands on the same sub-problem without a conclusion is a loop. The correct response is: read the full relevant file once, or use `webdev_debug` to get an independent diagnosis.

**Separate investigation from implementation.**
Complete the full investigation for all issues before writing any code. Fixing one issue before fully understanding another can invalidate earlier findings and introduce new loops.

---

## 3. Task Batching

**Batch issues that share the same files or components.**
Multiple issues on the same page (e.g., all product detail page fixes) should be submitted together. One code read covers all fixes, reducing total token cost.

**Separate issues that are on different pages or systems.**
Issues on unrelated pages or features should be separate tasks. They share no code context, so batching them provides no efficiency gain and makes rollback harder.

**The token cost driver is debugging loops, not issue count.**
Submitting many issues at once is not inherently expensive. Misidentifying a root cause and re-investigating is what causes token waste.

---

## 4. Code Change Discipline

**Roll back cleanly.**
Use `git revert` (not `git reset --hard`) to preserve history. Always confirm the revert commit was pushed before starting new work.

**One commit per logical change group.**
Group related fixes into a single commit with a descriptive message. Unrelated changes belong in separate commits to make rollback precise.

**Verify the field name before writing filter logic.**
When filtering by a data field (e.g., `item.title` vs `item.label`), confirm the exact field name from the TypeScript interface before writing the condition. A one-word mismatch causes silent failures that are expensive to debug.

---

## 5. CSS Layout Rules

**Account for fixed headers explicitly.**
Any page that sits below a fixed promo bar + fixed header must have `padding-top: calc(promoHeight + headerHeight)` on its root element. Do not assume the layout handles this automatically.

**Check the working page equivalent for offset patterns.**
Before adding a new `padding-top`, read how an already-working page (e.g., Collections) handles the same offset. Copy the pattern exactly.

**Full-bleed layouts require `max-width: none`.**
Any navbar or section intended to span the full viewport width must have `max-width: none` (or `unset`) on its container. A `max-width` cap combined with `margin: 0 auto` will center-constrain the layout on wide screens.
