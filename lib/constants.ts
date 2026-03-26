export const START_DATE = "2026-03-24";
export const END_DATE = "2026-05-01";
export const START_W = 111;
export const TARGET_W = 90;
export const BMR_V = 2150;
export const NEAT_V = 350;

export interface Phase {
  id: number;
  name: string;
  start: string;
  end: string;
  calT: number;
  wL: number;
}

export const PHASES: Phase[] = [
  { id: 1, name: "Water Flush", start: "2026-03-24", end: "2026-03-30", calT: 1050, wL: 6 },
  { id: 2, name: "The Grind", start: "2026-03-31", end: "2026-04-13", calT: 1020, wL: 7 },
  { id: 3, name: "Deep Cut", start: "2026-04-14", end: "2026-04-25", calT: 950, wL: 7 },
  { id: 4, name: "Water Cut", start: "2026-04-26", end: "2026-04-30", calT: 800, wL: 4 },
];

export interface WaterCutDay {
  wL: number;
  salt: string;
  note: string;
  calT: number;
}

export const WCD: Record<string, WaterCutDay> = {
  "2026-04-26": { wL: 8, salt: "Normal", note: "Water loading — 8L", calT: 1000 },
  "2026-04-27": { wL: 8, salt: "Normal", note: "Water loading — 8L", calT: 1000 },
  "2026-04-28": { wL: 4, salt: "ZERO", note: "Salt cut. Only haldi pepper lemon.", calT: 900 },
  "2026-04-29": { wL: 2, salt: "ZERO", note: "Tea + 1 shake + 100g paneer only", calT: 350 },
  "2026-04-30": { wL: 0.5, salt: "ZERO", note: "Sips only. Minimal food.", calT: 150 },
};

export interface Target {
  d: string;
  t: number;
  l: string;
}

export const TARGETS: Target[] = [
  { d: "2026-03-30", t: 106, l: "Mar 30" },
  { d: "2026-04-06", t: 102, l: "Apr 6" },
  { d: "2026-04-13", t: 98, l: "Apr 13" },
  { d: "2026-04-20", t: 95, l: "Apr 20" },
  { d: "2026-04-25", t: 93, l: "Apr 25" },
  { d: "2026-05-01", t: 90, l: "May 1" },
];

export interface Meal {
  id: string;
  n: string;
  c: number;
  p: number;
  t: string;
}

export const MG: Record<string, Meal[]> = {
  morning: [
    { id: "acv", n: "ACV + Warm Water", c: 5, p: 0, t: "6:45 AM" },
    { id: "greentea", n: "Green Tea + Chia Seeds", c: 60, p: 2, t: "7:00 AM" },
    { id: "shake1", n: "Protein Shake (22g)", c: 140, p: 22, t: "9:30 AM" },
    { id: "almonds", n: "Almonds (3-4)", c: 25, p: 1, t: "9:45 AM" },
  ],
  lunch: [
    { id: "l_roti", n: "Roti + Sabzi + Salad + Chaas", c: 280, p: 8, t: "1:00 PM" },
    { id: "l_chilla", n: "Besan Chilla + Sabzi + Salad + Chaas", c: 250, p: 12, t: "1:00 PM" },
    { id: "l_light", n: "Sabzi + Salad + Chaas only", c: 150, p: 5, t: "1:00 PM" },
  ],
  preworkout: [{ id: "coffee", n: "Americano (Black)", c: 5, p: 0, t: "4:30 PM" }],
  postworkout: [{ id: "shake2", n: "Post-Workout Shake (22g)", c: 140, p: 22, t: "6:45 PM" }],
  night: [{ id: "isabgol", n: "Isabgol + Warm Water", c: 10, p: 0, t: "10:00 PM" }],
};

export const AM: Meal[] = Object.values(MG).flat();

export interface DinnerRecipe {
  i: number;
  n: string;
  c: number;
  p: number;
  g: string;
}

export const DR: DinnerRecipe[] = [
  { i: 1, n: "Black Pepper Capsicum", c: 350, p: 37, g: "Indian" },
  { i: 2, n: "Coriander-Mint Tikka", c: 360, p: 38, g: "Indian" },
  { i: 3, n: "Tandoori Paneer", c: 355, p: 38, g: "Indian" },
  { i: 4, n: "Achari Paneer", c: 360, p: 37, g: "Indian" },
  { i: 5, n: "Methi Paneer", c: 360, p: 37, g: "Indian" },
  { i: 6, n: "Pahadi Tikka", c: 360, p: 39, g: "Indian" },
  { i: 7, n: "Paneer Amritsari", c: 370, p: 38, g: "Indian" },
  { i: 8, n: "Paneer Afghani", c: 365, p: 40, g: "Indian" },
  { i: 9, n: "Kali Mirch", c: 355, p: 38, g: "Indian" },
  { i: 10, n: "Tawa Masala", c: 365, p: 38, g: "Indian" },
  { i: 11, n: "Chatpata", c: 355, p: 37, g: "Indian" },
  { i: 12, n: "Tikka Masala", c: 365, p: 39, g: "Indian" },
  { i: 13, n: "Hariyali Tikka", c: 355, p: 38, g: "Indian" },
  { i: 14, n: "Hara Bhara", c: 355, p: 38, g: "Indian" },
  { i: 15, n: "Pudina Tikka", c: 355, p: 37, g: "Indian" },
  { i: 16, n: "Ajwain Tikka", c: 360, p: 38, g: "Indian" },
  { i: 17, n: "Lababdar Dry", c: 365, p: 38, g: "Indian" },
  { i: 18, n: "Peri Peri", c: 360, p: 38, g: "Indian" },
  { i: 19, n: "Rajasthani Kebab", c: 370, p: 39, g: "Indian" },
  { i: 20, n: "Chettinad", c: 365, p: 38, g: "Indian" },
  { i: 22, n: "Thai Basil", c: 365, p: 38, g: "Intl" },
  { i: 24, n: "Mexican Fajita", c: 375, p: 39, g: "Intl" },
  { i: 25, n: "Lebanese Shawarma", c: 375, p: 40, g: "Intl" },
  { i: 26, n: "Italian Caprese", c: 345, p: 37, g: "Intl" },
  { i: 27, n: "Szechuan", c: 370, p: 38, g: "Intl" },
  { i: 29, n: "Greek Herb", c: 365, p: 37, g: "Intl" },
  { i: 30, n: "Spanish Romesco", c: 375, p: 38, g: "Intl" },
  { i: 31, n: "Vietnamese Lemongrass", c: 360, p: 38, g: "Intl" },
  { i: 33, n: "Turkish Shish", c: 370, p: 39, g: "Intl" },
  { i: 34, n: "Peruvian Aji", c: 365, p: 38, g: "Intl" },
  { i: 36, n: "French Provencal", c: 360, p: 37, g: "Intl" },
  { i: 40, n: "Zaatar", c: 365, p: 38, g: "Intl" },
  { i: 41, n: "Tomato Soup", c: 295, p: 30, g: "Soup" },
  { i: 42, n: "Lemon Coriander Soup", c: 280, p: 28, g: "Soup" },
  { i: 43, n: "Moong Dal Soup", c: 310, p: 32, g: "Soup" },
  { i: 48, n: "Green Pea Soup", c: 295, p: 30, g: "Soup" },
  { i: 50, n: "Chana Dal Soup", c: 310, p: 32, g: "Soup" },
  { i: 52, n: "Broccoli Soup", c: 290, p: 30, g: "Soup" },
  { i: 55, n: "French Pistou", c: 300, p: 29, g: "Soup" },
  { i: 57, n: "Minestrone", c: 310, p: 30, g: "Soup" },
  { i: 61, n: "Sprouted Moong Bowl", c: 370, p: 38, g: "Bowl" },
  { i: 62, n: "Mediterranean Salad", c: 365, p: 37, g: "Bowl" },
  { i: 63, n: "Burrito Bowl", c: 380, p: 38, g: "Bowl" },
  { i: 65, n: "Fattoush", c: 360, p: 36, g: "Bowl" },
  { i: 67, n: "Kala Chana Chaat", c: 375, p: 38, g: "Bowl" },
  { i: 70, n: "Quinoa Bowl", c: 385, p: 38, g: "Bowl" },
  { i: 73, n: "Sprouted Lentil", c: 360, p: 36, g: "Bowl" },
  { i: 74, n: "Caprese Tower", c: 345, p: 36, g: "Bowl" },
  { i: 78, n: "Corn Chickpea Salad", c: 370, p: 37, g: "Bowl" },
  { i: 79, n: "Raita Bowl", c: 335, p: 36, g: "Bowl" },
];

export interface Workout {
  id: string;
  d: string;
  n: string;
  b: number;
}

export const WKS: Workout[] = [
  { id: "chest", d: "Mon", n: "Chest + Triceps", b: 550 },
  { id: "back", d: "Tue", n: "Back + Biceps", b: 570 },
  { id: "quads", d: "Wed", n: "Legs: Quads ★", b: 550 },
  { id: "shoulders", d: "Thu", n: "Shoulders + Core", b: 530 },
  { id: "hams", d: "Fri", n: "Legs: Hams ★", b: 540 },
  { id: "arms", d: "Sat", n: "Arms + Circuit", b: 500 },
  { id: "rest", d: "Sun", n: "Rest Day", b: 0 },
];

export interface Activity {
  id: string;
  n: string;
  b: number;
}

export const ACTS: Activity[] = [
  { id: "gym", n: "Gym Walk (2km)", b: 165 },
  { id: "w30", n: "Walk 30 min", b: 160 },
  { id: "w60", n: "Walk 60 min", b: 320 },
  { id: "w90", n: "Walk 90 min", b: 475 },
  { id: "w120", n: "Walk 2 hours", b: 640 },
  { id: "hiit15", n: "HIIT 15 min", b: 200 },
  { id: "hiit20", n: "HIIT 20 min", b: 280 },
  { id: "hiit30", n: "HIIT 30 min", b: 420 },
  { id: "hiit45", n: "HIIT 45 min", b: 580 },
];

export interface Supplement {
  id: string;
  n: string;
}

export const SUPPS: Supplement[] = [
  { id: "whey", n: "Whey Protein x2" },
  { id: "multi", n: "Multivitamin" },
  { id: "omega", n: "Omega-3 Flaxseed" },
  { id: "ors", n: "ORS / Electral" },
  { id: "glut", n: "Glutamine 5g" },
  { id: "isab", n: "Isabgol" },
  { id: "acvs", n: "ACV" },
];

export interface CustomMeal {
  id: number;
  n: string;
  c: number;
  p: number;
}

export interface DayData {
  meals: string[];
  dinner: number | null;
  workout: string | null;
  walks: string[];
  weight: number | null;
  water: number;
  supplements: string[];
  sleep: number | null;
  custom: CustomMeal[];
  notes: string;
}

export const EMPTY_DAY: DayData = {
  meals: [],
  dinner: null,
  workout: null,
  walks: [],
  weight: null,
  water: 0,
  supplements: [],
  sleep: null,
  custom: [],
  notes: "",
};

// Style constants
export const FONT_SANS = "'DM Sans', sans-serif";
export const FONT_MONO = "'JetBrains Mono', monospace";
export const lime = "#d4ff3a";
export const red = "#ff5c6c";
export const blue = "#60b8ff";
export const org = "#ffc05c";
export const cyn = "#33eeff";
export const prp = "#c9a0ff";
export const pnk = "#ff80b0";
export const bg = "#070710";
export const cd = "#0e0e1c";
export const bd = "#1c1c30";
export const tx = "#f5f3ef";
export const mt = "#8888a8";
export const dm = "#555578";

export const catLabels: Record<string, string> = {
  morning: "☀️ MORNING",
  lunch: "🍽️ LUNCH",
  preworkout: "☕ PRE-WORKOUT",
  postworkout: "💪 POST-WORKOUT",
  night: "🌙 NIGHT",
};

export const catAccents: Record<string, string> = {
  morning: lime,
  lunch: org,
  preworkout: cyn,
  postworkout: blue,
  night: prp,
};

export const inputStyle: React.CSSProperties = {
  padding: "12px 14px",
  borderRadius: 10,
  border: "1px solid " + bd,
  background: bg,
  color: tx,
  fontSize: 14,
  outline: "none",
  width: "100%",
  fontFamily: FONT_SANS,
};
