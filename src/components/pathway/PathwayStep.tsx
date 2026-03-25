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
    // items-stretch so the gutter column matches content height → line spans full height
    <div className="flex items-stretch">

      {/* ── Gutter column: w-6 matches SubstrateNode gutter for line alignment ── */}
      <div className="w-6 shrink-0 flex flex-col items-center">
        {/* Top line segment — grows to fill space above arrow */}
        <div className="flex-1 w-0.5 bg-primary/20" />
        {/* Arrow indicator */}
        <div className="w-6 h-6 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0 z-10">
          <ArrowDown className="w-3 h-3 text-primary" />
        </div>
        {/* Bottom line segment — grows to fill space below arrow */}
        <div className="flex-1 w-0.5 bg-primary/20" />
      </div>

      {/* ── Content ── */}
      <div className="flex-1 pl-6 py-4 space-y-2.5 min-h-[3rem]">
        {/* Reaction type badge */}
        <span className="inline-flex items-center text-xs font-mono font-medium text-info px-2.5 py-1 rounded-md bg-info/10 border border-info/25">
          {step.reactionType}
        </span>

        {step.enzymes.length > 0 ? (
          /* Enzyme cards — flex-col items-start so cards only take their natural width */
          <div className="flex flex-col items-start gap-1.5">
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
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary border border-border">
              <Beaker className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground italic">No enzymes found</span>
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
