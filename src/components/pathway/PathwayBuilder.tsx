import { useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import type { Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { PathwayGraph, MoleculeNodeData, ReactionNodeData, ReactionLabel } from '@/types/pathway';
import { MoleculeNode } from './nodes/MoleculeNode';
import { ReactionNode } from './nodes/ReactionNode';
import { applyDagreLayout } from '@/lib/utils/graphLayout';

const nodeTypes = { molecule: MoleculeNode, reaction: ReactionNode };

const defaultEdgeOptions = {
  style: { stroke: '#10B981', strokeWidth: 1.5, opacity: 0.5 },
};

interface PathwayBuilderProps {
  pathway: PathwayGraph;
}

export const PathwayBuilder = ({ pathway }: PathwayBuilderProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    // Build a lookup of molecule node data by id for substrate/product injection
    const molById: Record<string, MoleculeNodeData> = {};
    pathway.nodes.forEach(n => {
      if (n.type === 'molecule') molById[n.id] = n.data as MoleculeNodeData;
    });

    const rawNodes = pathway.nodes.map(n => {
      if (n.type === 'reaction') {
        const rData = n.data as ReactionNodeData;
        // Find source molecule nodes (substrates) and target molecule nodes (products)
        const substrateIds = pathway.edges.filter(e => e.target === n.id).map(e => e.source);
        const productIds   = pathway.edges.filter(e => e.source === n.id).map(e => e.target);
        const substrates   = substrateIds.map(id => molById[id]).filter(Boolean);
        const products     = productIds.map(id => molById[id]).filter(Boolean);

        const effectiveLabel: ReactionLabel = (() => {
          if (rData.confidence === 'high' && rData.enzyme) return 'Biocatalyst found';
          if (rData.confidence === 'low') return 'Chemical synthesis';
          return rData.label;
        })();

        return {
          id: n.id,
          type: n.type,
          data: {
            ...rData,
            label: effectiveLabel,
            ...(effectiveLabel === 'Chemical synthesis' && {
              confidence: undefined,
              enzyme: undefined,
            }),
            substrateSmiles: substrates.map(m => m.smiles).join('.'),
            productSmiles:   products.map(m => m.smiles).join('.'),
            substrateName:   substrates.map(m => m.name).join(' + '),
            productName:     products.map(m => m.name).join(' + '),
            pathwayId:       pathway.id,
            reactionId:      n.id,
          } as Record<string, unknown>,
          position: { x: 0, y: 0 },
        };
      }
      return {
        id: n.id,
        type: n.type,
        data: n.data as Record<string, unknown>,
        position: { x: 0, y: 0 },
      };
    });

    const rawEdges: Edge[] = pathway.edges.map(e => ({
      id: e.id,
      source: e.source,
      target: e.target,
    }));
    setNodes(applyDagreLayout(rawNodes, rawEdges));
    setEdges(rawEdges);
  }, [pathway.id]);

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.3}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} className="opacity-30" />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
};