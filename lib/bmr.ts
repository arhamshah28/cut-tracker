/**
 * Mifflin-St Jeor BMR calculation.
 * Male:   10 * weight(kg) + 6.25 * height(cm) - 5 * age + 5
 * Female: 10 * weight(kg) + 6.25 * height(cm) - 5 * age - 161
 */
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: 'male' | 'female'
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return Math.round(gender === 'male' ? base + 5 : base - 161);
}

/**
 * NEAT scales proportionally with body mass.
 * Reference: 350 kcal at 111 kg (default).
 */
export function calculateNEAT(
  weightKg: number,
  referenceWeight: number = 111,
  referenceNEAT: number = 350
): number {
  return Math.round(referenceNEAT * (weightKg / referenceWeight));
}
