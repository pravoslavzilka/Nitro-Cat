import type { PathwayGraph } from '@/types/pathway';
import { pathwayToGraph } from '@/lib/utils/pathwayConvert';
import { samplePathway } from './pathwayData';
import { islatravirPathway } from './islatravirPathway';

// ── Example 1: Shikimic Acid Biosynthesis ─────────────────────────────────────

const shikimicAcid: PathwayGraph = {
  ...pathwayToGraph(samplePathway),
  id: 'example-1',
  name: 'Shikimic Acid Biosynthesis',
};

// ── Example 2: L-DOPA Synthesis (3 steps) ─────────────────────────────────────

const ldopaSynthesis: PathwayGraph = {
  id: 'example-2',
  name: 'L-DOPA Synthesis',
  description: 'Three-step biosynthetic route from L-Phenylalanine to L-DOPA via aromatic hydroxylation and catechol formation.',
  status: 'complete',
  nodes: [
    { id: 'm0', type: 'molecule', data: { name: 'L-Phenylalanine', smiles: 'N[C@@H](Cc1ccccc1)C(O)=O', formula: 'C₉H₁₁NO₂' } },
    { id: 'r1', type: 'reaction', data: { label: 'Chemical synthesis' } },
    { id: 'm1', type: 'molecule', data: { name: 'L-Tyrosine', smiles: 'N[C@@H](Cc1ccc(O)cc1)C(O)=O', formula: 'C₉H₁₁NO₃' } },
    {
      id: 'r2', type: 'reaction', data: {
        label: 'Suggested biocatalysis',
        enzyme: {
          id: 'ldopa-1a', name: 'Phenylalanine Hydroxylase (PheA)', ecNumber: 'EC 1.14.16.1',
          score: 0.95, organism: 'Homo sapiens',
          description: 'Tetrahydrobiopterin-dependent monooxygenase that hydroxylates L-phenylalanine at the para position to yield L-tyrosine.',
          optimalPh: '6.8–7.2', optimalTemp: '37°C', kcat: '52 s⁻¹', km: '0.08 mM',
          projectedYield: '94%', vendor: 'Sigma-Aldrich', vendorLogo: '', price: '$320.00 / 1mg', catalogNumber: 'P1580',
        },
      },
    },
    { id: 'm2', type: 'molecule', data: { name: 'L-DOPA', smiles: 'N[C@@H](Cc1ccc(O)c(O)c1)C(O)=O', formula: 'C₉H₁₁NO₄' } },
    { id: 'r3', type: 'reaction', data: { label: 'Chemical synthesis' } },
    { id: 'm3', type: 'molecule', data: { name: 'Dopamine', smiles: 'NCCc1ccc(O)c(O)c1', formula: 'C₈H₁₁NO₂' } },
  ],
  edges: [
    { id: 'e1', source: 'm0', target: 'r1' },
    { id: 'e2', source: 'r1', target: 'm1' },
    { id: 'e3', source: 'm1', target: 'r2' },
    { id: 'e4', source: 'r2', target: 'm2' },
    { id: 'e5', source: 'm2', target: 'r3' },
    { id: 'e6', source: 'r3', target: 'm3' },
  ],
};

// ── Example 3: Chiral Amine Synthesis (2 steps) ───────────────────────────────

const chiralAmineSynthesis: PathwayGraph = {
  id: 'example-3',
  name: '(1S)-1-(3-chloro-4-fluorophenyl)ethanamine',
  description: 'Asymmetric reductive amination route to a chiral building block used in pharmaceutical synthesis.',
  status: 'complete',
  nodes: [
    { id: 'm0', type: 'molecule', data: { name: '3-Chloro-4-fluoroacetophenone', smiles: 'CC(=O)c1ccc(F)c(Cl)c1', formula: 'C₈H₆ClFO' } },
    { id: 'r1', type: 'reaction', data: { label: 'Chemical synthesis' } },
    { id: 'm1', type: 'molecule', data: { name: '(1S)-1-(3-chloro-4-fluorophenyl)ethanol', smiles: '[C@@H](c1ccc(F)c(Cl)c1)(O)C', formula: 'C₈H₈ClFO' } },
    {
      id: 'r2', type: 'reaction', data: {
        label: 'Suggested biocatalysis',
        enzyme: {
          id: 'chiral-1a', name: 'Ketoreductase KRED-P1-B02', ecNumber: 'EC 1.1.1.184',
          score: 0.97, organism: 'Lactobacillus kefiri',
          description: 'NADPH-dependent short-chain alcohol dehydrogenase with >99% ee for aryl ketones bearing halo substituents. Anti-Prelog selectivity.',
          optimalPh: '6.5–7.0', optimalTemp: '30°C', kcat: '62 s⁻¹', km: '0.07 mM',
          projectedYield: '96%', vendor: 'Codexis', vendorLogo: '', price: '$520.00 / 1mg', catalogNumber: 'KRED-P1-B02',
        },
      },
    },
    { id: 'm2', type: 'molecule', data: { name: '(1S)-1-(3-chloro-4-fluorophenyl)ethanamine', smiles: '[C@@H](c1ccc(F)c(Cl)c1)(N)C', formula: 'C₈H₉ClFN' } },
  ],
  edges: [
    { id: 'e1', source: 'm0', target: 'r1' },
    { id: 'e2', source: 'r1', target: 'm1' },
    { id: 'e3', source: 'm1', target: 'r2' },
    { id: 'e4', source: 'r2', target: 'm2' },
  ],
};

export const examplePathways: PathwayGraph[] = [
  shikimicAcid,
  ldopaSynthesis,
  chiralAmineSynthesis,
  islatravirPathway,
];
