import { useNavigate } from 'react-router-dom';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { FlaskConical } from 'lucide-react';
import type { ReactionLabel, ReactionNodeData } from '@/types/pathway';

export const ReactionNode = ({ data }: NodeProps) => {
  const navigate = useNavigate();
  const reaction = data as unknown as ReactionNodeData;

  // Full confidence → label normalisation
  const effectiveLabel: ReactionLabel = (() => {
    if (reaction.confidence === 'high' && reaction.enzyme) return 'Biocatalyst found';
    if (reaction.confidence === 'low') return 'Chemical synthesis';
    return reaction.label;
  })();

  const handleBiocatalystFound = () => {
    navigate(
      `/pathways/${reaction.pathwayId ?? 'unknown'}/biocatalyst/${reaction.reactionId ?? 'unknown'}`,
      { state: { reaction } },
    );
  };

  const handleTestBiocatalysis = () => {
    navigate(
      `/pathways/${reaction.pathwayId ?? 'unknown'}/test/${reaction.reactionId ?? 'unknown'}`,
      { state: { reaction } },
    );
  };

  return (
    <>
      <Handle type="target" position={Position.Top} style={{ opacity: 0, pointerEvents: 'none' }} />

      <div className="flex flex-col items-center">

        {effectiveLabel === 'Biocatalyst found' && (
          <button
            type="button"
            onClick={handleBiocatalystFound}
            onPointerDown={e => e.stopPropagation()}
            className="text-sm font-semibold px-4 py-2 rounded-full flex items-center gap-2 shadow-sm transition-colors cursor-pointer select-none"
            style={{ backgroundColor: '#10B981', color: '#fff', border: '1px solid #10B981' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#059669')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#10B981')}
          >
            <FlaskConical className="w-4 h-4" />
            Biocatalyst found
          </button>
        )}

        {effectiveLabel === 'Test biocatalysis' && reaction.confidence === 'medium' && (
          <button
            type="button"
            onClick={handleTestBiocatalysis}
            onPointerDown={e => e.stopPropagation()}
            className="text-sm font-semibold px-4 py-2 rounded-full flex items-center gap-2 shadow-sm transition-colors cursor-pointer select-none"
            style={{ backgroundColor: '#F59E0B', color: '#fff', border: '1px solid #F59E0B' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#D97706')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#F59E0B')}
          >
            <FlaskConical className="w-4 h-4" />
            Test biocatalysis
          </button>
        )}

        {effectiveLabel === 'Chemical synthesis' && (
          <span className="text-xs font-mono bg-muted text-muted-foreground border border-border px-3 py-1 rounded-full">
            Chemical synthesis
          </span>
        )}

      </div>

      <Handle type="source" position={Position.Bottom} style={{ opacity: 0, pointerEvents: 'none' }} />
    </>
  );
};
