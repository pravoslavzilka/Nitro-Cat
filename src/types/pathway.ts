import type { Enzyme } from './enzyme';

export interface PathwayStep {
  id: string;
  fromSubstrate: string;
  toSubstrate: string;
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
