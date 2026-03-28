import { useState } from "react";
import type { PathwayStep as PathwayStepType } from "@/types/pathway";
import { formatScore, formatConfidenceLabel } from "@/lib/utils/formatting";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronDown, ShoppingCart, FlaskConical, Droplets, Thermometer, Activity, Target, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const labelStyles: Record<'high' | 'medium' | 'low', string> = {
  high:   "bg-success-100 text-success-700 border border-success-500",
  medium: "bg-warning-100 text-warning-700 border border-warning-500",
  low:    "bg-danger-100 text-danger-700 border border-danger-500",
};

const ConfidenceScoreWithLabel = ({ score }: { score: number }) => {
  const label = formatConfidenceLabel(score);
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-sm font-mono font-semibold shrink-0",
      labelStyles[label]
    )}>
      {formatScore(score)}
      <span className="font-normal opacity-80">confidence</span>
    </span>
  );
};

interface PathwayStepProps {
  step: PathwayStepType;
}

export const PathwayStep = ({ step }: PathwayStepProps) => {
  const [open, setOpen] = useState(false);

  const isBiocatalysis = step.reactionType === "Suggested biocatalysis";
  const enzyme = step.enzymes[0] ?? null;

  return (
    <div className="px-2 py-1 flex flex-col items-center gap-2">

      {/* ── Reaction type pill ── */}
      {isBiocatalysis ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-sm font-semibold px-4 py-2 rounded-full flex items-center gap-2 shadow-sm transition-colors cursor-pointer select-none"
          style={{ backgroundColor: '#10B981', color: '#ffffff', border: '1px solid #10B981' }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#059669')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#10B981')}
        >
          {step.reactionType}
          <ChevronDown className="w-4 h-4" />
        </button>
      ) : (
        <span className="text-xs font-mono bg-muted text-muted-foreground border border-border px-3 py-1 rounded-full">
          {step.reactionType}
        </span>
      )}

      {/* ── Enzyme modal ── */}
      {isBiocatalysis && enzyme && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent
            className="max-w-3xl w-full p-0 overflow-hidden gap-0"
            style={{
              background: 'var(--bg-elevated)',
              boxShadow: '0 20px 40px -8px rgba(0,0,0,0.2), 0 8px 16px -4px rgba(0,0,0,0.12)',
            }}
          >
            {/* ── Header ── */}
            <div className="px-8 pt-8 pb-6 border-b border-border">
              <DialogHeader className="space-y-0">
                <div className="flex items-start justify-between gap-4">
                  <DialogTitle className="text-2xl font-bold text-foreground leading-tight">
                    {enzyme.name}
                  </DialogTitle>
                  <ConfidenceScoreWithLabel score={enzyme.score} />
                </div>
              </DialogHeader>
            </div>

            {/* ── Body ── */}
            <div className="px-8 py-7 space-y-6">

              {/* Kinetics grid — 4 cols on wide modal */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                  Kinetic Parameters
                </p>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { icon: <Droplets className="w-5 h-5" />,    label: "Optimal pH",   value: enzyme.optimalPh },
                    { icon: <Thermometer className="w-5 h-5" />, label: "Optimal Temp", value: enzyme.optimalTemp },
                    { icon: <Activity className="w-5 h-5" />,    label: "k_cat",        value: enzyme.kcat },
                    { icon: <Target className="w-5 h-5" />,      label: "K_m",          value: enzyme.km },
                  ].map(({ icon, label, value }) => (
                    <div key={label} className="flex flex-col gap-2 rounded-xl p-4 bg-muted/50 border border-border">
                      <span className="text-muted-foreground">{icon}</span>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
                        <p className="text-lg font-mono font-semibold text-foreground mt-0.5">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Projected Yield */}
              <div className="flex items-center gap-3 rounded-xl bg-primary/10 border border-primary/20 p-4 mb-4">
                <TrendingUp className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Projected Yield</p>
                  <p className="text-3xl font-bold font-mono text-foreground">{enzyme.projectedYield}</p>
                </div>
              </div>

              {/* Action row */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2"
                  onClick={() => window.open('#', '_blank')}
                >
                  <ShoppingCart className="w-4 h-4" />
                  Buy · {enzyme.price}
                </Button>
                <Button
                  size="lg"
                  className="gap-2 font-semibold shadow-sm glow-green-sm"
                  style={{ background: '#1a7a4a', color: '#fff' }}
                >
                  <FlaskConical className="w-4 h-4" />
                  Test with Nitroduck
                </Button>
              </div>

            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
