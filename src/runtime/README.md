# src/runtime — placeholder (not yet)

Future home of the ANYTIME RUNTIME layer: budget, scheduling,
distribution, parallelism.

Not a VM instruction. Not started. The VM core must be proven first —
see SPEC.md "Layers". When this layer starts, it may only call the VM's
three primitives; it may never reach into a value's representation.
