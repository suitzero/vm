import { describe, it, expect } from 'vitest';
import { MonteCarloPiValue, MonteCarloPiRefiner } from './mc-pi.js';
import { run } from '../runtime/runner.js';

// Linear congruential generator for deterministic tests
function lcg(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

describe('MonteCarloPi', () => {
  it('quality() is monotone (it improves after a refinement step)', () => {
    const initial = new MonteCarloPiValue({ estimate: 0, samples: 0, inside: 0 });
    const refiner = new MonteCarloPiRefiner(10); // small batch

    const step1 = refiner.step(initial);
    expect(step1.value.quality()).toBeGreaterThan(initial.quality());

    const step2 = refiner.step(step1.value);
    expect(step2.value.quality()).toBeGreaterThan(step1.value.quality());
    
    // Core invariant: uncertainty(refine(V)) <= uncertainty(V)
    // translated to quality convention: quality(refine(V)) >= quality(V)
  });

  it('estimate converges toward Math.PI as samples grow', () => {
    const initial = new MonteCarloPiValue({ estimate: 0, samples: 0, inside: 0 });
    // Use fixed seed for reproducible randomness
    const random = lcg(42);
    const refiner = new MonteCarloPiRefiner(1000, random);

    let current = initial;
    // Do 100 steps of 1000 samples (100,000 samples total)
    for (let i = 0; i < 100; i++) {
      current = refiner.step(current).value as MonteCarloPiValue;
    }

    const { estimate } = current.current();
    // At 100k samples, it should be reasonably close to Pi.
    // E.g., within 0.05
    expect(Math.abs(estimate - Math.PI)).toBeLessThan(0.05);
  });

  it('works with the budget runner and larger budgets give no-worse quality', () => {
    const initial = new MonteCarloPiValue({ estimate: 0, samples: 0, inside: 0 });
    const random = lcg(123);
    const refiner = new MonteCarloPiRefiner(10, random);

    const budget10Result = run(initial, refiner, 10);
    const budget20Result = run(initial, refiner, 20);
    const budget50Result = run(initial, refiner, 50);
    
    // Cost of one step is 10.
    // Budget 10 -> 1 step.
    // Budget 20 -> 2 steps.
    // Budget 50 -> 5 steps.

    expect(budget10Result.quality()).toBeGreaterThan(initial.quality());
    expect(budget20Result.quality()).toBeGreaterThanOrEqual(budget10Result.quality());
    expect(budget50Result.quality()).toBeGreaterThanOrEqual(budget20Result.quality());
    
    // Explicitly check strict improvement because we know 1 step < 2 steps
    expect(budget20Result.quality()).toBeGreaterThan(budget10Result.quality());
  });
});
