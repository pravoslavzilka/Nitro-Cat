import { formatScore, formatConfidenceLabel } from "@/lib/utils/formatting";
import { cn } from "@/lib/utils";

interface ConfidenceScoreProps {
  score: number;
}

const labelStyles: Record<'high' | 'medium' | 'low', string> = {
  high: "bg-success-100 text-success-700 border border-success-500",
  medium: "bg-warning-100 text-warning-700 border border-warning-500",
  low: "bg-danger-100 text-danger-700 border border-danger-500",
};

export const ConfidenceScore = ({ score }: ConfidenceScoreProps) => {
  const label = formatConfidenceLabel(score);
  return (
    <span
      className={cn(
        "inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono font-semibold",
        labelStyles[label]
      )}
    >
      {formatScore(score)}
    </span>
  );
};
