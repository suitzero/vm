import { Value, Refiner } from './value.js';

export interface ChildRefinement<T> {
  gain: number;
  cost: number;
  step: () => { value: Value<T>; cost: number };
}

export interface Composite<T> extends Value<T> {
  children(): ChildRefinement<T>[];
}

export class CompositeRefiner<T> implements Refiner<T> {
  step(v: Value<T>): { value: Value<T>; cost: number } {
    if (!('children' in v)) {
      throw new Error("CompositeRefiner requires a Composite value");
    }
    const comp = v as unknown as Composite<T>;
    const children = comp.children();
    
    if (children.length === 0) {
      return { value: v, cost: 1 };
    }
    
    let best = children[0];
    let bestScore = best.gain / best.cost;
    
    for (let i = 1; i < children.length; i++) {
      const score = children[i].gain / children[i].cost;
      if (score > bestScore) {
        best = children[i];
        bestScore = score;
      }
    }
    
    return best.step();
  }
}
