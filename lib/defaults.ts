import { PHASES, WCD, TARGETS, MG, DR, WKS, ACTS, SUPPS, SCHEDULE, RULES, GROCERY } from './constants';
import { daysBetween, parseDate, formatDate } from './helpers';
import type { Cut, Phase, Milestone } from './types';

export type CutTemplate = Omit<Cut, 'id' | 'user_id' | 'name' | 'status' | 'start_date' | 'end_date' | 'start_weight' | 'target_weight' | 'created_at' | 'updated_at'>;

export const DEFAULT_CUT_TEMPLATE: CutTemplate = {
  phases: PHASES,
  milestones: TARGETS,
  water_cut_days: WCD,
  meal_groups: MG,
  dinner_recipes: DR,
  workouts: WKS,
  activities: ACTS,
  supplements: SUPPS,
  schedule: SCHEDULE,
  rules: RULES,
  grocery: GROCERY,
};

/**
 * Auto-generate phases for a cut.
 * Splits total duration into 2-5 phases with linearly declining calorie targets
 * and water targets.
 */
export function autoGeneratePhases(
  startDate: string,
  endDate: string,
  startCalories: number = 1050,
  endCalories: number = 800,
  startWater: number = 6,
  endWater: number = 4
): Phase[] {
  const totalDays = daysBetween(startDate, endDate);

  let phaseCount: number;
  if (totalDays <= 14) {
    phaseCount = 2;
  } else if (totalDays <= 21) {
    phaseCount = 3;
  } else if (totalDays <= 35) {
    phaseCount = 4;
  } else {
    phaseCount = 5;
  }

  const baseDaysPerPhase = Math.floor(totalDays / phaseCount);
  const remainder = totalDays % phaseCount;

  const phases: Phase[] = [];
  const phaseNames = ['Phase 1: Ramp-Up', 'Phase 2: Build', 'Phase 3: Push', 'Phase 4: Deep Cut', 'Phase 5: Final'];
  let currentDate = parseDate(startDate);

  for (let i = 0; i < phaseCount; i++) {
    const phaseDays = baseDaysPerPhase + (i < remainder ? 1 : 0);
    const phaseStart = formatDate(currentDate);

    const endDateObj = new Date(currentDate.getTime());
    endDateObj.setDate(endDateObj.getDate() + phaseDays - 1);
    const phaseEnd = formatDate(endDateObj);

    const t = phaseCount === 1 ? 0 : i / (phaseCount - 1);
    const calT = Math.round(startCalories + t * (endCalories - startCalories));
    const wL = Math.round(startWater + t * (endWater - startWater));

    phases.push({
      id: i + 1,
      name: phaseNames[i] || `Phase ${i + 1}`,
      start: phaseStart,
      end: phaseEnd,
      calT,
      wL,
    });

    currentDate = new Date(endDateObj.getTime());
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return phases;
}

/**
 * Auto-generate milestones (one per week) with linearly interpolated target weights.
 */
export function autoGenerateMilestones(
  startDate: string,
  endDate: string,
  startWeight: number,
  targetWeight: number
): Milestone[] {
  const totalDays = daysBetween(startDate, endDate);
  const milestones: Milestone[] = [];

  const weekCount = Math.ceil(totalDays / 7);

  for (let w = 1; w <= weekCount; w++) {
    const dayOffset = Math.min(w * 7, totalDays);
    const milestoneDate = new Date(parseDate(startDate).getTime());
    milestoneDate.setDate(milestoneDate.getDate() + dayOffset);
    const dateStr = formatDate(milestoneDate);

    const progress = dayOffset / totalDays;
    const weight = Math.round(startWeight + progress * (targetWeight - startWeight));

    const month = milestoneDate.toLocaleString('en-US', { month: 'short' });
    const day = milestoneDate.getDate();
    const label = `${month} ${day}`;

    milestones.push({
      d: dateStr,
      t: weight,
      l: label,
    });
  }

  return milestones;
}
