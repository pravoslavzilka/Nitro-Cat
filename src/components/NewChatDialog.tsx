import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FlaskConical, Lock, Beaker } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface NewChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (pathwayId: string) => void;
}

const testedPathways = [
  { id: "shikimic", name: "Shikimic Acid Biosynthesis", steps: 4, status: "validated" },
  { id: "tryptophan", name: "Tryptophan Biosynthesis", steps: 5, status: "validated" },
  { id: "chorismate", name: "Chorismate Mutase Pathway", steps: 3, status: "beta" },
];

export const NewChatDialog = ({ open, onOpenChange, onSelect }: NewChatDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Reaction Analysis</DialogTitle>
          <DialogDescription>
            Select a pathway to analyze or define your own.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Tested Pathways
          </p>
          {testedPathways.map((pw) => (
            <button
              key={pw.id}
              onClick={() => {
                onSelect(pw.id);
                onOpenChange(false);
              }}
              className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/50 transition-colors text-left group"
            >
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <FlaskConical className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                  {pw.name}
                </p>
                <p className="text-xs text-muted-foreground">{pw.steps} steps</p>
              </div>
              <Badge
                variant={pw.status === "validated" ? "default" : "secondary"}
                className="text-[10px] shrink-0"
              >
                {pw.status}
              </Badge>
            </button>
          ))}
        </div>

        <div className="pt-2 space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Custom
          </p>
          <button
            disabled
            className="w-full flex items-center gap-3 p-3 rounded-lg border border-border opacity-50 cursor-not-allowed text-left"
          >
            <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
              <Beaker className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Custom Pathway</p>
              <p className="text-xs text-muted-foreground">Define your own reaction steps</p>
            </div>
            <Lock className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
