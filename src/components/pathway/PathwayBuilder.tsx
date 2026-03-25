import { useState } from "react";
import type { Pathway } from "@/types/pathway";
import type { Molecule } from "@/types/pathway";
import type { Enzyme } from "@/types/enzyme";
import { PathwayStep } from "./PathwayStep";
import { EnzymeModal } from "@/components/enzyme/EnzymeModal";
import { MoleculeViewer } from "@/components/molecule/MoleculeViewer";
import { FlaskConical, Layers, Dna } from "lucide-react";

interface PathwayBuilderProps {
  pathway: Pathway;
}

// Gutter width matches PathwayStep gutter (w-6 = 24px).
// Absolute line center: 11px from left (half of 24px minus 1px for 2px line).
const LINE_X = "left-[11px]";

const statusColors: Record<string, string> = {
  complete: "bg-success-100 text-success-700 border border-success-500",
  analyzing: "bg-warning-100 text-warning-700 border border-warning-500",
  draft: "bg-muted text-muted-foreground border border-border",
};

// Molecule node — dot on the timeline + name + structure visualization
const MoleculeNode = ({ molecule }: { molecule: Molecule }) => (
  <div className="relative flex items-start gap-5 py-4">
    {/* Dot sits on the absolute line */}
    <div className="w-6 shrink-0 flex justify-center pt-3">
      <div
        className="relative z-10 w-4 h-4 rounded-full bg-primary border-2 border-primary-600 shrink-0"
        style={{ boxShadow: '0 0 0 3px hsl(var(--background))' }}
      />
    </div>
    {/* Content */}
    <div className="pb-1">
      <p className="text-2xl font-bold font-mono text-foreground tracking-tight leading-snug">
        {molecule.name}
      </p>
      {molecule.formula && (
        <p className="text-base font-semibold font-mono text-muted-foreground mt-1">{molecule.formula}</p>
      )}
      <div className="mt-3">
        <MoleculeViewer smiles={molecule.smiles} width={260} height={170} />
      </div>
    </div>
  </div>
);

export const PathwayBuilder = ({ pathway }: PathwayBuilderProps) => {
  const [selectedEnzyme, setSelectedEnzyme] = useState<Enzyme | null>(null);
  const totalEnzymes = pathway.steps.reduce((n, s) => n + s.enzymes.length, 0);

  return (
    // h-full + overflow-y-auto gives the panel its own scrollable area
    <div className="h-full overflow-y-auto p-6">

      {/* ── Header card ── */}
      <div className="mb-8 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-5 shadow-[var(--shadow-md)]">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
              <FlaskConical className="w-4 h-4 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground leading-tight">
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

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-info bg-info/10 border border-info/20 px-2.5 py-1 rounded-md font-mono">
            <Layers className="w-3 h-3" />
            <span>{pathway.steps.length} reaction steps</span>
          </div>
          <div className="flex items-center gap-1.5 bg-success-100 border border-success-500/40 px-2.5 py-1 rounded-md font-mono" style={{ color: 'var(--success-700)' }}>
            <Dna className="w-3 h-3" />
            <span>{totalEnzymes} enzyme candidates</span>
          </div>
        </div>
      </div>

      {/* ── Timeline ── */}
      <div className="relative">
        {/*
          Single continuous vertical line.
          top-6 = 24px = py-4 (16px) + half of h-4 dot (8px) → starts at center of first dot.
          bottom-6 = same calculation from bottom → ends at center of last dot.
        */}
        <div
          className={`absolute ${LINE_X} top-6 bottom-6 w-0.5`}
          style={{
            backgroundImage: 'repeating-linear-gradient(to bottom, hsl(var(--primary) / 0.5) 0px, hsl(var(--primary) / 0.5) 5px, transparent 5px, transparent 13px)',
          }}
        />

        <div>
          {pathway.steps.map((step, idx) => (
            <div key={step.id}>
              {idx === 0 && <MoleculeNode molecule={step.startMolecule} />}
              <PathwayStep step={step} onEnzymeClick={setSelectedEnzyme} />
              <MoleculeNode molecule={step.productMolecule} />
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
