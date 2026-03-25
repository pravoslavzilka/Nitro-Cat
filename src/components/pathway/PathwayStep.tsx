import type { PathwayStep as PathwayStepType } from "@/types/pathway";
import type { Enzyme } from "@/types/enzyme";
import { EnzymeCard } from "@/components/enzyme/EnzymeCard";
import { Button } from "@/components/ui/button";
import { ArrowDown, Beaker, Zap } from "lucide-react";

interface PathwayStepProps {
  step: PathwayStepType;
  onEnzymeClick: (enzyme: Enzyme) => void;
}

export const PathwayStep = ({ step, onEnzymeClick }: PathwayStepProps) => {
  return (
    <div className="flex items-center">

      {/* ── Gutter: w-6 aligns with SubstrateNode gutter ── */}
      {/*
        No line segments here — the single absolute line in PathwayBuilder
        runs through this column continuously.
        Arrow circle: z-10 + bg-background so it appears to sit ON the line.
      */}
      <div className="w-6 shrink-0 flex justify-center">
        <div className="relative z-10 w-6 h-6 rounded-full bg-background border border-primary/50 flex items-center justify-center shrink-0">
          <ArrowDown className="w-3 h-3 text-primary" />
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 pl-5 py-2 space-y-2">
        {/* Reaction type — small inline label, not a card */}
        <span className="text-xs font-mono text-muted-foreground">
          {step.reactionType}
        </span>

        {step.enzymes.length > 0 ? (
          /* Enzyme cards — indented further to visually group within the step */
          <div className="flex flex-col items-start gap-1.5 pl-4">
            {step.enzymes.map((enzyme) => (
              <EnzymeCard
                key={enzyme.id}
                enzyme={enzyme}
                onClick={() => onEnzymeClick(enzyme)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-start gap-2">
            {/* No card styling — just a plain muted row */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Beaker className="w-3.5 h-3.5" />
              <span className="italic">No enzymes found</span>
            </div>
            {step.hasBruteForce && (
              <Button
                size="sm"
                variant="outline"
                className="border-warning/50 bg-warning/10 hover:bg-warning/20 hover:border-warning font-mono text-xs"
                style={{ color: 'var(--warning-700)' }}
              >
                <Zap className="w-3 h-3 mr-1" />
                Brute force search
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
