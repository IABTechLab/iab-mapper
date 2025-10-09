/**
 * Matching utilities for IAB taxonomy mapping
 */

import { extract, token_sort_ratio } from 'fuzzball';
import { normalize } from './normalize';

export interface IAB2Item {
  code: string;
  label: string;
}

export interface IAB3Item {
  id: string;
  label: string;
  path?: string[];
  scd?: boolean;
}

export type SynonymsMap = Record<string, string[]>;

/**
 * Build alias index from IAB 2.x catalog and synonyms
 */
export function buildAliasIndex(
  catalog: IAB2Item[],
  synonyms: SynonymsMap
): Map<string, string> {
  const idx = new Map<string, string>();
  
  for (const row of catalog) {
    const candidates = [row.label, ...(synonyms[row.label] || [])];
    for (const cand of candidates) {
      idx.set(normalize(cand), row.label);
    }
  }
  
  return idx;
}

/**
 * Build label maps from IAB 3.x catalog and synonyms
 */
export function buildLabelMaps(
  iab3: IAB3Item[],
  synonyms3x: SynonymsMap
): { labels: string[]; labelToId: Map<string, string> } {
  const labelToId = new Map<string, string>();
  const labels: string[] = [];
  
  for (const row of iab3) {
    labelToId.set(row.label, row.id);
    labels.push(row.label);
    
    for (const syn of (synonyms3x[row.label] || [])) {
      labelToId.set(syn, row.id);
      labels.push(syn);
    }
  }
  
  return { labels, labelToId };
}

/**
 * Fuzzy multi-match using rapidfuzz-like scoring
 */
export function fuzzyMulti(
  query: string,
  choices: string[],
  topK: number = 3,
  cut: number = 0.90
): Array<[string, number]> {
  if (!query) return [];
  
  // Use fuzzball's extract method with token_sort_ratio scorer
  const hits = extract(query, choices, {
    scorer: token_sort_ratio,
    limit: topK,
    cutoff: cut * 100
  });
  
  return hits.map(hit => [hit[0], hit[1] / 100.0]);
}

/**
 * Simple TF-IDF based retrieval
 */
export class TFIDFIndex {
  private texts: string[];
  private vocabulary: Map<string, number>;
  private idf: number[];
  private docVectors: number[][];

  constructor(texts: string[]) {
    this.texts = texts;
    this.vocabulary = new Map();
    this.idf = [];
    this.docVectors = [];
    this.build();
  }

  private tokenize(text: string): string[] {
    return normalize(text).split(/\s+/).filter(t => t.length > 0);
  }

  private build(): void {
    // Build vocabulary
    const docTokens = this.texts.map(t => this.tokenize(t));
    const df = new Map<string, number>();
    
    for (const tokens of docTokens) {
      const seen = new Set(tokens);
      for (const token of seen) {
        df.set(token, (df.get(token) || 0) + 1);
      }
    }

    let idx = 0;
    for (const [token, freq] of df.entries()) {
      this.vocabulary.set(token, idx);
      this.idf[idx] = Math.log((this.texts.length + 1) / (freq + 1)) + 1;
      idx++;
    }

    // Build document vectors
    for (const tokens of docTokens) {
      const vector = new Array(this.vocabulary.size).fill(0);
      const tf = new Map<string, number>();
      
      for (const token of tokens) {
        tf.set(token, (tf.get(token) || 0) + 1);
      }

      for (const [token, freq] of tf.entries()) {
        const vocabIdx = this.vocabulary.get(token);
        if (vocabIdx !== undefined) {
          vector[vocabIdx] = freq * this.idf[vocabIdx];
        }
      }

      // Normalize
      const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
      if (norm > 0) {
        for (let i = 0; i < vector.length; i++) {
          vector[i] /= norm;
        }
      }

      this.docVectors.push(vector);
    }
  }

  private cosineSimilarity(v1: number[], v2: number[]): number {
    let dot = 0;
    for (let i = 0; i < v1.length; i++) {
      dot += v1[i] * v2[i];
    }
    return dot;
  }

  search(query: string, topK: number = 3, cut: number = 0.90): Array<[string, number]> {
    if (!query) return [];

    const tokens = this.tokenize(query);
    const queryVector = new Array(this.vocabulary.size).fill(0);
    const tf = new Map<string, number>();

    for (const token of tokens) {
      tf.set(token, (tf.get(token) || 0) + 1);
    }

    for (const [token, freq] of tf.entries()) {
      const vocabIdx = this.vocabulary.get(token);
      if (vocabIdx !== undefined) {
        queryVector[vocabIdx] = freq * this.idf[vocabIdx];
      }
    }

    // Normalize
    const norm = Math.sqrt(queryVector.reduce((sum, v) => sum + v * v, 0));
    if (norm > 0) {
      for (let i = 0; i < queryVector.length; i++) {
        queryVector[i] /= norm;
      }
    }

    // Compute similarities
    const scores = this.docVectors.map(dv => this.cosineSimilarity(queryVector, dv));
    const indexed = scores.map((score, idx) => ({ score, idx }));
    indexed.sort((a, b) => b.score - a.score);

    const results: Array<[string, number]> = [];
    for (let i = 0; i < Math.min(topK, indexed.length); i++) {
      const { score, idx } = indexed[i];
      if (score >= cut) {
        results.push([this.texts[idx], score]);
      }
    }

    return results;
  }
}

