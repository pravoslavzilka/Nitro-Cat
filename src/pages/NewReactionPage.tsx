import { Component, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MoleculeViewer } from "@/components/molecule/MoleculeViewer";
import {
  ArrowLeft, Upload, Download, CheckCircle2, FlaskConical, FileText,
  Dna, Check, X, TrendingUp, ShoppingCart, Droplets, Thermometer, Activity, Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatScore, formatConfidenceLabel } from "@/lib/utils/formatting";
import SmilesDrawer from "smiles-drawer";
import { allExamplePathways } from "@/data/allExamplePathways";
import type { Enzyme } from "@/types/enzyme";
import type { ReactionNodeData } from "@/types/pathway";

// ── Error boundary ────────────────────────────────────────────────────────────

class RenderGuard extends Component<{ children: ReactNode; fallback: ReactNode }, { caught: boolean }> {
  state = { caught: false };
  static getDerivedStateFromError() { return { caught: true }; }
  componentDidCatch() {}
  render() { return this.state.caught ? this.props.fallback : this.props.children; }
}

// ── Enzyme lookup ─────────────────────────────────────────────────────────────

const HEXANOIC   = 'CCCCCC(=O)O';
const OLIVETOLIC = 'OC(=O)c1cc(O)cc(O)c1CCCCC';
const COMPOUND3  = 'C#C[C@]1(CO)[C@@H](O)C[C@@H](OP(=O)(O)O)O1';

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
  const cannabinoid = allExamplePathways.find(p => p.id === 'example-cannabinoid');
  const islatravir  = allExamplePathways.find(p => p.id === 'example-islatravir');

  const pick = (pathway: typeof cannabinoid, nodeId: string): Enzyme | null => {
    const node = pathway?.nodes.find(n => n.id === nodeId);
    return node ? ((node.data as ReactionNodeData).enzyme ?? null) : null;
  };

  const s = smiles.trim();
  if (s === HEXANOIC)   return pick(cannabinoid, 'r1') ?? DEFAULT_ENZYME;
  if (s === OLIVETOLIC) return pick(cannabinoid, 'r2') ?? DEFAULT_ENZYME;
  if (s === COMPOUND3)  return pick(islatravir,  'r2') ?? DEFAULT_ENZYME;
  return DEFAULT_ENZYME;
}

// ── Data ──────────────────────────────────────────────────────────────────────

const SUBSTRATE_EXAMPLES = [
  { label: 'Hexanoic acid',  smiles: HEXANOIC   },
  { label: 'Olivetolic acid', smiles: OLIVETOLIC },
  { label: 'Compound 3',     smiles: COMPOUND3  },
];

const PRODUCT_EXAMPLES = [
  { label: 'Olivetolic acid', smiles: OLIVETOLIC },
  { label: 'CBGA',            smiles: 'OC(=O)CCc1c(O)cc(O)c(CC=C(C)CCC=C(C)C)c1' },
  { label: 'Compound 4',      smiles: 'C#C[C@]1(COP(=O)(O)O)[C@@H](O)C[C@@H](O)O1' },
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

const SmilesColumn = ({
  label,
  value,
  valid,
  onChange,
  placeholder,
  examples,
  onExampleSelect,
}: {
  label: string;
  value: string;
  valid: boolean | null;
  onChange: (v: string) => void;
  placeholder: string;
  examples: { label: string; smiles: string }[];
  onExampleSelect: (smiles: string) => void;
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
    <div className="flex flex-col gap-1.5">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">From example pathways:</p>
      <div className="flex flex-wrap gap-1.5">
        {examples.map((ex) => (
          <ExampleChip key={ex.label} label={ex.label} onClick={() => onExampleSelect(ex.smiles)} />
        ))}
      </div>
    </div>
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

const FindEnzymesButton = ({ active, onClick }: { active: boolean; onClick: () => void }) => (
  <div className="flex justify-center">
    <button
      type="button"
      onClick={onClick}
      disabled={!active}
      className={cn(
        'inline-flex items-center gap-2 px-8 py-3 rounded-xl text-base font-semibold transition-all',
        active ? 'cursor-pointer font-bold' : 'cursor-not-allowed opacity-50'
      )}
      style={
        active
          ? { background: 'var(--primary-500)', color: '#fff', boxShadow: '0 2px 12px 0 rgba(16,185,129,0.25)' }
          : { border: '2px solid var(--border-default)', background: 'var(--bg-secondary)', color: 'var(--text-muted)' }
      }
    >
      <Dna className="w-5 h-5" />
      Find Enzymes
    </button>
  </div>
);

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
}) => (
  <div className="max-w-3xl mx-auto space-y-8 p-6">
    {/* Header */}
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

    {/* Two-column layout */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

      {/* Left: enzyme identity + kinetics */}
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
        </div>
      </div>

    </div>
  </div>
);

// ── Page ──────────────────────────────────────────────────────────────────────

type View = 'select' | 'input' | 'result';
type Mode = 'smiles' | 'rxn';

export const NewReactionPage = () => {
  const navigate     = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [view, setView]   = useState<View>('select');
  const [visible, setVisible] = useState(true);
  const [mode, setMode]   = useState<Mode>('smiles');
  const [substrateSmiles, setSubstrate] = useState('');
  const [productSmiles, setProduct]     = useState('');
  const [substrateValid, setSubstrateValid] = useState<boolean | null>(null);
  const [productValid, setProductValid]     = useState<boolean | null>(null);
  const [rxnFile, setRxnFile] = useState<File | null>(null);
  const firstMount = useRef(true);

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

  const smilesReady = substrateValid === true && productValid === true;
  const isActive    = mode === 'smiles' ? smilesReady : rxnFile !== null;

  const goTo = (next: View) => setView(next);
  const selectMode = (m: Mode) => { setMode(m); goTo('input'); };

  const handleFindEnzymes = () => {
    if (!isActive) return;
    goTo('result');
  };

  const resultEnzyme = getEnzymeForSubstrate(substrateSmiles);

  // ── Select view ─────────────────────────────────────────────────────────────

  const SelectContent = (
    <div className="flex flex-col h-full">
      <div className="p-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-1.5">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </div>
      <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <h1 className="text-3xl font-bold text-foreground">Import Reaction</h1>
        <p className="text-sm text-muted-foreground mt-2 mb-10">
          Choose how you'd like to define your reaction
        </p>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => selectMode('smiles')}
            className="w-72 h-36 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer"
          >
            <FlaskConical className="w-7 h-7 text-primary" />
            <span className="text-lg font-semibold">Substrate &amp; Product</span>
            <span className="text-xs italic text-muted-foreground mt-1">SMILES</span>
          </button>
          <button
            type="button"
            onClick={() => selectMode('rxn')}
            className="w-72 h-36 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer"
          >
            <FileText className="w-7 h-7 text-primary" />
            <span className="text-lg font-semibold">RXN File</span>
            <span className="text-xs italic text-muted-foreground mt-1">.rxn · MDL format</span>
          </button>
        </div>
      </div>
    </div>
  );

  // ── Input view ──────────────────────────────────────────────────────────────

  const InputContent = (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => goTo('select')} className="gap-1.5 -ml-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex gap-1 p-1 bg-muted rounded-lg">
            <button
              type="button"
              onClick={() => setMode('smiles')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md font-medium transition-all',
                mode === 'smiles' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              Text Input
            </button>
            <button
              type="button"
              onClick={() => setMode('rxn')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md font-medium transition-all',
                mode === 'rxn' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <FileText className="w-3.5 h-3.5" />
              RXN File
            </button>
          </div>
        </div>

        {mode === 'smiles' && (
          <div className="flex flex-col gap-8">
            <div className="flex flex-col md:flex-row items-stretch md:items-start gap-4">
              <SmilesColumn
                label="Substrate"
                value={substrateSmiles}
                valid={substrateValid}
                onChange={setSubstrate}
                placeholder="e.g. CCCCCC(=O)O"
                examples={SUBSTRATE_EXAMPLES}
                onExampleSelect={(smiles) => { setSubstrate(smiles); setProduct(''); }}
              />
              <div className="flex md:flex-col items-center justify-center shrink-0 md:pt-8">
                <span className="hidden md:block text-2xl text-primary/40">→</span>
                <span className="md:hidden text-2xl text-primary/40">↓</span>
              </div>
              <SmilesColumn
                label="Product"
                value={productSmiles}
                valid={productValid}
                onChange={setProduct}
                placeholder="e.g. OC(=O)c1cc(O)cc(O)c1CCCCC"
                examples={PRODUCT_EXAMPLES}
                onExampleSelect={(smiles) => { setProduct(smiles); setSubstrate(''); }}
              />
            </div>
            <FindEnzymesButton active={isActive} onClick={handleFindEnzymes} />
          </div>
        )}

        {mode === 'rxn' && (
          <div className="space-y-5">
            <div
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'border-2 border-dashed rounded-xl p-16 flex flex-col items-center gap-3 transition-all cursor-pointer max-w-lg mx-auto',
                rxnFile ? 'border-primary/40 bg-primary/5' : 'border-border hover:border-primary hover:bg-primary/5'
              )}
            >
              {rxnFile ? (
                <>
                  <CheckCircle2 className="w-10 h-10" style={{ color: 'var(--success-500)' }} />
                  <p className="text-base font-medium text-foreground">{rxnFile.name}</p>
                  <p className="text-sm text-muted-foreground">Reaction loaded (mock)</p>
                </>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-muted-foreground" />
                  <p className="text-base font-medium text-foreground">Drop your .rxn file here</p>
                  <p className="text-sm text-muted-foreground">Supports MDL .rxn format</p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".rxn"
              className="hidden"
              onChange={(e) => setRxnFile(e.target.files?.[0] ?? null)}
            />
            <div className="flex flex-wrap gap-3 justify-center">
              <Button variant="outline" size="sm" className="gap-2 text-xs" asChild>
                <a href="#" onClick={(e) => e.preventDefault()}>
                  <Download className="w-3.5 h-3.5" />
                  Example: Amide Bond Formation
                </a>
              </Button>
              <Button variant="outline" size="sm" className="gap-2 text-xs" asChild>
                <a href="#" onClick={(e) => e.preventDefault()}>
                  <Download className="w-3.5 h-3.5" />
                  Example: Reductive Amination
                </a>
              </Button>
            </div>
            <FindEnzymesButton active={isActive} onClick={handleFindEnzymes} />
          </div>
        )}
      </div>
    </div>
  );

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full">
      <div
        className={cn(
          'flex-1 overflow-y-auto transition-opacity duration-300',
          visible ? 'opacity-100' : 'opacity-0'
        )}
      >
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
    </div>
  );
};

export default NewReactionPage;
