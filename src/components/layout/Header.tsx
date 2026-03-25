import { useLocation, Link } from "react-router-dom";
import { useAuth } from "@/lib/auth/context";
import { ThemeToggle } from "./ThemeToggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { FlaskConical } from "lucide-react";

const routeTitles: Record<string, string> = {
  '/pathways': 'Pathways',
  '/pathways/new': 'New Pathway',
  '/history': 'History',
  '/settings': 'Settings',
  '/profile': 'Profile',
};

function getTitle(pathname: string): string {
  if (routeTitles[pathname]) return routeTitles[pathname];
  const match = pathname.match(/^\/pathways\/([^/]+)\/results$/);
  if (match) return 'Pathway Results';
  const matchDetail = pathname.match(/^\/pathways\/([^/]+)$/);
  if (matchDetail) return 'Pathway Detail';
  return 'NitroCat';
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export const Header = () => {
  const location = useLocation();
  const { user } = useAuth();
  const title = getTitle(location.pathname);

  return (
    <header className="h-12 flex items-center justify-between px-4 border-b border-border bg-background shrink-0">
      <div className="flex items-center gap-2">
        <FlaskConical className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold text-foreground">{title}</span>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        {user && (
          <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-sm text-muted-foreground hidden sm:block">{user.name}</span>
            <Avatar className="h-7 w-7">
              <AvatarFallback className="text-xs bg-primary/15 text-primary">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
          </Link>
        )}
      </div>
    </header>
  );
};
