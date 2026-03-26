import { useState, useRef, useEffect } from "react";
import type { Pathway } from "@/types/pathway";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Send, Bot, Sparkles, Paperclip, Globe, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatMessage, type Message } from "./ChatMessage";

const models = [
  { id: "nitroai-4", name: "NitroAI-4", desc: "Most capable" },
  { id: "nitroai-4-mini", name: "NitroAI-4 Mini", desc: "Fast & efficient" },
  { id: "nitroai-3.5", name: "NitroAI-3.5", desc: "Balanced" },
];

function buildWelcomeMessage(pathway: Pathway): Message {
  const startMol = pathway.steps[0]?.startMolecule.name ?? "the starting compound";
  const endMol = pathway.steps[pathway.steps.length - 1]?.productMolecule.name ?? "the product";
  const totalEnzymes = pathway.steps.reduce((n, s) => n + s.enzymes.length, 0);
  const topEnzyme = pathway.steps[0]?.enzymes[0];

  return {
    id: "1",
    role: "ai",
    content: `Hello! I'm your pathway analysis assistant for **${pathway.name}**.

This pathway converts **${startMol}** → **${endMol}** across **${pathway.steps.length} reaction steps** with **${totalEnzymes} enzyme candidates** identified.${topEnzyme ? `\n\nTop-ranked candidate for the first step is **${topEnzyme.name}** (${topEnzyme.ecNumber}, ${Math.round(topEnzyme.score * 100)}% match score).` : ""}

Ask me about enzyme selection, reaction conditions, yield optimization, or any step in the pathway.`,
    timestamp: new Date(),
  };
}

function buildSimulatedResponse(pathway: Pathway, userMessage: string, modelName: string): string {
  const steps = pathway.steps;
  const allEnzymes = steps.flatMap((s) => s.enzymes);
  const topEnzyme = [...allEnzymes].sort((a, b) => b.score - a.score)[0];
  const lowMsg = userMessage.toLowerCase();

  if (lowMsg.includes("enzyme") || lowMsg.includes("catalyst")) {
    return `For **${pathway.name}**, the highest-scoring enzyme is **${topEnzyme?.name ?? "N/A"}** with a ${topEnzyme ? Math.round(topEnzyme.score * 100) + "%" : "—"} match score (${topEnzyme?.ecNumber ?? "—"}). It operates at ${topEnzyme?.optimalTemp ?? "—"} and pH ${topEnzyme?.optimalPh ?? "—"}, with a k_cat of ${topEnzyme?.kcat ?? "—"}.`;
  }

  if (lowMsg.includes("step") || lowMsg.includes("reaction")) {
    const stepSummary = steps
      .map((s, i) => `Step ${i + 1}: ${s.reactionType} (${s.startMolecule.name} → ${s.productMolecule.name})`)
      .join("\n");
    return `Here's a summary of the ${steps.length} steps in **${pathway.name}**:\n\n${stepSummary}`;
  }

  if (lowMsg.includes("yield") || lowMsg.includes("efficient") || lowMsg.includes("optim")) {
    const best = [...steps]
      .filter((s) => s.enzymes.length > 0)
      .sort((a, b) => (b.enzymes[0]?.score ?? 0) - (a.enzymes[0]?.score ?? 0))[0];
    return `The highest-yield step in **${pathway.name}** is the **${best?.reactionType ?? "—"}** reaction (${best?.startMolecule.name} → ${best?.productMolecule.name}) with a projected yield of **${best?.enzymes[0]?.projectedYield ?? "—"}**. Using model **${modelName}**, I recommend prioritizing this step for initial optimization.`;
  }

  return `Based on the **${pathway.name}** pathway data, the ${steps.length} steps span from **${steps[0]?.startMolecule.name}** to **${steps[steps.length - 1]?.productMolecule.name}**. Using **${modelName}**, I can analyze any step in detail — enzyme kinetics, reaction conditions, or alternative routes. What would you like to explore?`;
}

interface ChatPanelProps {
  pathway: Pathway;
  className?: string;
}

export const ChatPanel = ({ pathway, className }: ChatPanelProps) => {
  const [messages, setMessages] = useState<Message[]>(() => [buildWelcomeMessage(pathway)]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedModel, setSelectedModel] = useState("nitroai-4");
  const [webSearch, setWebSearch] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Reset chat when pathway changes
  useEffect(() => {
    setMessages([buildWelcomeMessage(pathway)]);
  }, [pathway.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const simulateResponse = (userMessage: string) => {
    setIsTyping(true);
    setTimeout(() => {
      const modelName = models.find((m) => m.id === selectedModel)?.name ?? selectedModel;
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "ai",
          content: buildSimulatedResponse(pathway, userMessage, modelName),
          timestamp: new Date(),
        },
      ]);
      setIsTyping(false);
    }, 1100);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const text = input.trim();
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: "user", content: text, timestamp: new Date() },
    ]);
    simulateResponse(text);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + "px";
    }
  };

  return (
    <div className={cn("w-full max-w-2xl mx-auto flex flex-col", className)}>
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="h-8 w-auto gap-1 border-none bg-transparent shadow-none text-sm font-medium text-foreground hover:bg-accent px-2">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <SelectValue />
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </SelectTrigger>
            <SelectContent style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-emphasis)' }}>
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
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isTyping && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-2.5 text-sm text-muted-foreground">
              <span className="inline-flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="px-4 pb-4">
        <div className="border border-border rounded-2xl bg-card focus-within:border-primary/50 transition-colors">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaInput}
            onKeyDown={handleKeyDown}
            placeholder={`Ask about ${pathway.name}...`}
            className="border-0 bg-transparent shadow-none resize-none min-h-[44px] max-h-[160px] focus-visible:ring-0 focus-visible:ring-offset-0 text-sm px-4 pt-3 pb-1"
            rows={1}
          />
          <div className="flex items-center justify-between px-3 pb-2">
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                <Paperclip className="w-4 h-4" />
              </Button>
              <Button
                variant={webSearch ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setWebSearch(!webSearch)}
                className={cn(
                  "h-7 text-xs gap-1.5",
                  webSearch ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Globe className="w-3.5 h-3.5" />
                Search
              </Button>
            </div>
            <Button size="icon" className="h-7 w-7 rounded-lg" disabled={!input.trim()} onClick={handleSend}>
              <Send className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground text-center mt-2">
          NitroAI may produce inaccurate information. Verify critical enzyme data independently.
        </p>
      </div>
    </div>
  );
};
