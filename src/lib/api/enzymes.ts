import type { Enzyme } from '@/types/enzyme';
import type { PathwayStep } from '@/types/pathway';
import { samplePathway } from '@/data/pathwayData';

// Collect all enzymes from sample data for stub responses
const allSampleEnzymes: Enzyme[] = samplePathway.steps.flatMap((s) => s.enzymes);

export async function searchEnzymes(step: Pick<PathwayStep, 'reactionType' | 'fromSubstrate' | 'toSubstrate'>): Promise<Enzyme[]> {
  // Stub: return sample enzymes filtered loosely by reaction type
  const lower = step.reactionType.toLowerCase();
  const relevant = allSampleEnzymes.filter((e) =>
    e.organism.toLowerCase().includes('e. coli') || lower.length > 0
  );
  return Promise.resolve(relevant.length > 0 ? relevant : allSampleEnzymes);
}

export async function getEnzyme(id: string): Promise<Enzyme> {
  const found = allSampleEnzymes.find((e) => e.id === id);
  if (!found) throw new Error(`Enzyme ${id} not found`);
  return Promise.resolve(found);
}
