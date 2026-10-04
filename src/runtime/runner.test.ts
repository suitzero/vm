import { describe, it, expect } from 'vitest';
import { run } from './runner.js';
import { Value, Refiner } from '../vm/value.js';
import { CompositeRefiner } from '../vm/compose.js';
import { Interval, IntervalValue } from '../experiments/pi.js';
import { compose, add } from '../experiments/compose.js';

class HalvingRefiner implements Refiner<Interval> {
  step(v: Value<Interval>): { value: Value<Interval>; cost: number } {
    const { lo, hi } = v.current();
    const mid = (lo + hi) / 2;
    const width = hi - lo;
    
    // Check if we can still refine (avoid infinite identical steps in edge cases)
    if (width <= 0) {
        return { value: v, cost: 1 };
    }

    const nextLo = mid - width / 4;
    const nextHi = mid + width / 4;
    return {
      value: new IntervalValue({ lo: nextLo, hi: nextHi }),
      cost: 1, // Let's give it cost 1 to make budget easy to test
    };
  }
}

describe('Budget Runner', () => {
  it('returns a result for budget > 0', () => {
    // x = 10 +/- 5
    const x = { value: new IntervalValue({ lo: 5, hi: 15 }), refiner: new HalvingRefiner() };
    // y = 100 +/- 0.001
    const y = { value: new IntervalValue({ lo: 99.999, hi: 100.001 }), refiner: new HalvingRefiner() };
    const compositeValue = compose(add, x, y);
    const refiner = new CompositeRefiner<Interval>();

    // Initial quality
    const initialQuality = compositeValue.quality();

    const result1 = run(compositeValue, refiner, 1);
    expect(result1).toBeDefined();
    
    // A budget of 1 is enough for 1 step (cost = 1)
    expect(result1.quality()).toBeGreaterThan(initialQuality);
  });

  it('larger budget gives quality no worse than smaller budget on the Task 4 composite', () => {
    const x = { value: new IntervalValue({ lo: 5, hi: 15 }), refiner: new HalvingRefiner() };
    const y = { value: new IntervalValue({ lo: 99.999, hi: 100.001 }), refiner: new HalvingRefiner() };
    const compositeValue = compose(add, x, y);
    const refiner = new CompositeRefiner<Interval>();

    const result1 = run(compositeValue, refiner, 1);
    const result2 = run(compositeValue, refiner, 2);
    const result3 = run(compositeValue, refiner, 5);

    expect(result2.quality()).toBeGreaterThanOrEqual(result1.quality());
    expect(result3.quality()).toBeGreaterThanOrEqual(result2.quality());
    
    // Explicitly, with cost 1 steps, budget 2 will take 2 steps which gives better quality
    expect(result2.quality()).toBeGreaterThan(result1.quality());
  });

  it('same input + same budget -> same result (deterministic)', () => {
    const createInput = () => {
        const x = { value: new IntervalValue({ lo: 5, hi: 15 }), refiner: new HalvingRefiner() };
        const y = { value: new IntervalValue({ lo: 99.999, hi: 100.001 }), refiner: new HalvingRefiner() };
        return { compositeValue: compose(add, x, y), refiner: new CompositeRefiner<Interval>() };
    };

    const i1 = createInput();
    const resultA = run(i1.compositeValue, i1.refiner, 3);
    
    const i2 = createInput();
    const resultB = run(i2.compositeValue, i2.refiner, 3);

    expect(resultA.current()).toEqual(resultB.current());
    expect(resultA.quality()).toEqual(resultB.quality());
  });
  
  it('returns the same value when step cost exceeds remaining budget', () => {
    class CostlyRefiner implements Refiner<Interval> {
      step(v: Value<Interval>): { value: Value<Interval>; cost: number } {
        return {
          value: new IntervalValue({ lo: 0, hi: 1 }),
          cost: 10,
        };
      }
    }
    
    const v = new IntervalValue({ lo: -5, hi: 5 });
    const refiner = new CostlyRefiner();
    
    // Budget 1 is not enough to cover cost 10
    const result = run(v, refiner, 1);
    
    // Returns original value since budget was insufficient
    expect(result).toBe(v);
  });
});
