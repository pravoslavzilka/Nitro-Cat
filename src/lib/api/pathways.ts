import type { Pathway } from '@/types/pathway';
import { samplePathway } from '@/data/pathwayData';

// Stub: in production these would call apiGet/apiPost/apiPut/apiDelete
// For now return sample data so the UI works without a backend

export async function getPathways(): Promise<Pathway[]> {
  return Promise.resolve([
    samplePathway,
    {
      ...samplePathway,
      id: '2',
      name: 'Tryptophan Biosynthesis',
      description: 'Synthesis of tryptophan from chorismate via anthranilate',
      status: 'analyzing' as const,
      createdAt: '2025-02-01T10:00:00Z',
      updatedAt: '2025-02-10T14:00:00Z',
    },
    {
      ...samplePathway,
      id: '3',
      name: 'Chorismate Mutase Pathway',
      description: 'Conversion of chorismate to prephenate',
      status: 'draft' as const,
      createdAt: '2025-03-01T10:00:00Z',
      updatedAt: '2025-03-05T09:00:00Z',
    },
  ]);
}

export async function getPathway(id: string): Promise<Pathway> {
  const pathways = await getPathways();
  const found = pathways.find((p) => p.id === id);
  if (!found) throw new Error(`Pathway ${id} not found`);
  return found;
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
  const existing = await getPathway(id);
  return Promise.resolve({ ...existing, ...data, id, updatedAt: new Date().toISOString() });
}

export async function deletePathway(_id: string): Promise<void> {
  return Promise.resolve();
}
