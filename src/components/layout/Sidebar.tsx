import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Plus,
  FlaskConical,
  Settings,
  User,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface ChatSession {
  id: string;
  title: string;
  date: string;
}

const pastSessions: ChatSession[] = [
  { id: "1", title: "Shikimic Acid Biosynthesis", date: "Today" },
  { id: "2", title: "Tryptophan Pathway", date: "Yesterday" },
  { id: "3", title: "Chorismate Synthesis", date: "3 days ago" },
  { id: "4", title: "Phenylalanine Route", date: "Last week" },
];

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { resolvedTheme } = useTheme();
  const logo = resolvedTheme === "dark" ? "/images/logo3.png" : "/images/logo4.png";

  const grouped = {
    Today: pastSessions.filter((s) => s.date === "Today"),
    Yesterday: pastSessions.filter((s) => s.date === "Yesterday"),
    Older: pastSessions.filter((s) => s.date !== "Today" && s.date !== "Yesterday"),
  };

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-all duration-300 shrink-0",
        collapsed ? "w-14" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <img src={logo} className="h-10" />
            <span className="text-sm font-semibold text-foreground">NitroCat</span>
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

      {/* New Reaction Button */}
      <div className="p-2">
        <Button
          onClick={() => navigate('/pathways/new')}
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

      {/* Nav links */}
      {!collapsed && (
        <div className="px-2 pb-2 space-y-1">
          <button
            onClick={() => navigate('/pathways')}
            className={cn(
              "w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors",
              isActive('/pathways')
                ? "bg-accent text-accent-foreground font-medium"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
            )}
          >
            <FlaskConical className="w-4 h-4" />
            Pathways
          </button>
          <button
            onClick={() => navigate('/history')}
            className={cn(
              "w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors",
              isActive('/history')
                ? "bg-accent text-accent-foreground font-medium"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
            )}
          >
            <History className="w-4 h-4" />
            History
          </button>
        </div>
      )}

      {/* Session History */}
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
                      onClick={() => navigate(`/pathways/${session.id}`)}
                      className={cn(
                        "w-full text-left px-2 py-1.5 rounded-md text-sm truncate transition-colors",
                        location.pathname === `/pathways/${session.id}`
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
                  location.pathname === `/pathways/${session.id}` && "bg-accent text-accent-foreground"
                )}
                onClick={() => navigate(`/pathways/${session.id}`)}
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
          onClick={() => navigate('/settings')}
          className={cn(
            "w-full text-sidebar-foreground hover:text-foreground",
            collapsed ? "px-0 justify-center" : "justify-start",
            isActive('/settings') && "bg-accent text-accent-foreground"
          )}
          size="sm"
        >
          <Settings className="w-4 h-4" />
          {!collapsed && <span className="ml-2">Settings</span>}
        </Button>
        <Button
          variant="ghost"
          onClick={() => navigate('/profile')}
          className={cn(
            "w-full text-sidebar-foreground hover:text-foreground",
            collapsed ? "px-0 justify-center" : "justify-start",
            isActive('/profile') && "bg-accent text-accent-foreground"
          )}
          size="sm"
        >
          <User className="w-4 h-4" />
          {!collapsed && <span className="ml-2">Profile</span>}
        </Button>
      </div>
    </aside>
  );
};
