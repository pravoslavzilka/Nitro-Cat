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
import type { PathwayGraph } from '@/types/pathway';
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
    const rawNodes = pathway.nodes.map(n => ({
      id: n.id,
      type: n.type,
      data: n.data as Record<string, unknown>,
      position: { x: 0, y: 0 },
    }));
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
        fitView
        panOnScroll={true}
        zoomOnScroll={true}
        selectionOnDrag={false}
        defaultEdgeOptions={defaultEdgeOptions}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="var(--border)" />
        <Controls />
      </ReactFlow>
    </div>
  );
};
