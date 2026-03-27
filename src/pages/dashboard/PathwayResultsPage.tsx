import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { EnzymeTable } from "@/components/enzyme/EnzymeTable";
import type { Enzyme } from "@/types/enzyme";
import { Download } from "lucide-react";

export const PathwayResultsPage = () => {
  const { id } = useParams<{ id: string }>();
  const allEnzymes: Enzyme[] = [];

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Results: {id}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {allEnzymes.length} enzyme candidates
          </p>
        </div>
        <Button variant="outline" disabled className="gap-2 opacity-50">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      <EnzymeTable enzymes={allEnzymes} />
    </div>
  );
};

export default PathwayResultsPage;
