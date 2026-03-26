import { useState } from "react";
import type { PathwayStep as PathwayStepType } from "@/types/pathway";
import { ConfidenceScore } from "@/components/enzyme/ConfidenceScore";
import { Button } from "@/components/ui/button";
import { ChevronDown, ShoppingCart, FlaskConical, Droplets, Thermometer, Activity, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface PathwayStepProps {
  step: PathwayStepType;
}

export const PathwayStep = ({ step }: PathwayStepProps) => {
  const [expanded, setExpanded] = useState(false);

  const isBiocatalysis = step.reactionType === "Suggested biocatalysis";
  const enzyme = step.enzymes[0] ?? null;

  return (
    <div className="px-2 py-1 flex flex-col items-center gap-2">

      {/* ── Reaction type pill ── */}
      {isBiocatalysis ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-xs font-mono bg-primary/10 text-primary border border-primary/30 px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors cursor-pointer flex items-center gap-1.5"
        >
          {step.reactionType}
          <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", expanded && "rotate-180")} />
        </button>
      ) : (
        <span className="text-xs font-mono bg-muted text-muted-foreground border border-border px-3 py-1 rounded-full">
          {step.reactionType}
        </span>
      )}

      {/* ── Inline enzyme panel ── */}
      {isBiocatalysis && expanded && enzyme && (
        <div className="mt-3 rounded-xl border border-primary/20 bg-card shadow-sm p-5 transition-all duration-200 w-full max-w-lg">

          {/* Header row */}
          <div className="flex items-start justify-between gap-3">
            <span className="text-sm font-semibold text-foreground">{enzyme.name}</span>
            <ConfidenceScoreWithLabel score={enzyme.score} />
          </div>

          {/* Kinetics grid */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            {[
              { icon: <Droplets className="w-3.5 h-3.5" />, label: "Optimal pH",   value: enzyme.optimalPh },
              { icon: <Thermometer className="w-3.5 h-3.5" />, label: "Optimal Temp", value: enzyme.optimalTemp },
              { icon: <Activity className="w-3.5 h-3.5" />,    label: "k_cat",       value: enzyme.kcat },
              { icon: <Target className="w-3.5 h-3.5" />,      label: "K_m",         value: enzyme.km },
            ].map(({ icon, label, value }) => (
              <div key={label} className="flex items-center gap-2 rounded-lg p-2.5 bg-muted/50">
                <span className="text-muted-foreground shrink-0">{icon}</span>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
                  <p className="text-sm font-mono font-medium text-foreground">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Action row */}
          <div className="mt-4 flex items-center justify-between gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => window.open('#', '_blank')}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Buy · {enzyme.price}
            </Button>
            <Button
              size="sm"
              className="gap-1.5 font-semibold shadow-sm glow-green-sm"
              style={{ background: '#1a7a4a', color: '#fff' }}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              Test with Nitroduck
            </Button>
          </div>

        </div>
      )}
    </div>
  );
};
