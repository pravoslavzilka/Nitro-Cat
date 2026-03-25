import type { Enzyme } from './enzyme';

export interface Molecule {
  name: string;
  smiles: string;
  formula?: string;
}

export interface PathwayStep {
  id: string;
  startMolecule: Molecule;
  productMolecule: Molecule;
  reactionType: string;
  enzymes: Enzyme[];
  hasBruteForce: boolean;
}

export interface Pathway {
  id: string;
  name: string;
  description: string;
  steps: PathwayStep[];
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'analyzing' | 'complete';
}
