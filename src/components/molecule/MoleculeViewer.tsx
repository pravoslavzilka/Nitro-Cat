import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import SmilesDrawer from 'smiles-drawer';

interface MoleculeViewerProps {
  smiles: string;
  width?: number;
  height?: number;
  renderWidth?: number;
  renderHeight?: number;
  name?: string;
}

// Custom themes using our palette
const NITRO_THEMES = {
  'nitro-light': {
    FOREGROUND: '#1A1A1A',
    BACKGROUND: '#FFFFFF',
    C:  '#1A1A1A',
    O:  '#DC2626',
    N:  '#1D4ED8',
    F:  '#059669',
    CL: '#059669',
    BR: '#B45309',
    I:  '#7C3AED',
    P:  '#D97706',
    S:  '#D97706',
    B:  '#D97706',
    SI: '#D97706',
    H:  '#718096',
  },
  'nitro-dark': {
    FOREGROUND: '#E2E8F0',
    BACKGROUND: '#141C18',
    C:  '#E2E8F0',
    O:  '#F87171',
    N:  '#60A5FA',
    F:  '#34D399',
    CL: '#34D399',
    BR: '#FCD34D',
    I:  '#A78BFA',
    P:  '#FBBF24',
    S:  '#FBBF24',
    B:  '#FBBF24',
    SI: '#FBBF24',
    H:  '#9CA3AF',
  },
};

export const MoleculeViewer = ({ smiles, width = 240, height = 160, renderWidth, renderHeight }: MoleculeViewerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const { resolvedTheme } = useTheme();

  const rw = renderWidth ?? width;
  const rh = renderHeight ?? height;

  useEffect(() => {
    if (!canvasRef.current || !smiles) return;

    const themeName = resolvedTheme === 'dark' ? 'nitro-dark' : 'nitro-light';

    const drawer = new SmilesDrawer.Drawer({
      width: rw,
      height: rh,
      bondThickness: 1.0,
      shortBondWidth: 0.85,
      themes: NITRO_THEMES,
    });

    setLoading(true);
    setError(false);

    SmilesDrawer.parse(
      smiles,
      (tree: any) => {
        drawer.draw(tree, canvasRef.current, themeName, false);
        setLoading(false);
      },
      () => {
        setError(true);
        setLoading(false);
      }
    );
  }, [smiles, rw, rh, resolvedTheme]);

  if (error) {
    return (
      <div
        className="flex items-center justify-center rounded-lg bg-muted/40 text-xs text-muted-foreground font-mono"
        style={{ width, height }}
      >
        Invalid SMILES
      </div>
    );
  }

  return (
    <div
      className="relative rounded-lg overflow-hidden bg-muted/20"
      style={{ width, height }}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      )}
      <canvas
        ref={canvasRef}
        width={rw}
        height={rh}
        className="block"
        style={{ width, height, opacity: loading ? 0 : 1, transition: 'opacity 0.2s' }}
      />
    </div>
  );
};
