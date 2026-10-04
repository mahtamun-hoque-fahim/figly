"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Check,
  Code,
  Contrast,
  Copy,
  Download,
  Info,
  Link2,
  MoveHorizontal,
  Pencil,
  Shuffle,
  Type,
  X,
} from "lucide-react";
import FontLibrary from "./font-library";
import { FONTS } from "@/lib/fonts";
import {
  caseText,
  ensureFont,
  escapeHtml,
  frameArt,
  renderArt,
  type CaseMode,
  type Frame,
} from "@/lib/render";
import { buildQuery, MAX_CHARS, type Align, type Initial } from "@/lib/url";

const PRESETS = ["HELLO", "FIGLY", "ASCII MAGIC", "DEV 2026", "RETRO WAVE", "HACKER"];
const FRAMES: { value: Frame; label: string }[] = [
  { value: "none", label: "None" },
  { value: "box", label: "Box (+-)" },
  { value: "double", label: "Double" },
  { value: "stars", label: "Stars (***)" },
  { value: "minimal", label: "Minimal" },
];
const CASE_LABEL: Record<CaseMode, string> = { "as-is": "Aa Case", upper: "UPPER", lower: "lower" };
const CASE_NEXT: Record<CaseMode, CaseMode> = { "as-is": "upper", upper: "lower", lower: "as-is" };
const ALIGNS: { value: Align; label: string; Icon: typeof AlignLeft }[] = [
  { value: "left", label: "Align left", Icon: AlignLeft },
  { value: "center", label: "Align center", Icon: AlignCenter },
  { value: "right", label: "Align right", Icon: AlignRight },
];

export default function Figly({ initial }: { initial: Initial }) {
  const [text, setText] = useState(initial.text);
  const [font, setFont] = useState(initial.font);
  const [width, setWidth] = useState(initial.width);
  const [scale, setScale] = useState(initial.scale);
  const [align, setAlign] = useState<Align>(initial.align);
  const [frame, setFrame] = useState<Frame>(initial.frame);
  const [caseMode, setCaseMode] = useState<CaseMode>(initial.caseMode);
  const [light, setLight] = useState(false);
  const [tick, setTick] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Load the selected font; re-render once it is ready.
  useEffect(() => {
    let alive = true;
    ensureFont(font)
      .then(() => alive && setTick((t) => t + 1))
      .catch(() => alive && setToast("Could not load that font."));
    return () => {
      alive = false;
    };
  }, [font]);

  // Keep the address bar in sync so the URL is always shareable.
  useEffect(() => {
    const q = buildQuery({ text, font, width, scale, align, frame, caseMode });
    window.history.replaceState(null, "", `?${q}`);
  }, [text, font, width, scale, align, frame, caseMode]);

  const display = caseText(text, caseMode);
  const art = useMemo(
    () => frameArt(renderArt(display, font, width), frame),
    // tick changes when a font finishes loading
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [display, font, width, frame, tick],
  );
  const lines = art ? art.split("\n") : [];
  const cols = lines.reduce((m, l) => Math.max(m, l.length), 0);
  const bytes = art ? new Blob([art]).size : 0;

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }, []);

  const copy = useCallback(
    async (value: string, msg: string) => {
      try {
        await navigator.clipboard.writeText(value);
        showToast(msg);
        return true;
      } catch {
        showToast("Copy was blocked. Select the art and press Ctrl+C.");
        return false;
      }
    },
    [showToast],
  );

  const copyArt = useCallback(async () => {
    if (!art) return;
    if (await copy(art, "ASCII copied to clipboard")) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  }, [art, copy]);

  const randomFont = useCallback(() => {
    const others = FONTS.filter((f) => f.name !== font);
    setFont(others[Math.floor(Math.random() * others.length)].name);
  }, [font]);

  // Space = random font, Ctrl/Cmd+C with nothing selected = copy the art.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el.closest("input, textarea, select, button, a, [contenteditable]")) return;
      if (e.code === "Space") {
        e.preventDefault();
        randomFont();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "c" && !window.getSelection()?.toString()) {
        copyArt();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [randomFont, copyArt]);

  function download() {
    const blob = new Blob([art], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `figly-${text.trim().toLowerCase().replace(/\W+/g, "-") || "banner"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const alignClass = align === "left" ? "my-auto mr-auto" : align === "right" ? "my-auto ml-auto" : "m-auto";

  return (
    <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-12 xl:gap-6">
      <div
        role="status"
        aria-live="polite"
        className={`pointer-events-none fixed top-20 right-4 z-50 flex items-center gap-2 rounded-xl border-[2.5px] border-ink bg-sun px-4 py-2 text-sm font-bold shadow-hard transition-all duration-300 ${
          toast ? "translate-y-0 opacity-100" : "-translate-y-24 opacity-0"
        }`}
      >
        {toast && (
          <>
            <Check className="size-4" strokeWidth={3} aria-hidden />
            {toast}
          </>
        )}
      </div>

      <div id="generator" className="flex flex-col gap-4 lg:col-span-7 xl:col-span-8">
        {/* Input */}
        <section className="panel flex flex-col gap-3" aria-label="Text input">
          <div className="flex items-center justify-between">
            <label htmlFor="text" className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase">
              <Pencil className="size-4 text-coral" strokeWidth={2.5} aria-hidden />
              Source text
            </label>
            <div className="flex items-center gap-2">
              <span className="rounded-full border-[1.5px] border-ink bg-muted-strong px-2.5 py-1 text-[11px] font-bold">
                {text.length} / {MAX_CHARS} chars
              </span>
              <button
                type="button"
                aria-label="Clear text"
                onClick={() => setText("")}
                className="flex size-7 cursor-pointer items-center justify-center rounded-lg border-[1.5px] border-ink bg-muted-strong shadow-hard-sm hover:bg-coral-soft active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              >
                <X className="size-4" strokeWidth={2.5} />
              </button>
            </div>
          </div>
          <input
            id="text"
            type="text"
            value={text}
            maxLength={MAX_CHARS}
            autoComplete="off"
            spellCheck={false}
            placeholder="Type something chunky..."
            onChange={(e) => setText(e.target.value)}
            className="w-full border-2 border-ink bg-muted px-4 py-2.5 font-display text-xl font-bold tracking-wide shadow-hard-sm outline-none placeholder:font-sans placeholder:text-base placeholder:font-medium placeholder:text-plum/70 focus:border-coral focus:bg-card md:text-2xl"
          />
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="mr-1 text-[11px] font-bold uppercase">Presets:</span>
            {PRESETS.map((p) => (
              <button key={p} type="button" className="chip" onClick={() => setText(p)}>
                {p}
              </button>
            ))}
          </div>
        </section>

        {/* Output stage */}
        <section
          aria-label="Output"
          className="flex flex-col gap-3 overflow-hidden border-[3px] border-ink bg-stage p-4 text-[#fffdf5] shadow-hard-lg"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-stage-line pb-3">
            <div className="flex items-center gap-3">
              <div aria-hidden className="flex gap-1.5">
                <span className="size-3.5 rounded-full border-[1.5px] border-ink bg-coral" />
                <span className="size-3.5 rounded-full border-[1.5px] border-ink bg-sun" />
                <span className="size-3.5 rounded-full border-[1.5px] border-ink bg-[#38d9a9]" />
              </div>
              <span className="rounded-md border border-[#443c78] bg-[#252047] px-2.5 py-0.5 text-xs font-bold text-lavender-soft">
                {font}
              </span>
              <span className="text-xs font-semibold text-stage-text">
                {lines.length} line{lines.length === 1 ? "" : "s"} &bull; {cols} cols
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="stage-btn"
                disabled={!art}
                onClick={() =>
                  copy(
                    `<pre style="font-family:monospace;line-height:1.15;">\n${escapeHtml(art)}\n</pre>`,
                    "HTML <pre> snippet copied",
                  )
                }
              >
                <Code className="size-3.5" strokeWidth={2.5} aria-hidden />
                Snippet
              </button>
              <button type="button" className="btn btn-coral !rounded-xl !px-4 !text-sm" disabled={!art} onClick={copyArt}>
                {copied ? (
                  <Check className="size-4" strokeWidth={2.5} aria-hidden />
                ) : (
                  <Copy className="size-4" strokeWidth={2.5} aria-hidden />
                )}
                {copied ? "Copied!" : "Copy ASCII"}
              </button>
            </div>
          </div>

          <div
            className={`flex min-h-[260px] overflow-x-auto border-2 border-stage-line p-4 xl:min-h-[320px] ${
              light ? "bg-[#fcf9f8]" : "bg-stage-deep"
            }`}
          >
            {art ? (
              <pre
                role="img"
                aria-label={`ASCII art of "${display}" in ${font}`}
                className={`w-max shrink-0 font-mono font-bold whitespace-pre select-all ${alignClass} ${
                  light ? "text-ink" : "text-coral"
                }`}
                style={{ fontSize: scale, lineHeight: 1.15 }}
              >
                {art}
              </pre>
            ) : text.trim() ? (
              <p className="m-auto animate-pulse text-sm font-semibold text-stage-text">Loading font...</p>
            ) : (
              <div className="m-auto flex max-w-sm flex-col items-center gap-3 p-6 text-center">
                <span className="rounded-lg border-2 border-ink bg-sun px-3 py-2 font-mono text-base font-bold text-ink shadow-hard-sm">
                  [ &bull; _ &bull; ]
                </span>
                <h3 className="font-display text-base font-bold tracking-tight uppercase">Stage is waiting</h3>
                <p className="text-xs text-stage-text">Type above to turn your words into chunky text art.</p>
                <button type="button" className="btn btn-coral" onClick={() => setText("FIGLY")}>
                  Auto-fill &quot;FIGLY&quot;
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-stage-line pt-2 text-xs text-stage-text">
            <span className="flex items-center gap-2">
              <span aria-hidden className="size-2 rounded-full bg-[#38d9a9]" />
              <span className="text-lavender">Live preview</span>
              <span aria-hidden>&bull;</span>
              <span>{(bytes / 1024).toFixed(1)} KB</span>
            </span>
            <span>Runs in your browser. Nothing is uploaded.</span>
          </div>
        </section>

        {/* Controls */}
        <section className="panel flex flex-col gap-4" aria-label="Controls">
          <div className="flex flex-wrap items-stretch gap-3 border-b-2 border-muted-strong pb-4">
            <div className="flex min-w-[190px] flex-1 items-center gap-2.5 rounded-xl border-2 border-ink bg-muted px-3 py-2 shadow-hard-sm">
              <Type className="size-4 shrink-0" strokeWidth={2.5} aria-hidden />
              <div className="flex min-w-0 flex-1 flex-col">
                <label htmlFor="scale" className="flex justify-between text-[11px] font-bold uppercase">
                  Scale <span className="text-plum normal-case">{scale}px</span>
                </label>
                <input
                  id="scale"
                  type="range"
                  min={10}
                  max={22}
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  className="mt-1 h-2 w-full cursor-pointer accent-coral"
                />
              </div>
            </div>
            <div className="flex min-w-[190px] flex-1 items-center gap-2.5 rounded-xl border-2 border-ink bg-muted px-3 py-2 shadow-hard-sm">
              <MoveHorizontal className="size-4 shrink-0" strokeWidth={2.5} aria-hidden />
              <div className="flex min-w-0 flex-1 flex-col">
                <label htmlFor="width" className="flex justify-between text-[11px] font-bold uppercase">
                  Wrap at <span className="text-plum normal-case">{width} cols</span>
                </label>
                <input
                  id="width"
                  type="range"
                  min={40}
                  max={140}
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  className="mt-1 h-2 w-full cursor-pointer accent-coral"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl border-2 border-ink bg-muted px-2.5 py-1.5 shadow-hard-sm">
              <span className="text-[11px] font-bold text-plum uppercase">Align</span>
              <div role="radiogroup" aria-label="Alignment" className="flex gap-1 rounded-lg border border-ink bg-muted-strong p-0.5">
                {ALIGNS.map(({ value, label, Icon }) => (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={align === value}
                    aria-label={label}
                    onClick={() => setAlign(value)}
                    className={`flex size-7 cursor-pointer items-center justify-center rounded-md ${
                      align === value ? "border-[1.5px] border-ink bg-plum text-white shadow-[1px_1px_0_#18181b]" : "hover:bg-card"
                    }`}
                  >
                    <Icon className="size-3.5" strokeWidth={2.5} />
                  </button>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-2 rounded-xl border-2 border-ink bg-muted px-3 py-2 text-[11px] font-bold text-plum uppercase shadow-hard-sm">
              Frame
              <select
                value={frame}
                onChange={(e) => setFrame(e.target.value as Frame)}
                className="cursor-pointer rounded-lg border-[1.5px] border-ink bg-card px-2 py-0.5 text-xs font-bold text-ink normal-case"
              >
                {FRAMES.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <button type="button" className="btn" onClick={() => setCaseMode(CASE_NEXT[caseMode])}>
                {CASE_LABEL[caseMode]}
              </button>
              <button type="button" className="btn" aria-pressed={light} onClick={() => setLight((v) => !v)}>
                <Contrast className="size-3.5" strokeWidth={2.5} aria-hidden />
                Invert
              </button>
            </div>
            <div className="ml-auto flex flex-wrap gap-2.5">
              <button type="button" className="btn" onClick={randomFont}>
                <Shuffle className="size-3.5" strokeWidth={2.5} aria-hidden />
                Random font
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => copy(window.location.href, "Share link copied")}
              >
                <Link2 className="size-3.5" strokeWidth={2.5} aria-hidden />
                Share
              </button>
              <button type="button" className="btn btn-coral" disabled={!art} onClick={download}>
                <Download className="size-3.5" strokeWidth={2.5} aria-hidden />
                Download .txt
              </button>
            </div>
          </div>
        </section>

        <aside className="flex flex-wrap items-center justify-between gap-3 border-[2.5px] border-ink bg-lavender-soft p-3.5 shadow-hard">
          <div className="flex items-center gap-3">
            <span className="flex size-8 items-center justify-center rounded-lg border-2 border-ink bg-card shadow-hard-sm">
              <Info className="size-4" strokeWidth={2.5} aria-hidden />
            </span>
            <div className="text-xs">
              <p className="font-bold uppercase">Pro tip: short words win</p>
              <p className="text-plum">Three to eight characters look best in the big block fonts.</p>
            </div>
          </div>
          <div className="flex gap-1.5 text-[10px] font-bold">
            <kbd className="rounded border border-ink bg-card px-2 py-0.5 shadow-[1px_1px_0_#18181b]">Ctrl+C copy</kbd>
            <kbd className="rounded border border-ink bg-card px-2 py-0.5 shadow-[1px_1px_0_#18181b]">Space random</kbd>
          </div>
        </aside>
      </div>

      <div className="lg:col-span-5 xl:col-span-4">
        <FontLibrary text={text} selected={font} onSelect={setFont} />
      </div>
    </div>
  );
}
