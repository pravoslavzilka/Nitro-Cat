import type { PathwayStep as PathwayStepType } from "@/types/pathway";
import type { Enzyme } from "@/types/enzyme";
import { EnzymeCard } from "@/components/enzyme/EnzymeCard";
import { Button } from "@/components/ui/button";
import { Beaker, Zap } from "lucide-react";

interface PathwayStepProps {
  step: PathwayStepType;
  onEnzymeClick: (enzyme: Enzyme) => void;
}

export const PathwayStep = ({ step, onEnzymeClick }: PathwayStepProps) => {
  return (
    <div className="px-1 py-1">
      {/* Reaction type label */}
      <p className="text-[11px] font-mono font-semibold uppercase tracking-widest text-muted-foreground mb-2 px-1">
        {step.reactionType}
      </p>

      {step.enzymes.length > 0 ? (
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
        <div className="flex flex-col items-start gap-2 pl-4">
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
  );
};
