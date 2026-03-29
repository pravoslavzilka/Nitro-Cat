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

// ── Graph-based pathway representation ───────────────────────────────────────

export interface MoleculeNodeData {
  name: string;
  smiles: string;
  formula?: string;
}

export type ReactionLabel = 'Chemical synthesis' | 'Biocatalyst found' | 'Test biocatalysis';

export interface ReactionNodeData {
  label: ReactionLabel;
  confidence?: 'high' | 'medium' | 'low';
  enzyme?: Enzyme;
  // injected by PathwayBuilder from edge/node graph
  substrateSmiles?: string;   // dot-joined if multi-substrate
  productSmiles?: string;
  substrateName?: string;
  productName?: string;
  pathwayId?: string;
  reactionId?: string;
}

export interface PathwayNode {
  id: string;
  type: 'molecule' | 'reaction';
  data: MoleculeNodeData | ReactionNodeData;
}

export interface PathwayGraph {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'analyzi