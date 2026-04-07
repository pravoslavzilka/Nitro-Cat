import React, { useEffect, useState } from 'react';
import { FlaskConical, Beaker, BookOpen, ExternalLink, Dna, HelpCircle, Shuffle, GitCompareArrows } from 'lucide-react';
import type { Enzyme } from '@/types/enzyme';
import {
  fetchPubChemMolecularWeight,
  fetchUniProtMolecularWeight,
} from '@/lib/api/externalData';
import {
  predictYield,
  type YieldParams,
} from '@/lib/utils/yieldCalculation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// ── Constants ─────────────────────────────────────────────────────────────────
const SUBSTRATE_MASS_UG = 10;        // µg   — m_S
const REACTION_VOLUME_L = 20e-6;     // L    — V  (20 µL)

// ── Types ─────────────────────────────────────────────────────────────────────

export interface YieldCardProps {
  enzyme: Enzyme;
  substrateCid?: number | null;
  productCid?: number | null;
  enzymeMassMg: number;
  accentColor: string;
  onExploreBiocatalysts: () => void;
}

type ReferenceCategory =
  | 'same-substrate'
  | 'similar-substrate'
  | 'different-substrate'
  | 'no-transformation';

interface MockReference {
  title: string;
  firstAuthor: string;
  year: number;
  journal: string;
  doi: string;
  category: ReferenceCategory;
}

const CATEGORY_LABELS: Record<ReferenceCategory, string> = {
  'same-substrate':       'Biocatalytic transformation found on the same substrate',
  'similar-substrate':    'Biocatalytic transformation found on a similar substrate',
  'different-substrate':  'Biocatalytic transformation found on different substrates',
  'no-transformation':    'No biocatalytic transformation found',
};

const CATEGORY_ORDER: ReferenceCategory[] = [
  'same-substrate',
  'similar-substrate',
  'different-substrate',
  'no-transformation',
];

const MOCK_REFERENCES: MockReference[] = [
  {
    title: 'Is it time for biocatalysis in fragment-based drug discovery?',
    firstAuthor: 'Ramsden',
    year: 2020,
    journal: 'Chemical Science',
    doi: 'https://doi.org/10.1039/d0sc04103c',
    category: 'same-substrate',
  },
  {
    title: 'Microbial dl-peptidases enable predator defense and interkingdom competition in Streptomyces',
    firstAuthor: 'Hermenau',
    year: 2024,
    journal: 'Angewandte Chemie International Edition',
    doi: 'https://doi.org/10.1002/anie.202309284',
    category: 'similar-substrate',
  },
  {
    title: 'Biocatalysis in medicinal chemistry: Challenges to access and drivers for adoption',
    firstAuthor: 'Goodwin',
    year: 2019,
    journal: 'ACS Medicinal Chemistry Letters',
    doi: 'https://doi.org/10.1021/acsmedchemlett.9b00410',
    category: 'different-substrate',
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatMass = (grams: number | null): string => {
  if (grams == null || !isFinite(grams) || grams <= 0) return '—';
  const mg = grams * 1000;
  if (mg >= 1) return `${mg.toFixed(2)} mg`;
  return `${(mg * 1000).toFixed(1)} µg`;
};

const formatTimeHours = (seconds: number | null): string => {
  if (seconds == null || !isFinite(seconds) || seconds <= 0) return '—';
  const h = seconds / 3600;
  if (h >= 1) return `${h.toFixed(2)} h`;
  return `${(seconds / 60).toFixed(1)} min`;
};

// ── Component ─────────────────────────────────────────────────────────────────

export const YieldCard = ({
  enzyme,
  substrateCid,
  productCid,
  enzymeMassMg,
  accentColor,
  onExploreBiocatalysts,
}: YieldCardProps) => {
  const [mwE, setMwE] = useState<number | null>(null);
  const [mwS, setMwS] = useState<number | null>(null);
  const [mwP, setMwP] = useState<number | null>(null);
  const [substrateInfoOpen, setSubstrateInfoOpen] = useState(false);
  const [yieldInfoOpen, setYieldInfoOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!enzyme.id || enzyme.id === 'unknown') { setMwE(null); return; }
    fetchUniProtMolecularWeight(enzyme.id).then(v => { if (!cancelled) setMwE(v); });
    return () => { cancelled = true; };
  }, [enzyme.id]);

  useEffect(() => {
    let cancelled = false;
    if (!substrateCid) { setMwS(null); return; }
    fetchPubChemMolecularWeight(substrateCid).then(v => { if (!cancelled) setMwS(v); });
    return () => { cancelled = true; };
  }, [substrateCid]);

  useEffect(() => {
    let cancelled = false;
    if (!productCid) { setMwP(null); return; }
    fetchPubChemMolecularWeight(productCid).then(v => { if (!cancelled) setMwP(v); });
    return () => { cancelled = true; };
  }, [productCid]);

  const kcat: number | null = null;
  const km:   number | null = null;

  const params: YieldParams | null =
    (mwE && mwS && mwP && kcat != null && km != null)
      ? {
          mwE,
          mwS,
          mwP,
          kcat,
          km,
          mE: enzymeMassMg * 1e-3,
          mS: SUBSTRATE_MASS_UG * 1e-6,
          V:  REACTION_VOLUME_L,
        }
      : null;

  const prediction = params ? predictYield(params) : null;

  // ── UI ──
  return (
    <div className="w-full rounded-xl border border-border bg-muted/20 px-7 py-8">

      <div className="grid grid-cols-1 md:grid-cols-[calc(16.67%_+_1cm)_calc(16.67%_+_1cm)_1fr_1fr] gap-5 min-h-[280px]">

        {/* ── 1. REACTION CONDITIONS ─────────────────────────────────────── */}
        <section className="flex flex-col gap-3 md:border-r md:border-border/50 md:pr-4">
          <header className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4" style={{ color: accentColor }} />
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Reaction conditions
            </h3>
            <button
              type="button"
              onClick={() => setSubstrateInfoOpen(true)}
              className="ml-auto shrink-0 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="About substrate mass needed"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </header>
          <dl className="flex flex-col gap-2">
            {([
              { label: 'substrate mass needed', value: `${SUBSTRATE_MASS_UG} µg`,        placeholder: false },
              { label: 'temperature',           value: enzyme.optimalTemp || '—',         placeholder: !enzyme.optimalTemp },
              { label: 'pH',                    value: enzyme.optimalPh   || '—',         placeholder: !enzyme.optimalPh   },
              { label: 'time',                  value: formatTimeHours(prediction?.timeS ?? null), placeholder: !prediction },
              { label: 'solvent',               value: <span>H<sub>2</sub>O<sub>2</sub></span>, placeholder: false        },
              { label: 'co-factors',            value: 'not needed',                      placeholder: false               },
            ] as { label: string; value: React.ReactNode; placeholder: boolean }[]).map(({ label, value, placeholder }) => (
              <div
                key={label}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-muted/40 border border-border/40"
              >
                <dt className="text-sm text-muted-foreground">
                  {label}
                </dt>
                <dd
                  className="text-sm font-mono font-semibold"
                  style={{ color: placeholder ? undefined : accentColor }}
                >
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ── 2. PREDICTED YIELD ────────────────────────────────────────── */}
        <section className="space-y-3 md:border-r md:border-border/50 md:px-4 flex flex-col">
          <header className="flex items-center gap-2">
            <Beaker className="w-4 h-4" style={{ color: accentColor }} />
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Predicted yield
            </h3>
            <button
              type="button"
              onClick={() => setYieldInfoOpen(true)}
              className="ml-auto shrink-0 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="About predicted yield"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </header>
          <p className="text-xs text-muted-foreground/70 leading-snug">
            for biocatalysts expected to catalyze your desired transformation
          </p>
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            {prediction ? (
              <>
                <p className="text-3xl font-bold font-mono leading-tight" style={{ color: accentColor }}>
                  {formatMass(prediction.massProductG * 0.55)}
                  <span className="mx-2 text-muted-foreground/50">–</span>
                  {formatMass(prediction.massProductG * 0.95)}
                </p>
                <p className="text-[11px] text-muted-foreground/60 mt-1">
                  20th – 80th percentile
                </p>
              </>
            ) : (
              <p className="text-3xl font-bold font-mono text-muted-foreground/30">—</p>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              of product at 99% conversion under optimal conditions
            </p>
          </div>
        </section>

        {/* ── 3. SIMILAR TRANSFORMATIONS ────────────────────────────────── */}
        <section className="flex flex-col gap-3 md:border-r md:border-border/50 md:px-5">
          <header className="flex items-center gap-2">
            <GitCompareArrows className="w-4 h-4" style={{ color: accentColor }} />
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Similar transformations
            </h3>
          </header>
        </section>

        {/* ── 4. REFERENCES ─────────────────────────────────────────────── */}
        <section className="flex flex-col gap-3 md:pl-5">
          <header className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" style={{ color: accentColor }} />
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              References
            </h3>
          </header>
          <p className="text-sm font-semibold leading-snug" style={{ color: accentColor }}>
            {CATEGORY_LABELS['same-substrate']}
          </p>
          <ul
            className={[
              'space-y-3 pr-1',
              MOCK_REFERENCES.length > 5 ? 'overflow-y-auto max-h-[280px]' : '',
            ].join(' ')}
          >
            {MOCK_REFERENCES.map((ref, i) => (
              <li key={i}>
                <a
                  href={ref.doi}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 group"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground leading-snug group-hover:text-primary transition-colors">
                      "{ref.title}"
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {ref.firstAuthor} et al. ({ref.year}) · {ref.journal}
                    </p>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 mt-0.5 shrink-0 text-muted-foreground/60 group-hover:text-primary transition-colors" />
                </a>
              </li>
            ))}
          </ul>
        </section>

      </div>

      {/* ── Substrate info dialog ─────────────────────────────────────────── */}
      <Dialog open={substrateInfoOpen} onOpenChange={setSubstrateInfoOpen}>
        <DialogContent className="max-w-sm rounded-xl" style={{ background: 'var(--bg-elevated)' }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-primary" />
              Substrate amount per well
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>
              <span className="font-semibold text-foreground">10 µg</span> of substrate per well is recommended to ensure reliable detection of your desired transformation, even at low yields or under suboptimal conditions.
            </p>
            <p>
              This produces at least <span className="font-semibold text-foreground">1 µg of product</span> in a 20 µL volume, allowing you to inject 2 µL (100 ng) into LC-MS while staying well above the detection limit.
            </p>
            <p>
              This enables you to clearly determine whether the transformation occurred. If successful, you can optimize further. If not, you can confidently conclude that the biocatalyst cannot perform the desired reaction on your substrate.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Predicted yield info dialog ───────────────────────────────────── */}
      <Dialog open={yieldInfoOpen} onOpenChange={setYieldInfoOpen}>
        <DialogContent className="max-w-sm rounded-xl" style={{ background: 'var(--bg-elevated)' }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Beaker className="w-4 h-4 text-primary" />
              Predicted Yield
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>
              Shows the <span className="font-semibold text-foreground">20th–80th percentile</span> of reported yields for enzymes in your kit that have recorded kinetic parameters on any substrates.
            </p>
            <p>
              Part of biocatalysts in your custom kit give <span className="font-semibold text-foreground">no yield</span>, indicating they do not accept your substrate. Among those that do show activity, most will give lower yields, while only a few will display higher predicted yields — these are the best candidates for further optimization and scale-up.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Bottom action ─────────────────────────────────────────────────── */}
      <div className="mt-7 pt-5 border-t border-border/50">
        <button
          type="button"
          onClick={onExploreBiocatalysts}
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm font-semibold transition-all cursor-pointer"
          style={{ background: 'var(--primary-500)', color: '#fff', boxShadow: '0 2px 12px 0 rgba(16,185,129,0.25)' }}
        >
          <Dna className="w-4 h-4" />
          Explore selected biocatalysts
        </button>
      </div>
    </div>
  );
};
