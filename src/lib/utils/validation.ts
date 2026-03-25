export function isValidMoleculeName(name: string): boolean {
  return name.trim().length >= 2;
}

export function isValidSmiles(smiles: string): boolean {
  // Basic stub: true if non-empty
  return smiles.trim().length > 0;
}
