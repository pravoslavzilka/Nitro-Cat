import type { Pathway, PathwayGraph } from '@/types/pathway';
import { pathways } from '@/data/pathwayData';
import { examplePathways } from '@/data/examplePathways';
import { pathwayToGraph } from '@/lib/utils/pathwayConvert';

export async function getPathways(): Promise<Pathway[]> {
  return Promise.resolve(pathways);
}

export async function getPathway(id: string): Promise<PathwayGraph> {
  const example = examplePathways.find((p) => p.id === id);
  if (example) return Promise.resolve(example);

  const found = pathways.find((p) => p.id === id);
  if (found) return Promise.resolve(pathwayToGraph(found));

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

export async function updatePathway(id: string, data: Partial<Pathway>): Promise<Pathway> {
  const existing = pathways.find(p => p.id === id);
  if (!existing) throw new Error(`Pathway ${id} not found`);
  return Promise.resolve({ ...existing, ...data, id, updatedAt: new Date().toISOString() });
}

export async function deletePathway(_id: string): Promise<void> {
  return Promise.resolve();
}
