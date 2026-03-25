import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

const AI_MODELS = [
  { id: 'enzym-4', label: 'EnzymAI-4', desc: 'Most capable' },
  { id: 'enzym-4-mini', label: 'EnzymAI-4 Mini', desc: 'Fast & efficient' },
  { id: 'enzym-3.5', label: 'EnzymAI-3.5', desc: 'Balanced' },
];

const DENSITY_OPTIONS = [
  { id: 'comfortable', label: 'Comfortable' },
  { id: 'compact', label: 'Compact' },
];

const THEME_OPTIONS: Array<{ id: 'light' | 'dark' | 'system'; label: string; icon: React.ReactNode }> = [
  { id: 'light', label: 'Light', icon: <Sun className="w-4 h-4" /> },
  { id: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4" /> },
  { id: 'system', label: 'System', icon: <Monitor className="w-4 h-4" /> },
];

export const SettingsPage = () => {
  const { theme, setTheme } = useTheme();
  const [defaultModel, setDefaultModel] = useState(() => localStorage.getItem('default_model') ?? 'enzym-4');
  const [density, setDensity] = useState<'compact' | 'comfortable'>(() => {
    return (localStorage.getItem('display_density') as 'compact' | 'comfortable') ?? 'comfortable';
  });

  // Apply density attribute to document
  useEffect(() => {
    document.documentElement.setAttribute('data-density', density);
  }, [density]);

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    toast({ title: 'Theme updated', description: `Theme set to ${newTheme}.` });
  };

  const handleModelChange = (model: string) => {
    setDefaultModel(model);
    localStorage.setItem('default_model', model);
    toast({ title: 'Model updated', description: `Default model set to ${AI_MODELS.find((m) => m.id === model)?.label}.` });
  };

  const handleDensityChange = (newDensity: 'compact' | 'comfortable') => {
    setDensity(newDensity);
    localStorage.setItem('display_density', newDensity);
    document.documentElement.setAttribute('data-density', newDensity);
    toast({ title: 'Display updated', description: `Density set to ${newDensity}.` });
  };

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="max-w-lg mx-auto space-y-8">
        <div>
          <h1 className="text-xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Configure your EnzymAI experience</p>
        </div>

        {/* Appearance */}
        <section className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">Appearance</h2>
            <p className="text-xs text-muted-foreground">Choose your preferred color scheme</p>
          </div>
          <div className="flex gap-3">
            {THEME_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleThemeChange(opt.id)}
                className={cn(
                  "flex-1 flex flex-col items-center gap-2 p-3 rounded-lg border transition-all",
                  theme === opt.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-secondary text-muted-foreground hover:border-primary/50 hover:text-foreground"
                )}
              >
                {opt.icon}
                <span className="text-xs font-medium">{opt.label}</span>
              </button>
            ))}
          </div>
        </section>

        <Separator />

        {/* AI Model */}
        <section className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">AI Model</h2>
            <p className="text-xs text-muted-foreground">Default model for pathway analysis</p>
          </div>
          <div className="space-y-1.5">
            <Label>Default Model</Label>
            <Select value={defaultModel} onValueChange={handleModelChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-emphasis)' }}>
                {AI_MODELS.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{m.label}</span>
                      <span className="text-xs text-muted-foreground">{m.desc}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        <Separator />

        {/* Display Density */}
        <section className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">Display</h2>
            <p className="text-xs text-muted-foreground">Adjust information density</p>
          </div>
          <div className="flex gap-3">
            {DENSITY_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleDensityChange(opt.id as 'compact' | 'comfortable')}
                className={cn(
                  "flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all",
                  density === opt.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-secondary text-muted-foreground hover:border-primary/50 hover:text-foreground"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default SettingsPage;
