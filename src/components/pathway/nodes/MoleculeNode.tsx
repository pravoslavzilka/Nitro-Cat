import { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { MoleculeViewer } from '@/components/molecule/MoleculeViewer';
import { Copy, Check } from 'lucide-react';
import type { MoleculeNodeData } from '@/types/pathway';

export const MoleculeNode = ({ data }: NodeProps) => {
  const [copied, setCopied] = useState(false);
  const molecule = data as unknown as MoleculeNodeData;

  const handleCopy = () => {
    navigator.clipboard.writeText(molecule.smiles);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const truncated = molecule.smiles.length > 28
    ? molecule.smiles.slice(0, 28) + '…'
    : molecule.smiles;

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        style={{ opacity: 0, pointerEvents: 'none' }}
      />
      <div className="bg-card shadow-sm rounded-xl p-3 flex flex-col items-center">
        <div className="rounded-lg bg-white p-2 shadow-inner">
          <MoleculeViewer smiles={molecule.smiles} width={280} height={200} renderWidth={400} renderHeight={300} />
        </div>
        <p className="text-xs font-mono text-muted-foreground text-center mt-1">{molecule.name}</p>
        <div
          className="flex items-center justify-center gap-1 mt-1 cursor-pointer group"
          onClick={handleCopy}
        >
          <span className="text-[10px] font-mono text-muted-foreground group-hover:text-foreground transition-colors max-w-[280px] truncate">
            {truncated}
          </span>
          {copied
            ? <Check className="w-3 h-3 text-primary shrink-0" />
            : <Copy className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
          }
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ opacity: 0, pointerEvents: 'none' }}
      />
    </>
  );
};
