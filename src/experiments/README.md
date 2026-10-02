# src/experiments — first proofs of generality

Two completely different problems, one identical interface
(`current()` / `quality()` / `refine()`):

- `pi/` — digits of π: `3 ± 1 → 3.1 → 3.14 → 3.141 → …`
  (quality = error bound)
- `image/` — progressive rendering: `blocks → coarse → better → …`
  (quality = reconstruction error)

Deliberately not matrix multiplication first: the point is the
abstraction, not an accelerator benchmark.

Each experiment ships a headless test asserting monotonic quality and a
tiny driver that refines N steps and prints the estimate/quality trace.
