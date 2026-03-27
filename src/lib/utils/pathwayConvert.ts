import type { Pathway, PathwayGraph, PathwayNode } from '@/types/pathway';

/** Convert a linear Pathway (step-based) to a graph PathwayGraph (node/edge). */
export function pathwayToGraph(p: Pathway): PathwayGraph {
  const nodes: PathwayNode[] = [];
  const edges: { id: string; source: string; target: string }[] = [];

  // First molecule node
  nodes.push({ id: 'm0', type: 'molecule', data: p.steps[0].startMolecule });

  p.steps.forEach((step, idx) => {
    const rId = `r${idx + 1}`;
    const mId = `m${idx + 1}`;
    const prevMId = idx === 0 ? 'm0' : `m${idx}`;

    nodes.push({
      id: rId,
      type: 'reaction',
      data: {
        label: step.reactionType as 'Chemical synthesis' | 'Suggested biocatalysis',
        enzyme: step.enzymes[0],
      },
    });

    nodes.push({ id: mId, type: 'molecule', data: step.productMolecule });

    edges.push({ id: `e${idx * 2 + 1}`, source: prevMId, target: rId });
    edges.push({ id: `e${idx * 2 + 2}`, source: rId, target: mId });
  });

  return {
    id: p.id,
    name: p.name,
    description: p.description,
    status: p.status,
    nodes,
    edges,
  };
}
