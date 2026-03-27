import type { PathwayGraph } from '@/types/pathway';

export const chemoEnzymaticPathway: PathwayGraph = {
  id: 'example-chemoenzymatic',
  name: 'Chemo-Enzymatic Synthesis of Chiral Amine Alcohol',
  description: 'Rh catalysis + ADH reduction · Cortes-Clerget et al. Nat Commun 2019',
  status: 'complete',
  nodes: [
    // Molecules
    { id: 'm1', type: 'molecule', data: { name: '3-Nitrophenylboronic acid', smiles: 'OB(O)c1cccc([N+](=O)[O-])c1' } },
    { id: 'm2', type: 'molecule', data: { name: 'Methyl vinyl ketone', smiles: 'CC(=O)C=C' } },
    { id: 'm3', type: 'molecule', data: { name: '4-(3-Nitrophenyl)butan-2-one', smiles: 'CC(=O)CCc1cccc([N+](=O)[O-])c1' } },
    { id: 'm4', type: 'molecule', data: { name: '4-(3-Aminophenyl)butan-2-one', smiles: 'CC(=O)CCc1cccc(N)c1' } },
    { id: 'm5', type: 'molecule', data: { name: '(R)-4-(3-Aminophenyl)butan-2-ol', smiles: 'C[C@@H](O)CCc1cccc(N)c1' } },

    // Reactions
    { id: 'r1', type: 'reaction', data: { label: 'Chemical synthesis' } },
    { id: 'r2', type: 'reaction', data: { label: 'Chemical synthesis' } },
    {
      id: 'r3', type: 'reaction', data: {
        label: 'Suggested biocatalysis',
        enzyme: {
          id: 'adh101', name: 'Alcohol Dehydrogenase ADH101', ecNumber: 'EC 1.1.1.1',
          organism: 'Johnson Matthey', score: 0.96, description: '',
          optimalPh: '7.0', optimalTemp: '30°C', kcat: '220 s⁻¹', km: '0.09 mM',
          projectedYield: '97%', vendor: '', vendorLogo: '', catalogNumber: '', price: '$290 / 10mg',
        },
      },
    },
  ],
  edges: [
    { id: 'e1', source: 'm1', target: 'r1' },
    { id: 'e2', source: 'm2', target: 'r1' },
    { id: 'e3', source: 'r1', target: 'm3' },
    { id: 'e4', source: 'm3', target: 'r2' },
    { id: 'e5', source: 'r2', target: 'm4' },
    { id: 'e6', source: 'm4', target: 'r3' },
    { id: 'e7', source: 'r3', target: 'm5' },
  ],
};
