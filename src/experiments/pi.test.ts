import { describe, it, expect } from 'vitest';
import { IntervalValue, PiRefiner } from './pi.js';

describe('PiRefiner', () => {
  it('should guarantee every interval contains Math.PI', () => {
    const initialInterval = { lo: 3, hi: 2 * Math.sqrt(3) };
    let currentValue = new IntervalValue(initialInterval);
    const refiner = new PiRefiner();

    for (let i = 0; i < 20; i++) {
      const { lo, hi } = currentValue.current();
      expect(lo).toBeLessThanOrEqual(Math.PI);
      expect(hi).toBeGreaterThanOrEqual(Math.PI);

      const result = refiner.step(currentValue);
      currentValue = result.value as IntervalValue;
    }
  });

  it('should ensure intervals are nested', () => {
    const initialInterval = { lo: 3, hi: 2 * Math.sqrt(3) };
    let currentValue = new IntervalValue(initialInterval);
    const refiner = new PiRefiner();

    for (let i = 0; i < 20; i++) {
      const { lo: currentLo, hi: currentHi } = currentValue.current();
      
      const result = refiner.step(currentValue);
      const nextValue = result.value as IntervalValue;
      const { lo: nextLo, hi: nextHi } = nextValue.current();

      expect(nextLo).toBeGreaterThanOrEqual(currentLo);
      expect(nextHi).toBeLessThanOrEqual(currentHi);

      currentValue = nextValue;
    }
  });

  it('should ensure width never grows', () => {
    const initialInterval = { lo: 3, hi: 2 * Math.sqrt(3) };
    let currentValue = new IntervalValue(initialInterval);
    const refiner = new PiRefiner();

    for (let i = 0; i < 20; i++) {
      const { lo: currentLo, hi: currentHi } = currentValue.current();
      const currentWidth = currentHi - currentLo;
      
      const result = refiner.step(currentValue);
      const nextValue = result.value as IntervalValue;
      const { lo: nextLo, hi: nextHi } = nextValue.current();
      const nextWidth = nextHi - nextLo;

      expect(nextWidth).toBeLessThanOrEqual(currentWidth);

      currentValue = nextValue;
    }
  });

  it('should stop refining when width stops shrinking', () => {
    const initialInterval = { lo: 3, hi: 2 * Math.sqrt(3) };
    let currentValue = new IntervalValue(initialInterval);
    const refiner = new PiRefiner();

    let steps = 0;
    while (true) {
      const result = refiner.step(currentValue);
      
      if (result.value === currentValue) {
        break;
      }

      currentValue = result.value as IntervalValue;
      steps++;
      
      if (steps > 100) {
        throw new Error('Infinite loop detected in PiRefiner');
      }
    }
    
    // We should reach a point where width stops shrinking due to float precision
    expect(steps).toBeGreaterThan(10);
    expect(steps).toBeLessThan(40);
  });
});
