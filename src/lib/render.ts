import figlet from "figlet";
import { FONT_LOADERS } from "./fonts";

export type Frame = "none" | "box" | "double" | "stars" | "minimal";
export type CaseMode = "as-is" | "upper" | "lower";

const loaded = new Set<string>();
const pending = new Map<string, Promise<void>>();

export function isLoaded(name: string) {
  return loaded.has(name);
}

export function ensureFont(name: string): Promise<void> {
  if (loaded.has(name)) return Promise.resolve();
  const inflight = pending.get(name);
  if (inflight) return inflight;
  const load = FONT_LOADERS[name];
  if (!load) return Promise.reject(new Error(`Unknown font: ${name}`));
  const p = load().then((mod) => {
    figlet.parseFont(name, mod.default);
    loaded.add(name);
  });
  pending.set(name, p);
  return p;
}

function trimBlankLines(art: string) {
  return art.replace(/^\s*\n/, "").replace(/\s+$/, "");
}

export function renderArt(text: string, font: string, width: number): string {
  if (!text.trim() || !loaded.has(font)) return "";
  try {
    const art = figlet.textSync(text, {
      font: font as never,
      width,
      whitespaceBreak: true,
    });
    return trimBlankLines(art);
  } catch {
    return "";
  }
}

export function caseText(text: string, mode: CaseMode) {
  if (mode === "upper") return text.toUpperCase();
  if (mode === "lower") return text.toLowerCase();
  return text;
}

export function frameArt(art: string, frame: Frame): string {
  if (!art || frame === "none") return art;
  const lines = art.split("\n");
  const max = lines.reduce((m, l) => Math.max(m, l.length), 0);
  const pad = (l: string) => l.padEnd(max, " ");
  switch (frame) {
    case "box": {
      const edge = "+" + "-".repeat(max + 2) + "+";
      return [edge, ...lines.map((l) => `| ${pad(l)} |`), edge].join("\n");
    }
    case "double":
      return [
        "╔" + "═".repeat(max + 2) + "╗",
        ...lines.map((l) => `║ ${pad(l)} ║`),
        "╚" + "═".repeat(max + 2) + "╝",
      ].join("\n");
    case "stars": {
      const edge = "*".repeat(max + 4);
      return [edge, ...lines.map((l) => `* ${pad(l)} *`), edge].join("\n");
    }
    case "minimal": {
      const rule = "─".repeat(max);
      return [rule, ...lines, rule].join("\n");
    }
  }
}

export function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
