import type { Enzyme } from '@/types/enzyme';
import type { PathwayStep } from '@/types/pathway';

export async function searchEnzymes(_step: Pick<PathwayStep, 'reactionType'>): Promise<Enzyme[]> {
  return Promise.resolve([]);
}

export async function getEnzyme(id: string): Promise<Enzyme> {
  throw new Error(`Enzyme ${id} not found`);
}
