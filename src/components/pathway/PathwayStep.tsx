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
    <div className="flex items-start ml-8 my-1">
      <div className="flex flex-col items-center mr-4 pt-1">
        <div className="w-px h-6 bg-primary/40" />
        <ArrowDown className="w-4 h-4 text-primary/60" />
        <div className="w-px h-6 bg-primary/40" />
      </div>

      <div className="pt-2 space-y-1.5 flex-1">
        <span className="text-xs font-mono text-muted-foreground">{step.reactionType}</span>
        {step.enzymes.length > 0 ? (
          <div className="space-y-1">
            {step.enzymes.map((enzyme) => (
              <EnzymeCard
                key={enzyme.id}
                enzyme={enzyme}
                onClick={() => onEnzymeClick(enzyme)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary/50 border border-border/50">
              <Beaker className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground italic">No enzymes found</span>
            </div>
            {step.hasBruteForce && (
              <Button
                size="sm"
                variant="outline"
                className="border-warning/50 text-warning-foreground bg-warning/10 hover:bg-warning/20 hover:border-warning font-mono text-xs"
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
