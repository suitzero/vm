import { IntervalValue, PiRefiner } from './pi.js';

function runDriver() {
  const initialInterval = { lo: 3, hi: 2 * Math.sqrt(3) };
  let currentValue = new IntervalValue(initialInterval);
  const refiner = new PiRefiner();
  
  console.log(`Step 0: [${currentValue.current().lo}, ${currentValue.current().hi}], width: ${-currentValue.quality()}, cost: 0`);
  
  let step = 1;
  while (true) {
    const { value, cost } = refiner.step(currentValue);
    
    if (value === currentValue) {
      console.log('Width stopped shrinking. Refinement complete.');
      break;
    }
    
    currentValue = value as IntervalValue;
    console.log(`Step ${step}: [${currentValue.current().lo}, ${currentValue.current().hi}], width: ${-currentValue.quality()}, cost: ${cost}`);
    step++;
  }
}

runDriver();
