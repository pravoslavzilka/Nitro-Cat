import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FlaskConical } from "lucide-react";
import { formatDate } from "@/lib/utils/formatting";
import { samplePathway } from "@/data/pathwayData";
import type { Pathway } from "@/types/pathway";

const mockPathways: Pathway[] = [
  samplePathway,
  {
    ...samplePathway,
    id: '2',
    name: 'Tryptophan Biosynthesis',
    description: 'Synthesis of tryptophan from chorismate via anthranilate',
    status: 'analyzing',
    createdAt: '2025-02-01T10:00:00Z',
    updatedAt: '2025-02-10T14:00:00Z',
  },
  {
    ...samplePathway,
    id: '3',
    name: 'Chorismate Mutase Pathway',
    description: 'Conversion of chorismate to prephenate',
    status: 'draft',
    steps: samplePathway.steps.slice(0, 2),
    createdAt: '2025-03-01T10:00:00Z',
    updatedAt: '2025-03-05T09:00:00Z',
  },
];

const statusVariant: Record<Pathway['status'], 'default' | 'secondary' | 'outline'> = {
  complete: 'default',
  analyzing: 'secondary',
  draft: 'outline',
};

export const PathwaysPage = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Pathways</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Your enzyme pathway analyses</p>
        </div>
        <Button onClick={() => navigate('/pathways/new')} className="gap-2">
          <Plus className="w-4 h-4" />
          New Reaction
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockPathways.map((pathway) => (
          <button
            key={pathway.id}
            onClick={() => navigate(`/pathways/${pathway.id}`)}
            className="text-left bg-secondary border border-border border-l-[3px] border-l-primary rounded-lg p-4 space-y-3 hover:bg-muted hover:glow-success transition-all group"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <FlaskConical className="w-4 h-4 text-primary" />
              </div>
              <Badge variant={statusVariant[pathway.status]} className="text-[10px] capitalize shrink-0">
                {pathway.status}
              </Badge>
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                {pathway.name}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{pathway.description}</p>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{pathway.steps.length} steps</span>
              <span>{formatDate(pathway.updatedAt)}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PathwaysPage;
