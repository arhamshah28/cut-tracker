import type { Phase, WaterCutDay } from "./types";

export function parseDate(s: string): Date {
  return new Date(s + "T12:00:00");
}

export function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

export function getToday(): string {
  return formatDate(new Date());
}

export function daysBetween(a: string, b: string): number {
  return Math.round((parseDate(b).getTime() - parseDate(a).getTime()) / 864e5);
}

export function clamp(v: number, l: number, h: number): number {
  return Math.max(l, Math.min(h, v));
}

export function getWeekday(s: string): string {
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][parseDate(s).getDay()];
}

export function getDayNum(s: string): number {
  return parseDate(s).getDate();
}

export function getMonthShort(s: string): string {
  return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][parseDate(s).getMonth()];
}

export function getPhase(d: string, phases: Phase[]) {
  return phases.find((p) => d >= p.start && d <= p.end) || phases[0];
}

export function getCalorieTarget(d: string, phases: Phase[], waterCutDays: Record<string, WaterCutDay>): number {
  return waterCutDays[d] ? waterCutDays[d].calT : getPhase(d, phases).calT;
}

export function getWaterTarget(d: string, phases: Phase[], waterCutDays: Record<string, WaterCutDay>): number {
  return waterCutDays[d] ? waterCutDays[d].wL : getPhase(d, phases).wL;
}
