import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { examplePathways } from "@/data/examplePathways";
import { MoleculeViewer } from "@/components/molecule/MoleculeViewer";
import type { PathwayGraph, MoleculeNodeData } from "@/types/pathway";

/** Find the best representative molecule to display for a pathway card. */
function getPreviewMolecule(graph: PathwayGraph): MoleculeNodeData | null {
  const sourceSet = new Set(graph.edges.map(e => e.source));
  const molNodes = graph.nodes.filter(n => n.type === 'molecule');

  // Prefer leaf nodes (target but never source = final products)
  const leaves = molNodes.filter(n => !sourceSet.has(n.id));
  const candidates = leaves.length > 0 ? leaves : molNodes;

  // Pick the molecule with the longest (most complex) SMILES
  return candidates.reduce<MoleculeNodeData | null>((best, n) => {
    const d = n.data as MoleculeNodeData;
    return !best || d.smiles.length > best.smiles.length ? d : best;
  }, null);
}

export const ImportPathwayPage = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-foreground">Import Pathway</h1>
          <p className="text-sm text-muted-foreground mt-1">Choose an example pathway to explore or upload your own file.</p>
        </div>

        {/* Example pathway grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {examplePathways.map((pathway) => {
            const mol = getPreviewMolecule(pathway);
            return (
              <button
                key={pathway.id}
                onClick={() => navigate(`/pathways/${pathway.id}`)}
                className="bg-secondary border border-border rounded-xl p-5 hover:border-primary hover:bg-primary/5 cursor-pointer transition-all flex flex-col items-center"
              >
                {mol && <MoleculeViewer smiles={mol.smiles} width={160} height={120} />}
                <p className="text-sm font-semibold text-foreground text-center mt-3 leading-snug">{pathway.name}</p>
                {pathway.description && (
                  <p className="text-xs text-muted-foreground text-center mt-1 leading-relaxed line-clamp-2">
                    {pathway.description}
                  </p>
                )}
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
