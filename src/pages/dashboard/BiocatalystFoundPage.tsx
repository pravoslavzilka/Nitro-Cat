import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, FlaskConical, Dna, Wrench, ShoppingCart,
  Activity, Target, TrendingUp,
  BookOpen, ExternalLink, CheckCircle2, Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MoleculeViewer } from '@/components/molecule/MoleculeViewer';
import { cn } from '@/lib/utils';
import { formatScore, formatConfidenceLabel } from '@/lib/utils/formatting';
import type { ReactionNodeData } from '@/types/pathway';
import type { Enzyme } from '@/types/enzyme';

// ── Confidence badge ──────────────────────────────────────────────────────────

const labelStyles: Record<'high' | 'medium' | 'low', string> = {
  high:   'bg-success-100 text-success-700 border border-success-500',
  medium: 'bg-warning-100 text-warning-700 border border-warning-500',
  low:    'bg-danger-100  text-danger-700  border border-danger-500',
};

const ConfidenceBadge = ({ score }: { score: number }) => {
  const label = formatConfidenceLabel(score);
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-sm font-mono font-semibold',
      labelStyles[label],
    )}>
      {formatScore(score)}
      <span className="font-normal opacity-80">confidence</span>
    </span>
  );
};

// Keep ConfidenceBadge defined — may be used in future panels
void ConfidenceBadge;

// ── Reaction header: structural view + SMILES ─────────────────────────────────

const ReactionHeader = ({
  substrateSmiles, productSmiles, substrateName, productName,
}: {
  substrateSmiles: string; productSmiles: string;
  substrateName: string;   productName: string;
}) => (
  <div className="rounded-xl border border-border bg-muted/20 p-5">
    <div className="flex items-center justify-center gap-6">
      {/* Substrate (left — starting material) */}
      <div className="flex flex-col items-center gap-2">
        <MoleculeViewer smiles={substrateSmiles} width={180} height={130} />
        <span className="text-xs font-medium text-muted-foreground text-center max-w-[180px] truncate">
          {substrateName}
        </span>
      </div>

      {/* Arrow pointing right: substrate → product */}
      <div className="flex flex-col items-center gap-1 shrink-0">
        <div className="flex items-center gap-1">
          <div className="w-12 h-0.5 bg-primary/60" />
          <div className="w-0 h-0 border-t-4 border-b-4 border-l-6 border-transparent border-l-primary/60" />
        </div>
        <span className="text-[10px] font-mono text-primary/60 uppercase tracking-widest">biocatalysis</span>
      </div>

      {/* Product (right — what is made) */}
      <div className="flex flex-col items-center gap-2">
        <MoleculeViewer smiles={productSmiles} width={180} height={130} />
        <span className="text-xs font-medium text-muted-foreground text-center max-w-[180px] truncate">
          {productName}
        </span>
      </div>
    </div>

    {/* Reaction SMILES */}
    <div className="mt-4 rounded-lg bg-muted/60 border border-border px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Reaction SMILES</p>
      <p className="text-xs font-mono text-foreground break-all leading-relaxed">
        {substrateSmiles} <span className="text-primary font-bold mx-1">{'>>'}</span> {productSmiles}
      </p>
    </div>
  </div>
);

// ── Enzyme Info panel ─────────────────────────────────────────────────────────

const EnzymeInfoPanel = ({ enzyme }: { enzyme: Enzyme }) => (
  <div className="space-y-5">

    {/* A. Identity */}
    <div>
      <h2 className="text-xl font-bold text-foreground leading-tight">{enzyme.name}</h2>
      <div className="flex flex-wrap items-center gap-2 mt-2">
        <span className="text-xs font-mono bg-muted border border-border px-2 py-0.5 rounded">
          {enzyme.ecNumber}
        </span>
        <span className="text-xs font-mono bg-muted border border-border px-2 py-0.5 rounded text-muted-foreground">
          {enzyme.organism}
        </span>
      </div>
    </div>

    {/* B. External resource links */}
    <div className="flex flex-wrap gap-2">
      {[
        { label: 'UniProt',   href: `https://www.uniprot.org/uniprotkb?query=${enzyme.id}`,           color: 'text-sky-500 border-sky-400/40 bg-sky-500/5 hover:bg-sky-500/15' },
        { label: 'BRENDA',    href: `https://www.brenda-enzymes.org/enzyme.php?ecno=${enzyme.ecNumber.replace(/^EC\s*/i, '')}`, color: 'text-amber-500 border-amber-400/40 bg-amber-500/5 hover:bg-amber-500/15' },
        { label: 'ExplorEnz', href: `https://www.enzyme-database.org/query.php?ec=${enzyme.ecNumber}`, color: 'text-violet-500 border-violet-400/40 bg-violet-500/5 hover:bg-violet-500/15' },
      ].map(({ label, href, color }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noreferrer"
          className={cn(
            'inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors',
            color,
          )}
        >
          {label}
          <ExternalLink className="w-3 h-3" />
        </a>
      ))}
    </div>

    {/* C. Projected yield with progress bar */}
    <div className="rounded-xl bg-muted/40 border border-border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary shrink-0" />
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Projected Yield
          </p>
        </div>
        <span className="text-2xl font-bold font-mono text-foreground">{enzyme.projectedYield}</span>
      </div>

      {(() => {
        const pct = parseInt(enzyme.projectedYield?.replace('%', '') ?? '0', 10);
        const clamped = Math.min(100, Math.max(0, isNaN(pct) ? 0 : pct));
        return (
          <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${clamped}%`, backgroundColor: '#10B981' }}
            />
          </div>
        );
      })()}
    </div>

    {/* D. Kinetic parameters — kcat and Km only */}
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
        Kinetic Parameters
      </p>
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: <Activity className="w-4 h-4" />, label: 'k_cat', value: enzyme.kcat },
          { icon: <Target className="w-4 h-4" />,   label: 'K_m',   value: enzyme.km   },
        ].map(({ icon, label, value }) => (
          <div key={label} className="flex flex-col gap-2 rounded-xl p-4 bg-muted/50 border border-border">
            <span className="text-muted-foreground">{icon}</span>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
              <p className="text-base font-mono font-semibold text-foreground mt-0.5">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

  </div>
);

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
// Volume discount multipliers (price goes down as qty goes up)
const ENZYME_DISCOUNT  = [1.00, 0.90, 0.82, 0.70]                   as const;
const DNA_MUG_DISCOUNT = [1.00, 0.88, 0.80, 0.65]                   as const;
const DNA_CNS_DISCOUNT = [1.00, 0.92, 0.85, 0.75]                   as const;

// Selected selector button style
const SEL_BTN  = 'border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold ring-1 ring-emerald-500/30';
const IDLE_BTN = 'border-border bg-muted/30 text-muted-foreground hover:border-emerald-500/40';

// ── Get the Enzyme panel ──────────────────────────────────────────────────────

type DnaStep = 'host' | 'confirm';

const GetEnzymePanel = ({ enzyme }: { enzyme: Enzyme }) => {
  const [open, setOpen]                 = useState<'enzyme' | 'dna' | 'design' | null>(null);
  const [dnaStep, setDnaStep]           = useState<DnaStep>('host');
  const [selectedHost, setSelectedHost] = useState<string | null>(null);
  const [enzymeQtyIdx, setEnzymeQtyIdx] = useState(0); // drives both qty AND reactions
  const [dnaMugIdx,    setDnaMugIdx]    = useState(0);
  const [dnaSubStep,    setDnaSubStep]    = useState<'config' | 'review'>('config');
  const [orderPlaced,   setOrderPlaced]   = useState<'enzyme' | 'dna' | null>(null);

  const resetDna = () => { setDnaStep('host'); setSelectedHost(null); setDnaSubStep('config'); };

  const recommendedHosts = (() => {
    const ec  = enzyme.ecNumber ?? '';
    const cls = ec.split('.')[0];
    if (ec.includes('1.14')) return ['S. cerevisiae BY4741', 'E. coli BL21(DE3)'];
    if (cls === '1')         return ['E. coli BL21(DE3)', 'P. pastoris X-33'];
    if (cls === '2')         return ['E. coli BL21(DE3)', 'B. subtilis 168'];
    if (cls === '4')         return ['E. coli BL21(DE3)'];
    if (cls === '5')         return ['E. coli BL21(DE3)'];
    return ['E. coli BL21(DE3)', 'P. pastoris X-33'];
  })();

  const options: { key: 'enzyme' | 'dna' | 'design'; icon: React.ReactNode; title: string; sub: string }[] = [
    {
      key: 'enzyme',
      icon: <ShoppingCart className="w-6 h-6 text-primary" />,
      title: 'Get the Enzyme',
      sub: 'Order purified enzyme from a vendor',
    },
    {
      key: 'dna',
      icon: <Dna className="w-6 h-6 text-primary" />,
      title: 'Get DNA',
      sub: 'Order a codon-optimised gene construct',
    },
    {
      key: 'design',
      icon: <Wrench className="w-6 h-6 text-primary" />,
      title: 'Get Design',
      sub: 'Receive an engineering design for this enzyme',
    },
  ];

  return (
    <div className="space-y-4">

      <p className="text-sm text-muted-foreground">
        Choose how you would like to obtain{' '}
        <span className="font-semibold text-foreground">{enzyme.name}</span> for your experiment.
      </p>

      <div className="grid grid-cols-3 gap-3">
        {options.map(({ key, icon, title, sub }) => (
          <button
            key={key}
            type="button"
            onClick={() => setOpen(key)}
            className="flex flex-col items-center gap-3 rounded-xl border border-border bg-muted/30 hover:bg-muted/60 hover:border-primary/40 p-4 text-center transition-colors group"
          >
            <div className="shrink-0 rounded-lg bg-primary/10 p-2.5">{icon}</div>
            <div>
              <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">{title}</p>
              <p className="text-xs text-muted-foreground mt-1 leading-snug">{sub}</p>
            </div>
          </button>
        ))}
      </div>

      {/* ── Get the Enzyme dialog ── */}
      <Dialog open={open === 'enzyme'} onOpenChange={v => { if (!v) { setOpen(null); setOrderPlaced(null); } }}>
        <DialogContent className="max-w-sm" style={{ background: 'var(--bg-elevated)' }}>
          <DialogHeader><DialogTitle>Get the Enzyme</DialogTitle></DialogHeader>
          {orderPlaced === 'enzyme' ? (
            <div className="py-8 flex flex-col items-center gap-3 text-center">
              <CheckCircle2 className="w-10 h-10 text-primary" />
              <p className="text-sm font-semibold text-foreground">Order placed!</p>
              <p className="text-xs text-muted-foreground">Your order for <span className="font-semibold text-foreground">{enzyme.name}</span> is being processed.</p>
              <Button size="sm" variant="outline" className="mt-2" onClick={() => { setOpen(null); setOrderPlaced(null); }}>Done</Button>
            </div>
          ) : (
            <div className="py-4 space-y-5">
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
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Get DNA dialog ── */}
      <Dialog
        open={open === 'dna'}
        onOpenChange={v => { if (!v) { setOpen(null); resetDna(); } }}
      >
        <DialogContent className="max-w-sm" style={{ background: 'var(--bg-elevated)' }}>
          <DialogHeader><DialogTitle>Get DNA</DialogTitle></DialogHeader>

          {dnaStep === 'host' && (
            <div className="py-4 space-y-3">
              <p className="text-sm text-muted-foreground">
                Choose an expression host for{' '}
                <span className="font-semibold text-foreground">{enzyme.name}</span>. The gene sequence will be codon-optimised for your chosen host.
              </p>
              {recommendedHosts.length > 0 && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5 space-y-1.5">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">
                    Recommended for {enzyme.ecNumber}
                  </p>
                  {recommendedHosts.map(host => (
                    <div key={host} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3 text-primary shrink-0" />
                      <span className="text-xs font-semibold text-foreground">{host}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: 'ecoli',      label: 'E. coli BL21(DE3)' },
                  { id: 'pastoris',   label: 'P. pastoris X-33' },
                  { id: 'cerevisiae', label: 'S. cerevisiae BY4741' },
                  { id: 'bsubtilis',  label: 'B. subtilis 168' },
                  { id: 'cfree',      label: 'Cell-free (wheat germ)' },
                ].map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSelectedHost(id)}
                    className={cn(
                      'flex items-center gap-3 rounded-xl border p-3 text-left transition-colors',
                      selectedHost === id
                        ? 'border-emerald-500 bg-emerald-500/15 ring-1 ring-emerald-500/30'
                        : 'border-border bg-muted/30 hover:border-emerald-500/40 hover:bg-muted/60',
                    )}
                  >
                    <div className={cn(
                      'w-3.5 h-3.5 rounded-full border-2 shrink-0',
                      selectedHost === id ? 'border-emerald-500 bg-emerald-500' : 'border-muted-foreground',
                    )} />
                    <p className="text-sm font-semibold text-foreground">{label}</p>
                  </button>
                ))}
              </div>
              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold disabled:opacity-50"
                disabled={!selectedHost}
                onClick={() => setDnaStep('confirm')}
              >
                Continue
              </Button>
            </div>
          )}

          {dnaStep === 'confirm' && dnaSubStep === 'config' && (
            <div className="py-4 space-y-4">
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
              <button type="button" className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors" onClick={() => setDnaStep('host')}>
                ← Change host
              </button>
            </div>
          )}

          {dnaStep === 'confirm' && dnaSubStep === 'review' && (
            <div className="py-4 space-y-4">
              <div className="rounded-lg bg-muted/40 border border-border p-3 space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Order summary</p>
                <p className="text-sm text-foreground font-semibold">{enzyme.name} — codon-optimised gene</p>
                <p className="text-xs text-muted-foreground">Host: {selectedHost}</p>
                <p className="text-xs text-muted-foreground">Format: pET-28a(+) insert · 5′ NdeI / 3′ XhoI</p>
                <p className="text-xs text-muted-foreground">Quantity: {QTY_MUG[dnaMugIdx]}</p>
              </div>
              {orderPlaced === 'dna' ? (
                <div className="py-4 flex flex-col items-center gap-3 text-center">
                  <CheckCircle2 className="w-10 h-10 text-primary" />
                  <p className="text-sm font-semibold text-foreground">Order placed!</p>
                  <p className="text-xs text-muted-foreground">Your gene synthesis order is being processed.</p>
                  <Button size="sm" variant="outline" className="mt-2" onClick={() => { setOpen(null); resetDna(); setOrderPlaced(null); }}>Done</Button>
                </div>
              ) : (
                <>
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
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Get Design dialog ── */}
      <Dialog open={open === 'design'} onOpenChange={v => !v && setOpen(null)}>
        <DialogContent className="max-w-sm" style={{ background: 'var(--bg-elevated)' }}>
          <DialogHeader><DialogTitle>Get Design</DialogTitle></DialogHeader>
          <div className="py-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              An engineering design — expression vector, host strain recommendation, and process parameters — will be generated here.
            </p>
            {recommendedHosts.length > 0 && (
              <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5 space-y-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">
                  Recommended host for {enzyme.ecNumber}
                </p>
                {recommendedHosts.map(host => (
                  <div key={host} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-primary shrink-0" />
                    <span className="text-xs font-semibold text-foreground">{host}</span>
                  </div>
                ))}
              </div>
            )}
            <Button className="w-full gap-2" disabled>
              <Wrench className="w-4 h-4" />
              Generate design — coming soon
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ── How to Test panel ─────────────────────────────────────────────────────────

const HowToTestPanel = ({ enzyme, substrateName, productName }: {
  enzyme: Enzyme; substrateName: string; productName: string;
}) => (
  <div className="space-y-5">
    <div className="rounded-lg bg-primary/5 border border-primary/20 px-4 py-3 flex items-start gap-2">
      <BookOpen className="w-4 h-4 text-primary shrink-0 mt-0.5" />
      <p className="text-xs text-muted-foreground leading-relaxed">
        Protocol generated for{' '}
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

    {/* References */}
    <div className="pt-2 border-t border-border">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">References</p>
      <div className="space-y-2">
        {[
          {
            id: 'ref1',
            authors: 'Bornscheuer, U. T. et al.',
            year: 2012,
            title: 'Engineering the third wave of biocatalysis.',
            journal: 'Nature', vol: '485', pages: '185–194',
            doi: 'https://doi.org/10.1038/nature11117',
          },
          {
            id: 'ref2',
            authors: 'Hauer, B.',
            year: 2020,
            title: "Embracing nature's catalysts: a viewpoint on the future of biocatalysis.",
            journal: 'ACS Catal.', vol: '10', pages: '8418–8427',
            doi: 'https://doi.org/10.1021/acscatal.0c01708',
          },
          {
            id: 'ref3',
            authors: 'Sheldon, R. A. & Woodley, J. M.',
            year: 2018,
            title: 'Role of biocatalysis in sustainable chemistry.',
            journal: 'Chem. Rev.', vol: '118', pages: '801–838',
            doi: 'https://doi.org/10.1021/acs.chemrev.7b00203',
          },
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
      <p className="text-[10px] text-muted-foreground/50 text-center mt-3">
        Mock references · {enzyme.ecNumber} · Agent-assisted protocol lookup coming soon
      </p>
    </div>
  </div>
);

// ── Main page ─────────────────────────────────────────────────────────────────

type Tab = 'enzyme' | 'get' | 'test';

export default function BiocatalystFoundPage() {
  const location = useLocation();
  const navigate  = useNavigate();
  const reaction  = location.state?.reaction as ReactionNodeData | undefined;

  const [tab, setTab]                       = useState<Tab | null>(null);
  const [confidenceOpen, setConfidenceOpen] = useState(false);

  if (!reaction?.enzyme) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No enzyme data found.</p>
      </div>
    );
  }

  const enzyme          = reaction.enzyme;
  const substrateSmiles = reaction.substrateSmiles ?? '';
  const productSmiles   = reaction.productSmiles   ?? '';
  const substrateName   = reaction.substrateName   ?? 'Substrate';
  const productName     = reaction.productName     ?? 'Product';

  return (
    <div className="h-full overflow-y-auto">

      {/* Title section — full width */}
      <div
        className="w-full border-b px-8 py-6"
        style={{ borderColor: 'rgba(16,185,129,0.2)', backgroundColor: 'rgba(16,185,129,0.04)' }}
      >
        <div className="flex items-start gap-5">
          <div
            className="w-1.5 self-stretch rounded-full shrink-0"
            style={{ backgroundColor: '#10B981' }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <FlaskConical className="w-7 h-7 shrink-0" style={{ color: '#10B981' }} />
              <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#10B981' }}>
                We found your biocatalyst
              </h1>
            </div>
            <p className="text-base text-muted-foreground mt-2">
              <span className="text-lg font-semibold text-foreground">{enzyme.name}</span>
              {' '}is predicted to catalyse this reaction with a match score of{' '}
              <span
                className="font-semibold"
                style={{
                  color: enzyme.score >= 0.9 ? '#10B981'
                       : enzyme.score >= 0.75 ? '#F59E0B'
                       : '#F97316',
                }}
              >
                {formatScore(enzyme.score)}
              </span>
              {' '}
              <span
                className="text-sm font-medium"
                style={{
                  color: enzyme.score >= 0.9 ? '#10B981'
                       : enzyme.score >= 0.75 ? '#F59E0B'
                       : '#F97316',
                }}
              >
                ({formatConfidenceLabel(enzyme.score)} confidence)
              </span>.
            </p>
            <button
              type="button"
              onClick={() => setConfidenceOpen(v => !v)}
              className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="text-base leading-none">{confidenceOpen ? '▾' : '▸'}</span>
              How we assess confidence
            </button>
            {confidenceOpen && (
              <div
                className="mt-3 rounded-xl border p-4 space-y-2 text-sm text-muted-foreground leading-relaxed max-w-2xl"
                style={{ borderColor: 'rgba(16,185,129,0.2)', backgroundColor: 'rgba(16,185,129,0.06)' }}
              >
                <p>
                  Each enzyme is scored against the reaction by a deep-learning model trained on
                  characterised enzyme–reaction pairs. The best match is picked from over 262 000 known enzymes.
                </p>
                <p>
                  <span className="font-semibold" style={{ color: '#10B981' }}>High</span> ≥ 90 % ·{' '}
                  <span className="font-semibold text-amber-500">Medium</span> 75–89 % ·{' '}
                  <span className="font-semibold text-orange-500">Low</span> &lt; 75 %
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6 space-y-6">

        {/* Back button */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {reaction.pathwayId === 'import' ? 'Back to input' : 'Back to pathway'}
        </button>

        {/* Reaction structural view */}
        <ReactionHeader
          substrateSmiles={substrateSmiles}
          productSmiles={productSmiles}
          substrateName={substrateName}
          productName={productName}
        />

        {/* Tab buttons — solid pills, left to right */}
        <div className="grid grid-cols-3 gap-2">
          {([
            { key: 'enzyme' as Tab, icon: <Activity className="w-4 h-4" />,     label: 'Enzyme Info' },
            { key: 'get'    as Tab, icon: <ShoppingCart className="w-4 h-4" />, label: 'Get the Enzyme' },
            { key: 'test'   as Tab, icon: <FlaskConical className="w-4 h-4" />, label: 'How to Test' },
          ]).map(({ key, icon, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(prev => prev === key ? null : key)}
              className={cn(
                'flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-xs font-semibold transition-colors',
                tab === key
                  ? 'text-white border-transparent shadow-sm'
                  : 'bg-muted/40 text-muted-foreground border-border hover:bg-muted/70 hover:text-foreground',
              )}
              style={tab === key ? { backgroundColor: '#10B981' } : {}}
            >
              {icon}
              <span className="text-center leading-tight">{label}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === null && (
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground/50 text-sm gap-2">
            <Activity className="w-6 h-6 opacity-40" />
            <span>Select a section above to explore this biocatalyst</span>
          </div>
        )}
        {tab === 'enzyme' && <EnzymeInfoPanel enzyme={enzyme} />}
        {tab === 'get'    && <GetEnzymePanel  enzyme={enzyme} />}
        {tab === 'test'   && (
          <HowToTestPanel
            enzyme={enzyme}
            substrateName={substrateName}
            productName={productName}
          />
        )}

      </div>
    </div>
  );
}
