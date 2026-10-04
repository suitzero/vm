import { Value, Refiner } from '../vm/value.js';
import { ChildRefinement, Composite } from '../vm/compose.js';
import { Interval } from './pi.js';

export type IntervalOp = (a: Interval, b: Interval) => Interval;

export const add: IntervalOp = (x, y) => ({
  lo: x.lo + y.lo,
  hi: x.hi + y.hi,
});

export const mul: IntervalOp = (x, y) => {
  const p1 = x.lo * y.lo;
  const p2 = x.lo * y.hi;
  const p3 = x.hi * y.lo;
  const p4 = x.hi * y.hi;
  return {
    lo: Math.min(p1, p2, p3, p4),
    hi: Math.max(p1, p2, p3, p4),
  };
};

export class IntervalComposite implements Composite<Interval> {
  constructor(
    public readonly op: IntervalOp,
    public readonly x: Value<Interval>,
    public readonly rx: Refiner<Interval>,
    public readonly y: Value<Interval>,
    public readonly ry: Refiner<Interval>
  ) {}

  current(): Interval {
    return this.op(this.x.current(), this.y.current());
  }

  quality(): number {
    const curr = this.current();
    return -(curr.hi - curr.lo);
  }

  children(): ChildRefinement<Interval>[] {
    const currentQ = this.quality();
    const refs: ChildRefinement<Interval>[] = [];

    const xStep = this.rx.step(this.x);
    if (xStep.value !== this.x) {
      const xNextVal = this.op(xStep.value.current(), this.y.current());
      const xNextQ = -(xNextVal.hi - xNextVal.lo);
      refs.push({
        gain: xNextQ - currentQ,
        cost: xStep.cost,
        step: () => ({
          value: new IntervalComposite(this.op, xStep.value, this.rx, this.y, this.ry),
          cost: xStep.cost,
        }),
      });
    }

    const yStep = this.ry.step(this.y);
    if (yStep.value !== this.y) {
      const yNextVal = this.op(this.x.current(), yStep.value.current());
      const yNextQ = -(yNextVal.hi - yNextVal.lo);
      refs.push({
        gain: yNextQ - currentQ,
        cost: yStep.cost,
        step: () => ({
          value: new IntervalComposite(this.op, this.x, this.rx, yStep.value, this.ry),
          cost: yStep.cost,
        }),
      });
    }

    return refs;
  }
}

export function compose(
  op: IntervalOp,
  x: { value: Value<Interval>; refiner: Refiner<Interval> },
  y: { value: Value<Interval>; refiner: Refiner<Interval> }
): Value<Interval> {
  return new IntervalComposite(op, x.value, x.refiner, y.value, y.refiner);
}
