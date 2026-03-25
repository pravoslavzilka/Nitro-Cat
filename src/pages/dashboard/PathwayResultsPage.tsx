import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { EnzymeTable } from "@/components/enzyme/EnzymeTable";
import { samplePathway } from "@/data/pathwayData";
import type { Enzyme } from "@/types/enzyme";
import { Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export const PathwayResultsPage = () => {
  const { id } = useParams<{ id: string }>();
  const pathway = { ...samplePathway, id: id ?? '1' };

  const allEnzymes: Enzyme[] = pathway.steps.flatMap((step) => step.enzymes);

  const handleExportCSV = () => {
    const header = 'Name,EC Number,Organism,kcat,Km,Score,Vendor,Price\n';
    const rows = allEnzymes.map((e) =>
      [e.name, e.ecNumber, e.organism, e.kcat, e.km, e.score, e.vendor, e.price]
        .map((v) => `"${v}"`)
        .join(',')
    );
    const csv = header + rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pathway.name.replace(/\s+/g, '_')}_enzymes.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'CSV exported', description: 'Enzyme data downloaded.' });
  };

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Results: {pathway.name}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {allEnzymes.length} enzyme candidates across {pathway.steps.length} steps
          </p>
        </div>
        <Button variant="outline" onClick={handleExportCSV} className="gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      <EnzymeTable enzymes={allEnzymes} />
    </div>
  );
};

export default PathwayResultsPage;
