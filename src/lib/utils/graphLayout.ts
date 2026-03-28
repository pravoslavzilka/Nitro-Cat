import dagre from '@dagrejs/dagre';
import type { Node, Edge } from '@xyflow/react';

const MOLECULE_W = 240;
const MOLECULE_H = 220;
const REACTION_W = 160;
const REACTION_H = 48;

export function applyDagreLayout(nodes: Node[], edges: Edge[], direction = 'TB'): Node[] {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: direction, nodesep: 60, ranksep: 80 });

  nodes.forEach(n => {
    const isMol = n.type === 'molecule';
    g.setNode(n.id, { width: isMol ? MOLECULE_W : REACTION_W, height: isMol ? MOLECULE_H : REACTION_H });
  });

  edges.forEach(e => g.setEdge(e.source, e.target));
  dagre.layout(g);

  return nodes.map(n => {
    const pos = g.node(n.id);
    const isMol = n.type === 'molecule';
    return {
      ...n,
      position: {
        x: pos.x - (isMol ? MOLECULE_W : REACTION_W) / 2,
        y: pos.y - (isMol ? MOLECULE_H : REACTION_H) / 2,
      },
    };
  });
}
