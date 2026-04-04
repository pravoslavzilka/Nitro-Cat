import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, FlaskConical, ShoppingCart, Dna, Wrench,
  Activity, Target, TrendingUp, ExternalLink,
  ChevronDown, ChevronUp, BookOpen, CheckCircle2, Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { formatScore } from '@/lib/utils/formatting';
import { MoleculeViewer } from '@/components/molecule/MoleculeViewer';
import type { ReactionNodeData } from '@/types/reaction';
import type { Enzyme } from '@/types/enzyme';

// ── Mock candidate generator ──────────────────────────────────────────────────

// TODO: wire backend — call API with top_k: N to get all candidates
const buildCandidates = (top1: Enzyme, confidence: 'high' | 'good' | 'medium' | 'low'): Enzyme[] => {
  const count = confidence === 'low' ? 5 : confidence === 'medium' ? 4 : 3;
  const variants: { scoreDelta: number; organism: string }[] = [
    { scoreDelta: 0,     organism: top1.organism },
    { scoreDelta: -0.07, organism: `${top1.organism} (variant A)` },
    { scoreDelta: -0.12, organism: 'Bacillus subtilis' },
    { scoreDelta: -0.17, organism: 'Streptomyces coelicolor' },
    { scoreDelta: -0.22, organism: 'Rhodotorula glutinis' },
  ];
  return variants.slice(0, count).map((v, i) => ({
    ...top1,
    id: `${top1.id}-cand-${i + 1}`,
    score: Math.max(0, +(top1.score + v.scoreDelta).toFixed(3)),
    organism: v.organism,
  }));
};

// ── Score colour ──────────────────────────────────────────────────────────────

const getScoreColor = (score: number): string => {
  if (score >= 0.9) return '#25512B';
  if (score >= 0.8) return '#6CA033';
  if (score >= 0.5) return '#F69B05';
  return '#C00000';
};

// ── Seeded price helper ───────────────────────────────────────────────────────

const seedPrice = (id: string, min: number, max: number): number => {
  let h = 5381;
  for (let i = 0; i < id.length; i++) h = (h * 33 + id.charCodeAt(i)) & 0x7fffffff;
  return min + (h % (max - min + 1));
};

const QTY_MG          = [1, 5, 10, 50]                              as const;
const QTY_RXNS         = [10, 50, 100, 500]                          as const;
const QTY_MUG          = ['1 µg', '5 µg', '10 µg', '50 µg']         as const;
const MUG_MULT         = [1, 3, 5, 15]                               as const;
const DNA_CNS          = [1, 2, 5, 10]                               as const;
const ENZYME_DISCOUNT  = [1.00, 0.90, 0.82, 0.70]                   as const;
const DNA_MUG_DISCOUNT = [1.00, 0.88, 0.80, 0.65]                   as const;
const DNA_CNS_DISCOUNT = [1.00, 0.92, 0.85, 0.75]                   as const;

const SEL_BTN  = 'border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold ring-1 ring-emerald-500/30';
const IDLE_BTN = 'border-border bg-muted/30 text-muted-foreground hover:border-emerald-500/40';

// ── Get-Enzyme dialog ─────────────────────────────────────────────────────────

type GetView = 'chooser' | 'enzyme' | 'dna' | 'design';

const GetEnzymeDialog = ({ enzyme, open, onOpenChange }: {
  enzyme: Enzyme;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) => {
  const [view, setView] = useState<GetView>('chooser');
  const [enzymeQtyIdx, setEnzymeQtyIdx] = useState(0); // drives both qty AND reactions
  const [dnaMugIdx,    setDnaMugIdx]    = useState(0);
  const [dnaSubStep,    setDnaSubStep]    = useState<'config' | 'review'>('config');
  const [orderPlaced,   setOrderPlaced]   = useState<'enzyme' | 'dna' | null>(null);

  const handleOpenChange = (v: boolean) => {
    if (!v) { setView('chooser'); setOrderPlaced(null); setDnaSubStep('config'); }
    onOpenChange(v);
  };

  const backLink = (
    <button
      type="button"
      onClick={() => setView('chooser')}
      className="text-xs text-muted-foreground hover:text-foreground transition-colors w-full text-center pt-1"
    >
      ← Back
    </button>
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm" style={{ background: 'var(--bg-elevated)' }}>

        {view === 'chooser' && (
          <>
            <DialogHeader>
              <DialogTitle>Obtain {enzyme.name}</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Choose how you'd like to obtain{' '}
              <span className="font-semibold text-foreground">{enzyme.name}</span>.
            </p>
            <div className="space-y-2 mt-1">
              {(
                [
                  { key: 'enzyme' as const, icon: <ShoppingCart className="w-5 h-5 text-primary" />, title: 'Get the Enzyme', desc: 'Order purified enzyme from a vendor' },
                  { key: 'dna'    as const, icon: <Dna className="w-5 h-5 text-primary" />,           title: 'Get DNA',        desc: 'Order a codon-optimised gene construct' },
                  { key: 'design' as const, icon: <Wrench className="w-5 h-5 text-primary" />,        title: 'Get Design',     desc: 'Receive an engineering design for this enzyme' },
                ] satisfies { key: GetView; icon: React.ReactNode; title: string; desc: string }[]
              ).map(({ key, icon, title, desc }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setView(key)}
                  className="flex items-center gap-3 w-full rounded-xl border border-border bg-muted/30 hover:bg-muted/60 hover:border-primary/40 p-3 text-left transition-colors group"
                >
                  <div className="shrink-0 rounded-lg bg-primary/10 p-2">{icon}</div>
                  <div>
                    <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{title}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  <span className="ml-auto text-muted-foreground">›</span>
                </button>
              ))}
            </div>
          </>
        )}

        {view === 'enzyme' && (
          <>
            <DialogHeader><DialogTitle>Get the Enzyme</DialogTitle></DialogHeader>
            {orderPlaced === 'enzyme' ? (
              <div className="py-8 flex flex-col items-center gap-3 text-center">
                <CheckCircle2 className="w-10 h-10 text-primary" />
                <p className="text-sm font-semibold text-foreground">Order placed!</p>
                <p className="text-xs text-muted-foreground">Your order for <span className="font-semibold text-foreground">{enzyme.name}</span> is being processed.</p>
                <Button size="sm" variant="outline" className="mt-2" onClick={() => handleOpenChange(false)}>Done</Button>
              </div>
            ) : (
              <div className="py-2 space-y-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Quantity</p>
                  <div className="grid grid-cols-4 gap-2">
                    {QTY_MG.map((mg, i) => (
                      <button key={mg} type="button" onClick={() => setEnzymeQtyIdx(i)}
                        className={cn('rounded-lg border py-2 text-sm transition-colors', enzymeQtyIdx === i ? SEL_BTN : IDLE_BTN)}
                      >{mg} mg</button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Reactions</p>
                  <div className="grid grid-cols-4 gap-2">
                    {QTY_RXNS.map((n, i) => (
                      <button key={n} type="button" onClick={() => setEnzymeQtyIdx(i)}
                        className={cn('rounded-lg border py-2 text-sm transition-colors', enzymeQtyIdx === i ? SEL_BTN : IDLE_BTN)}
                      >{n}</button>
                    ))}
                  </div>
                </div>
                {(() => {
                  const base  = seedPrice(enzyme.id, 150, 380);
                  const unit  = Math.round(base * ENZYME_DISCOUNT[enzymeQtyIdx]);
                  const total = QTY_MG[enzymeQtyIdx] * unit;
                  return (
                    <div className="rounded-lg bg-muted/40 border border-border px-4 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">Estimated cost</p>
                        <p className="text-xl font-bold text-foreground font-mono mt-0.5">${total.toLocaleString()}</p>
                        {enzymeQtyIdx > 0 && (
                          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                            {Math.round((1 - ENZYME_DISCOUNT[enzymeQtyIdx]) * 100)}% volume discount applied
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Unit price</p>
                        <p className="text-sm font-mono text-muted-foreground">${unit}/mg</p>
                      </div>
                    </div>
                  );
                })()}
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold" onClick={() => setOrderPlaced('enzyme')}>Place Order</Button>
                {backLink}
              </div>
            )}
          </>
        )}

        {view === 'dna' && (
          <>
            <DialogHeader><DialogTitle>Get DNA</DialogTitle></DialogHeader>
            {orderPlaced === 'dna' ? (
              <div className="py-8 flex flex-col items-center gap-3 text-center">
                <CheckCircle2 className="w-10 h-10 text-primary" />
                <p className="text-sm font-semibold text-foreground">Order placed!</p>
                <p className="text-xs text-muted-foreground">Your gene synthesis order is being processed.</p>
                <Button size="sm" variant="outline" className="mt-2" onClick={() => handleOpenChange(false)}>Done</Button>
              </div>
            ) : dnaSubStep === 'config' ? (
              <div className="py-2 space-y-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Quantity</p>
                  <div className="grid grid-cols-4 gap-2">
                    {QTY_MUG.map((q, i) => (
                      <button key={q} type="button" onClick={() => setDnaMugIdx(i)}
                        className={cn('rounded-lg border py-2 text-sm transition-colors', dnaMugIdx === i ? SEL_BTN : IDLE_BTN)}
                      >{q}</button>
                    ))}
                  </div>
                </div>
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold" onClick={() => setDnaSubStep('review')}>Continue</Button>
                {backLink}
              </div>
            ) : (
              <div className="py-2 space-y-4">
                <div className="rounded-lg bg-muted/40 border border-border p-3 space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Order summary</p>
                  <p className="text-sm text-foreground font-semibold">{enzyme.name} — codon-optimised gene</p>
                  <p className="text-xs text-muted-foreground">Quantity: {QTY_MUG[dnaMugIdx]}</p>
                </div>
                {(() => {
                  const base    = seedPrice(enzyme.id + 'dna', 80, 220);
                  const total   = Math.round(base * MUG_MULT[dnaMugIdx] * DNA_MUG_DISCOUNT[dnaMugIdx]);
                  const discPct = Math.round((1 - DNA_MUG_DISCOUNT[dnaMugIdx]) * 100);
                  return (
                    <div className="rounded-lg bg-muted/40 border border-border px-4 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">Estimated cost</p>
                        <p className="text-xl font-bold text-foreground font-mono mt-0.5">${total.toLocaleString()}</p>
                        {discPct > 0 && (
                          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">{discPct}% volume discount applied</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Base price</p>
                        <p className="text-sm font-mono text-muted-foreground">${base}</p>
                      </div>
                    </div>
                  );
                })()}
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold" onClick={() => setOrderPlaced('dna')}>Place Order</Button>
                <button type="button" className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors" onClick={() => setDnaSubStep('config')}>
                  ← Edit quantity
                </button>
              </div>
            )}
          </>
        )}

        {view === 'design' && (
          <>
            <DialogHeader><DialogTitle>Get Design</DialogTitle></DialogHeader>
            <div className="py-2 space-y-3">
              <p className="text-sm text-muted-foreground">
                An engineering design for {enzyme.name} — expression vector, host strain recommendation, and process parameters.
              </p>
              <Button className="w-full gap-2" disabled>
                <Wrench className="w-4 h-4" />Generate design — coming soon
              </Button>
              {backLink}
            </div>
          </>
        )}

      </DialogContent>
    </Dialog>
  );
};

// ── PubChem name lookup ──────────────────────────────────────────────────────

type PubChemInfo = { name: string; cid: number } | null;

async function fetchPubChemName(smiles: string): Promise<PubChemInfo> {
  try {
    // Use POST to avoid issues with slashes (E/Z stereochemistry) in the URL path
    const cidRes = await fetch(
      'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/cids/JSON',
      { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: `smiles=${encodeURIComponent(smiles)}` },
    );
    if (!cidRes.ok) return null;
    const cidData = await cidRes.json();
    const cid = cidData?.IdentifierList?.CID?.[0];
    if (!cid) return null;

    const synRes = await fetch(
      `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/synonyms/JSON`
    );
    if (!synRes.ok) return { name: `CID ${cid}`, cid };
    const synData = await synRes.json();
    const synonyms = synData?.InformationList?.Information?.[0]?.Synonym;
    if (!synonyms?.length) return { name: `CID ${cid}`, cid };

    return { name: synonyms[0], cid };
  } catch {
    return null;
  }
}

// ── Reaction header ───────────────────────────────────────────────────────────

const ReactionHeader = ({ substrateSmiles, productSmiles, substrateInfo, productInfo, loading, enzymeName, accentColor }: {
  substrateSmiles: string; productSmiles: string;
  substrateName: string;   productName: string;
  substrateInfo?: PubChemInfo; productInfo?: PubChemInfo; loading?: boolean;
  enzymeName?: string; accentColor?: string;
}) => {
  const renderLabel = (fallback: string, info?: PubChemInfo) => {
    if (loading) return <span className="text-base font-semibold text-muted-foreground animate-pulse">…</span>;
    if (info) {
      return (
        <a
          href={`https://pubchem.ncbi.nlm.nih.gov/compound/${info.cid}`}
          target="_blank"
          rel="noreferrer"
          className="text-base font-semibold text-muted-foreground hover:text-primary hover:underline transition-colors inline-flex items-center gap-1 text-center"
        >
          {info.name}
          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
        </a>
      );
    }
    return <span className="text-base font-semibold text-muted-foreground">{fallback}</span>;
  };

  return (
    <div className="h-full rounded-xl border border-border bg-muted/20 px-1 py-0 flex flex-col justify-center overflow-hidden">
      <div className="flex items-center justify-center gap-2">
        {/* Substrate */}
        <div className="flex flex-col items-center">
          <MoleculeViewer smiles={substrateSmiles} width={390} height={220} />
          <div className="-mt-1">{renderLabel('Substrate', substrateInfo)}</div>
        </div>

        {/* Enzyme name + arrow — one word per line, column sizes to longest word */}
        <div className="flex flex-col items-center gap-1 shrink-0 w-fit">
          <div className="flex flex-col items-center leading-snug" style={{ color: accentColor ?? '#6CA033' }}>
            {(enzymeName ?? 'Enzyme').split(' ').map((word, i) => (
              <span key={i} className="text-base font-semibold text-center whitespace-nowrap">
                {word}
              </span>
            ))}
          </div>
          <span className="text-4xl leading-none shrink-0" style={{ color: 'var(--color-primary, #538b5e)', opacity: 0.75 }}>
            ⟶
          </span>
        </div>

        {/* Product */}
        <div className="flex flex-col items-center">
          <MoleculeViewer smiles={productSmiles} width={390} height={220} />
          <div className="-mt-1">{renderLabel('Product', productInfo)}</div>
        </div>
      </div>
    </div>
  );
};

// ── Candidate card (accordion) ────────────────────────────────────────────────

const CandidateCard = ({ enzyme, rank, reaction, expanded, onToggle }: {
  enzyme: Enzyme;
  rank: number;
  reaction: ReactionNodeData;
  expanded: boolean;
  onToggle: () => void;
}) => {
  const [getOpen, setGetOpen]         = useState(false);
  const [howToTestOpen, setHowToTest] = useState(false);

  const substrateName = reaction.substrateName ?? 'Substrate';
  const productName   = reaction.productName   ?? 'Product';

  return (
    <div className={cn(
      'rounded-xl border transition-colors',
      expanded ? 'border-primary/40 bg-muted/30' : 'border-border bg-muted/20 hover:bg-muted/30',
    )}>
      {/* Header row */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
      >
        <span className="shrink-0 w-6 h-6 rounded-full bg-muted border border-border flex items-center justify-center text-[11px] font-bold text-muted-foreground">
          {rank}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{enzyme.name}</p>
          <p className="text-xs text-muted-foreground truncate">{enzyme.organism}</p>
        </div>
        <span className="shrink-0 text-xs font-mono bg-muted border border-border px-2 py-0.5 rounded hidden sm:block">
          {enzyme.ecNumber}
        </span>
        <span className='shrink-0 text-sm font-mono font-bold' style={{ color: getScoreColor(enzyme.score) }}>
          {Math.round(enzyme.score * 100)}%
        </span>
        {expanded
          ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
          : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
      </button>

      {/* Expanded body — EnzymeInfo style */}
      {expanded && (
        <div className="px-4 pb-4 pt-3 space-y-4 border-t border-border/50">

          {/* Identity badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono bg-muted border border-border px-2 py-0.5 rounded">
              {enzyme.ecNumber}
            </span>
            <span className="text-xs font-mono bg-muted border border-border px-2 py-0.5 rounded text-muted-foreground">
              {enzyme.organism}
            </span>
          </div>

          {/* DB links */}
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'UniProt',   href: `https://www.uniprot.org/uniprotkb?query=${enzyme.id}`,                                                        color: 'text-sky-500 border-sky-400/40 bg-sky-500/5 hover:bg-sky-500/15' },
              { label: 'BRENDA',    href: `https://www.brenda-enzymes.org/enzyme.php?ecno=${enzyme.ecNumber.replace(/^EC\s*/i, '')}`,                     color: 'text-amber-500 border-amber-400/40 bg-amber-500/5 hover:bg-amber-500/15' },
              { label: 'ExplorEnz', href: `https://www.enzyme-database.org/query.php?ec=${enzyme.ecNumber}`,                                             color: 'text-violet-500 border-violet-400/40 bg-violet-500/5 hover:bg-violet-500/15' },
            ].map(({ label, href, color }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                className={cn('inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors', color)}
              >
                {label}
                <ExternalLink className="w-3 h-3" />
              </a>
            ))}
          </div>

          {/* Projected yield */}
          <div className="rounded-xl bg-muted/40 border border-border p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary shrink-0" />
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Projected Yield</p>
              </div>
              <span className="text-xl font-bold font-mono text-foreground">{enzyme.projectedYield}</span>
            </div>
            {(() => {
              const pct = parseInt(enzyme.projectedYield?.replace('%', '') ?? '0', 10);
              const clamped = Math.min(100, Math.max(0, isNaN(pct) ? 0 : pct));
              return (
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${clamped}%`, backgroundColor: '#538b5e' }} />
                </div>
              );
            })()}
          </div>

          {/* kcat + Km only */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Kinetic Parameters</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: <Activity className="w-4 h-4" />, label: 'k_cat', value: enzyme.kcat },
                { icon: <Target className="w-4 h-4" />,   label: 'K_m',   value: enzyme.km   },
              ].map(({ icon, label, value }) => (
                <div key={label} className="flex flex-col gap-1.5 rounded-xl p-3 bg-muted/50 border border-border">
                  <span className="text-muted-foreground">{icon}</span>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
                    <p className="text-sm font-mono font-semibold text-foreground mt-0.5">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              size="sm"
              className="gap-1.5 flex-1 font-semibold"
              style={{ background: '#538b5e', color: '#fff' }}
              onClick={() => setGetOpen(true)}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Get Enzyme
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 flex-1" onClick={() => setHowToTest(true)}>
              <FlaskConical className="w-3.5 h-3.5" />
              How to Test
            </Button>
          </div>
        </div>
      )}

      <GetEnzymeDialog enzyme={enzyme} open={getOpen} onOpenChange={setGetOpen} />

      {/* How to Test dialog */}
      <Dialog open={howToTestOpen} onOpenChange={setHowToTest}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto" style={{ background: 'var(--bg-elevated)' }}>
          <DialogHeader>
            <DialogTitle>How to Test — {enzyme.name}</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-5">
            <div className="rounded-lg bg-primary/5 border border-primary/20 px-4 py-3 flex items-start gap-2">
              <BookOpen className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Protocol for{' '}
                <span className="font-semibold text-foreground">{substrateName} → {productName}</span> using{' '}
                <span className="font-semibold text-foreground">{enzyme.name}</span>. Agent-assisted protocol lookup coming soon.
              </p>
            </div>

            {[
              {
                step: 1,
                icon: <CheckCircle2 className="w-4 h-4 text-success-600 shrink-0 mt-0.5" />,
                title: 'Prepare enzyme stock',
                body: `Dissolve lyophilised ${enzyme.name} in 50 mM sodium phosphate buffer (pH ${enzyme.optimalPh}). Target concentration 1 mg/mL. Keep on ice.`,
              },
              {
                step: 2,
                icon: <CheckCircle2 className="w-4 h-4 text-success-600 shrink-0 mt-0.5" />,
                title: 'Prepare substrate solution',
                body: `Dissolve ${substrateName} in the same buffer to 10 mM final concentration. Verify solubility; add ≤ 1% DMSO if needed.`,
              },
              {
                step: 3,
                icon: <Clock className="w-4 h-4 text-warning-600 shrink-0 mt-0.5" />,
                title: 'Run reaction',
                body: `Combine enzyme (0.1 mg/mL) and ${substrateName} (1 mM) in a 1 mL reaction volume at ${enzyme.optimalTemp}. Incubate with gentle agitation (200 rpm) for 2 h.`,
              },
              {
                step: 4,
                icon: <Clock className="w-4 h-4 text-warning-600 shrink-0 mt-0.5" />,
                title: 'Quench & analyse',
                body: `Quench with ice-cold methanol (1:1 v/v). Centrifuge 10 000 × g for 5 min. Analyse supernatant by HPLC or LC-MS against ${productName} reference standard.`,
              },
              {
                step: 5,
                icon: <CheckCircle2 className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />,
                title: 'Controls',
                body: `Run a no-enzyme blank and a heat-inactivated enzyme control in parallel. Include an authentic ${productName} standard for LC-MS peak identification.`,
              },
            ].map(({ step, icon, title, body }) => (
              <div key={step} className="flex gap-3">
                <div className="flex flex-col items-center gap-1">
                  {icon}
                  {step < 5 && <div className="w-px flex-1 bg-border min-h-[24px]" />}
                </div>
                <div className="pb-4">
                  <p className="text-sm font-semibold text-foreground">{step}. {title}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{body}</p>
                </div>
              </div>
            ))}

            <div className="pt-2 border-t border-border">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">References</p>
              <div className="space-y-2">
                {[
                  { id: 'ref1', authors: 'Bornscheuer, U. T. et al.', year: 2012, title: 'Engineering the third wave of biocatalysis.', journal: 'Nature', vol: '485', pages: '185–194', doi: 'https://doi.org/10.1038/nature11117' },
                  { id: 'ref2', authors: 'Hauer, B.', year: 2020, title: 'Embracing nature\'s catalysts: a viewpoint on the future of biocatalysis.', journal: 'ACS Catal.', vol: '10', pages: '8418–8427', doi: 'https://doi.org/10.1021/acscatal.0c01708' },
                  { id: 'ref3', authors: 'Sheldon, R. A. & Woodley, J. M.', year: 2018, title: 'Role of biocatalysis in sustainable chemistry.', journal: 'Chem. Rev.', vol: '118', pages: '801–838', doi: 'https://doi.org/10.1021/acs.chemrev.7b00203' },
                ].map(({ id, authors, year, title, journal, vol, pages, doi }) => (
                  <a
                    key={id}
                    href={doi}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-start gap-2 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 hover:border-primary/30 p-2.5 transition-colors group"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5 group-hover:text-primary" />
                    <div>
                      <p className="text-xs text-foreground leading-snug">
                        <span className="font-semibold">{authors}</span> ({year}). {title}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        <span className="italic">{journal}</span> <span className="font-semibold">{vol}</span>, {pages}.
                      </p>
                    </div>
                    <ExternalLink className="w-3 h-3 text-muted-foreground shrink-0 mt-1 ml-auto group-hover:text-primary" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────

export const TestReactionPage = () => {
  const navigate   = useNavigate();
  const location   = useLocation();
  const [expandedId, setExpandedId]   = useState<string | null>(null);
  const [bulkOpen, setBulkOpen]       = useState(false);
  const candidatesRef = useRef<HTMLDivElement>(null);
  const [pubchemLoading, setPubchemLoading] = useState(false);
  const [substrateInfo, setSubstrateInfo]   = useState<PubChemInfo>(null);
  const [productInfo, setProductInfo]       = useState<PubChemInfo>(null);

  const state      = location.state as { reaction: ReactionNodeData; candidates?: Enzyme[] } | null;
  const reaction   = state?.reaction;
  const enzyme     = reaction?.enzyme ?? null;
  const confidence = (reaction?.confidence ?? 'medium') as 'high' | 'good' | 'medium' | 'low';

  const substrateSmiles = reaction?.substrateSmiles ?? '';
  const productSmiles   = reaction?.productSmiles   ?? '';
  const substrateName   = reaction?.substrateName   ?? 'Substrate';
  const productName     = reaction?.productName     ?? 'Product';

  // Fetch common names from PubChem
  useEffect(() => {
    if (!substrateSmiles && !productSmiles) return;
    let cancelled = false;

    // Pick the longest substrate (dot-separated SMILES)
    const longestSubstrate = substrateSmiles
      .split('.')
      .reduce((a, b) => (b.length > a.length ? b : a), '');

    setPubchemLoading(true);
    Promise.all([
      longestSubstrate ? fetchPubChemName(longestSubstrate) : Promise.resolve(null),
      productSmiles    ? fetchPubChemName(productSmiles)    : Promise.resolve(null),
    ]).then(([sub, prod]) => {
      if (cancelled) return;
      setSubstrateInfo(sub);
      setProductInfo(prod);
    }).finally(() => {
      if (!cancelled) setPubchemLoading(false);
    });

    return () => { cancelled = true; };
  }, [substrateSmiles, productSmiles]);

  if (!enzyme || !reaction) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
        No reaction data found. Please navigate here from a pathway node.
      </div>
    );
  }

  // Use real backend candidates when available (import flow), fall back to mock (pathway flow)
  const candidates = (state?.candidates && state.candidates.length > 0)
    ? state.candidates
    : buildCandidates(enzyme, confidence);

  const scorePct = Math.round(enzyme.score * 100);

  // 5-tier wording + palette based on raw score
  const tier = enzyme.score >= 0.9 ? 'high'
             : enzyme.score >= 0.8 ? 'good'
             : enzyme.score >= 0.5 ? 'medium'
             : 'low';

  const TIER_CFG = {
    high: {
      header1:     'We found your biocatalysts!',
      phrase:      'is a perfect match',
      showEnzyme:  true,
      zz:          5,
      accentColor: '#25512B',
      accentBg:    'rgba(37,81,43,0.04)',
      accentBorder:'rgba(37,81,43,0.2)',
      accentPanel: 'rgba(37,81,43,0.06)',
    },
    good: {
      header1:     'We found your biocatalysts!',
      phrase:      'is a very promising option',
      showEnzyme:  true,
      zz:          10,
      accentColor: '#6CA033',
      accentBg:    'rgba(108,160,51,0.04)',
      accentBorder:'rgba(108,160,51,0.2)',
      accentPanel: 'rgba(108,160,51,0.06)',
    },
    medium: {
      header1:     'We found your biocatalysts!',
      phrase:      'is an option worth exploring',
      showEnzyme:  true,
      zz:          20,
      accentColor: '#F69B05',
      accentBg:    'rgba(246,155,5,0.04)',
      accentBorder:'rgba(246,155,5,0.2)',
      accentPanel: 'rgba(246,155,5,0.06)',
    },
    low: {
      header1:     'Biocatalyst not found yet!',
      phrase:      'no established biocatalyst was identified',
      showEnzyme:  false,
      zz:          40,
      accentColor: '#C00000',
      accentBg:    'rgba(192,0,0,0.04)',
      accentBorder:'rgba(192,0,0,0.2)',
      accentPanel: 'rgba(192,0,0,0.06)',
    },
  } as const;

  const { header1, phrase, showEnzyme, zz, accentColor, accentBg, accentBorder, accentPanel } = TIER_CFG[tier];

  return (
    <div className="h-full overflow-y-auto">

      {/* Title section — full width */}
      <div
        className="w-full border-b px-8 py-8"
        style={{ borderColor: accentBorder, backgroundColor: accentBg }}
      >
        <div className="flex items-start gap-5 max-w-6xl mx-auto">
          {/* Accent bar */}
          <div
            className="w-1.5 self-stretch rounded-full shrink-0"
            style={{ backgroundColor: accentColor }}
          />
          <div className="flex-1 min-w-0 space-y-2">

            {/* Line 1 — label */}
            <h1 className="text-2xl font-bold tracking-tight leading-none" style={{ color: accentColor }}>
              {header1}
            </h1>

            {/* Line 2 — confidence + enzyme description */}
            <p className="text-3xl font-bold tracking-tight leading-snug text-foreground">
              With <span style={{ color: accentColor }}>{scorePct}%</span> confidence,{' '}
              {showEnzyme
                ? <><span style={{ color: accentColor }}>{enzyme.name}</span>{' '}{phrase}</>
                : phrase
              }!
            </p>

            {/* Line 3 — testing recommendation */}
            <p className="text-xl text-foreground pt-1">
              Testing the top{' '}
              <span style={{ color: accentColor }}>{zz}</span>
              {' '}biocatalysts will yield the desired transformation of your substrate.
            </p>

          </div>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="w-full px-8 py-3 space-y-4">

        {/* Back button */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {reaction.pathwayId === 'import' ? 'Back to input' : 'Back to pathway'}
        </button>

        {/* Two main boxes side by side */}
        <div className="grid grid-cols-[2fr_1fr] gap-6 items-stretch">

          {/* Reaction structural view */}
          <ReactionHeader
            substrateSmiles={substrateSmiles}
            productSmiles={productSmiles}
            substrateName={substrateName}
            productName={productName}
            substrateInfo={substrateInfo}
            productInfo={productInfo}
            loading={pubchemLoading}
            enzymeName={enzyme.name}
            accentColor={accentColor}
          />

          {/* Kit card */}
          {(() => {
            const kitPrice = candidates.length * 40;
            return (
              <div className="flex flex-col rounded-xl border border-border bg-muted/20 px-4 py-2 gap-2">

                {/* Primary CTA */}
                <button
                  type="button"
                  onClick={() => setBulkOpen(true)}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all cursor-pointer"
                  style={{ background: 'var(--primary-500)', color: '#fff', boxShadow: '0 2px 12px 0 rgba(16,185,129,0.25)' }}
                >
                  <ShoppingCart className="w-4 h-4" />
                  Get custom kit for this reaction
                </button>

                <div className="border-t border-border/50" />

                {/* Biocatalysts in kit */}
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Biocatalysts in kit</p>
                  <ul className="text-sm text-foreground space-y-0.5 list-disc list-inside leading-snug">
                    <li>{candidates.length} enzymes most likely to catalyze your transformation</li>
                    <li>Each 1 mg, lyophilized — protocol and all reagents included</li>
                  </ul>
                </div>

                <div className="border-t border-border/50" />

                {/* Price */}
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Price for kit</p>
                  <p className="text-2xl font-bold text-foreground">${kitPrice}</p>
                </div>

                <div className="border-t border-border/50" />

                {/* Delivery */}
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Delivery</p>
                  <ul className="text-sm text-foreground space-y-0.5 list-disc list-inside leading-snug">
                    <li>5 business days</li>
                    <li>Free shipping</li>
                  </ul>
                </div>

                <div className="border-t border-border/50 mt-auto" />

                {/* Secondary actions */}
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    className="w-full inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-medium transition-all border disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{ borderColor: 'var(--primary-500)', color: 'var(--primary-500)', background: 'transparent' }}
                  >
                    Explore protocol
                  </button>
                  <button
                    type="button"
                    className="w-full inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-medium transition-all border disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{ borderColor: 'var(--primary-500)', color: 'var(--primary-500)', background: 'transparent' }}
                  >
                    How do we select biocatalysts?
                  </button>
                </div>

              </div>
            );
          })()}

        </div>

        {/* Full-width scroll-to-candidates button */}
        <button
          type="button"
          onClick={() => candidatesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm font-semibold transition-all cursor-pointer"
          style={{ background: 'var(--primary-500)', color: '#fff', boxShadow: '0 2px 12px 0 rgba(16,185,129,0.25)' }}
        >
          <Dna className="w-4 h-4" />
          Explore selected biocatalysts
        </button>

        {/* Candidate list */}
        <div ref={candidatesRef} className="space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Enzyme Candidates · Ranked by Compatibility Score
          </p>
          {candidates.map((cand, i) => (
            <CandidateCard
              key={cand.id}
              enzyme={cand}
              rank={i + 1}
              reaction={reaction}
              expanded={expandedId === cand.id}
              onToggle={() => setExpandedId(prev => prev === cand.id ? null : cand.id)}
            />
          ))}
        </div>

      </div>

      {/* Bulk get dialog */}
      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent className="max-w-sm" style={{ background: 'var(--bg-elevated)' }}>
          <DialogHeader>
            <DialogTitle>Get all {candidates.length} candidates</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              Choose how you would like to obtain all {candidates.length} enzyme candidates for parallel testing.
            </p>
            {[
              { icon: <ShoppingCart className="w-5 h-5 text-primary" />, title: 'Get all Enzymes', sub: 'Order purified enzyme for each candidate' },
              { icon: <Dna className="w-5 h-5 text-primary" />,          title: 'Get all DNA',     sub: 'Codon-optimised gene construct per candidate' },
              { icon: <Wrench className="w-5 h-5 text-primary" />,       title: 'Get all Designs', sub: 'Engineering design for each candidate' },
            ].map(({ icon, title, sub }) => (
              <button
                key={title}
                type="button"
                disabled
                className="w-full flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3 text-left opacity-60 cursor-not-allowed"
              >
                <div className="rounded-lg bg-primary/10 p-2 shrink-0">{icon}</div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{title}</p>
                  <p className="text-xs text-muted-foreground">{sub}</p>
                </div>
                <span className="ml-auto text-[10px] font-mono text-muted-foreground whitespace-nowrap">coming soon</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default TestReactionPage;
