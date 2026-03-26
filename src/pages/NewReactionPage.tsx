import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MoleculeViewer } from "@/components/molecule/MoleculeViewer";
import { ArrowLeft, Upload, Download, CheckCircle2, FlaskConical, FileText, Dna, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import SmilesDrawer from "smiles-drawer";

// ── Data ──────────────────────────────────────────────────────────────────────

const SUBSTRATE_EXAMPLES = [
  { label: "Phenol",     smiles: "c1ccc(cc1)O" },
  { label: "L-Tyrosine", smiles: "N[C@@H](Cc1ccc(O)cc1)C(=O)O" },
  { label: "Shikimate",  smiles: "O[C@@H]1CC(=O)C[C@H](O)[C@@H]1O" },
];

const PRODUCT_EXAMPLES = [
  { label: "L-DOPA",        smiles: "N[C@@H](Cc1ccc(O)c(O)c1)C(=O)O" },
  { label: "Shikimic acid", smiles: "O[C@@H]1C[C@@](O)(C=O)C[C@H](O)[C@@H]1O" },
  { label: "Catechol",      smiles: "Oc1ccccc1O" },
];

// ── Validation ────────────────────────────────────────────────────────────────

function validateInput(value: string, onResult: (valid: boolean) => void) {
  const trimmed = value.trim();
  if (!trimmed) { onResult(false); return; }
  SmilesDrawer.parse(trimmed, () => onResult(true), () => onResult(false));
}

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
    <span className="inline-flex items-center gap-1 text-xs font-mono" style={{ color: "var(--success-600)" }}>
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
}: {
  label: string;
  value: string;
  valid: boolean | null;
  onChange: (v: string) => void;
  placeholder: string;
  examples: { label: string; smiles: string }[];
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
        "font-mono text-sm resize-none transition-colors",
        value.trim() && valid === false && "border-destructive focus-visible:ring-destructive/30"
      )}
    />
    <div className="flex flex-wrap gap-1.5">
      {examples.map((ex) => (
        <ExampleChip key={ex.label} label={ex.label} onClick={() => onChange(ex.smiles)} />
      ))}
    </div>
    <div className="bg-muted/30 rounded-xl p-3 flex items-center justify-center min-h-[196px]">
      {value.trim() ? (
        <MoleculeViewer smiles={value} width={260} height={180} />
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
      className={cn(
        "inline-flex items-center gap-2 px-8 py-3 rounded-xl text-base font-semibold transition-all",
        active ? "cursor-pointer font-bold" : "cursor-not-allowed opacity-50"
      )}
      style={
        active
          ? { background: "var(--primary-500)", color: "#fff", boxShadow: "0 2px 12px 0 rgba(16,185,129,0.25)" }
          : { border: "2px solid var(--border-default)", background: "var(--bg-secondary)", color: "var(--text-muted)" }
      }
    >
      <Dna className="w-5 h-5" />
      Find Enzymes
    </button>
  </div>
);

// ── Page ──────────────────────────────────────────────────────────────────────

type Step = "select" | "input";
type Mode = "smiles" | "rxn";

export const NewReactionPage = () => {
  const navigate     = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep]               = useState<Step>("select");
  const [mode, setMode]               = useState<Mode>("smiles");
  const [substrateSmiles, setSubstrate] = useState("");
  const [productSmiles, setProduct]     = useState("");
  const [substrateValid, setSubstrateValid] = useState<boolean | null>(null);
  const [productValid, setProductValid]     = useState<boolean | null>(null);
  const [rxnFile, setRxnFile]           = useState<File | null>(null);

  useEffect(() => {
    validateInput(substrateSmiles, (v) => setSubstrateValid(substrateSmiles.trim() ? v : null));
  }, [substrateSmiles]);

  useEffect(() => {
    validateInput(productSmiles, (v) => setProductValid(productSmiles.trim() ? v : null));
  }, [productSmiles]);

  const smilesReady = substrateValid === true && productValid === true;
  const isActive = mode === "smiles" ? smilesReady : rxnFile !== null;

  const handleFindEnzymes = () => {
    if (!isActive) return;
    navigate("/pathways/example-1");
  };

  const selectMode = (m: Mode) => { setMode(m); setStep("input"); };

  // ── Step 1: mode selector ────────────────────────────────────────────────

  if (step === "select") {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto">
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
                onClick={() => selectMode("smiles")}
                className="w-72 h-36 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer"
              >
                <FlaskConical className="w-7 h-7 text-primary" />
                <span className="text-lg font-semibold">Substrate &amp; Product</span>
                <span className="text-xs italic text-muted-foreground mt-1">SMILES</span>
              </button>

              <button
                type="button"
                onClick={() => selectMode("rxn")}
                className="w-72 h-36 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer"
              >
                <FileText className="w-7 h-7 text-primary" />
                <span className="text-lg font-semibold">RXN File</span>
                <span className="text-xs italic text-muted-foreground mt-1">.rxn · MDL format</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Step 2: input form ───────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* Back + mode toggle row */}
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setStep("select")} className="gap-1.5 -ml-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>

            {/* Mode switcher */}
            <div className="flex gap-1 p-1 bg-muted rounded-lg">
              <button
                type="button"
                onClick={() => setMode("smiles")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md font-medium transition-all",
                  mode === "smiles"
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <FlaskConical className="w-3.5 h-3.5" />
                Text Input
              </button>
              <button
                type="button"
                onClick={() => setMode("rxn")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md font-medium transition-all",
                  mode === "rxn"
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <FileText className="w-3.5 h-3.5" />
                RXN File
              </button>
            </div>
          </div>

          {/* SMILES mode */}
          {mode === "smiles" && (
            <div className="flex flex-col gap-8">
              <div className="flex flex-col md:flex-row items-stretch md:items-start gap-4">
                <SmilesColumn
                  label="Substrate"
                  value={substrateSmiles}
                  valid={substrateValid}
                  onChange={setSubstrate}
                  placeholder="e.g. c1ccc(cc1)O"
                  examples={SUBSTRATE_EXAMPLES}
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
                  placeholder="e.g. N[C@@H](Cc1ccc(O)c(O)c1)C(=O)O"
                  examples={PRODUCT_EXAMPLES}
                />
              </div>

              <FindEnzymesButton active={isActive} onClick={handleFindEnzymes} />
            </div>
          )}

          {/* RXN mode */}
          {mode === "rxn" && (
            <div className="space-y-5">
              <div
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-xl p-16 flex flex-col items-center gap-3 transition-all cursor-pointer max-w-lg mx-auto",
                  rxnFile
                    ? "border-primary/40 bg-primary/5"
                    : "border-border hover:border-primary hover:bg-primary/5"
                )}
              >
                {rxnFile ? (
                  <>
                    <CheckCircle2 className="w-10 h-10" style={{ color: "var(--success-500)" }} />
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
    </div>
  );
};

export default NewReactionPage;
