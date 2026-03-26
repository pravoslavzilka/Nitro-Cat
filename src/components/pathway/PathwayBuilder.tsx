import { TransformWrapper, TransformComponent, useControls } from "react-zoom-pan-pinch";
import type { Pathway, Molecule } from "@/types/pathway";
import { PathwayStep } from "./PathwayStep";
import { MoleculeViewer } from "@/components/molecule/MoleculeViewer";
import { FlaskConical, Layers, ArrowDown, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

interface PathwayBuilderProps {
  pathway: Pathway;
}

const statusColors: Record<string, string> = {
  complete: "bg-success-100 text-success-700 border border-success-500",
  analyzing: "bg-warning-100 text-warning-700 border border-warning-500",
  draft: "bg-muted text-muted-foreground border border-border",
};

const StepArrow = () => (
  <div className="flex flex-col items-center py-2">
    <div className="w-0.5 h-8 bg-primary/40" />
    <ArrowDown className="w-7 h-7 text-primary/70 -mt-1" />
  </div>
);

const MoleculeCard = ({ molecule }: { molecule: Molecule }) => (
  <div className="shadow-sm rounded-xl bg-card p-3">
    <div className="flex justify-center">
      <MoleculeViewer smiles={molecule.smiles} width={320} height={220} />
    </div>
    <p className="text-xs font-mono text-muted-foreground text-center mt-1">{molecule.name}</p>
  </div>
);

const ZoomControls = () => {
  const { zoomIn, zoomOut, resetTransform } = useControls();
  return (
    <div className="absolute top-4 right-4 z-10 flex items-center gap-1 bg-background border border-border rounded-full px-2 py-1 shadow-sm">
      <button
        type="button"
        onClick={() => zoomOut()}
        className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Zoom out"
      >
        <ZoomOut className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={() => zoomIn()}
        className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Zoom in"
      >
        <ZoomIn className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={() => resetTransform()}
        className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Reset zoom"
      >
        <Maximize2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export const PathwayBuilder = ({ pathway }: PathwayBuilderProps) => {
  return (
    <div className="h-full overflow-hidden relative">
      <TransformWrapper
        minScale={0.3}
        maxScale={2}
        initialScale={0.75}
        wheel={{ step: 0.1 }}
        panning={{ disabled: false }}
        doubleClick={{ disabled: true }}
      >
        <ZoomControls />

        <TransformComponent
          wrapperStyle={{ width: "100%", height: "100%" }}
          contentStyle={{ cursor: "grab" }}
        >
          <div className="p-6 min-w-[500px]" style={{ cursor: "inherit" }}>

            {/* ── Header card ── */}
            <div className="mb-8 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-5 shadow-[var(--shadow-md)]">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
                    <FlaskConical className="w-4 h-4 text-primary" />
                  </div>
                  <h1 className="text-2xl font-bold text-foreground leading-tight">
                    {pathway.name}
                  </h1>
                </div>
                <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded capitalize shrink-0 mt-1 ${statusColors[pathway.status] ?? statusColors.draft}`}>
                  {pathway.status}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs mt-3">
                <div className="flex items-center gap-1.5 text-info bg-info/10 border border-info/20 px-2.5 py-1 rounded-md font-mono">
                  <Layers className="w-3 h-3" />
                  <span>{pathway.steps.length} reaction steps</span>
                </div>
              </div>
            </div>

            {/* ── Pathway flow ── */}
            <div className="flex flex-col items-center space-y-0">
              {pathway.steps.map((step, idx) => (
                <div key={step.id} className="flex flex-col items-center w-full">
                  {idx === 0 && <MoleculeCard molecule={step.startMolecule} />}
                  <StepArrow />
                  <PathwayStep step={step} />
                  <MoleculeCard molecule={step.productMolecule} />
                </div>
              ))}
            </div>

          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
};
