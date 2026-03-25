import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  return (
    <div className={cn("flex gap-3", message.role === "user" && "justify-end")}>
      {message.role === "ai" && (
        <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
          <Bot className="w-4 h-4 text-primary" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          message.role === "user"
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-secondary text-foreground rounded-bl-md"
        )}
      >
        {message.content}
      </div>
      {message.role === "user" && (
        <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
          <User className="w-4 h-4 text-muted-foreground" />
        </div>
      )}
    </div>
  );
};
