import { useState } from "react";
import { Pathway, Enzyme } from "@/data/pathwayData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowDown, FlaskConical, Zap, Beaker } from "lucide-react";
import { EnzymeModal } from "./EnzymeModal";

interface PathwayViewerProps {
  pathway: Pathway;
}

const scoreColor = (score: number) => {
  if (score >= 0.9) return "text-primary text-glow";
  if (score >= 0.8) return "text-primary/80";
  return "text-primary/60";
};

export const PathwayViewer = ({ pathway }: PathwayViewerProps) => {
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
            {/* From substrate */}
            {idx === 0 && (
              <SubstrateNode name={step.fromSubstrate} />
            )}

            {/* Reaction arrow with enzymes */}
            <div className="flex items-start ml-8 my-1">
              <div className="flex flex-col items-center mr-4 pt-1">
                <div className="w-px h-6 bg-primary/40" />
                <ArrowDown className="w-4 h-4 text-primary/60" />
                <div className="w-px h-6 bg-primary/40" />
              </div>

              <div className="pt-2 space-y-1.5">
                <span className="text-xs font-mono text-muted-foreground">{step.reactionType}</span>
                {step.enzymes.length > 0 ? (
                  <div className="space-y-1">
                    {step.enzymes.map((enz) => (
                      <button
                        key={enz.id}
                        onClick={() => setSelectedEnzyme(enz)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary hover:bg-secondary/80 border border-border hover:border-primary/50 hover:glow-green-sm transition-all group cursor-pointer"
                      >
                        <FlaskConical className="w-3.5 h-3.5 text-primary/70 group-hover:text-primary" />
                        <span className="text-sm text-secondary-foreground group-hover:text-foreground">
                          {enz.name}
                        </span>
                        <span className={`text-xs font-mono font-semibold ${scoreColor(enz.score)}`}>
                          ({enz.score.toFixed(2)})
                        </span>
                      </button>
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
                        className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive font-mono text-xs"
                      >
                        <Zap className="w-3 h-3 mr-1" />
                        Brute force search
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* To substrate */}
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

const SubstrateNode = ({ name }: { name: string }) => (
  <div className="flex items-center gap-3 ml-2">
    <div className="w-3 h-3 rounded-full bg-primary/30 border-2 border-primary glow-green-sm" />
    <span className="text-lg font-semibold text-foreground">{name}</span>
  </div>
);
