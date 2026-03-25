import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils/formatting";

interface HistoryEntry {
  id: string;
  pathwayName: string;
  date: string;
  stepCount: number;
  enzymeCount: number;
  status: 'complete' | 'analyzing' | 'draft';
}

const mockHistory: HistoryEntry[] = [
  { id: '1', pathwayName: 'Shikimic Acid Biosynthesis', date: '2025-01-20T14:30:00Z', stepCount: 4, enzymeCount: 6, status: 'complete' },
  { id: '2', pathwayName: 'Tryptophan Biosynthesis', date: '2025-02-10T14:00:00Z', stepCount: 5, enzymeCount: 8, status: 'analyzing' },
  { id: '3', pathwayName: 'Chorismate Mutase Pathway', date: '2025-03-05T09:00:00Z', stepCount: 2, enzymeCount: 2, status: 'draft' },
  { id: '1', pathwayName: 'Phenylalanine Route', date: '2025-01-05T11:00:00Z', stepCount: 6, enzymeCount: 10, status: 'complete' },
  { id: '1', pathwayName: 'Tyrosine Pathway', date: '2024-12-15T09:30:00Z', stepCount: 5, enzymeCount: 7, status: 'complete' },
];

const statusVariant: Record<HistoryEntry['status'], 'default' | 'secondary' | 'outline'> = {
  complete: 'default',
  analyzing: 'secondary',
  draft: 'outline',
};

export const HistoryPage = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Analysis History</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Past pathway analyses</p>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary border-b border-border">
            <tr>
              <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pathway</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Steps</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Enzymes</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {mockHistory.map((entry, i) => (
              <tr
                key={`${entry.id}-${i}`}
                onClick={() => navigate('/pathways/1')}
                className="border-b border-border last:border-0 hover:bg-secondary/50 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3 font-medium text-foreground hover:text-primary transition-colors">
                  {entry.pathwayName}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(entry.date)}</td>
                <td className="px-4 py-3 text-muted-foreground">{entry.stepCount}</td>
                <td className="px-4 py-3 text-muted-foreground">{entry.enzymeCount}</td>
                <td className="px-4 py-3">
                  <Badge variant={statusVariant[entry.status]} className="text-[10px] capitalize">
                    {entry.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistoryPage;
