import { FONTS, DEFAULT_FONT } from "./fonts";
import type { CaseMode, Frame } from "./render";

export type Align = "left" | "center" | "right";

export type Initial = {
  text: string;
  font: string;
  width: number;
  scale: number;
  align: Align;
  frame: Frame;
  caseMode: CaseMode;
};

export const MAX_CHARS = 30;
const FRAMES: Frame[] = ["none", "box", "double", "stars", "minimal"];
const ALIGNS: Align[] = ["left", "center", "right"];
const CASES: CaseMode[] = ["as-is", "upper", "lower"];

type Params = Record<string, string | string[] | undefined>;

function one(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

function num(v: string | undefined, min: number, max: number, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : fallback;
}

function pick<T extends string>(v: string | undefined, allowed: T[], fallback: T): T {
  return allowed.includes(v as T) ? (v as T) : fallback;
}

export function parseInitial(sp: Params): Initial {
  const font = one(sp.f);
  return {
    text: (one(sp.t) ?? "BIG DREAMS").slice(0, MAX_CHARS),
    font: FONTS.some((f) => f.name === font) ? (font as string) : DEFAULT_FONT,
    width: num(one(sp.w), 40, 140, 80),
    scale: num(one(sp.s), 10, 22, 14),
    align: pick(one(sp.a), ALIGNS, "center"),
    frame: pick(one(sp.fr), FRAMES, "none"),
    caseMode: pick(one(sp.c), CASES, "as-is"),
  };
}

export function buildQuery(s: Initial) {
  const p = new URLSearchParams();
  if (s.text) p.set("t", s.text);
  p.set("f", s.font);
  p.set("w", String(s.width));
  p.set("s", String(s.scale));
  p.set("a", s.align);
  if (s.frame !== "none") p.set("fr", s.frame);
  if (s.caseMode !== "as-is") p.set("c", s.caseMode);
  return p.toString();
}
