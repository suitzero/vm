export interface Value<T> {
  current(): T;
  quality(): number;
}

export interface Refiner<T> {
  step(v: Value<T>): { value: Value<T>; cost: number };
}

export function trace<T>(
  initialValue: Value<T>,
  refiner: Refiner<T>,
  n: number
): { current: T; quality: number; cost: number }[] {
  const result: { current: T; quality: number; cost: number }[] = [];
  let currentValue = initialValue;

  // Record initial state with cost 0
  result.push({
    current: currentValue.current(),
    quality: currentValue.quality(),
    cost: 0,
  });

  for (let i = 0; i < n; i++) {
    const stepResult = refiner.step(currentValue);
    currentValue = stepResult.value;
    result.push({
      current: currentValue.current(),
      quality: currentValue.quality(),
      cost: stepResult.cost,
    });
  }

  return result;
}
