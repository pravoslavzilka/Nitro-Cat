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
import { ExternalLink, ShoppingCart, Thermometer, Droplets, Activity, Target, TrendingUp } from "lucide-react";
import { ConfidenceScore } from "./ConfidenceScore";

interface EnzymeModalProps {
  enzyme: Enzyme | null;
  open: boolean;
  onClose: () => void;
}

export const EnzymeModal = ({ enzyme, open, onClose }: EnzymeModalProps) => {
  if (!enzyme) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-lg p-0 overflow-hidden gap-0"
        style={{
          background: 'var(--bg-elevated)',
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.15), 0 4px 6px -4px rgba(0,0,0,0.1)',
        }}
      >
        {/* ── Header ── */}
        <div className="px-6 pt-6 pb-4 border-b">
          <DialogHeader className="space-y-0">
            <DialogTitle className="text-xl font-bold text-foreground">
              {enzyme.name}
            </DialogTitle>
            <div className="flex items-center gap-2 pt-2 flex-wrap">
              <Badge variant="outline" className="text-xs font-mono">{enzyme.ecNumber}</Badge>
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

          {/* Projected yield — prominent */}
          <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-3">
            <TrendingUp className="w-5 h-5 text-primary shrink-0" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Projected Yield</p>
              <p className="text-2xl font-bold font-mono text-foreground">{enzyme.projectedYield}</p>
            </div>
          </div>

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
                <div key={label} className="flex items-center gap-2.5 rounded-lg p-2.5 bg-muted/50">
                  <span className="text-muted-foreground">{icon}</span>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
                    <p className="text-sm font-mono font-medium text-foreground">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Vendor row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold border bg-muted text-muted-foreground">
                {enzyme.vendor.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{enzyme.vendor}</p>
                <p className="text-xs text-muted-foreground font-mono">Cat# {enzyme.catalogNumber}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-foreground">{enzyme.price}</p>
              <Button size="sm" className="mt-1 gap-1.5">
                <ShoppingCart className="w-3 h-3" />
                Buy
                <ExternalLink className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
