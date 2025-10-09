/**
 * Text normalization utilities for IAB taxonomy matching
 */

const PUNCT_RE = /[^\w\s&/+-]/g;
const WS_RE = /\s+/g;

/**
 * Normalize text for matching: lowercase, remove punctuation, normalize whitespace
 */
export function normalize(text: string): string {
  if (!text) return '';
  
  let t = text.normalize('NFKC');
  t = t.toLowerCase().trim();
  t = t.replace(/&/g, ' and ');
  t = t.replace(/-/g, ' ');
  t = t.replace(PUNCT_RE, ' ');
  t = t.replace(WS_RE, ' ');
  return t.trim();
}

