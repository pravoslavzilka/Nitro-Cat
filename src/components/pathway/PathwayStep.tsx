import { useState } from "react";
import type { PathwayStep as PathwayStepType } from "@/types/pathway";
import type { Enzyme } from "@/types/enzyme";
import { EnzymeCard } from "@/components/enzyme/EnzymeCard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Beaker, Zap, Search, Mail, FlaskConical, Database, Cpu } from "lucide-react";

interface PathwayStepProps {
  step: PathwayStepType;
  onEnzymeClick: (enzyme: Enzyme) => void;
}

const BruteForceModal = ({ open, onClose, reactionType }: { open: boolean; onClose: () => void; reactionType: string }) => (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent
      className="max-w-md"
      style={{
        background: 'var(--bg-elevated)',
        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.15)',
      }}
    >
      <DialogHeader>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-lg bg-warning/15 border border-warning/30 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4" style={{ color: 'var(--warning-600)' }} />
          </div>
          <DialogTitle className="text-lg font-bold">Brute Force Enzyme Search</DialogTitle>
        </div>
        <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
          No known enzyme candidates were found for the <span className="font-semibold text-foreground">{reactionType}</span> reaction using standard database queries.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-3 py-2">
        <p className="text-sm text-muted-foreground">
          A brute force search will scan all known enzyme families and apply ML-based activity prediction to identify potential candidates. This includes:
        </p>

        <div className="space-y-2">
          {[
            { icon: <Database className="w-3.5 h-3.5" />, text: "Full scan of UniProt, BRENDA, and MetaCyc databases" },
            { icon: <Cpu className="w-3.5 h-3.5" />, text: "ML-based substrate specificity prediction across 40,000+ enzyme sequences" },
            { icon: <FlaskConical className="w-3.5 h-3.5" />, text: "In silico docking and activity scoring for top candidates" },
            { icon: <Search className="w-3.5 h-3.5" />, text: "Literature mining for novel or unreported enzyme activities" },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-start gap-2.5 text-sm text-muted-foreground">
              <span className="mt-0.5 shrink-0" style={{ color: 'var(--warning-600)' }}>{icon}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>

        <div className="rounded-lg bg-muted/50 border p-3 text-xs text-muted-foreground">
          <strong className="text-foreground">Estimated time:</strong> 2–5 business days. Results will be delivered to your email with ranked candidates and confidence scores.
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <Button variant="outline" className="flex-1" onClick={onClose}>
          Cancel
        </Button>
        <Button
          className="flex-1 gap-2"
          style={{ background: 'var(--warning-500)', color: '#fff' }}
          onClick={onClose}
        >
          <Mail className="w-3.5 h-3.5" />
          Contact Research Team
        </Button>
      </div>
    </DialogContent>
  </Dialog>
);

export const PathwayStep = ({ step, onEnzymeClick }: PathwayStepProps) => {
  const [bruteForceOpen, setBruteForceOpen] = useState(false);

  return (
    <div className="px-2 py-1">
      {/* Reaction type — bigger, centered */}
      <p className="text-sm font-semibold text-foreground text-center mb-2.5">
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
        <div className="flex flex-col items-center gap-2">
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
              onClick={() => setBruteForceOpen(true)}
            >
              <Zap className="w-3 h-3 mr-1" />
              Brute force search
            </Button>
          )}
        </div>
      )}

      <BruteForceModal
        open={bruteForceOpen}
        onClose={() => setBruteForceOpen(false)}
        reactionType={step.reactionType}
      />
    </div>
  );
};
