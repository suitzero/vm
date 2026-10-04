import { Value, Refiner } from '../vm/value.js';

export interface MonteCarloPiEstimate {
  estimate: number;
  samples: number;
  inside: number;
}

export class MonteCarloPiValue implements Value<MonteCarloPiEstimate> {
  constructor(private readonly data: MonteCarloPiEstimate) {}

  current(): MonteCarloPiEstimate {
    return this.data;
  }

  quality(): number {
    // Quality convention: higher is always better.
    // Error-type measures like variance (proportional to 1/N) should be negative.
    if (this.data.samples === 0) {
      return -Infinity; // lowest quality when no samples
    }
    // A simple quality metric related to variance is -1/N
    return -1 / this.data.samples;
  }
}

export class MonteCarloPiRefiner implements Refiner<MonteCarloPiEstimate> {
  // Pass a custom PRNG for deterministic testing, fallback to Math.random
  constructor(
    private readonly batchSize: number = 1000,
    private readonly random: () => number = Math.random
  ) {}

  step(v: Value<MonteCarloPiEstimate>): { value: Value<MonteCarloPiEstimate>; cost: number } {
    const { samples, inside } = v.current();
    
    let newInside = inside;
    for (let i = 0; i < this.batchSize; i++) {
      const x = this.random();
      const y = this.random();
      if (x * x + y * y <= 1) {
        newInside++;
      }
    }
    
    const newSamples = samples + this.batchSize;
    const nextEstimate = (newInside / newSamples) * 4;
    
    return {
      value: new MonteCarloPiValue({
        estimate: nextEstimate,
        samples: newSamples,
        inside: newInside
      }),
      cost: this.batchSize
    };
  }
}
