import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

export const LandingPage = () => {
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();
  const logo = resolvedTheme === "dark" ? "/images/logo3.png" : "/images/logo4.png";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={logo} className="h-10" />
          <span className="text-lg font-bold text-foreground">NitroCat</span>
        </div>
        <Button variant="outline" onClick={() => navigate('/login')}>
          Sign In
        </Button>
      </header>

      {/* Hero */}
      <section className="min-h-[calc(100vh-57px)] flex flex-col items-center justify-center text-center">
        <img src={logo} className="h-28" />
        <h1 className="text-3xl font-bold text-foreground mt-3">NitroCat</h1>
        <div className="flex gap-4 mt-10">
          <Button
            variant="outline"
            className="w-56 h-20 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 hover:text-primary transition-all flex flex-col gap-1"
            onClick={() => {}}
          >
            <Upload className="w-5 h-5" />
            <span className="text-base font-semibold">Import Reaction</span>
          </Button>
          <Button
            variant="outline"
            className="w-56 h-20 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 hover:text-primary transition-all flex flex-col gap-1"
            onClick={() => {}}
          >
            <Upload className="w-5 h-5" />
            <span className="text-base font-semibold">Import Pathway</span>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
