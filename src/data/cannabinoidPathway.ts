import type { PathwayGraph } from '@/types/pathway';

export const cannabinoidPathway: PathwayGraph = {
  id: 'example-cannabinoid',
  name: 'Non-natural Cannabinoid Biosynthesis',
  description: 'In vivo yeast biosynthesis · Luo & Reiter et al. Nature 2019',
  status: 'complete',
  nodes: [
    // Molecules
    { id: 'm1', type: 'molecule', data: { name: 'Hexanoic acid', smiles: 'CCCCCC(=O)O' } },
    { id: 'm2', type: 'molecule', data: { name: 'Olivetolic acid (OA)', smiles: 'OC(=O)c1cc(O)cc(O)c1CCCCC' } },
    { id: 'm3', type: 'molecule', data: { name: 'Cannabigerolic acid (CBGA)', smiles: 'OC(=O)CCc1c(O)cc(O)c(CC=C(C)CCC=C(C)C)c1' } },
    { id: 'm4', type: 'molecule', data: { name: 'THCA', smiles: 'OC(=O)[C@@H]1[C@@H]2CC(C)=CC[C@@H]2C(C)(C)Oc2cc(CCCCC)cc(O)c21' } },
    { id: 'm5', type: 'molecule', data: { name: 'THC (Δ9-THC)', smiles: 'CCCCCC1=CC(=C2[C@@H]3CC(=CC[C@H]3C(OC2=C1)(C)C)C)O' } },

    // Reactions
    {
      id: 'r1', type: 'reaction', data: {
        label: 'Suggested biocatalysis',
        enzyme: {
          id: 'tks-oac', name: 'Tetraketide Synthase / Olivetolic Acid Cyclase', ecNumber: 'EC 2.3.1.206',
          organism: 'Cannabis sativa', score: 0.93, description: '',
          optimalPh: '7.0', optimalTemp: '30°C', kcat: '0.8 min⁻¹', km: '12 μM',
          projectedYield: '91%', vendor: '', vendorLogo: '', catalogNumber: '', price: '$410 / 5mg',
        },
      },
    },
    {
      id: 'r2', type: 'reaction', data: {
        label: 'Suggested biocatalysis',
        enzyme: {
          id: 'cspt4', name: 'Cannabigerolic Acid Synthase (CsPT4)', ecNumber: 'EC 2.5.1.102',
          organism: 'Cannabis sativa', score: 0.89, description: '',
          optimalPh: '6.5', optimalTemp: '33°C', kcat: '1.2 min⁻¹', km: '28 μM',
          projectedYield: '85%', vendor: '', vendorLogo: '', catalogNumber: '', price: '$380 / 5mg',
        },
      },
    },
    {
      id: 'r3', type: 'reaction', data: {
        label: 'Suggested biocatalysis',
        enzyme: {
          id: 'thcas', name: 'THCA Synthase', ecNumber: 'EC 1.21.3.7',
          organism: 'Cannabis sativa', score: 0.87, description: '',
          optimalPh: '5.5', optimalTemp: '30°C', kcat: '0.5 min⁻¹', km: '41 μM',
          projectedYield: '79%', vendor: '', vendorLogo: '', catalogNumber: '', price: '$450 / 5mg',
        },
      },
    },
    { id: 'r4', type: 'reaction', data: { label: 'Chemical synthesis' } },
  ],
  edges: [
    { id: 'e1', source: 'm1', target: 'r1' },
    { id: 'e2', source: 'r1', target: 'm2' },
    { id: 'e3', source: 'm2', target: 'r2' },
    { id: 'e4', source: 'r2', target: 'm3' },
    { id: 'e5', source: 'm3', target: 'r3' },
    { id: 'e6', source: 'r3', target: 'm4' },
    { id: 'e7', source: 'm4', target: 'r4' },
    { id: 'e8', source: 'r4', target: 'm5' },
  ],
};
