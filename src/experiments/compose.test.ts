import { describe, it, expect } from 'vitest';
import { Value, Refiner, trace } from '../vm/value.js';
import { CompositeRefiner } from '../vm/compose.js';
import { Interval, IntervalValue } from './pi.js';
import { compose, add, mul, IntervalComposite } from './compose.js';

class HalvingRefiner implements Refiner<Interval> {
  step(v: Value<Interval>): { value: Value<Interval>; cost: number } {
    const { lo, hi } = v.current();
    const mid = (lo + hi) / 2;
    const width = hi - lo;
    const nextLo = mid - width / 4;
    const nextHi = mid + width / 4;
    return {
      value: new IntervalValue({ lo: nextLo, hi: nextHi }),
      cost: 1,
    };
  }
}

describe('COMPOSE on two numeric values', () => {
  it('shows refining x is chosen as more valuable than refining y for add', () => {
    // x = 10 ± 5 -> [5, 15]
    const x = { value: new IntervalValue({ lo: 5, hi: 15 }), refiner: new HalvingRefiner() };
    // y = 100 ± 0.001 -> [99.999, 100.001]
    const y = { value: new IntervalValue({ lo: 99.999, hi: 100.001 }), refiner: new HalvingRefiner() };

    const compositeValue = compose(add, x, y) as IntervalComposite;
    const children = compositeValue.children();

    expect(children.length).toBe(2);
    
    // First child is x refinement, second is y refinement
    const xGain = children[0].gain;
    const yGain = children[1].gain;

    expect(xGain).toBeGreaterThan(yGain);
  });

  it('shows refining x is chosen as more valuable than refining y for mul', () => {
    // x = 10 ± 5 -> [5, 15]
    const x = { value: new IntervalValue({ lo: 5, hi: 15 }), refiner: new HalvingRefiner() };
    // y = 100 ± 0.001 -> [99.999, 100.001]
    const y = { value: new IntervalValue({ lo: 99.999, hi: 100.001 }), refiner: new HalvingRefiner() };

    const compositeValue = compose(mul, x, y) as IntervalComposite;
    const children = compositeValue.children();

    expect(children.length).toBe(2);
    
    const xGain = children[0].gain;
    const yGain = children[1].gain;

    expect(xGain).toBeGreaterThan(yGain);
  });

  it('works with the same trace helper as a single value using CompositeRefiner', () => {
    const x = { value: new IntervalValue({ lo: 5, hi: 15 }), refiner: new HalvingRefiner() };
    const y = { value: new IntervalValue({ lo: 99.999, hi: 100.001 }), refiner: new HalvingRefiner() };

    const compositeValue = compose(add, x, y);
    const refiner = new CompositeRefiner<Interval>();

    const traceResult = trace(compositeValue, refiner, 2);

    expect(traceResult.length).toBe(3); // Initial + 2 steps
    
    // Verify quality strictly improves
    expect(traceResult[1].quality).toBeGreaterThan(traceResult[0].quality);
    expect(traceResult[2].quality).toBeGreaterThan(traceResult[1].quality);
  });
});
