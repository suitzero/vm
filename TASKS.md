# Anytime VM — Task List v0.1 (Track A: Value / Refiner split)

This repo is **Track A** of a two-track design experiment. Track B is
`suitzero/StreetVM`, which runs the same task list against a different core
design: there `refine()` lives inside Value per the original SPEC. Here,
Value and Refiner are separate objects. Same rules, same tests, same tasks —
after Task 2 and Task 4 the two designs are compared, and after Task 5 both
tracks implement the same new value kind (Monte Carlo π) as a final exam.

Read SPEC.md first. Rules for every task:
- One task = one PR. CI (typecheck + test + build) must be green.
- `src/vm/` stays substrate-agnostic: no DOM, no Node-only APIs.
- Do NOT add code to `src/world/`, GFL, or anything optics-related.
- Do NOT add a fourth primitive. If you think one is needed, write the
  counterexample in the PR description and stop.
- Smallest runnable proof wins. No speculative abstractions.

---

## Task 1 — Green CI + honest README
- Add package-lock.json (CI uses `npm ci`).
- Add a minimal `src/vm/value.ts` and one trivial test so tsc and vitest pass.
- Change README "Status" to: "v0.1 — design stage. Core not yet implemented."

Done when: CI is green on main.

## Task 2 — Value / Refiner split (this track's design)
- `Value<T>`: `current(): T`, `quality(): number`. Immutable.
- `Refiner<T>`: `step(v: Value<T>): { value: Value<T>, cost: number }`.
- Quality convention: higher = better. Error-type measures are converted
  (e.g. quality = -width). Document this in SPEC.md.
- Update SPEC.md interface section to match.
- Add a `trace(value, refiner, n)` helper returning [{current, quality, cost}].

Done when: a property test checks `quality(step(v)) >= quality(v)` for a
toy value kind.

## Task 3 — Certified π (real computation, not digit reveal)
- Value kind `Interval`: { lo, hi }, quality = -(hi - lo).
- Refiner that computes actual bounds for π (e.g. Archimedes polygon
  bounds or a series with a proven remainder bound).
  Do NOT reveal hardcoded digits.
- Float precision is fine for v0.1; stop refining when width stops shrinking.
- Small driver prints the trace: step, [lo, hi], width, cost.

Done when tests show: every interval contains Math.PI, intervals are nested,
width never grows.

## Task 4 — COMPOSE on two numeric values
- `compose(add, x, y)` and `compose(mul, x, y)` on Intervals, returning a Value.
- Composite exposes which children can be refined, and the estimated
  quality gain per child.
- The composite must work with the same `trace` helper as a single value.

Done when a test with x = 10 ± 5, y = 100 ± 0.001 shows refining x is
chosen as more valuable than refining y.

## Task 5 — Minimal budget runner (`src/runtime/`)
- `run(value, refiner, budget)` → always returns a result for budget > 0.
- Greedy choice: pick the child refinement with best (quality gain / cost).
- Runtime only calls Value/Refiner interfaces; never reads representation.
- Same input + same budget → same result (deterministic).

Done when tests show: budget 1 returns a result; larger budget gives
quality no worse than smaller budget, on the Task 4 composite.

---

## Agent prompt template (for the sprint loop)

> You are implementing the Anytime VM on repo suitzero/vm (Track A:
> Value/Refiner split). Read SPEC.md and TASKS.md first. This track uses
> separate `Value<T>` (`current()`, `quality()`) and `Refiner<T>`
> (`step(v) -> { value, cost }`) — do NOT put refine() on Value.
>
> Task — <task title and description from TASKS.md>
> Acceptance criteria (ALL must hold): <done conditions from TASKS.md>
> Also add/extend headless tests for the logic you touched.
> End state: push your branch and open a PR against main. CI must be green.
> One task = one PR. Do not invent features beyond the task.
