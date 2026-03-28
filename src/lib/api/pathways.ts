import type { Pathway, PathwayGraph } from '@/types/pathway';
import { allExamplePathways } from '@/data/allExamplePathways';

export async function getPathways(): Promise<Pathway[]> {
  return Promise.resolve([]);
}

export async function getPathway(id: string): Promise<PathwayGraph> {
  const example = allExamplePathways.find((p) => p.id === id);
  if (example) return Promise.resolve(example);
  throw new Error(`Pathway ${id} not found`);
}

export async function createPathway(data: Partial<Pathway>): Promise<Pathway> {
  const newPathway: Pathway = {
    id: Date.now().toString(),
    name: data.name ?? 'New Pathway',
    description: data.description ?? '',
    steps: data.steps ?? [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'draft',
  };
  return Promise.resolve(newPathway);
}

export async function updatePathway(id: string, _data: Partial<Pathway>): Promise<Pathway> {
  throw new Error(`Pathway ${id} not found`);
}

export async function deletePathway(_id: string): Promise<void> {
  return Promise.resolve();
}
