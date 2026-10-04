import { Value, Refiner } from '../vm/value.js';

/**
 * Runs a refinable value with a given budget.
 * Always returns a result for budget > 0.
 *
 * @param value The initial value to refine.
 * @param refiner The refiner defining the step logic.
 * @param budget The max cost allowed.
 * @returns The refined value.
 */
export function run<T>(value: Value<T>, refiner: Refiner<T>, budget: number): Value<T> {
  let currentValue = value;
  let remainingBudget = budget;

  while (remainingBudget > 0) {
    const stepResult = refiner.step(currentValue);
    
    // Stop if no further refinement is possible
    if (stepResult.value === currentValue) {
      break; 
    }
    
    // Stop if we don't have enough budget for this step
    if (remainingBudget < stepResult.cost) {
        break;
    }
    
    currentValue = stepResult.value;
    remainingBudget -= stepResult.cost;
  }
  
  return currentValue;
}
