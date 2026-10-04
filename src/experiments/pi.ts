import { Value, Refiner } from '../vm/value.js';

export interface Interval {
  lo: number;
  hi: number;
}

export class IntervalValue implements Value<Interval> {
  constructor(private readonly interval: Interval) {}

  current(): Interval {
    return this.interval;
  }

  quality(): number {
    return -(this.interval.hi - this.interval.lo);
  }
}

export class PiRefiner implements Refiner<Interval> {
  step(v: Value<Interval>): { value: Value<Interval>; cost: number } {
    const { lo, hi } = v.current();
    
    const nextHi = (2 * lo * hi) / (lo + hi);
    const nextLo = Math.sqrt(lo * nextHi);
    
    const currentWidth = hi - lo;
    const nextWidth = nextHi - nextLo;
    
    // Stop refining when width stops shrinking (due to float precision)
    if (nextWidth >= currentWidth || nextHi <= nextLo || Number.isNaN(nextWidth)) {
      return { value: v, cost: 1 };
    }
    
    return { value: new IntervalValue({ lo: nextLo, hi: nextHi }), cost: 1 };
  }
}
