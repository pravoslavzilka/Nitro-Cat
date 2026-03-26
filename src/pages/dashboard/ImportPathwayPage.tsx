import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { examplePathways } from "@/data/examplePathways";
import { MoleculeViewer } from "@/components/molecule/MoleculeViewer";

export const ImportPathwayPage = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-foreground">Import Pathway</h1>
          <p className="text-sm text-muted-foreground mt-1">Choose an example pathway to explore or upload your own file.</p>
        </div>

        {/* Example pathway grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {examplePathways.map((pathway) => {
            const target = pathway.steps[pathway.steps.length - 1].productMolecule;
            return (
              <button
                key={pathway.id}
                onClick={() => navigate(`/pathways/${pathway.id}`)}
                className="bg-secondary border border-border rounded-xl p-5 hover:border-primary hover:bg-primary/5 cursor-pointer transition-all flex flex-col items-center"
              >
                <MoleculeViewer smiles={target.smiles} width={200} height={150} />
                <p className="text-sm font-semibold text-foreground text-center mt-3 leading-snug">{target.name}</p>
              </button>
            );
          })}
        </div>

        {/* Upload section */}
        <div className="flex flex-col items-center gap-2 pt-2">
          <Button variant="outline" disabled className="opacity-50 cursor-not-allowed gap-2">
            <Upload className="w-4 h-4" />
            Upload .rdf file
          </Button>
          <p className="text-xs text-muted-foreground">File upload coming soon</p>
        </div>

      </div>
    </div>
  );
};

export default ImportPathwayPage;
