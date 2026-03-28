import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatPanel } from "./ChatPanel";
import type { Pathway } from "@/types/pathway";

const STUB_PATHWAY: Pathway = {
  id: 'nitrocat', name: 'NitroCat Assistant', description: '', steps: [],
  createdAt: '', updatedAt: '', status: 'complete',
};

const models = [
  { id: "nitroai-4",      name: "NitroAI-4",      desc: "Most capable" },
  { id: "nitroai-4-mini", name: "NitroAI-4 Mini", desc: "Fast & efficient" },
  { id: "nitroai-3.5",    name: "NitroAI-3.5",    desc: "Balanced" },
];

export const NitroAIChat = () => {
  const [open, setOpen]                   = useState(false);
  const [selectedModel, setSelectedModel] = useState("nitroai-4");

  const modelName = models.find((m) => m.id === selectedModel)?.name ?? "NitroAI-4";

  return (
    <>
      {/* Chat popup panel */}
      <div
        className={cn(
          "fixed bottom-24 right-6 z-[200] w-96 h-[520px] rounded-2xl border-2 border-border flex flex-col overflow-hidden transition-all duration-200 origin-bottom-right",
          open ? "scale-100 opacity-100 pointer-events-auto" : "scale-95 opacity-0 pointer-events-none"
        )}
        style={{
          background: "var(--bg-elevated)",
          boxShadow: "0 8px 40px 0 rgba(0,0,0,0.18), 0 1.5px 8px 0 rgba(0,0,0,0.10)",
        }}
      >
        {/* Panel header */}
        <div
          className="px-4 py-3 border-b-2 border-border flex items-center justify-between shrink-0"
          style={{ background: "var(--bg-secondary)" }}
        >
          <div className="flex items-center gap-2">
            <img src="/images/nitroduck-logo.png" className="h-6 w-6 object-contain" alt="NitroAI" />
            <span className="text-sm font-semibold text-foreground">NitroAI</span>
            <span className="text-xs font-mono text-muted-foreground ml-1">{modelName}</span>
          </div>
          <div className="flex items-center gap-1">
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="h-7 w-auto gap-1 border-none bg-transparent shadow-none text-xs text-muted-foreground hover:bg-accent px-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent style={{ background: "var(--bg-elevated)", borderColor: "var(--border-emphasis)" }}>
                {models.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    <div className="flex flex-col">
                      <span className="text-sm">{m.name}</span>
                      <span className="text-[10px] text-muted-foreground">{m.desc}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              <Minus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Panel body */}
        <div className="flex-1 overflow-hidden">
          <ChatPanel pathway={STUB_PATHWAY} className="h-full" />
        </div>
      </div>

      {/* Floating trigger button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-[200] w-14 h-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 transition-all flex items-center justify-center glow-green-sm"
        aria-label="Open NitroAI chat"
      >
        <img src="/images/nitroduck-logo.png" className="w-8 h-8 object-contain" alt="NitroAI" />
      </button>
    </>
  );
};
