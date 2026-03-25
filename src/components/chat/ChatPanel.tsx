import { useState, useRef, useEffect } from "react";
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
  { id: "enzym-4", name: "EnzymAI-4", desc: "Most capable" },
  { id: "enzym-4-mini", name: "EnzymAI-4 Mini", desc: "Fast & efficient" },
  { id: "enzym-3.5", name: "EnzymAI-3.5", desc: "Balanced" },
];

const initialMessages: Message[] = [
  {
    id: "1",
    role: "ai",
    content:
      "Hello! I'm your pathway analysis assistant. I can help you understand enzyme selections, reaction conditions, and optimization strategies. What would you like to explore?",
    timestamp: new Date(),
  },
];

export const ChatPanel = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedModel, setSelectedModel] = useState("enzym-4");
  const [webSearch, setWebSearch] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const simulateResponse = () => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "ai",
          content: `Based on the current pathway analysis, the enzyme selection here is optimized for substrate specificity and kinetic parameters. The selected model (${models.find((m) => m.id === selectedModel)?.name}) suggests this is the most efficient route. Would you like me to compare alternative enzymes or adjust reaction conditions?`,
          timestamp: new Date(),
        },
      ]);
      setIsTyping(false);
    }, 1200);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: "user",
        content: input.trim(),
        timestamp: new Date(),
      },
    ]);
    simulateResponse();
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
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
    <div className="w-full max-w-2xl mx-auto flex flex-col h-full">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="h-8 w-auto gap-1 border-none bg-transparent shadow-none text-sm font-medium text-foreground hover:bg-accent px-2">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <SelectValue />
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </SelectTrigger>
            <SelectContent>
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
            placeholder="Ask about enzymes, reactions, or optimization..."
            className="border-0 bg-transparent shadow-none resize-none min-h-[44px] max-h-[160px] focus-visible:ring-0 focus-visible:ring-offset-0 text-sm px-4 pt-3 pb-1"
            rows={1}
          />
          <div className="flex items-center justify-between px-3 pb-2">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
              >
                <Paperclip className="w-4 h-4" />
              </Button>
              <Button
                variant={webSearch ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setWebSearch(!webSearch)}
                className={cn(
                  "h-7 text-xs gap-1.5",
                  webSearch
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Globe className="w-3.5 h-3.5" />
                Search
              </Button>
            </div>
            <Button
              size="icon"
              className="h-7 w-7 rounded-lg"
              disabled={!input.trim()}
              onClick={handleSend}
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground text-center mt-2">
          EnzymAI may produce inaccurate information. Verify critical enzyme data independently.
        </p>
      </div>
    </div>
  );
};
