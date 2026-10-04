# Anytime VM — Specification v0.1

Source of truth for all implementation work. Read this before every task decision.

## The bet

CPUs and GPUs are not required by the programming model — they only add
complexity. Build the VM first. Once the VM works, hardware is an
implementation of the VM's contract: laptop GPU, datacenter, ASIC,
photonics, 100,000 optical nodes all execute the same VM.

Optics is a future substrate, not today's work. Today's work is the
compute model. This decouples the research bet (compute model) from the
hardware timeline bet (photonics).

## The three primitives

The VM has exactly three primitives. Nothing else is a VM instruction.

```
VALUE    — a refinable value
REFINE   — reduce a value's uncertainty (the core)
COMPOSE  — build bigger computations out of values
```

Lisp's question applies to everything proposed: **"can this be expressed
with the rest?"** A fourth primitive is added only when a computation is
found that cannot be expressed with these three. Never sooner.

## VALUE

A value is not a plain datum. It is:

```
VALUE {
    representation    // current best estimate
    quality           // how good the estimate is
    refinement        // how to improve it
}
```

Interface:

```ts
interface Value<T> {
    current(): T        // current best estimate
    quality(): number   // higher = better; meaning defined by the value
}

interface Refiner<T> {
    step(v: Value<T>): { value: Value<T>, cost: number }
}
```

### The core invariant

```
quality(step(V).value) >= quality(V)
```

Computation is not the act of producing a value. **Computation is the act
of reducing uncertainty.** Every program is:

```
estimate → refine → refine → refine → …
```

with resources > 0 always yielding a result. There is no
"resources < requirement → cannot run". There is only
"fewer resources → coarser estimate".

### Quality is defined by the value

Do NOT force an (estimate, uncertainty) pair onto every value. Numbers are
easy (`3.14 ± 0.01`); images, worlds, and behaviors are not. Each value
kind defines what its quality means.

**Quality convention:** Higher is always better. Error-type measures (like width, variance, or distance) should be converted to negative numbers (e.g., `quality = -width`).

| Value kind           | quality() means                        |
|----------------------|----------------------------------------|
| number               | error bound (e.g. ±0.01)               |
| image                | reconstruction / perceptual error      |
| Monte Carlo          | variance                               |
| world model          | confidence / consistency               |
| neural representation| task-defined fidelity                  |

## REFINE

Refinement is the only computation the VM understands. Budget, scheduling,
and parallelism decide *how much* refinement happens and *where* — never
*what* refinement means. That meaning belongs to the value.

## COMPOSE

Composition builds larger computations from values. Parallel
decomposition (split/join, map/reduce) is a **runtime implementation
strategy**, not an ISA primitive. Baking split/join into the ISA would
bake an execution model (MapReduce/CUDA-style) into the language — the
exact complexity this project exists to remove. First attempt: express
parallelism through COMPOSE and let the runtime decide how to spread it.

## Layers

```
WORLD
─────────────────────────────
read / commit / tick
lockstep / synchronization

ANYTIME RUNTIME
─────────────────────────────
budget, scheduling, distribution, parallelism

ANYTIME VM
─────────────────────────────
VALUE / REFINE / COMPOSE
```

The VM knows nothing about the world. Nothing about GPUs. Nothing about
the network. Nothing about how many machines exist. That ignorance is the
design: it is what lets one box and a datacenter run the same program.

- `read / commit / tick` are **world runtime semantics**, not VM instructions.
- `budget` is a **runtime/scheduler property**, not a VM instruction.

## First experiments

Deliberately NOT matrix multiplication first — that would lock thinking
into "GPU/optical accelerator benchmark" from day one. Instead, two
completely different problems on the identical interface:

**π** — `3 ± 1 → 3.1 ± .1 → 3.14 ± .01 → 3.141 ± .001 → …`

**image rendering** — `blocks → coarse image → better → better → …`

If numbers, images, and simulations all run on the same three
primitives, we are approaching a general computation abstraction. If only
matrices work, we built an approximate linear algebra library — a
failure of scope, not of engineering.

## Roadmap

1. **Now:** VALUE / REFINE / COMPOSE + π + image on the same interface.
2. **Then:** a small world as a value — `World = Value`.
3. **Later:** the scheduler itself as a value — `Scheduler = Value`.
4. **The philosophy, as architecture:** `code = data = value = refinable computation`.

## Rules for agents

1. `src/vm/` is substrate-agnostic: no DOM, no Node-only APIs, no network
   imports in the core. It must run in a browser, in Node, and (later) on
   bare metal alike.
2. Every feature must demonstrate one of: the same three primitives
   expressing a *different* computation, or monotonic quality
   (`quality(refine(v)) >= quality(v)`, tested).
3. Do not add a fourth primitive. If you believe one is needed, write the
   computation that cannot be expressed and stop — the architecture
   decision stays with the human.
4. Headless tests (vitest) ride along with every change. CI must be green.
5. Never optimize for architectural completeness. Optimize for the
   smallest runnable proof of the abstraction.
