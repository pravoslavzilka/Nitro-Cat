import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FlaskConical, Zap, Shield, BarChart3 } from "lucide-react";

const features = [
  {
    icon: <Zap className="w-6 h-6 text-primary" />,
    title: "AI-Powered Enzyme Discovery",
    description: "Leverage advanced AI models to identify optimal enzymes for each step in your biosynthetic pathway.",
  },
  {
    icon: <Shield className="w-6 h-6 text-primary" />,
    title: "Validated Pathways",
    description: "Access curated, experimentally validated metabolic pathways with confidence scores for every recommendation.",
  },
  {
    icon: <BarChart3 className="w-6 h-6 text-primary" />,
    title: "Kinetic Analysis",
    description: "Compare kcat, Km, and projected yields to make data-driven decisions on enzyme selection.",
  },
];

export const LandingPage = () => {  
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/images/logo.png"  className="h-[100px]"  />
          <span className="text-lg font-bold text-foreground">NitroCat</span>
        </div>
        <Button variant="outline" onClick={() => navigate('/login')}>
          Sign In
        </Button>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-24 gap-6">
        
        <img src="/images/logo.png"  className="h-[300px]"  />
        <h1 className="text-4xl sm:text-5xl font-bold text-foreground text-glow max-w-2xl">
          Discover optimal enzyme pathways with AI
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl">
          NitroCat combines cutting-edge machine learning with biochemistry databases to accelerate your metabolic engineering research.
        </p>
        <div className="flex gap-3 flex-wrap justify-center">
          <Button size="lg" onClick={() => navigate('/login')} className="glow-green">
            Get Started
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate('/pathways')}>
            View Demo
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-secondary border border-border rounded-lg p-6 space-y-3 hover:bg-muted transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-foreground">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
