import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isValidMoleculeName } from "@/lib/utils/validation";
import { cn } from "@/lib/utils";

interface MoleculeInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

export const MoleculeInput = ({ value, onChange, placeholder, label }: MoleculeInputProps) => {
  const isValid = value === '' || isValidMoleculeName(value);

  return (
    <div className="space-y-1.5">
      {label && (
        <Label className="text-sm font-medium text-foreground">{label}</Label>
      )}
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "e.g. D-Glucose"}
        className={cn(
          "font-mono text-sm",
          !isValid && "border-danger focus-visible:ring-danger"
        )}
      />
      {!isValid && (
        <p className="text-xs text-danger">Molecule name must be at least 2 characters.</p>
      )}
    </div>
  );
};
