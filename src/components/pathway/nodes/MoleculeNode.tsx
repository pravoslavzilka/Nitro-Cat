import { useState } from 'react';
import { useTheme } from 'next-themes';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { MoleculeViewer } from '@/components/molecule/MoleculeViewer';
import { Copy, Check } from 'lucide-react';
import type { MoleculeNodeData } from '@/types/pathway';

export const MoleculeNode = ({ data }: NodeProps) => {
  const [copied, setCopied] = useState(false);
  const { resolvedTheme } = useTheme();
  const structureBg = resolvedTheme === 'dark' ? '#1e2d26' : '#ffffff';
  const molecule = data as unknown as MoleculeNodeData;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();   // prevent React Flow from treating this as a node click/drag
    navigator.clipboard.writeText(molecule.smiles).catch(() => {
      // fallback for browsers that block clipboard without HTTPS
      const ta = document.createElement('textarea');
      ta.value = molecule.smiles;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    });
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
        <div className="rounded-lg p-2 shadow-inner" style={{ background: structureBg }}>
          <MoleculeViewer smiles={molecule.smiles} width={280} height={200} renderWidth={400} renderHeight={300} />
        </div>
        <p className="text-xs font-mono text-muted-foreground text-center mt-1">{molecule.name}</p>
        <button
          type="button"
          title="Copy SMILES"
          className="flex items-center justify-center gap-1.5 mt-1 px-2 py-1 rounded-md cursor-pointer group hover:bg-muted/60 transition-colors w-full max-w-[280px]"
          onClick={handleCopy}
          onPointerDown={e => e.stopPropagation()}
        >
          <span className="text-[10px] font-mono text-muted-foreground group-hover:text-foreground transition-colors truncate">
            {truncated}
          </span>
          {copied
            ? <Check className="w-3 h-3 text-primary shrink-0" />
            : <Copy className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
          }
        </button>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ opacity: 0, pointerEvents: 'none' }}
      />
    </>
  );
};
