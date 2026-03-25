export function formatScore(score: number): string {
  return `${Math.round(score * 100)}%`;
}

export function formatConfidenceLabel(score: number): 'high' | 'medium' | 'low' {
  if (score >= 0.9) return 'high';
  if (score >= 0.6) return 'medium';
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
