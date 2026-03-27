import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { PathwayBuilder } from "@/components/pathway/PathwayBuilder";
import { getPathway } from "@/lib/api/pathways";
import type { PathwayGraph } from "@/types/pathway";

const statusColors: Record<string, string> = {
  complete: "bg-success-100 text-success-700 border border-success-500",
  analyzing: "bg-warning-100 text-warning-700 border border-warning-500",
  draft: "bg-muted text-muted-foreground border border-border",
};

export const PathwayDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [pathway, setPathway] = useState<PathwayGraph | null>(null);

  useEffect(() => {
    if (!id) return;
    getPathway(id).then(setPathway).catch(console.error);
  }, [id]);

  if (!pathway) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-3 border-b border-border flex items-center gap-3 shrink-0">
        <h1 className="text-xl font-bold text-foreground">{pathway.name}</h1>
        <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded capitalize ${statusColors[pathway.status] ?? statusColors.draft}`}>
          {pathway.status}
        </span>
      </div>
      <div className="flex-1 min-h-0">
        <PathwayBuilder pathway={pathway} />
      </div>
    </div>
  );
};

export default PathwayDetailPage;
