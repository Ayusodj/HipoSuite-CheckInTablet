
import { GuestData, MealPlanRegime } from '../types';

const parseMealPlanRegime = (regimeStr: string): MealPlanRegime => {
  const upperRegime = regimeStr.toUpperCase().trim();
  if (Object.values(MealPlanRegime).includes(upperRegime as MealPlanRegime)) {
    return upperRegime as MealPlanRegime;
  }
  console.warn(`Unknown meal plan regime: "${regimeStr}". Defaulting to RO.`);
  return MealPlanRegime.RO; 
};

export const parseGuestData = (dataText: string): Omit<GuestData, 'id'>[] => {
  const lines = dataText.trim().split('\n');
  if (lines.length === 0) return [];

  const guests: Omit<GuestData, 'id'>[] = [];
  let headerChecked = false;

  for (const line of lines) {
    const currentLine = line.trim();
    if (!currentLine) continue; 

    if (!headerChecked) {
      headerChecked = true;
      const commaValues = currentLine.split(',').map(v => v.trim().toLowerCase());
      if (
        commaValues.length >= 3 &&
        commaValues[0].includes('room') &&
        (commaValues[1].includes('name') || commaValues[1].includes('guest')) &&
        (commaValues[2].includes('plan') || commaValues[2].includes('meal'))
      ) {
        const firstValIsNumber = !isNaN(parseFloat(commaValues[0]));
        if (!firstValIsNumber) { 
            console.log("Comma-separated header row detected and skipped:", currentLine);
            continue;
        }
      }
    }
    
    const parts = currentLine.split(/\s+/);

    if (parts.length < 3) {
      console.warn(`Skipping line due to insufficient parts (expected Room, Name, MealPlan): "${currentLine}"`);
      continue;
    }

    const roomNumber = parts[0];
    const mealPlanStr = parts[parts.length - 1];
    const guestNameParts = parts.slice(1, parts.length - 1);
    
    if (guestNameParts.length === 0) {
        console.warn(`Skipping line due to missing guest name: "${currentLine}"`);
        continue;
    }
    const guestName = guestNameParts.join(' ');
    
    if (!roomNumber || !guestName || !mealPlanStr) {
        console.warn(`Skipping line due to missing essential data (Room, Name, or Plan): "${currentLine}"`);
        continue;
    }

    guests.push({
      roomNumber,
      guestName,
      mealPlanRegime: parseMealPlanRegime(mealPlanStr),
    });
  }
  return guests;
};
