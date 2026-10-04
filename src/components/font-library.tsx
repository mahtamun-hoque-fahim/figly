"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { CATEGORIES, FONTS, TOTAL_FIGLET_FONTS, type Category } from "@/lib/fonts";
import { ensureFont, isLoaded, renderArt } from "@/lib/render";

type Sort = "curated" | "az" | "lines";

export default function FontLibrary({
  text,
  selected,
  onSelect,
}: {
  text: string;
  selected: string;
  onSelect: (name: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<Category | "All">("All");
  const [sort, setSort] = useState<Sort>("curated");
  const [, setTick] = useState(0);
  const previewText = useDeferredValue(text.trim().slice(0, 6) || "Figly");

  // Load every curated font in the background, one at a time, so previews fill in.
  useEffect(() => {
    let alive = true;
    (async () => {
      for (const f of FONTS) {
        try {
          await ensureFont(f.name);
        } catch {
          /* skip a font that fails to load */
        }
        if (alive) setTick((t) => t + 1);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = FONTS.filter(
      (f) =>
        (cat === "All" || f.tags.includes(cat)) &&
        (!q || f.name.toLowerCase().includes(q) || f.tags.some((t) => t.toLowerCase().includes(q))),
    ).map((f) => {
      const art = renderArt(previewText, f.name, 200);
      return { ...f, art, lines: art ? art.split("\n").length : 0 };
    });
    if (sort === "az") list.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "lines") list.sort((a, b) => (a.lines || 99) - (b.lines || 99));
    return list;
  }, [query, cat, sort, previewText]);

  return (
    <section id="fonts" aria-labelledby="fonts-title" className="flex flex-col gap-4">
      <div className="panel flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 id="fonts-title" className="font-display text-base font-extrabold uppercase tracking-tight">
            Font Library
          </h2>
          <span className="rounded-full border-[1.5px] border-ink bg-sun px-2.5 py-0.5 text-xs font-bold">
            {FONTS.length} styles
          </span>
        </div>

        <div className="relative">
          <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" strokeWidth={2.5} />
          <input
            type="search"
            aria-label="Search fonts"
            placeholder="Search fonts or styles..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && setQuery("")}
            className="w-full border-2 border-ink bg-muted py-2 pr-10 pl-9 text-xs shadow-hard-sm outline-none focus:bg-card"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setQuery("")}
              className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer rounded border border-ink bg-muted-strong p-0.5"
            >
              <X className="size-3.5" strokeWidth={3} />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 text-xs font-bold">
          <label className="flex items-center gap-1.5">
            Sort:
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="cursor-pointer rounded-lg border border-ink bg-muted px-2 py-0.5"
            >
              <option value="curated">Curated</option>
              <option value="az">A to Z</option>
              <option value="lines">Fewest lines</option>
            </select>
          </label>
          <span aria-live="polite" className="text-plum">
            {rows.length} shown
          </span>
        </div>

        <div role="group" aria-label="Filter by style" className="flex flex-wrap gap-1.5">
          {(["All", ...CATEGORIES] as const).map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={cat === c}
              onClick={() => setCat(c)}
              className={`chip ${cat === c ? "!bg-ink text-white" : ""}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <ul className="flex max-h-[70vh] flex-col gap-3 overflow-y-auto p-1 pr-2">
        {rows.length === 0 && (
          <li className="panel text-center text-sm font-bold">No fonts match that search.</li>
        )}
        {rows.map((f) => {
          const active = f.name === selected;
          return (
            <li
              key={f.name}
              onClick={() => onSelect(f.name)}
              className={`flex cursor-pointer flex-col gap-1.5 bg-card p-3 transition-transform duration-150 hover:-translate-y-0.5 ${
                active ? "border-[3px] border-plum shadow-plum" : "border-[2.5px] border-ink shadow-hard-sm"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <span className="font-display text-sm font-bold">{f.name}</span>
                  {f.tags.map((t) => (
                    <span key={t} className="rounded border border-ink bg-lavender-soft px-1.5 text-[10px] font-bold">
                      {t}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  aria-pressed={active}
                  aria-label={`${active ? "Selected font" : "Use font"} ${f.name}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(f.name);
                  }}
                  className={`shrink-0 cursor-pointer rounded-lg border-[1.5px] border-ink px-2.5 py-0.5 text-xs font-bold ${
                    active ? "bg-coral shadow-hard-sm" : "bg-muted hover:bg-coral"
                  }`}
                >
                  {active ? "Selected" : "Select"}
                </button>
              </div>
              <div className="overflow-x-hidden border-[1.5px] border-ink bg-muted p-2">
                {isLoaded(f.name) ? (
                  <pre aria-hidden className="font-mono text-[9px] leading-tight font-bold">
                    {f.art}
                  </pre>
                ) : (
                  <div className="h-10 animate-pulse rounded bg-muted-strong" />
                )}
              </div>
              <div className="text-xs font-semibold text-plum">
                {f.lines ? `${f.lines} line${f.lines === 1 ? "" : "s"}` : "Loading..."}
              </div>
            </li>
          );
        })}
      </ul>

      <p className="border-2 border-ink bg-muted p-3 text-xs font-semibold shadow-hard-sm">
        Showing {rows.length} of {FONTS.length} curated fonts. Figlet ships {TOTAL_FIGLET_FONTS} in total.
      </p>
    </section>
  );
}
