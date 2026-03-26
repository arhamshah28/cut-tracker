export interface UserProfile {
  user_id: string;
  height_cm: number;
  age: number;
  gender: 'male' | 'female';
}

export interface Phase {
  id: number;
  name: string;
  start: string;
  end: string;
  calT: number;
  wL: number;
}

export interface Milestone {
  d: string;
  t: number;
  l: string;
}

export interface WaterCutDay {
  wL: number;
  salt: string;
  note: string;
  calT: number;
}

export interface MealItem {
  id: string;
  n: string;
  c: number;
  p: number;
  t: string;
}

export interface DinnerRecipe {
  i: number;
  n: string;
  c: number;
  p: number;
  g: string;
}

export interface Workout {
  id: string;
  d: string;
  n: string;
  b: number;
}

export interface Activity {
  id: string;
  n: string;
  b: number;
}

export interface Supplement {
  id: string;
  n: string;
}

export interface Cut {
  id: string;
  user_id: string;
  name: string;
  status: 'active' | 'completed' | 'abandoned';
  start_date: string;
  end_date: string;
  start_weight: number;
  target_weight: number;
  phases: Phase[];
  milestones: Milestone[];
  water_cut_days: Record<string, WaterCutDay>;
  meal_groups: Record<string, MealItem[]>;
  dinner_recipes: DinnerRecipe[];
  workouts: Workout[];
  activities: Activity[];
  supplements: Supplement[];
  schedule: string[][];
  rules: string[];
  grocery: string[];
  created_at?: string;
  updated_at?: string;
}
