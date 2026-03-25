import { useState } from "react";
import type { Pathway } from "@/types/pathway";
import type { Enzyme } from "@/types/enzyme";
import { PathwayStep } from "./PathwayStep";
import { EnzymeModal } from "@/components/enzyme/EnzymeModal";
import { Badge } from "@/components/ui/badge";
import { FlaskConical, Layers, Dna } from "lucide-react";

interface PathwayBuilderProps {
  pathway: Pathway;
}

// Dot center is at left-[11px] (half of w-6 gutter minus half of 2px line = 12px - 1px)
const GUTTER = "w-6 shrink-0";
const LINE_POS = "left-[11px]";

const SubstrateNode = ({ name }: { name: string }) => (
  <div className="relative flex items-center gap-5 py-4">
    {/* Dot — centered in gutter, sits on top of the absolute line */}
    <div className={`${GUTTER} flex justify-center`}>
      <div className="relative z-10 w-4 h-4 rounded-full bg-primary border-2 border-primary-600 shadow-[0_0_12px_hsl(var(--primary)/0.5)]" />
    </div>
    {/* Molecule pill */}
    <div className="bg-primary/8 border border-primary/25 rounded-lg px-5 py-2.5 shadow-[var(--shadow-sm)]">
      <span className="text-xl font-bold font-mono text-foreground tracking-tight leading-snug">
        {name}
      </span>
    </div>
  </div>
);

const statusColors: Record<string, string> = {
  complete: "bg-success-100 text-success-700 border border-success-500",
  analyzing: "bg-warning-100 text-warning-700 border border-warning-500",
  draft: "bg-muted text-muted-foreground border border-border",
};

export const PathwayBuilder = ({ pathway }: PathwayBuilderProps) => {
  const [selectedEnzyme, setSelectedEnzyme] = useState<Enzyme | null>(null);

  const totalEnzymes = pathway.steps.reduce((n, s) => n + s.enzymes.length, 0);

  return (
    <div className="flex-1 overflow-y-auto p-6">

      {/* ── Header ── */}
      <div className="mb-8 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-5 shadow-[var(--shadow-md)]">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
              <FlaskConical className="w-4.5 h-4.5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground text-glow leading-tight">
              {pathway.name}
            </h1>
          </div>
          <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded capitalize shrink-0 mt-1 ${statusColors[pathway.status] ?? statusColors.draft}`}>
            {pathway.status}
          </span>
        </div>

        <p className="text-sm text-muted-foreground font-mono leading-relaxed mb-3">
          {pathway.description}
        </p>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-info bg-info/10 border border-info/20 px-2.5 py-1 rounded-md font-mono">
            <Layers className="w-3 h-3" />
            <span>{pathway.steps.length} reaction steps</span>
          </div>
          <div className="flex items-center gap-1.5 text-success-700 bg-success-100 border border-success-500/40 px-2.5 py-1 rounded-md font-mono">
            <Dna className="w-3 h-3" />
            <span>{totalEnzymes} enzyme candidates</span>
          </div>
        </div>
      </div>

      {/* ── Timeline ── */}
      <div className="relative">
        {/* Continuous vertical line running through all dots */}
        <div className={`absolute ${LINE_POS} top-6 bottom-6 w-0.5 bg-primary/20`} />

        <div>
          {pathway.steps.map((step, idx) => (
            <div key={step.id}>
              {idx === 0 && <SubstrateNode name={step.fromSubstrate} />}
              <PathwayStep step={step} onEnzymeClick={setSelectedEnzyme} />
              <SubstrateNode name={step.toSubstrate} />
            </div>
          ))}
        </div>
      </div>

      <EnzymeModal
        enzyme={selectedEnzyme}
        open={!!selectedEnzyme}
        onClose={() => setSelectedEnzyme(null)}
      />
    </div>
  );
};
