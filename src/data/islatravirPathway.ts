import type { PathwayGraph } from '@/types/pathway';

export const islatravirPathway: PathwayGraph = {
  id: 'example-islatravir',
  name: 'Islatravir Biosynthesis',
  description: '3-enzyme biocatalytic cascade · Huffman et al. Science 2019',
  status: 'complete',
  nodes: [
    // Molecule nodes
    { id: 'm1', type: 'molecule', data: { name: 'Islatravir (1)', smiles: 'C#C[C@]1([C@H](C[C@@H](O1)N2C=NC3=C(N=C(N=C32)F)N)O)CO' } },
    { id: 'm2', type: 'molecule', data: { name: '2-Fluoroadenine (2)', smiles: 'C1=NC2=NC(=NC(=C2N1)N)F' } },
    { id: 'm3', type: 'molecule', data: { name: 'Compound 3', smiles: 'C#C[C@]1(CO)[C@@H](O)C[C@@H](OP(=O)(O)O)O1' } },
    { id: 'm4', type: 'molecule', data: { name: 'Compound 4', smiles: 'C#C[C@]1(COP(=O)(O)O)[C@@H](O)C[C@@H](O)O1' } },
    { id: 'm5', type: 'molecule', data: { name: 'Aldehyde intermediate (5)', smiles: 'O=C[C@@](O)(C#C)COP(=O)(O)O' } },
    { id: 'm6', type: 'molecule', data: { name: 'Acetaldehyde', smiles: 'CC=O' } },

    // Reaction nodes
    {
      id: 'r1', type: 'reaction', data: {
        label: 'Suggested biocatalysis',
        enzyme: {
          id: 'pnp', name: 'Purine Nucleoside Phosphorylase', ecNumber: 'EC 2.4.2.1',
          organism: 'E. coli', score: 0.95, description: '',
          optimalPh: '7.5', optimalTemp: '37°C', kcat: '142 s⁻¹', km: '0.18 mM',
          projectedYield: '94%', vendor: '', vendorLogo: '', catalogNumber: '', price: '$320 / 10mg',
        },
      },
    },
    {
      id: 'r2', type: 'reaction', data: {
        label: 'Suggested biocatalysis',
        enzyme: {
          id: 'ppm', name: 'Phosphopentomutase', ecNumber: 'EC 5.4.2.7',
          organism: 'E. coli', score: 0.91, description: '',
          optimalPh: '7.4', optimalTemp: '35°C', kcat: '89 s⁻¹', km: '0.42 mM',
          projectedYield: '88%', vendor: '', vendorLogo: '', catalogNumber: '', price: '$280 / 10mg',
        },
      },
    },
    {
      id: 'r3', type: 'reaction', data: {
        label: 'Suggested biocatalysis',
        enzyme: {
          id: 'dera', name: 'Deoxyribose 5-Phosphate Aldolase', ecNumber: 'EC 4.1.2.4',
          organism: 'E. coli', score: 0.88, description: '',
          optimalPh: '7.6', optimalTemp: '37°C', kcat: '67 s⁻¹', km: '0.55 mM',
          projectedYield: '81%', vendor: '', vendorLogo: '', catalogNumber: '', price: '$350 / 10mg',
        },
      },
    },
  ],
  edges: [
    { id: 'e1', source: 'm6', target: 'r3' },
    { id: 'e2', source: 'm5', target: 'r3' },
    { id: 'e3', source: 'r3', target: 'm4' },
    { id: 'e4', source: 'm4', target: 'r2' },
    { id: 'e5', source: 'r2', target: 'm3' },
    { id: 'e6', source: 'm3', target: 'r1' },
    { id: 'e7', source: 'm2', target: 'r1' },
    { id: 'e8', source: 'r1', target: 'm1' },
  ],
};
