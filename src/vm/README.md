# src/vm — the Anytime VM core

Owns: `VALUE`, `REFINE`, `COMPOSE` — and nothing else.

Hard rules:
- Substrate-agnostic: no DOM, no Node-only APIs, no network imports.
  This code must run in a browser, in Node, and later on bare metal.
- The core invariant `quality(refine(v)) >= quality(v)` is tested, not
  assumed. Every value kind ships its own quality definition.
- No fourth primitive. Ever, without the human's architecture decision.

Planned: `value.ts` (the `Value<T>` interface + base), `refine.ts`,
`compose.ts`, one value kind per file under `kinds/`.
