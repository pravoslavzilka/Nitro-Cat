import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MoleculeInput } from "@/components/pathway/MoleculeInput";
import { toast } from "@/hooks/use-toast";

export const NewPathwayPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startMolecule, setStartMolecule] = useState('');
  const [targetMolecule, setTargetMolecule] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    // Stub: simulate creation delay
    await new Promise((r) => setTimeout(r, 600));
    toast({ title: "Pathway created", description: `"${name}" has been created successfully.` });
    navigate('/pathways/1');
  };

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="max-w-lg mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">New Reaction Pathway</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Define your biosynthetic route</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="name">Pathway Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Shikimic Acid Biosynthesis"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this pathway..."
              rows={3}
            />
          </div>

          <MoleculeInput
            label="Starting Molecule"
            value={startMolecule}
            onChange={setStartMolecule}
            placeholder="e.g. D-Erythrose 4-Phosphate"
          />

          <MoleculeInput
            label="Target Molecule"
            value={targetMolecule}
            onChange={setTargetMolecule}
            placeholder="e.g. Shikimic Acid"
          />

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => navigate('/pathways')} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || isSubmitting} className="flex-1">
              {isSubmitting ? 'Creating...' : 'Create Pathway'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewPathwayPage;
