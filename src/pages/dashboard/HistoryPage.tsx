import { useNavigate } from "react-router-dom";
import { allExamplePathways } from "@/data/allExamplePathways";
import { MoleculeViewer } from "@/components/molecule/MoleculeViewer";
import type { PathwayGraph, MoleculeNodeData } from "@/types/pathway";

function getPreviewMolecule(graph: PathwayGraph): MoleculeNodeData | null {
  const sourceSet = new Set(graph.edges.map(e => e.source));
  const molNodes = graph.nodes.filter(n => n.type === 'molecule');
  const leaves = molNodes.filter(n => !sourceSet.has(n.id));
  const candidates = leaves.length > 0 ? leaves : molNodes;
  return candidates.reduce<MoleculeNodeData | null>((best, n) => {
    const d = n.data as MoleculeNodeData;
    return !best || d.smiles.length > best.smiles.length ? d : best;
  }, null);
}

function getStepCount(graph: PathwayGraph): number {
  return graph.nodes.filter(n => n.type === 'reaction').length;
}

export const HistoryPage = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Recent Pathways</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Your recently explored pathway analyses</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allExamplePathways.map((pathway) => {
          const mol = getPreviewMolecule(pathway);
          const steps = getStepCount(pathway);
          return (
            <button
              key={pathway.id}
              onClick={() => navigate(`/pathways/${pathway.id}`)}
              className="bg-secondary border border-border rounded-xl p-5 hover:border-primary hover:bg-primary/5 cursor-pointer transition-all flex flex-col items-center text-left"
            >
              {mol && (
                <div className="rounded-lg p-2" style={{ background: 'var(--bg-elevated)' }}>
                  <MoleculeViewer smiles={mol.smiles} width={160} height={120} />
                </div>
              )}
              <p className="text-sm font-semibold text-foreground text-center mt-3 leading-snug w-full">{pathway.name}</p>
              {pathway.description && (
                <p className="text-xs text-muted-foreground text-center mt-1 leading-relaxed line-clamp-2 w-full">
                  {pathway.description}
                </p>
              )}
              <p className="text-[10px] font-mono font-semibold uppercase tracking-widest text-muted-foreground mt-2">
                {steps} steps
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default HistoryPage;
