import { Component, lazy, Suspense, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { MoleculeViewer } from "@/components/molecule/MoleculeViewer";
import {
  ArrowLeft, ArrowRight, Upload, Download, CheckCircle2, FlaskConical, FileText,
  Dna, Check, X, TrendingUp, ShoppingCart, Droplets, Thermometer, Activity, Target,
  PencilLine, ScrollText, Beaker, Clock, AlertTriangle, BookOpen, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatScore, formatConfidenceLabel, transformClipzymeScore } from "@/lib/utils/formatting";
import SmilesDrawer from "smiles-drawer";
import { allExamplePathways } from "@/data/allExamplePathways";
import { addHistoryEntry } from "@/lib/history";
import type { Enzyme } from "@/types/enzyme";
import type { ReactionNodeData } from "@/types/pathway";

const KetcherEditor = lazy(() => import('@/components/reaction/KetcherEditor'));

// ── Error boundary ────────────────────────────────────────────────────────────

class RenderGuard extends Component<{ children: ReactNode; fallback: ReactNode }, { caught: boolean }> {
  state = { caught: false };
  static getDerivedStateFromError() { return { caught: true }; }
  componentDidCatch() {}
  render() { return this.state.caught ? this.props.fallback : this.props.children; }
}

// ── Enzyme lookup ─────────────────────────────────────────────────────────────

const ACETOPHENONE     = 'CC(=O)c1ccccc1';
const R_PHENYLETHANOL  = 'C[C@@H](O)c1ccccc1';
const COMPOUND3   = 'C#C[C@]1(CO)[C@@H](O)C[C@@H](OP(=O)(O)O)O1';
const COMPOUND4   = 'C#C[C@]1(COP(=O)(O)O)[C@@H](O)C[C@@H](O)O1';
const AMINO_KETONE   = 'CC(=O)CCc1cccc(N)c1';
const CHIRAL_ALCOHOL = 'C[C@@H](O)CCc1cccc(N)c1';

const DEFAULT_ENZYME: Enzyme = {
  id: 'th-rd38b',
  name: 'Tyrosine Hydroxylase (variant TH-Rd38B)',
  ecNumber: 'EC 1.14.16.2',
  organism: 'E. coli (engineered)',
  score: 0.91,
  description: '',
  optimalPh: '7.2',
  optimalTemp: '34°C',
  kcat: '18.4 s⁻¹',
  km: '0.31 mM',
  projectedYield: '88%',
  vendor: '',
  vendorLogo: '',
  catalogNumber: '',
  price: '$310 / 10mg',
};

function getEnzymeForSubstrate(smiles: string): Enzyme {
  const cannabinoid      = allExamplePathways.find(p => p.id === 'example-cannabinoid');
  const islatravir       = allExamplePathways.find(p => p.id === 'example-islatravir');
  const chemoEnzymatic   = allExamplePathways.find(p => p.id === 'example-chemoenzymatic');

  const pick = (pathway: typeof cannabinoid, nodeId: string): Enzyme | null => {
    const node = pathway?.nodes.find(n => n.id === nodeId);
    return node ? ((node.data as ReactionNodeData).enzyme ?? null) : null;
  };

  const s = smiles.trim();
  if (s === ACETOPHENONE) return DEFAULT_ENZYME; // backend will handle this
  if (s === COMPOUND3)   return pick(islatravir,     'r2') ?? DEFAULT_ENZYME;
  if (s === AMINO_KETONE) return pick(chemoEnzymatic, 'r3') ?? DEFAULT_ENZYME;
  return DEFAULT_ENZYME;
}

// ── Example data ──────────────────────────────────────────────────────────────

// Pre-converted MOL V2000 strings for use in the Kekule structure editor
// (Kekule can write SMILES but only reads MOL natively)
const MOL: Record<string, string> = {
  ACETOPHENONE: "\n     RDKit          2D\n\n  9  9  0  0  0  0  0  0  0  0999 V2000\n    2.5833   -1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.8333    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.5833    1.2990    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    0.3333   -0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -0.4167   -1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -1.9167   -1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -2.6667    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -1.9167    1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -0.4167    1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0\n  2  3  2  0\n  2  4  1  0\n  4  5  2  0\n  5  6  1  0\n  6  7  2  0\n  7  8  1  0\n  8  9  2  0\n  9  4  1  0\nM  END\n",
  R_PHENYLETHANOL: "\n     RDKit          2D\n\n  9  9  0  0  0  0  0  0  0  0999 V2000\n    2.5833   -1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.8333    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.5833    1.2990    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    0.3333   -0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -0.4167   -1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -1.9167   -1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -2.6667    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -1.9167    1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -0.4167    1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n  2  1  1  6\n  2  3  1  0\n  2  4  1  0\n  4  5  2  0\n  5  6  1  0\n  6  7  2  0\n  7  8  1  0\n  8  9  2  0\n  9  4  1  0\nM  END\n",
  COMPOUND3: "\n     RDKit          2D\n\n 15 15  0  0  0  0  0  0  0  0999 V2000\n    4.4193    1.0120    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    3.0691    0.3585    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.7190   -0.2950    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.5100   -1.5695    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.8018   -2.8918    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.2102    1.1160    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.0527    2.3571    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n   -0.2891    1.0682    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -0.7068   -0.3724    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -2.1179   -0.8812    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n   -3.2641    0.0864    0.0000 P   0  0  0  0  0  0  0  0  0  0  0  0\n   -4.2317   -1.0598    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n   -2.2965    1.2325    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n   -4.4103    1.0540    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    0.5342   -1.2150    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  3  0\n  3  2  1  1\n  3  4  1  0\n  4  5  1  0\n  3  6  1  0\n  6  7  1  6\n  6  8  1  0\n  8  9  1  0\n  9 10  1  6\n 10 11  1  0\n 11 12  2  0\n 11 13  1  0\n 11 14  1  0\n  9 15  1  0\n 15  3  1  0\nM  END\n",
  COMPOUND4: "\n     RDKit          2D\n\n 15 15  0  0  0  0  0  0  0  0999 V2000\n    1.3499   -3.3001    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.1412   -1.8147    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.9324   -0.3293    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -0.5230   -0.6921    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -1.5650    0.3869    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n   -3.0204    0.0241    0.0000 P   0  0  0  0  0  0  0  0  0  0  0  0\n   -3.3833    1.4795    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n   -2.6576   -1.4314    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n   -4.4759   -0.3387    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    2.4315   -0.2770    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    3.3550   -1.4590    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8450    1.1649    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.6015    2.0037    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.5492    3.5028    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    0.4195    1.0803    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  3  0\n  3  2  1  1\n  3  4  1  0\n  4  5  1  0\n  5  6  1  0\n  6  7  2  0\n  6  8  1  0\n  6  9  1  0\n  3 10  1  0\n 10 11  1  6\n 10 12  1  0\n 12 13  1  0\n 13 14  1  6\n 13 15  1  0\n 15  3  1  0\nM  END\n",
  AMINO_KETONE: "\n     RDKit          2D\n\n 12 12  0  0  0  0  0  0  0  0999 V2000\n   -4.6788    0.8925    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -3.5433   -0.0877    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -3.8243   -1.5611    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n   -2.1267    0.4057    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -0.9912   -0.5745    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.4253   -0.0811    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7064    1.3923    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1230    1.8856    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    3.2585    0.9055    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.9774   -0.5679    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    4.1129   -1.5480    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    1.5608   -1.0612    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0\n  2  3  2  0\n  2  4  1  0\n  4  5  1  0\n  5  6  1  0\n  6  7  2  0\n  7  8  1  0\n  8  9  2  0\n  9 10  1  0\n 10 11  1  0\n 10 12  2  0\n 12  6  1  0\nM  END\n",
  CHIRAL_ALCOHOL: "\n     RDKit          2D\n\n 12 12  0  0  0  0  0  0  0  0999 V2000\n   -4.6788    0.8925    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -3.5433   -0.0877    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -3.8243   -1.5611    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n   -2.1267    0.4057    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -0.9912   -0.5745    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.4253   -0.0811    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7064    1.3923    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.1230    1.8856    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    3.2585    0.9055    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.9774   -0.5679    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    4.1129   -1.5480    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    1.5608   -1.0612    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n  2  1  1  6\n  2  3  1  0\n  2  4  1  0\n  4  5  1  0\n  5  6  1  0\n  6  7  2  0\n  7  8  1  0\n  8  9  2  0\n  9 10  1  0\n 10 11  1  0\n 10 12  2  0\n 12  6  1  0\nM  END\n",
  CBGA: "\n     RDKit          2D\n\n 23 23  0  0  0  0  0  0  0  0999 V2000\n   -8.1122   -1.1385    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n   -6.6644   -1.5306    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -6.2800   -2.9805    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n   -5.6009   -0.4727    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -4.1531   -0.8648    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -3.0896    0.1930    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -3.4739    1.6429    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -4.9218    2.0350    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n   -2.4105    2.7008    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -0.9626    2.3087    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.1009    3.3665    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n   -0.5782    0.8588    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.8696    0.4667    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.2540   -0.9832    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.7018   -1.3753    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    3.0862   -2.8252    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    3.7653   -0.3175    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    5.2132   -0.7096    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    6.2766    0.3483    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    7.7245   -0.0438    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    8.7880    1.0140    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    8.1089   -1.4937    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -1.6417   -0.1991    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0\n  2  3  2  0\n  2  4  1  0\n  4  5  1  0\n  5  6  1  0\n  6  7  2  0\n  7  8  1  0\n  7  9  1  0\n  9 10  2  0\n 10 11  1  0\n 10 12  1  0\n 12 13  1  0\n 13 14  1  0\n 14 15  2  3\n 15 16  1  0\n 15 17  1  0\n 17 18  1  0\n 18 19  1  0\n 19 20  2  0\n 20 21  1  0\n 20 22  1  0\n 12 23  2  0\n 23  6  1  0\nM  END\n",
};

const SUBSTRATE_EXAMPLES = [
  { label: 'Acetophenone',  smiles: ACETOPHENONE,    mol: MOL.ACETOPHENONE    },
  { label: 'Amino ketone',  smiles: AMINO_KETONE,    mol: MOL.AMINO_KETONE    },
  { label: 'Compound 3',    smiles: COMPOUND3,       mol: MOL.COMPOUND3       },
];

const PRODUCT_EXAMPLES = [
  { label: '(R)-1-Phenylethanol', smiles: R_PHENYLETHANOL, mol: MOL.R_PHENYLETHANOL },
  { label: 'CBGA',                smiles: 'OC(=O)CCc1c(O)cc(O)c(CC=C(C)CCC=C(C)C)c1', mol: MOL.CBGA },
  { label: 'Compound 4',          smiles: COMPOUND4,        mol: MOL.COMPOUND4        },
];

const EXAMPLE_PAIRS = [
  { label: 'Acetophenone → (R)-1-Phenylethanol', shortLabel: 'Acetophenone → Phenylethanol', substrate: ACETOPHENONE, subMol: MOL.ACETOPHENONE, product: R_PHENYLETHANOL, prodMol: MOL.R_PHENYLETHANOL },
  { label: 'Compound 3 → Compound 4',               shortLabel: 'Compound 3 → 4',      substrate: COMPOUND3,       subMol: MOL.COMPOUND3,       product: COMPOUND4,       prodMol: MOL.COMPOUND4       },
  { label: 'Amino ketone → Chiral alcohol',         shortLabel: 'Amino ketone → Chiral', substrate: AMINO_KETONE,  subMol: MOL.AMINO_KETONE,    product: CHIRAL_ALCOHOL,  prodMol: MOL.CHIRAL_ALCOHOL  },
];

const REACTION_EXAMPLES = [
  {
    label: 'Acetophenone → (R)-1-Phenylethanol',
    substrate: ACETOPHENONE,
    product: R_PHENYLETHANOL,
  },
  {
    label: 'Compound 3 → Compound 4',
    substrate: COMPOUND3,
    product: COMPOUND4,
  },
  {
    label: 'Amino ketone → Chiral alcohol',
    substrate: AMINO_KETONE,
    product: CHIRAL_ALCOHOL,
  },
];

// ── Validation ────────────────────────────────────────────────────────────────

function validateInput(value: string, onResult: (valid: boolean) => void) {
  const trimmed = value.trim();
  if (!trimmed) { onResult(false); return; }
  SmilesDrawer.parse(trimmed, () => onResult(true), () => onResult(false));
}

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
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-sm font-mono font-semibold shrink-0',
      labelStyles[label]
    )}>
      {formatScore(score)}
      <span className="font-normal opacity-80">confidence</span>
    </span>
  );
};

// ── Sub-components ────────────────────────────────────────────────────────────

const ExampleChip = ({ label, onClick }: { label: string; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="text-xs bg-muted hover:bg-muted/80 border border-border rounded-full px-3 py-1 font-mono cursor-pointer transition-colors"
  >
    {label}
  </button>
);

const ValidityBadge = ({ valid }: { valid: boolean | null }) => {
  if (valid === null) return null;
  return valid ? (
    <span className="inline-flex items-center gap-1 text-xs font-mono" style={{ color: 'var(--success-600)' }}>
      <Check className="w-3 h-3" /> valid
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-xs font-mono text-destructive">
      <X className="w-3 h-3" /> invalid
    </span>
  );
};

const KetcherFallback = () => (
  <div className="rounded-xl border border-border bg-muted/30 flex items-center justify-center h-72 text-sm text-muted-foreground">
    Loading editor…
  </div>
);

const SmilesColumn = ({
  label,
  value,
  valid,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  valid: boolean | null;
  onChange: (v: string) => void;
  placeholder: string;
}) => (
  <div className="flex flex-col gap-3 flex-1 min-w-0">
    <div className="flex items-center justify-between mb-2">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <ValidityBadge valid={value.trim() ? valid : null} />
    </div>
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={3}
      className={cn(
        'font-mono text-sm resize-none transition-colors',
        value.trim() && valid === false && 'border-destructive focus-visible:ring-destructive/30'
      )}
    />
    <div className="bg-muted/30 rounded-xl p-3 flex items-center justify-center min-h-[196px]">
      {value.trim().length >= 2 ? (
        <RenderGuard fallback={<p className="text-xs text-muted-foreground italic">Could not render structure</p>}>
          <MoleculeViewer key={value} smiles={value} width={260} height={180} />
        </RenderGuard>
      ) : (
        <p className="text-xs text-muted-foreground italic">Enter SMILES to preview</p>
      )}
    </div>
  </div>
);

// ── Find Enzymes button ───────────────────────────────────────────────────────

const FindEnzymesButton = ({ active, loading, onClick }: { active: boolean; loading?: boolean; onClick: () => void }) => (
  <div className="flex justify-center">
    <button
      type="button"
      onClick={onClick}
      disabled={!active || loading}
      className={cn(
        'inline-flex items-center gap-2 px-8 py-3 rounded-xl text-base font-semibold transition-all',
        (active && !loading) ? 'cursor-pointer font-bold' : 'cursor-not-allowed opacity-50'
      )}
      style={
        active
          ? { background: 'var(--primary-500)', color: '#fff', boxShadow: '0 2px 12px 0 rgba(16,185,129,0.25)' }
          : { border: '2px solid var(--border-default)', background: 'var(--bg-secondary)', color: 'var(--text-muted)' }
      }
    >
      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Dna className="w-5 h-5" />}
      {loading ? 'Searching…' : 'Find Biocatalyst'}
    </button>
  </div>
);

// ── Protocol data ─────────────────────────────────────────────────────────────

const MW_TABLE: Record<string, { mw: number; name: string }> = {
  'CCCCCC(=O)O':                                        { mw: 116.16, name: 'Hexanoic acid' },
  'OC(=O)c1cc(O)cc(O)c1CCCCC':                         { mw: 210.23, name: 'Olivetolic acid' },
  'OC(=O)CCc1c(O)cc(O)c(CC=C(C)CCC=C(C)C)c1':         { mw: 360.45, name: 'CBGA' },
  'C#C[C@]1(CO)[C@@H](O)C[C@@H](OP(=O)(O)O)O1':       { mw: 254.22, name: 'Compound 3' },
  'C#C[C@]1(COP(=O)(O)O)[C@@H](O)C[C@@H](O)O1':       { mw: 254.22, name: 'Compound 4' },
  'CC(=O)CCc1cccc(N)c1':                                { mw: 177.24, name: '4-(3-Aminophenyl)butan-2-one' },
  'C[C@@H](O)CCc1cccc(N)c1':                            { mw: 179.26, name: '(R)-4-(3-Aminophenyl)butan-2-ol' },
};

function calcYieldGrams(substrateSMILES: string, productSMILES: string, yieldPct: number, startGrams = 1): string {
  const sub  = MW_TABLE[substrateSMILES.trim()];
  const prod = MW_TABLE[productSMILES.trim()];
  if (!sub || !prod) return '~0.8 g (estimated)';
  const mmol = (startGrams * 1000) / sub.mw;
  const productGrams = (mmol * (yieldPct / 100) * prod.mw) / 1000;
  return `${productGrams.toFixed(2)} g`;
}

// ── Protocol modal ────────────────────────────────────────────────────────────

const SectionHeading = ({ children }: { children: ReactNode }) => (
  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 mt-5 first:mt-0">{children}</p>
);

const ProtocolRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-baseline justify-between py-1.5 border-b border-border/50 last:border-0">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="text-sm font-mono font-medium text-foreground">{value}</span>
  </div>
);

const ProtocolModal = ({
  open, onClose, substrate, product, enzyme,
}: {
  open: boolean;
  onClose: () => void;
  substrate: string;
  product: string;
  enzyme: Enzyme;
}) => {
  const yieldPct = parseFloat(enzyme.projectedYield.replace('%', '')) || 85;
  const subInfo  = MW_TABLE[substrate.trim()];
  const prodInfo = MW_TABLE[product.trim()];
  const yieldGrams = calcYieldGrams(substrate, product, yieldPct);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}>
        <DialogHeader>
          <div className="flex flex-wrap items-start gap-3">
            <DialogTitle className="text-xl font-bold">Reaction Protocol</DialogTitle>
            <Badge variant="secondary" className="font-mono text-xs shrink-0">{enzyme.name}</Badge>
          </div>
        </DialogHeader>

        {/* Scale banner */}
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mt-1">
          <div className="flex items-center gap-2 mb-2">
            <Beaker className="w-4 h-4 shrink-0" style={{ color: 'var(--primary-500)' }} />
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--primary-600)' }}>
              Scale calculation · 1 g substrate
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            {[
              { label: 'Substrate',  value: subInfo  ? `${subInfo.mw} g/mol`  : 'Unknown' },
              { label: 'Product',    value: prodInfo ? `${prodInfo.mw} g/mol`  : 'Unknown' },
              { label: 'Yield',      value: enzyme.projectedYield },
              { label: 'Product out', value: yieldGrams },
            ].map(({ label, value }) => (
              <div key={label} className="bg-background rounded-lg p-2 border border-primary/10">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
                <p className="text-sm font-mono font-semibold text-foreground mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Reagents */}
        <SectionHeading>Reagents &amp; Materials</SectionHeading>
        <div className="rounded-lg border border-border overflow-hidden">
          {[
            { label: subInfo?.name ?? 'Substrate',    value: '1.00 g (starting material)' },
            { label: enzyme.name,                      value: '5 mg · enzyme loading 0.5 mol%' },
            { label: 'NADPH (cofactor)',               value: '10 mM · sodium salt' },
            { label: 'Glucose-6-phosphate (GDH cycle)', value: '20 mM' },
            { label: 'Glucose dehydrogenase (GDH)',    value: '2 U/mL' },
            { label: 'Potassium phosphate buffer',     value: `100 mM · pH ${enzyme.optimalPh}` },
            { label: 'Total reaction volume',          value: '50 mL' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-baseline justify-between px-3 py-2 border-b border-border/50 last:border-0 even:bg-muted/50">
              <span className="text-sm text-foreground">{label}</span>
              <span className="text-xs font-mono text-muted-foreground ml-4 text-right">{value}</span>
            </div>
          ))}
        </div>

        {/* Procedure */}
        <SectionHeading>Procedure</SectionHeading>
        <ol className="space-y-2 text-sm text-foreground">
          {[
            `Prepare 100 mM potassium phosphate buffer, pH ${enzyme.optimalPh}. Degas with N₂ for 10 min.`,
            `Dissolve substrate (1.00 g) in 2 mL DMSO, then dilute into 45 mL buffer. Final DMSO ≤ 4% v/v.`,
            `Add NADPH (10 mM final), glucose-6-phosphate (20 mM), and GDH (2 U/mL). Mix gently.`,
            `Add ${enzyme.name} (5 mg). Adjust pH to ${enzyme.optimalPh} if necessary.`,
            `Incubate at ${enzyme.optimalTemp}, 200 rpm orbital shaking, for 4–6 h. Monitor conversion by TLC or HPLC every 90 min.`,
            `Quench with equal volume EtOAc. Centrifuge 5 min at 3000 × g to break emulsion.`,
            `Collect organic layer. Back-extract aqueous phase twice with EtOAc (2 × 20 mL). Combine organics.`,
            `Wash combined organics with brine (20 mL), dry over MgSO₄, filter, and evaporate in vacuo.`,
            `Purify by silica gel chromatography (hexane/EtOAc gradient). Expected yield: ${enzyme.projectedYield} → ${yieldGrams} product.`,
          ].map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="shrink-0 w-5 h-5 rounded-full bg-primary/15 text-[11px] font-mono font-semibold flex items-center justify-center" style={{ color: 'var(--primary-600)' }}>
                {i + 1}
              </span>
              <span className="leading-relaxed text-muted-foreground">{step}</span>
            </li>
          ))}
        </ol>

        {/* Reaction conditions */}
        <SectionHeading>Reaction Conditions</SectionHeading>
        <div className="rounded-lg border border-border overflow-hidden">
          {[
            { label: 'Temperature',      value: enzyme.optimalTemp },
            { label: 'pH',               value: enzyme.optimalPh },
            { label: 'Agitation',        value: '200 rpm orbital shaker' },
            { label: 'Atmosphere',       value: 'N₂ (anaerobic preferred)' },
            { label: 'Reaction time',    value: '4–6 h (HPLC-monitored)' },
            { label: 'k_cat',            value: enzyme.kcat },
            { label: 'K_m (substrate)',  value: enzyme.km },
          ].map(({ label, value }) => (
            <ProtocolRow key={label} label={label} value={value} />
          ))}
        </div>

        {/* Analytical */}
        <SectionHeading>Analytical Monitoring</SectionHeading>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {[
            { icon: <Clock className="w-3.5 h-3.5" />, title: 'HPLC', body: 'C18 reverse-phase, 5 µm, 4.6 × 150 mm. Gradient: 10 → 90% MeCN / 0.1% TFA. Flow 1.0 mL/min. UV 254 nm.' },
            { icon: <Activity className="w-3.5 h-3.5" />, title: 'TLC', body: 'Silica 60 F₂₅₄. EtOAc/hexane 3:7. Visualise UV 254 nm + KMnO₄ stain.' },
            { icon: <BookOpen className="w-3.5 h-3.5" />, title: 'ee / Chiral HPLC', body: 'Chiralpak IA-3, 0.46 cm × 25 cm. Hexane/IPA 95:5, 0.8 mL/min.' },
            { icon: <Target className="w-3.5 h-3.5" />, title: 'Conversion target', body: '≥ 95% by HPLC peak area before workup.' },
          ].map(({ icon, title, body }) => (
            <div key={title} className="rounded-lg bg-muted/60 border border-border p-3">
              <div className="flex items-center gap-1.5 mb-1 text-foreground font-medium">
                {icon}{title}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{body}</p>
            </div>
          ))}
        </div>

        {/* Safety */}
        <SectionHeading>Safety &amp; Handling</SectionHeading>
        <div className="rounded-xl border border-warning-500/40 bg-warning-50 dark:bg-warning-100/20 p-3 flex gap-3">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-warning-600" />
          <ul className="text-xs text-muted-foreground space-y-1 leading-relaxed">
            <li>Handle enzyme powder under N₂; avoid prolonged air exposure (activity loss).</li>
            <li>DMSO penetrates skin — wear nitrile gloves and eye protection at all times.</li>
            <li>Dispose of organic solvent waste per institutional solvent waste procedures.</li>
            <li>This protocol is a mock template for demonstration; verify against your safety guidelines before use.</li>
          </ul>
        </div>

        <p className="text-[10px] text-muted-foreground/60 text-center mt-2">
          Generated by nitroAI · Mock protocol · {enzyme.ecNumber}
        </p>
      </DialogContent>
    </Dialog>
  );
};

// ── Result view ───────────────────────────────────────────────────────────────

const truncateSMILES = (s: string, max = 18) =>
  s.length > max ? s.slice(0, max) + '…' : s;

const ResultView = ({
  substrate,
  product,
  enzyme,
  onBack,
}: {
  substrate: string;
  product: string;
  enzyme: Enzyme;
  onBack: () => void;
}) => {
  const [protocolOpen, setProtocolOpen] = useState(false);
  return (
  <div className="max-w-3xl mx-auto space-y-8 p-6">
    <div className="mb-8">
      <div className="flex items-start gap-4 mb-2">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5 -ml-2 shrink-0">
          <ArrowLeft className="w-4 h-4" />
          Back to input
        </Button>
      </div>
      <h1 className="text-2xl font-bold text-foreground">Enzyme Suggestion</h1>
      <p className="text-sm text-muted-foreground mt-1 font-mono">
        {truncateSMILES(substrate)} → {truncateSMILES(product)}
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left: identity + kinetics */}
      <div className="space-y-5">
        <div>
          <h2 className="text-2xl font-bold text-foreground leading-tight">{enzyme.name}</h2>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="text-sm font-mono bg-muted border border-border px-2 py-0.5 rounded">
              {enzyme.ecNumber}
            </span>
            <span className="text-sm font-mono bg-muted border border-border px-2 py-0.5 rounded text-muted-foreground">
              {enzyme.organism}
            </span>
          </div>
          <div className="mt-3">
            <ConfidenceBadge score={enzyme.score} />
          </div>
        </div>
        <div className="border-t border-border" />
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Kinetic Parameters
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: <Droplets className="w-4 h-4" />,    label: 'Optimal pH',   value: enzyme.optimalPh   },
              { icon: <Thermometer className="w-4 h-4" />, label: 'Optimal Temp', value: enzyme.optimalTemp },
              { icon: <Activity className="w-4 h-4" />,    label: 'k_cat',        value: enzyme.kcat        },
              { icon: <Target className="w-4 h-4" />,      label: 'K_m',          value: enzyme.km          },
            ].map(({ icon, label, value }) => (
              <div key={label} className="flex flex-col gap-1.5 rounded-lg p-3 bg-muted/50 border border-border">
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

      {/* Right: yield + actions */}
      <div className="space-y-4">
        <div
          className="flex items-center gap-3 rounded-xl p-4"
          style={{ background: 'var(--primary-50)', border: '1px solid var(--primary-100)' }}
        >
          <TrendingUp className="w-5 h-5 shrink-0" style={{ color: 'var(--primary-500)' }} />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Projected Yield
            </p>
            <p className="text-3xl font-bold font-mono text-foreground">{enzyme.projectedYield}</p>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <Button
            variant="outline"
            size="lg"
            className="w-full gap-2"
            onClick={() => window.open('#', '_blank')}
          >
            <ShoppingCart className="w-4 h-4" />
            Buy · {enzyme.price}
          </Button>
          <button
            type="button"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-base font-semibold text-white glow-green-sm transition-colors"
            style={{ background: '#1a7a4a' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#155f3a')}
            onMouseLeave={e => (e.currentTarget.style.background = '#1a7a4a')}
          >
            <FlaskConical className="w-4 h-4" />
            Test with Nitroduck
          </button>
          <Button
            variant="outline"
            className="w-full gap-2 mt-2"
            onClick={() => setProtocolOpen(true)}
          >
            <ScrollText className="w-4 h-4" />
            View Protocol
          </Button>
        </div>
      </div>
    </div>
    <ProtocolModal
      open={protocolOpen}
      onClose={() => setProtocolOpen(false)}
      substrate={substrate}
      product={product}
      enzyme={enzyme}
    />
  </div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────

type View = 'select' | 'input' | 'result';
type Mode = 'smiles' | 'rxn' | 'draw';

export const NewReactionPage = () => {
  const navigate     = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [view, setView]     = useState<View>('select');
  const [visible, setVisible] = useState(true);
  const [mode, setMode]     = useState<Mode>('smiles');
  const [substrateSmiles, setSubstrate] = useState('');
  const [productSmiles, setProduct]     = useState('');
  const [substrateValid, setSubstrateValid] = useState<boolean | null>(null);
  const [productValid, setProductValid]     = useState<boolean | null>(null);
  const [rxnFile, setRxnFile] = useState<File | null>(null);
  const [subLoadTrigger,  setSubLoadTrigger]  = useState<{ molfile?: string; smiles?: string; key: number } | undefined>(undefined);
  const [prodLoadTrigger, setProdLoadTrigger] = useState<{ molfile?: string; smiles?: string; key: number } | undefined>(undefined);
  const [subMolfile, setSubMolfile] = useState<string>('');
  const firstMount = useRef(true);
  const [resultEnzyme, setResultEnzyme] = useState<Enzyme>(DEFAULT_ENZYME);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  /** Load a substrate + product pair into the two draw editors */
  const loadDrawPair = (subSmiles: string, subMolfile: string, prodSmiles: string, prodMolfile: string) => {
    setSubLoadTrigger(t => ({ molfile: subMolfile,  key: (t?.key ?? 0) + 1 }));
    setProdLoadTrigger(t => ({ molfile: prodMolfile, key: (t?.key ?? 0) + 1 }));
    setSubstrate(subSmiles);
    setProduct(prodSmiles);
  };
  /** Load a single molecule into the substrate editor */
  const loadSubstrateMol = (smiles: string, molfile: string) => {
    setSubLoadTrigger(t => ({ molfile, key: (t?.key ?? 0) + 1 }));
    setSubstrate(smiles);
  };
  /** Load a single molecule into the product editor */
  const loadProductMol = (smiles: string, molfile: string) => {
    setProdLoadTrigger(t => ({ molfile, key: (t?.key ?? 0) + 1 }));
    setProduct(smiles);
  };

  // Fade transition on view change
  useEffect(() => {
    if (firstMount.current) { firstMount.current = false; return; }
    setVisible(false);
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, [view]);

  useEffect(() => {
    validateInput(substrateSmiles, (v) => setSubstrateValid(substrateSmiles.trim() ? v : null));
  }, [substrateSmiles]);

  useEffect(() => {
    validateInput(productSmiles, (v) => setProductValid(productSmiles.trim() ? v : null));
  }, [productSmiles]);

  const canSubmit = substrateSmiles.trim().length >= 2 && productSmiles.trim().length >= 2;
  const isActive =
    mode === 'smiles' ? canSubmit :
    mode === 'rxn'    ? rxnFile !== null :
    /* draw */          canSubmit;

  const goTo = (next: View) => setView(next);
  const selectMode = (m: Mode) => { setMode(m); goTo('input'); };

  const handleFindEnzymes = async () => {
    if (!isActive || apiLoading) return;
    setApiError(null);

    let enzyme     = DEFAULT_ENZYME;
    let candidates: Enzyme[] = [];

    const fmt     = (v: unknown) => (v != null && v !== '' ? String(v) : 'Unavailable');
    const fmtTemp = (v: unknown) => (v != null && v !== '' ? `${v}°C` : 'Unavailable');
    const toEnzyme = (r: Record<string, unknown>): Enzyme => ({
      id:            (r.uniprot_id ?? r.uniprot ?? 'unknown') as string,
      name:          (r.protein_name ?? 'Unavailable') as string,
      ecNumber:      (r.ec_number ?? 'Unavailable') as string,
      score:         transformClipzymeScore(typeof r.score === 'number' ? r.score : 0),
      organism:      (r.organism ?? 'Unavailable') as string,
      description:   (r.function ?? 'Unavailable') as string,
      optimalPh:     fmt(r.ph_optimum ?? r.optimal_ph),
      optimalTemp:   fmtTemp(r.temp_optimum ?? r.optimal_temp),
      kcat:          fmt(r.kcat),
      km:            fmt(r.km),
      projectedYield: 'Unavailable',
      vendor: '', vendorLogo: '', price: 'Unavailable', catalogNumber: 'Unavailable',
    });

    if (substrateSmiles.trim() && productSmiles.trim()) {
      setApiLoading(true);
      try {
        const response = await fetch('https://nitrocat-backend-production.up.railway.app/screen', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            substrate_smiles: substrateSmiles.trim(),
            product_smiles:   productSmiles.trim(),
            top_k: 10,
            enrich: true,
          }),
        });

        const data = await response.json().catch(() => null);

        if (!response.ok || data?.status === 'error' || data?.status === 'ERROR') {
          const msg = (typeof data?.result === 'string' && data.result) ? data.result : (data?.error ?? `Server error (${response.status})`);
          setApiError(msg);
          setApiLoading(false);
          return;
        }

        candidates = (Array.isArray(data?.result) ? data.result : [])
          .map((r: Record<string, unknown>) => toEnzyme(r));
        if (candidates.length > 0) enzyme = candidates[0];

      } catch {
        setApiError('Backend is unreachable. The server may be down — please try again later.');
        setApiLoading(false);
        return;
      }
      setApiLoading(false);
    } else {
      enzyme     = getEnzymeForSubstrate(substrateSmiles);
      candidates = [enzyme];
    }

    setResultEnzyme(enzyme);
    const substrateName = MW_TABLE[substrateSmiles.trim()]?.name ?? substrateSmiles.slice(0, 24);
    const productName   = MW_TABLE[productSmiles.trim()]?.name  ?? productSmiles.slice(0, 24);
    const confidence    = formatConfidenceLabel(enzyme.score);
    const reactionState: import('@/types/pathway').ReactionNodeData = {
      label:         confidence === 'high' ? 'Biocatalyst found' : 'Test biocatalysis',
      confidence,
      enzyme,
      substrateSmiles: substrateSmiles.trim(),
      productSmiles:   productSmiles.trim(),
      substrateName,
      productName,
      pathwayId:   'import',
      reactionId:  'result',
    };
    addHistoryEntry({
      id:       `reaction-${Date.now()}`,
      type:     'reaction',
      name:     `${substrateName} → ${productName}`,
      subtitle: enzyme.name,
      reactionState,
    });
    if (confidence === 'high') {
      navigate('/pathways/import/biocatalyst/result', { state: { reaction: reactionState } });
    } else {
      // medium → top 5, low → all 10
      const candidatesForTest = confidence === 'low' ? candidates : candidates.slice(0, 5);
      navigate('/pathways/import/test/result', { state: { reaction: reactionState, candidates: candidatesForTest } });
    }
  };

  // ── Select view ─────────────────────────────────────────────────────────────

  const SelectContent = (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="p-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-1.5">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-8 pb-16 gap-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Find Biocatalyst</h1>
          <p className="text-sm text-muted-foreground mt-1">Choose how you'd like to input your reaction</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
          {([
            { id: 'smiles' as Mode, icon: <FileText className="w-6 h-6 text-primary" />, label: 'SMILES' },
            { id: 'rxn'   as Mode, icon: <Upload    className="w-6 h-6 text-primary" />, label: 'RXN File' },
            { id: 'draw'  as Mode, icon: <PencilLine className="w-6 h-6 text-primary" />, label: 'Draw Structure' },
          ] as const).map(({ id, icon, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => selectMode(id)}
              className="flex flex-col items-center gap-3 p-6 rounded-xl border border-border bg-card hover:bg-accent transition-all group"
              style={{ cursor: 'pointer' }}
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                {icon}
              </div>
              <p className="font-semibold text-foreground">{label}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Input view ───────────────────────────────────────────────────────────────

  const modeTabs: { id: Mode; label: string }[] = [
    { id: 'smiles', label: 'SMILES' },
    { id: 'rxn',   label: 'RXN File' },
    { id: 'draw',  label: 'Draw Structure' },
  ];

  const InputContent = (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="p-4 flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => goTo('select')} className="gap-1.5 shrink-0">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        {/* Mode tab switcher */}
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {modeTabs.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setMode(id)}
              className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
              style={
                mode === id
                  ? { background: 'var(--bg-primary)', color: 'var(--text-primary)', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }
                  : { color: 'var(--text-muted)' }
              }
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-12 max-w-3xl mx-auto w-full space-y-6">
        {mode === 'smiles' && (
          <>
            <h1 className="text-xl font-bold text-foreground">Enter SMILES</h1>
            <div className="flex flex-col sm:flex-row gap-6">
              <SmilesColumn
                label="Substrate"
                value={substrateSmiles}
                valid={substrateValid}
                onChange={setSubstrate}
                placeholder="e.g. CCCCCC(=O)O"
              />
              <SmilesColumn
                label="Product"
                value={productSmiles}
                valid={productValid}
                onChange={setProduct}
                placeholder="e.g. OC(=O)c1cc(O)cc(O)c1CCCCC"
              />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Example reactions</p>
              <div className="flex flex-wrap gap-2">
                {REACTION_EXAMPLES.map((ex) => (
                  <ExampleChip
                    key={ex.label}
                    label={ex.label}
                    onClick={() => { setSubstrate(ex.substrate); setProduct(ex.product); }}
                  />
                ))}
              </div>
            </div>
            {apiError && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{apiError}</span>
              </div>
            )}
            <FindEnzymesButton active={canSubmit} loading={apiLoading} onClick={handleFindEnzymes} />
          </>
        )}

        {mode === 'rxn' && (
          <>
            <h1 className="text-xl font-bold text-foreground">Upload RXN File</h1>
            <input
              ref={fileInputRef}
              type="file"
              accept=".rxn,.rdf,.mol"
              className="hidden"
              onChange={(e) => setRxnFile(e.target.files?.[0] ?? null)}
            />
            <div
              role="button"
              tabIndex={0}
              className="rounded-xl border-2 border-dashed border-border hover:border-[var(--border-interactive)] transition-colors cursor-pointer p-12 flex flex-col items-center gap-4 text-center"
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
            >
              <Upload className="w-10 h-10 text-muted-foreground" />
              {rxnFile ? (
                <>
                  <p className="font-semibold text-foreground">{rxnFile.name}</p>
                  <p className="text-xs text-muted-foreground">{(rxnFile.size / 1024).toFixed(1)} KB · click to replace</p>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">Click to upload or drag &amp; drop</p>
                  <p className="text-xs text-muted-foreground font-mono">.rxn · .rdf · .mol</p>
                </>
              )}
            </div>
            <FindEnzymesButton active={rxnFile !== null} loading={apiLoading} onClick={handleFindEnzymes} />
          </>
        )}

        {mode === 'draw' && (
          <>
            <h1 className="text-xl font-bold text-foreground">Draw Reaction</h1>

            {/* ── Two editors side by side ──────────────────────────────── */}
            <RenderGuard
              fallback={
                <div className="rounded-xl border border-border bg-muted/30 flex flex-col items-center justify-center h-72 gap-3 text-sm text-muted-foreground">
                  <Beaker className="w-8 h-8 opacity-40" />
                  <p>Structure editor failed to load.</p>
                  <Button variant="ghost" size="sm" className="mt-2" onClick={() => selectMode('smiles')}>
                    Switch to SMILES input
                  </Button>
                </div>
              }
            >
              <div className="flex flex-col gap-2">

                {/* ── Shared example pills (one row, no duplication) ─── */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-medium shrink-0">Examples:</span>
                  {EXAMPLE_PAIRS.map((ex) => (
                    <button
                      key={ex.label}
                      type="button"
                      onClick={() => loadDrawPair(ex.substrate, ex.subMol, ex.product, ex.prodMol)}
                      className="text-xs px-2.5 py-0.5 rounded-full border border-border bg-secondary hover:bg-tertiary hover:border-primary/50 text-foreground transition-colors cursor-pointer whitespace-nowrap"
                    >
                      {ex.shortLabel}
                    </button>
                  ))}
                </div>

                {/* ── Labels + editors with copy button ───────────────── */}
                <div className="flex items-stretch gap-2">

                  {/* Substrate */}
                  <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Substrate</span>
                    <Suspense fallback={<KetcherFallback />}>
                      <KetcherEditor
                        onSmiles={(s) => setSubstrate(s)}
                        onMolfile={(m) => setSubMolfile(m)}
                        height={320}
                        loadTrigger={subLoadTrigger}
                      />
                    </Suspense>
                  </div>

                  {/* Copy substrate → product button */}
                  <div className="flex flex-col items-center justify-center gap-1 pt-5 shrink-0">
                    <button
                      type="button"
                      title="Copy substrate structure to product"
                      disabled={!subMolfile}
                      onClick={() => setProdLoadTrigger(t => ({ molfile: subMolfile, key: (t?.key ?? 0) + 1 }))}
                      className={cn(
                        'flex flex-col items-center gap-1 rounded-lg border px-2 py-3 transition-colors',
                        subMolfile
                          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 cursor-pointer'
                          : 'border-border bg-muted/20 text-muted-foreground/40 cursor-not-allowed',
                      )}
                    >
                      <ArrowRight className="w-4 h-4" />
                      <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ writingMode: 'vertical-lr' }}>Copy</span>
                    </button>
                  </div>

                  {/* Product */}
                  <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Product</span>
                    <Suspense fallback={<KetcherFallback />}>
                      <KetcherEditor
                        onSmiles={(s) => setProduct(s)}
                        height={320}
                        loadTrigger={prodLoadTrigger}
                      />
                    </Suspense>
                  </div>

                </div>

              </div>
            </RenderGuard>

            {apiError && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{apiError}</span>
              </div>
            )}
            <FindEnzymesButton active={canSubmit} loading={apiLoading} onClick={handleFindEnzymes} />
          </>
        )}
      </div>
    </div>
  );

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className={cn('transition-opacity duration-150', visible ? 'opacity-100' : 'opacity-0')}>
      {view === 'select' && SelectContent}
      {view === 'input'  && InputContent}
      {view === 'result' && (
        <ResultView
          substrate={substrateSmiles}
          product={productSmiles}
          enzyme={resultEnzyme}
          onBack={() => goTo('input')}
        />
      )}
    </div>
  );
};

export default NewReactionPage;
