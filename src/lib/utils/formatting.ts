// Transform raw CLIPZyme cosine similarity into an intuitive 0–1 scale.
// Empirical bounds from testing real reactions against the backend:
//   ~0.10 = no meaningful match, ~0.45 = best observed match.
// Values outside this range are clamped.
const CLIPZYME_LOW  = 0.10;
const CLIPZYME_HIGH = 0.45;

export function transformClipzymeScore(raw: number): number {
  return Math.min(1, Math.max(0, (raw - CLIPZYME_LOW) / (CLIPZYME_HIGH - CLIPZYME_LOW)));
}

export function formatScore(score: number): string {
  return `${Math.round(score * 100)}%`;
}

export function formatConfidenceLabel(score: number): 'high' | 'medium' | 'low' {
  if (score >= 0.9) return 'high';
  if (score >= 0.75) return 'medium';
  return 'low';
}

export function formatPrice(price: string): string {
  return price;
}

export function formatDate(date: string): string {
  try {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return date;
  }
}
