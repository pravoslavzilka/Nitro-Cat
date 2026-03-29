import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, FlaskConical, AlertTriangle,
  ChevronDown, ChevronUp, ShoppingCart, Dna, Wrench,
  Droplets, Thermometer, Activity, Target, TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MoleculeViewer } from '@/components/molecule/MoleculeViewer';
import { cn } from '@/lib/utils';
import type { ReactionNodeData } from '@/types/pathway';
import type { Enzyme } from '@/types/enzyme';

// ── Mock candidate generator ──────────────────────────────────────────────────

// TODO: wire backend — call API with top_k: N to get all candidates
// top_k: 5 for medium confidence, top_k: 10 for low confidence
const buildCandidates = (top1: Enzyme, confidence: 'medium' | 'low'): Enzyme[] => {
  const count = confidence === 'low' ? 5 : 4;
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

// ── Score color ───────────────────────────────────────────────────────────────

const scoreColor = (score: number): string => {
  if (score >= 0.90) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 0.75) return 'text-amber-600 dark:text-amber-400';
  return 'text-orange-600 dark:text-orange-400';
};

// ── Get-Enzyme dialog (single dialog, view-switched) ──────────────────────────

type GetView = 'chooser' | 'enzyme' | 'dna' | 'design';

const GetEnzymeDialog = ({ enzyme, open, onOpenChange }: {
  enzyme: Enzyme;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) => {
  const [view, setView] = useState<GetView>('chooser');

  const handleOpenChange = (v: boolean) => {
    if (!v) setView('chooser');
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
            <div className="py-2 space-y-3">
              <p className="text-sm text-muted-foreground">Order purified {enzyme.name} directly.</p>
              <div className="rounded-lg bg-muted/40 border border-border p-3 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-sm font-mono">{enzyme.price || 'Price on request'}</span>
              </div>
              <Button className="w-full gap-2" disabled>
                <ShoppingCart className="w-4 h-4" />Order — coming soon
              </Button>
              {backLink}
            </div>
          </>
        )}

        {view === 'dna' && (
          <>
            <DialogHeader><DialogTitle>Get DNA</DialogTitle></DialogHeader>
            <div className="py-2 space-y-3">
              <p className="text-sm text-muted-foreground">
                A codon-optimised gene construct for{' '}
                <span className="font-semibold">{enzyme.name}</span> from a gene synthesis provider.
              </p>
              <Button className="w-full gap-2" disabled>
                <Dna className="w-4 h-4" />Order gene — coming soon
              </Button>
              {backLink}
            </div>
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

// ── Candidate card (accordion) ────────────────────────────────────────────────

const CandidateCard = ({ enzyme, rank, reaction, expanded, onToggle }: {
  enzyme: Enzyme;
  rank: number;
  reaction: ReactionNodeData;
  expanded: boolean;
  onToggle: () => void;
}) => {
  const navigate = useNavigate();
  const [getOpen, setGetOpen] = useState(false);

  const handleViewDetails = () => {
    navigate(
      `/pathways/${reaction.pathwayId ?? 'unknown'}/biocatalyst/${reaction.reactionId ?? 'unknown'}`,
      { state: { reaction: { ...reaction, enzyme, label: 'Biocatalyst found' as const } } },
    );
  };

  return (
    <div className={cn(
      'rounded-xl border transition-colors',
      expanded
        ? 'border-primary/40 bg-muted/30'
        : 'border-border bg-muted/20 hover:bg-muted/30',
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

        <span className={cn('shrink-0 text-sm font-mono font-bold', scoreColor(enzyme.score))}>
          {Math.round(enzyme.score * 100)}%
        </span>

        {expanded
          ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
          : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
      </button>

      {/* Expanded body */}
      {expanded && (
        <div className="px-4 pb-4 pt-3 space-y-4 border-t border-border/50">

          {/* Kinetics grid */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: <Droplets className="w-3.5 h-3.5" />,    label: 'Optimal pH',   value: enzyme.optimalPh },
              { icon: <Thermometer className="w-3.5 h-3.5" />, label: 'Optimal Temp', value: enzyme.optimalTemp },
              { icon: <Activity className="w-3.5 h-3.5" />,    label: 'k_cat',        value: enzyme.kcat },
              { icon: <Target className="w-3.5 h-3.5" />,      label: 'K_m',          value: enzyme.km },
            ].map(({ icon, label, value }) => (
              <div key={label} className="flex flex-col gap-1.5 rounded-lg p-3 bg-muted/50 border border-border">
                <span className="text-muted-foreground">{icon}</span>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
                  <p className="text-sm font-mono font-semibold text-foreground">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Projected yield */}
          <div className="flex items-center gap-3 rounded-lg bg-primary/10 border border-primary/20 p-3">
            <TrendingUp className="w-4 h-4 text-primary shrink-0" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Projected Yield</p>
              <p className="text-xl font-bold font-mono text-foreground">{enzyme.projectedYield}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 flex-1"
              onClick={() => setGetOpen(true)}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Get Enzyme
            </Button>
            <Button
              size="sm"
              className="gap-1.5 flex-1 font-semibold"
              style={{ background: '#10B981', color: '#fff' }}
              onClick={handleViewDetails}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              View Details
            </Button>
          </div>
        </div>
      )}

      <GetEnzymeDialog enzyme={enzyme} open={getOpen} onOpenChange={setGetOpen} />
    </div>
  );
};

// ── Reaction header ───────────────────────────────────────────────────────────

const ReactionHeader = ({ substrateSmiles, productSmiles, substrateName, productName }: {
  substrateSmiles: string; productSmiles: string;
  substrateName: string;   productName: string;
}) => (
  <div className="rounded-xl border border-border bg-muted/20 p-5">
    <div className="flex items-center justify-center gap-6">
      {/* Product (left — what is being made) */}
      <div className="flex flex-col items-center gap-2">
        <MoleculeViewer smiles={productSmiles} width={180} height={130} />
        <span className="text-xs font-medium text-muted-foreground text-center max-w-[180px] truncate">
          {productName}
        </span>
      </div>

      {/* Arrow (← pointing left: product ← substrate) */}
      <div className="flex flex-col items-center gap-1 shrink-0">
        <div className="flex items-center gap-1">
          <div className="w-0 h-0 border-t-4 border-b-4 border-r-6 border-transparent border-r-primary/60" />
          <div className="w-12 h-0.5 bg-primary/60" />
        </div>
        <span className="text-[10px] font-mono text-primary/60 uppercase tracking-widest">biocatalysis</span>
      </div>

      {/* Substrate (right — what you start with) */}
      <div className="flex flex-col items-center gap-2">
        <MoleculeViewer smiles={substrateSmiles} width={180} height={130} />
        <span className="text-xs font-medium text-muted-foreground text-center max-w-[180px] truncate">
          {substrateName}
        </span>
      </div>
    </div>

    <div className="mt-4 rounded-lg bg-muted/60 border border-border px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Reaction SMILES</p>
      <p className="text-xs font-mono text-foreground break-all leading-relaxed">
        {productSmiles} <span className="text-primary font-bold mx-1">{'<<'}</span> {substrateSmiles}
      </p>
    </div>
  </div>
);

// ── Page ──────────────────────────────────────────────────────────────────────

export const TestBiocatalysisPage = () => {
  const navigate   = useNavigate();
  const location   = useLocation();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [bulkOpen, setBulkOpen]     = useState(false);

  const reaction   = (location.state as { reaction: ReactionNodeData } | null)?.reaction;
  const enzyme     = reaction?.enzyme ?? null;
  const confidence = (reaction?.confidence === 'low' ? 'low' : 'medium') as 'medium' | 'low';

  const substrateSmiles = reaction?.substrateSmiles ?? '';
  const productSmiles   = reaction?.productSmiles   ?? '';
  const substrateName   = reaction?.substrateName   ?? 'Substrate';
  const productName     = reaction?.productName     ?? 'Product';

  if (!enzyme || !reaction) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
        No reaction data found. Please navigate here from a pathway node.
      </div>
    );
  }

  // TODO: wire backend — call API with top_k: N to get all candidates
  // top_k: 5 for medium confidence, top_k: 10 for low confidence
  const candidates = buildCandidates(enzyme, confidence);
  const topK       = confidence === 'low' ? 10 : 5;
  const badgeColor = confidence === 'low' ? '#F97316' : '#F59E0B';

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Top bar — back button + badge */}
      <div className="px-6 py-3 border-b border-border flex items-center gap-3 shrink-0">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-1.5 -ml-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1 rounded-full"
            style={{ backgroundColor: badgeColor, color: '#fff' }}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            Test biocatalysis
          </span>
          <span className="text-muted-foreground text-sm font-mono hidden sm:block">
            {substrateName} → {productName}
          </span>
        </div>
      </div>

      {/* Title row — same shell as BiocatalystFoundPage */}
      <div className="px-6 py-4 border-b border-border bg-muted/10 shrink-0">
        <div className="flex items-start gap-3 max-w-2xl mx-auto">
          <div className={cn(
            'mt-0.5 rounded-full p-2 shrink-0',
            confidence === 'medium' ? 'bg-amber-500/15' : 'bg-orange-500/15',
          )}>
            <AlertTriangle className={cn(
              'w-5 h-5',
              confidence === 'medium' ? 'text-amber-500' : 'text-orange-500',
            )} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">
              Test these biocatalyst candidates
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Confidence is{' '}
              <span className={cn(
                'font-semibold',
                confidence === 'medium' ? 'text-amber-500' : 'text-orange-500',
              )}>{confidence}</span>{' '}
              for this reaction. We recommend testing the enzyme candidates below before committing to a synthesis route.
            </p>
          </div>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-6 space-y-6">

          {/* Reaction structural view */}
          <ReactionHeader
            substrateSmiles={substrateSmiles}
            productSmiles={productSmiles}
            substrateName={substrateName}
            productName={productName}
          />

          {/* Bulk action bar */}
          <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/20 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Get all {candidates.length} candidates at once</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Order purified enzyme, gene constructs, or engineering designs for the full ranked list.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 gap-2 border-primary/40 text-primary hover:bg-primary/10 hover:border-primary"
              onClick={() => setBulkOpen(true)}
            >
              <ShoppingCart className="w-4 h-4" />
              Get all
            </Button>
          </div>

          {/* Candidate list */}
          <div className="space-y-3">
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

          {/* Bottom note */}
          <p className="text-[10px] text-muted-foreground/60 text-center pb-2">
            Ranked by AI compatibility score · top_k={topK} · {confidence} confidence
          </p>

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

export default TestBiocatalysisPage;
