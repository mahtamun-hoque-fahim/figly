import { Code } from "lucide-react";
import Figly from "@/components/figly";
import { parseInitial } from "@/lib/url";

export default async function Page({ searchParams }: PageProps<"/">) {
  const initial = parseInitial(await searchParams);

  return (
    <>
      <header className="sticky top-0 z-40 border-b-[3px] border-ink bg-card shadow-[0_4px_0_#18181b]">
        <div className="mx-auto flex h-16 max-w-[1720px] items-center justify-between gap-4 px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className="flex size-9 items-center justify-center rounded-lg border-2 border-ink bg-coral font-display text-lg font-extrabold shadow-hard-sm"
            >
              F
            </span>
            <span className="font-display text-xl font-extrabold tracking-tight">Figly</span>
            <span className="hidden -rotate-1 rounded-full border-2 border-ink bg-sun px-3 py-1 text-[11px] font-bold shadow-hard-sm xl:inline-block">
              Make your words ridiculously big.
            </span>
          </div>
          <nav aria-label="Sections" className="hidden items-center gap-1 rounded-2xl border-[2.5px] border-ink bg-muted p-1 shadow-hard-sm md:flex">
            <a href="#generator" className="rounded-xl border-2 border-ink bg-coral px-4 py-1 text-sm font-bold shadow-hard-sm">
              Generator
            </a>
            <a href="#fonts" className="rounded-xl px-4 py-1 text-sm font-bold hover:bg-muted-strong">
              Fonts
            </a>
          </nav>
          <a
            href="https://github.com/mahtamun-hoque-fahim/figletive"
            target="_blank"
            rel="noopener noreferrer"
            className="btn !text-sm"
          >
            <Code className="size-4" strokeWidth={2.5} aria-hidden />
            <span className="hidden sm:inline">GitHub</span>
            <span className="sr-only sm:hidden">GitHub</span>
          </a>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1720px] px-4 py-6 lg:px-8">
        <Figly initial={initial} />
      </main>
    </>
  );
}
