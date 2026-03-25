import { useState } from "react";
import {
  Plus,
  FlaskConical,
  Settings,
  User,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { NewChatDialog } from "./NewChatDialog";
import { cn } from "@/lib/utils";

interface ChatSession {
  id: string;
  title: string;
  pathway: string;
  date: string;
}

const pastSessions: ChatSession[] = [
  { id: "1", title: "Shikimic Acid Biosynthesis", pathway: "shikimic", date: "Today" },
  { id: "2", title: "Tryptophan Pathway", pathway: "tryptophan", date: "Yesterday" },
  { id: "3", title: "Chorismate Synthesis", pathway: "chorismate", date: "3 days ago" },
  { id: "4", title: "Phenylalanine Route", pathway: "phenylalanine", date: "Last week" },
];

interface AppSidebarProps {
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: (pathwayId: string) => void;
}

export const AppSidebar = ({ activeSessionId, onSelectSession, onNewChat }: AppSidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [newChatOpen, setNewChatOpen] = useState(false);

  const grouped = {
    Today: pastSessions.filter((s) => s.date === "Today"),
    Yesterday: pastSessions.filter((s) => s.date === "Yesterday"),
    Older: pastSessions.filter((s) => s.date !== "Today" && s.date !== "Yesterday"),
  };

  return (
    <>
      <aside
        className={cn(
          "flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-all duration-300",
          collapsed ? "w-14" : "w-64"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-sidebar-border">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-sidebar-primary" />
              <span className="text-sm font-semibold text-foreground">EnzymAI</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-sidebar-foreground hover:text-foreground"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>

        {/* New Chat Button */}
        <div className="p-2">
          <Button
            onClick={() => setNewChatOpen(true)}
            variant="outline"
            className={cn(
              "w-full border-dashed border-sidebar-border text-sidebar-foreground hover:text-foreground hover:border-primary",
              collapsed ? "px-0 justify-center" : "justify-start"
            )}
            size="sm"
          >
            <Plus className="w-4 h-4" />
            {!collapsed && <span className="ml-2">New Reaction</span>}
          </Button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto px-2 py-1">
          {!collapsed ? (
            Object.entries(grouped).map(
              ([label, sessions]) =>
                sessions.length > 0 && (
                  <div key={label} className="mb-3">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground px-2 mb-1">
                      {label}
                    </p>
                    {sessions.map((session) => (
                      <button
                        key={session.id}
                        onClick={() => onSelectSession(session.id)}
                        className={cn(
                          "w-full text-left px-2 py-1.5 rounded-md text-sm truncate transition-colors",
                          activeSessionId === session.id
                            ? "bg-accent text-accent-foreground font-medium"
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
                        )}
                      >
                        {session.title}
                      </button>
                    ))}
                  </div>
                )
            )
          ) : (
            <div className="flex flex-col items-center gap-1 mt-1">
              {pastSessions.slice(0, 4).map((session) => (
                <Button
                  key={session.id}
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-8 w-8",
                    activeSessionId === session.id && "bg-accent text-accent-foreground"
                  )}
                  onClick={() => onSelectSession(session.id)}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Bottom section */}
        <div className="border-t border-sidebar-border p-2 space-y-1">
          <ThemeToggle />
          <Button
            variant="ghost"
            className={cn(
              "w-full text-sidebar-foreground hover:text-foreground",
              collapsed ? "px-0 justify-center" : "justify-start"
            )}
            size="sm"
          >
            <Settings className="w-4 h-4" />
            {!collapsed && <span className="ml-2">Settings</span>}
          </Button>
          <Button
            variant="ghost"
            className={cn(
              "w-full text-sidebar-foreground hover:text-foreground",
              collapsed ? "px-0 justify-center" : "justify-start"
            )}
            size="sm"
          >
            <User className="w-4 h-4" />
            {!collapsed && <span className="ml-2">Profile</span>}
          </Button>
        </div>
      </aside>

      <NewChatDialog open={newChatOpen} onOpenChange={setNewChatOpen} onSelect={onNewChat} />
    </>
  );
};
