import { useState } from "react";
import type { Pathway, Molecule } from "@/types/pathway";
import type { Enzyme } from "@/types/enzyme";
import { PathwayStep } from "./PathwayStep";
import { EnzymeModal } from "@/components/enzyme/EnzymeModal";
import { MoleculeViewer } from "@/components/molecule/MoleculeViewer";
import { FlaskConical, Layers, Dna, ArrowDown } from "lucide-react";

interface PathwayBuilderProps {
  pathway: Pathway;
}

const statusColors: Record<string, string> = {
  complete: "bg-success-100 text-success-700 border border-success-500",
  analyzing: "bg-warning-100 text-warning-700 border border-warning-500",
  draft: "bg-muted text-muted-foreground border border-border",
};

// Arrow connector between molecule card and reaction section
const StepArrow = () => (
  <div className="flex justify-center py-1">
    <div className="flex flex-col items-center">
      <div className="w-px h-5 bg-primary/35" />
      <ArrowDown className="w-4 h-4 text-primary/60 -mt-0.5" />
    </div>
  </div>
);

// Bordered molecule card
const MoleculeCard = ({ molecule }: { molecule: Molecule }) => (
  <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
        <p className="text-xl font-bold font-mono text-foreground leading-tight">
          {molecule.name}
        </p>
      </div>
      {molecule.formula && (
        <p className="text-sm font-semibold font-mono text-muted-foreground shrink-0 ml-3">
          {molecule.formula}
        </p>
      )}
    </div>
    <div className="flex justify-center">
      <MoleculeViewer smiles={molecule.smiles} width={300} height={190} />
    </div>
  </div>
);

export const PathwayBuilder = ({ pathway }: PathwayBuilderProps) => {
  const [selectedEnzyme, setSelectedEnzyme] = useState<Enzyme | null>(null);
  const totalEnzymes = pathway.steps.reduce((n, s) => n + s.enzymes.length, 0);

  return (
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

      {/* ── Pathway flow ── */}
      <div className="space-y-0">
        {pathway.steps.map((step, idx) => (
          <div key={step.id}>
            {idx === 0 && <MoleculeCard molecule={step.startMolecule} />}
            <StepArrow />
            <PathwayStep step={step} onEnzymeClick={setSelectedEnzyme} />
            <StepArrow />
            <MoleculeCard molecule={step.productMolecule} />
          </div>
        ))}
      </div>

      <EnzymeModal
        enzyme={selectedEnzyme}
        open={!!selectedEnzyme}
        onClose={() => setSelectedEnzyme(null)}
      />
    </div>
  );
};
