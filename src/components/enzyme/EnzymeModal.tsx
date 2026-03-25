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

interface EnzymeModalProps {
  enzyme: Enzyme | null;
  open: boolean;
  onClose: () => void;
}

export const EnzymeModal = ({ enzyme, open, onClose }: EnzymeModalProps) => {
  if (!enzyme) return null;

  const scorePercent = Math.round(enzyme.score * 100);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground text-glow text-xl">
            {enzyme.name}
          </DialogTitle>
          <div className="flex items-center gap-2 pt-1">
            <Badge variant="outline" className="font-mono text-xs border-primary/40 text-primary">
              {enzyme.ecNumber}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {enzyme.organism}
            </Badge>
          </div>
        </DialogHeader>

        <p className="text-sm text-muted-foreground leading-relaxed">{enzyme.description}</p>

        <Separator className="bg-border" />

        {/* Performance metrics */}
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3">Projected Performance</h4>
          <div className="grid grid-cols-2 gap-3">
            <MetricCard icon={<Droplets className="w-4 h-4" />} label="Optimal pH" value={enzyme.optimalPh} />
            <MetricCard icon={<Thermometer className="w-4 h-4" />} label="Optimal Temp" value={enzyme.optimalTemp} />
            <MetricCard icon={<Activity className="w-4 h-4" />} label="k_cat" value={enzyme.kcat} />
            <MetricCard icon={<Target className="w-4 h-4" />} label="K_m" value={enzyme.km} />
          </div>
        </div>

        {/* Yield bar */}
        <div className="bg-secondary rounded-lg p-3">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Match Score</span>
            <span className="font-mono font-bold text-primary text-glow">{scorePercent}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="h-2 rounded-full bg-primary transition-all"
              style={{ width: `${scorePercent}%`, boxShadow: '0 0 8px hsl(142 70% 45% / 0.5)' }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Projected yield: {enzyme.projectedYield}</span>
          </div>
        </div>

        <Separator className="bg-border" />

        {/* Vendor + Buy */}
        <div className="flex items-center justify-between bg-secondary rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
              {enzyme.vendor.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{enzyme.vendor}</p>
              <p className="text-xs text-muted-foreground font-mono">Cat# {enzyme.catalogNumber}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-primary">{enzyme.price}</p>
            <Button size="sm" className="mt-1 glow-green-sm">
              <ShoppingCart className="w-3 h-3 mr-1" />
              Buy
              <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const MetricCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="bg-secondary rounded-md p-2.5 flex items-center gap-2">
    <span className="text-primary/70">{icon}</span>
    <div>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="text-sm font-mono text-foreground">{value}</p>
    </div>
  </div>
);
