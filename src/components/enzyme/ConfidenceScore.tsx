import { formatScore, formatConfidenceLabel } from "@/lib/utils/formatting";
import { cn } from "@/lib/utils";

interface ConfidenceScoreProps {
  score: number;
}

const labelStyles: Record<'high' | 'medium' | 'low', string> = {
  high: "bg-success/15 text-success border-success/30",
  medium: "bg-warning/15 text-warning border-warning/30",
  low: "bg-danger/15 text-danger border-danger/30",
};

export const ConfidenceScore = ({ score }: ConfidenceScoreProps) => {
  const label = formatConfidenceLabel(score);
  return (
    <span
      className={cn(
        "inline-flex items-center px-1.5 py-0.5 rounded border text-xs font-mono font-semibold",
        labelStyles[label]
      )}
    >
      {formatScore(score)}
    </span>
  );
};
