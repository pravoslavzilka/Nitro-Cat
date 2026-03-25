import type { Pathway } from '@/types/pathway';
import pathwaysJson from './pathways.json';

export const pathways: Pathway[] = pathwaysJson as Pathway[];

export const samplePathway: Pathway = pathways[0];

export function getPathwayById(id: string): Pathway | undefined {
  return pathways.find((p) => p.id === id);
}
