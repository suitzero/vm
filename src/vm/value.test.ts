import { describe, it, expect } from 'vitest';
import { Value } from './value.js';

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
