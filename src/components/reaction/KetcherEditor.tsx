/**
 * Molecule structure editor backed by Kekule.js (loaded from jsDelivr CDN).
 * Kekule is pure browser JavaScript — no Node.js/CJS deps, no bundler issues.
 *
 * Communicates SMILES out via `onSmiles` (debounced 600 ms).
 * External molecules can be loaded by passing a new `loadTrigger` object —
 * provide a MOL V2000 string (Kekule reads MOL reliably; SMILES reading is unavailable in the CDN build).
 */
import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

export interface KetcherEditorProps {
  onSmiles: (smiles: string) => void;
  /** Also emits the current MOL V2000 string on every edit (useful for copying between editors). */
  onMolfile?: (molfile: string) => void;
  height?: number;
  /** Optional label shown above the editor */
  label?: string;
  /**
   * To programmatically load a molecule, pass a new object here.
   * `molfile` is a MOL V2000 string (Kekule reads MOL reliably; SMILES reading unavailable in CDN build).
   * Increment `key` to re-trigger even if the same molfile is passed.
   */
  loadTrigger?: { molfile: string; key: number };
}

const KEKULE_CSS = 'https://cdn.jsdelivr.net/npm/kekule@1.0.3/dist/themes/default/kekule.css';
const KEKULE_JS  = 'https://cdn.jsdelivr.net/npm/kekule@1.0.3/dist/kekule.min.js';

// Module-level promise cache so concurrent callers share one load.
// Checking window.Kekule first handles HMR-triggered cache resets.
const _scriptCache = new Map<string, Promise<void>>();

function loadScript(src: string): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((window as any).Kekule) return Promise.resolve(); // already loaded
  if (_scriptCache.has(src)) return _scriptCache.get(src)!;

  const p = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existing) {
      // Tag was inserted by a concurrent call — wait for it to finish
      existing.addEventListener('load',  () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), { once: true });
      return;
    }
    const s = document.createElement('script');
    s.src = src; s.async = true;
    s.onload  = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
  _scriptCache.set(src, p);
  return p;
}

function loadStyle(href: string) {
  if (document.querySelector(`link[href="${href}"]`)) return;
  const l = document.createElement('link');
  l.rel = 'stylesheet'; l.href = href;
  document.head.appendChild(l);
}

export default function KetcherEditor({ onSmiles, onMolfile, height = 320, label, loadTrigger }: KetcherEditorProps) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const composerRef   = useRef<unknown>(null);
  const debounceRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onSmilesRef   = useRef(onSmiles);
  const onMolfileRef  = useRef(onMolfile);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  // Keep refs current so event listeners always call the latest callbacks
  useEffect(() => { onSmilesRef.current  = onSmiles;  }, [onSmiles]);
  useEffect(() => { onMolfileRef.current = onMolfile; }, [onMolfile]);

  // ── Init Kekule once on mount ────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        loadStyle(KEKULE_CSS);
        await loadScript(KEKULE_JS);
        if (!mounted || !containerRef.current) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const Kekule = (window as any).Kekule;
        if (!Kekule) throw new Error('Kekule not available');

        const composer = new Kekule.Editor.Composer(containerRef.current);
        composer.setDimension('100%', `${height}px`);

        // Emit SMILES whenever the user edits the structure
        composer.addEventListener('editObjsChanged', () => {
          if (debounceRef.current) clearTimeout(debounceRef.current);
          debounceRef.current = setTimeout(() => {
            try {
              const mol = composer.getChemObj();
              if (!mol) return;
              const smiles = Kekule.IO.saveFormatData(mol, 'smi');
              if (smiles) onSmilesRef.current(smiles);
              if (onMolfileRef.current) {
                const molfile = Kekule.IO.saveFormatData(mol, 'mol');
                if (molfile) onMolfileRef.current(molfile);
              }
            } catch { /* empty canvas */ }
          }, 600);
        });

        composerRef.current = composer;
        if (mounted) setStatus('ready');
      } catch (err) {
        console.error('KetcherEditor init error:', err);
        if (mounted) setStatus('error');
      }
    }

    init();
    return () => {
      mounted = false;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (composerRef.current as any)?.finalize?.();
    };
  }, []); // run once

  // ── Load external molecule when loadTrigger changes ──────────────────────────
  useEffect(() => {
    if (!loadTrigger?.molfile || !composerRef.current || status !== 'ready') return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Kekule = (window as any).Kekule;
      // Kekule reliably reads MOL V2000 format; SMILES reading is not available in the CDN build
      const chemObj = Kekule.IO.loadFormatData(loadTrigger.molfile, 'mol');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (composerRef.current as any).setChemObj(chemObj);
    } catch (err) {
      console.error('KetcherEditor: failed to load molecule', err);
    }
  }, [loadTrigger, status]);

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="rounded-xl border border-border overflow-hidden relative">
      {label && (
        <p className="text-xs uppercase tracking-widest text-muted-foreground px-3 pt-3 pb-1">{label}</p>
      )}

      {status === 'loading' && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-background/60 z-10"
          style={{ minHeight: height }}
        >
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {status === 'error' && (
        <div
          className="flex items-center justify-center text-sm text-destructive"
          style={{ minHeight: height }}
        >
          Structure editor failed to load.
        </div>
      )}

      <div ref={containerRef} style={{ width: '100%', minHeight: `${height}px` }} />
    </div>
  );
}
