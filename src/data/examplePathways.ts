import type { Pathway } from '@/types/pathway';
import { samplePathway } from './pathwayData';

// ── Example 1: Shikimic Acid Biosynthesis (reuse samplePathway) ──────────────

const shikimicAcid: Pathway = {
  ...samplePathway,
  id: 'example-1',
  name: 'Shikimic Acid Biosynthesis',
};

// ── Example 2: L-DOPA Synthesis (3 steps) ────────────────────────────────────

const ldopaSynthesis: Pathway = {
  id: 'example-2',
  name: 'L-DOPA Synthesis',
  description: 'Three-step biosynthetic route from L-Phenylalanine to L-DOPA via aromatic hydroxylation and catechol formation.',
  createdAt: '2025-02-10T09:00:00Z',
  updatedAt: '2025-02-15T11:00:00Z',
  status: 'complete',
  steps: [
    {
      id: 'ldopa-step-1',
      startMolecule: {
        name: 'L-Phenylalanine',
        smiles: 'N[C@@H](Cc1ccccc1)C(O)=O',
        formula: 'C₉H₁₁NO₂',
      },
      productMolecule: {
        name: 'L-Tyrosine',
        smiles: 'N[C@@H](Cc1ccc(O)cc1)C(O)=O',
        formula: 'C₉H₁₁NO₃',
      },
      reactionType: 'Chemical synthesis',
      enzymes: [],
    },
    {
      id: 'ldopa-step-2',
      startMolecule: {
        name: 'L-Tyrosine',
        smiles: 'N[C@@H](Cc1ccc(O)cc1)C(O)=O',
        formula: 'C₉H₁₁NO₃',
      },
      productMolecule: {
        name: 'L-DOPA',
        smiles: 'N[C@@H](Cc1ccc(O)c(O)c1)C(O)=O',
        formula: 'C₉H₁₁NO₄',
      },
      reactionType: 'Suggested biocatalysis',
      enzymes: [
        {
          id: 'ldopa-1a',
          name: 'Phenylalanine Hydroxylase (PheA)',
          ecNumber: 'EC 1.14.16.1',
          score: 0.95,
          organism: 'Homo sapiens',
          description: 'Tetrahydrobiopterin-dependent monooxygenase that hydroxylates L-phenylalanine at the para position to yield L-tyrosine.',
          optimalPh: '6.8–7.2',
          optimalTemp: '37°C',
          kcat: '52 s⁻¹',
          km: '0.08 mM',
          projectedYield: '94%',
          vendor: 'Sigma-Aldrich',
          vendorLogo: '',
          price: '$320.00 / 1mg',
          catalogNumber: 'P1580',
        },
      ],
    },
    {
      id: 'ldopa-step-3',
      startMolecule: {
        name: 'L-DOPA',
        smiles: 'N[C@@H](Cc1ccc(O)c(O)c1)C(O)=O',
        formula: 'C₉H₁₁NO₄',
      },
      productMolecule: {
        name: 'Dopamine',
        smiles: 'NCCc1ccc(O)c(O)c1',
        formula: 'C₈H₁₁NO₂',
      },
      reactionType: 'Chemical synthesis',
      enzymes: [],
    },
  ],
};

// ── Example 3: (1S)-1-(3-chloro-4-fluorophenyl)ethanamine Synthesis ───────────

const chiralAmineSynthesis: Pathway = {
  id: 'example-3',
  name: '(1S)-1-(3-chloro-4-fluorophenyl)ethanamine',
  description: 'Asymmetric reductive amination route to (1S)-1-(3-chloro-4-fluorophenyl)ethanamine, a chiral building block used in pharmaceutical synthesis.',
  createdAt: '2025-03-01T08:00:00Z',
  updatedAt: '2025-03-08T16:00:00Z',
  status: 'complete',
  steps: [
    {
      id: 'chiral-step-1',
      startMolecule: {
        name: '3-Chloro-4-fluoroacetophenone',
        smiles: 'CC(=O)c1ccc(F)c(Cl)c1',
        formula: 'C₈H₆ClFO',
      },
      productMolecule: {
        name: '(1S)-1-(3-chloro-4-fluorophenyl)ethanol',
        smiles: '[C@@H](c1ccc(F)c(Cl)c1)(O)C',
        formula: 'C₈H₈ClFO',
      },
      reactionType: 'Chemical synthesis',
      enzymes: [],
    },
    {
      id: 'chiral-step-2',
      startMolecule: {
        name: '(1S)-1-(3-chloro-4-fluorophenyl)ethanol',
        smiles: '[C@@H](c1ccc(F)c(Cl)c1)(O)C',
        formula: 'C₈H₈ClFO',
      },
      productMolecule: {
        name: '(1S)-1-(3-chloro-4-fluorophenyl)ethanamine',
        smiles: '[C@@H](c1ccc(F)c(Cl)c1)(N)C',
        formula: 'C₈H₉ClFN',
      },
      reactionType: 'Suggested biocatalysis',
      enzymes: [
        {
          id: 'chiral-1a',
          name: 'Ketoreductase KRED-P1-B02',
          ecNumber: 'EC 1.1.1.184',
          score: 0.97,
          organism: 'Lactobacillus kefiri',
          description: 'NADPH-dependent short-chain alcohol dehydrogenase with >99% ee for aryl ketones bearing halo substituents. Anti-Prelog selectivity.',
          optimalPh: '6.5–7.0',
          optimalTemp: '30°C',
          kcat: '62 s⁻¹',
          km: '0.07 mM',
          projectedYield: '96%',
          vendor: 'Codexis',
          vendorLogo: '',
          price: '$520.00 / 1mg',
          catalogNumber: 'KRED-P1-B02',
        },
      ],
    },
  ],
};

export const examplePathways: Pathway[] = [shikimicAcid, ldopaSynthesis, chiralAmineSynthesis];
