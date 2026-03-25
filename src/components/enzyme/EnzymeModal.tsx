import type { Enzyme } from "@/types/enzyme";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, ShoppingCart, Thermometer, Droplets, Activity, Target } from "lucide-react";
import { ConfidenceScore } from "./ConfidenceScore";
import { formatConfidenceLabel } from "@/lib/utils/formatting";

interface EnzymeModalProps {
  enzyme: Enzyme | null;
  open: boolean;
  onClose: () => void;
}

// Color palette per confidence level
const confidenceConfig = {
  high: {
    headerBg: 'var(--success-50)',
    headerBorder: 'var(--success-500)',
    accent: 'var(--success-600)',
    barColor: 'var(--success-500)',
    iconBg: 'var(--success-100)',
    iconColor: 'var(--success-700)',
  },
  medium: {
    headerBg: 'var(--warning-50)',
    headerBorder: 'var(--warning-500)',
    accent: 'var(--warning-600)',
    barColor: 'var(--warning-500)',
    iconBg: 'var(--warning-100)',
    iconColor: 'var(--warning-700)',
  },
  low: {
    headerBg: 'var(--danger-50)',
    headerBorder: 'var(--danger-500)',
    accent: 'var(--danger-600)',
    barColor: 'var(--danger-500)',
    iconBg: 'var(--danger-100)',
    iconColor: 'var(--danger-700)',
  },
} as const;

export const EnzymeModal = ({ enzyme, open, onClose }: EnzymeModalProps) => {
  if (!enzyme) return null;

  const scorePercent = Math.round(enzyme.score * 100);
  const confidence = formatConfidenceLabel(enzyme.score);
  const cfg = confidenceConfig[confidence];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-lg p-0 overflow-hidden gap-0"
        style={{
          background: 'var(--bg-elevated)',
          borderColor: 'var(--border-emphasis)',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        {/* ── Colored header ── */}
        <div
          className="px-6 pt-6 pb-4 border-b"
          style={{
            background: cfg.headerBg,
            borderBottomColor: cfg.headerBorder + '40',
          }}
        >
          <DialogHeader className="space-y-0">
            <DialogTitle className="text-xl font-bold text-foreground">
              {enzyme.name}
            </DialogTitle>
            <div className="flex items-center gap-2 pt-2 flex-wrap">
              <span
                className="inline-flex items-center text-xs font-mono font-semibold px-2 py-0.5 rounded border"
                style={{
                  color: cfg.accent,
                  borderColor: cfg.headerBorder + '60',
                  background: cfg.iconBg,
                }}
              >
                {enzyme.ecNumber}
              </span>
              <Badge variant="secondary" className="text-xs font-mono">{enzyme.organism}</Badge>
              <ConfidenceScore score={enzyme.score} />
            </div>
          </DialogHeader>
          <p className="text-sm text-muted-foreground leading-relaxed mt-3">
            {enzyme.description}
          </p>
        </div>

        {/* ── Body ── */}
        <div className="px-6 py-5 space-y-5">

          {/* Kinetic metrics grid */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2.5">
              Kinetic Parameters
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: <Droplets className="w-4 h-4" />, label: "Optimal pH", value: enzyme.optimalPh },
                { icon: <Thermometer className="w-4 h-4" />, label: "Optimal Temp", value: enzyme.optimalTemp },
                { icon: <Activity className="w-4 h-4" />, label: "k_cat", value: enzyme.kcat },
                { icon: <Target className="w-4 h-4" />, label: "K_m", value: enzyme.km },
              ].map(({ icon, label, value }) => (
                <div
                  key={label}
                  className="flex items-center gap-2.5 rounded-lg p-2.5"
                  style={{ background: cfg.iconBg }}
                >
                  <span style={{ color: cfg.iconColor }}>{icon}</span>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
                    <p className="text-sm font-mono font-medium text-foreground">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Match score bar */}
          <div className="rounded-lg border p-3 space-y-1.5" style={{ borderColor: cfg.headerBorder + '30', background: cfg.headerBg }}>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">Match Score</span>
              <span className="text-sm font-mono font-bold" style={{ color: cfg.accent }}>
                {scorePercent}%
              </span>
            </div>
            <div className="w-full bg-black/10 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all"
                style={{
                  width: `${scorePercent}%`,
                  background: cfg.barColor,
                  boxShadow: `0 0 6px ${cfg.barColor}80`,
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground">Projected yield: {enzyme.projectedYield}</p>
          </div>

          <Separator />

          {/* Vendor row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold border"
                style={{ background: cfg.iconBg, color: cfg.accent, borderColor: cfg.headerBorder + '40' }}
              >
                {enzyme.vendor.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{enzyme.vendor}</p>
                <p className="text-xs text-muted-foreground font-mono">Cat# {enzyme.catalogNumber}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold" style={{ color: cfg.accent }}>{enzyme.price}</p>
              <Button
                size="sm"
                className="mt-1 text-white"
                style={{ background: cfg.barColor }}
              >
                <ShoppingCart className="w-3 h-3 mr-1" />
                Buy
                <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
