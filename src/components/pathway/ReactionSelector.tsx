import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const reactionTypes = [
  "Aldol condensation",
  "Cyclization",
  "Dehydration",
  "NADPH-dependent reduction",
  "Oxidation",
  "Phosphorylation",
  "Dephosphorylation",
  "Isomerization",
  "Transamination",
  "Decarboxylation",
  "Hydroxylation",
  "Methylation",
  "Glycosylation",
  "Acylation",
];

interface ReactionSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export const ReactionSelector = ({ value, onChange, label }: ReactionSelectorProps) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <Label className="text-sm font-medium text-foreground">{label}</Label>
      )}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="text-sm">
          <SelectValue placeholder="Select reaction type..." />
        </SelectTrigger>
        <SelectContent>
          {reactionTypes.map((type) => (
            <SelectItem key={type} value={type} className="text-sm font-mono">
              {type}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
