import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

export const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/images/nitroduck-logo.png" className="h-8" alt="Nitroduck" />
          <span className="text-sm font-bold tracking-widest uppercase text-foreground">Nitroduck</span>
        </div>
        <Button variant="outline" onClick={() => navigate('/login')}>
          Sign In
        </Button>
      </header>

      {/* Hero */}
      <section className="min-h-[calc(100vh-57px)] flex flex-col items-center justify-center text-center">
        <img src="/images/nitroduck-logo.png" className="h-32 mb-4" alt="Nitroduck" />
        <h1 className="text-3xl font-bold text-foreground mt-3">NitroCat</h1>
        <div className="flex gap-4 mt-10">
          <Button
            variant="outline"
            className="group w-72 h-36 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 hover:text-primary transition-all flex flex-col gap-1"
            onClick={() => navigate('/pathways/new')}
          >
            <Upload className="w-7 h-7" />
            <span className="text-lg font-semibold">Import Reaction</span>
            <span className="text-xs italic text-muted-foreground mt-1 group-hover:text-muted-foreground">SMILES · .rxn</span>
          </Button>
          <Button
            variant="outline"
            className="group w-72 h-36 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 hover:text-primary transition-all flex flex-col gap-1"
            onClick={() => navigate('/pathways/import')}
          >
            <Upload className="w-7 h-7" />
            <span className="text-lg font-semibold">Import Pathway</span>
            <span className="text-xs italic text-muted-foreground mt-1 group-hover:text-muted-foreground">.rdf · Reaxys · SYNTHIA · .cdxml</span>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
