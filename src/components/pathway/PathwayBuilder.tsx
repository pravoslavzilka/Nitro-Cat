import { useState } from "react";
import type { Pathway } from "@/types/pathway";
import type { Enzyme } from "@/types/enzyme";
import { PathwayStep } from "./PathwayStep";
import { EnzymeModal } from "@/components/enzyme/EnzymeModal";

interface PathwayBuilderProps {
  pathway: Pathway;
}

const SubstrateNode = ({ name }: { name: string }) => (
  <div className="flex items-center gap-3 ml-2">
    <div className="w-3 h-3 rounded-full bg-primary/30 border-2 border-primary glow-green-sm" />
    <span className="text-lg font-semibold text-foreground">{name}</span>
  </div>
);

export const PathwayBuilder = ({ pathway }: PathwayBuilderProps) => {
  const [selectedEnzyme, setSelectedEnzyme] = useState<Enzyme | null>(null);

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground text-glow mb-1">{pathway.name}</h1>
        <p className="text-muted-foreground text-sm font-mono">{pathway.description}</p>
      </div>

      <div className="space-y-0">
        {pathway.steps.map((step, idx) => (
          <div key={step.id}>
            {idx === 0 && <SubstrateNode name={step.fromSubstrate} />}

            <PathwayStep
              step={step}
              onEnzymeClick={setSelectedEnzyme}
            />

            <SubstrateNode name={step.toSubstrate} />
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
