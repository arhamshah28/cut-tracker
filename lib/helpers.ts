import { PHASES, WCD } from "./constants";

export function toD(s: string): Date {
  return new Date(s + "T12:00:00");
}

export function fm(d: Date): string {
  return d.toISOString().split("T")[0];
}

export function now(): string {
  return fm(new Date());
}

export function dB(a: string, b: string): number {
  return Math.round((toD(b).getTime() - toD(a).getTime()) / 864e5);
}

export function cl(v: number, l: number, h: number): number {
  return Math.max(l, Math.min(h, v));
}

export function wd(s: string): string {
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][toD(s).getDay()];
}

export function dn(s: string): number {
  return toD(s).getDate();
}

export function msh(s: string): string {
  return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][toD(s).getMonth()];
}

export function gP(d: string) {
  return PHASES.find((p) => d >= p.start && d <= p.end) || PHASES[0];
}

export function gCT(d: string): number {
  return WCD[d] ? WCD[d].calT : gP(d).calT;
}

export function gWT(d: string): number {
  return WCD[d] ? WCD[d].wL : gP(d).wL;
}
