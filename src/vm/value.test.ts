import { describe, it, expect } from 'vitest';
import { Value, Refiner, trace } from './value.js';

class ToyValue implements Value<number> {
  constructor(private value: number, private error: number) {}

  current(): number {
    return this.value;
  }

  // Quality convention: higher = better. Convert error to negative.
  quality(): number {
    return -this.error;
  }
}

class ToyRefiner implements Refiner<number> {
  step(v: Value<number>): { value: Value<number>; cost: number } {
    const current = v.current();
    // toy logic: step moves value closer to 42, halves error
    const newValue = new ToyValue(current + (42 - current) / 2, -v.quality() / 2);
    return { value: newValue, cost: 10 };
  }
}

describe('Value', () => {
  it('should allow implementing the interface', () => {
    const dummyValue: Value<number> = {
      current: () => 42,
      quality: () => 1.0,
    };

    expect(dummyValue.current()).toBe(42);
    expect(dummyValue.quality()).toBe(1.0);
  });
});

describe('Refiner and trace', () => {
  it('should enforce property: quality(step(v)) >= quality(v)', () => {
    const v = new ToyValue(0, 100);
    const refiner = new ToyRefiner();

    const result1 = refiner.step(v);
    expect(result1.value.quality()).toBeGreaterThanOrEqual(v.quality());

    const result2 = refiner.step(result1.value);
    expect(result2.value.quality()).toBeGreaterThanOrEqual(result1.value.quality());
  });

  it('should trace n steps', () => {
    const v = new ToyValue(0, 100);
    const refiner = new ToyRefiner();

    const t = trace(v, refiner, 3);
    expect(t.length).toBe(4); // initial + 3 steps

    // Initial state
    expect(t[0].current).toBe(0);
    expect(t[0].quality).toBe(-100);
    expect(t[0].cost).toBe(0);

    // Step 1
    expect(t[1].current).toBe(21);
    expect(t[1].quality).toBe(-50);
    expect(t[1].cost).toBe(10);

    // Step 2
    expect(t[2].current).toBe(31.5);
    expect(t[2].quality).toBe(-25);
    expect(t[2].cost).toBe(10);

    // Step 3
    expect(t[3].current).toBe(36.75);
    expect(t[3].quality).toBe(-12.5);
    expect(t[3].cost).toBe(10);
  });
});
