/**
 * IAB Content Taxonomy Mapper
 * Maps IAB 2.x codes/labels to IAB 3.0 taxonomy
 */

import * as fs from 'fs';
import * as path from 'path';
import { normalize } from './normalize';
import {
  buildAliasIndex,
  buildLabelMaps,
  fuzzyMulti,
  TFIDFIndex,
  IAB2Item,
  IAB3Item,
  SynonymsMap
} from './matching';

export interface MapConfig {
  fuzzyCut?: number;
  fuzzyMethod?: 'rapidfuzz' | 'tfidf';
  maxTopics?: number;
  dropScd?: boolean;
  cattax?: string;
  overridesPath?: string;
}

export interface TopicMatch {
  id: string;
  label: string;
  confidence: number;
  source: string;
  scd?: boolean;
}

export interface VectorValues {
  channel?: string;
  type?: string;
  format?: string;
  language?: string;
  source?: string;
  environment?: string;
}

export interface MappedRecord {
  in_code?: string;
  in_label: string;
  out_ids: string[];
  out_labels: string[];
  topic_ids: string[];
  topic_confidence: number[];
  topic_sources: string[];
  topic_scd: boolean[];
  vectors: VectorValues;
  cattax: string;
  openrtb: {
    content: {
      cat: string[];
      cattax: string;
    };
  };
  vast_contentcat: string;
  topics: TopicMatch[];
}

export interface InputRecord {
  code?: string;
  label: string;
  channel?: string;
  type?: string;
  format?: string;
  language?: string;
  source?: string;
  environment?: string;
}

export interface Override {
  code?: string | null;
  label?: string | null;
  ids: string[];
}

export class Mapper {
  private cfg: Required<MapConfig>;
  private iab2: IAB2Item[];
  private iab3: IAB3Item[];
  private syn2: SynonymsMap;
  private syn3: SynonymsMap;
  private aliasIdx: Map<string, string>;
  private labels3: string[];
  private labelToId: Map<string, string>;
  private idToRow: Map<string, IAB3Item>;
  private retriever?: TFIDFIndex;
  private vectors: Record<string, Record<string, string>>;
  private overrides: Override[];

  constructor(cfg: MapConfig = {}, dataDir?: string) {
    this.cfg = {
      fuzzyCut: cfg.fuzzyCut ?? 0.92,
      fuzzyMethod: cfg.fuzzyMethod ?? 'rapidfuzz',
      maxTopics: cfg.maxTopics ?? 3,
      dropScd: cfg.dropScd ?? false,
      cattax: cfg.cattax ?? '2',
      overridesPath: cfg.overridesPath ?? ''
    };

    const baseDataDir = dataDir || path.join(__dirname, '..', 'data');

    // Load catalogs
    this.iab2 = this.loadJson(path.join(baseDataDir, 'iab_2x.json'));
    this.iab3 = this.loadJson(path.join(baseDataDir, 'iab_3x.json'));
    
    // Load synonyms (optional)
    this.syn2 = this.tryLoadJson(path.join(baseDataDir, 'synonyms_2x.json')) || {};
    this.syn3 = this.tryLoadJson(path.join(baseDataDir, 'synonyms_3x.json')) || {};

    // Build indexes
    this.aliasIdx = buildAliasIndex(this.iab2, this.syn2);
    const { labels, labelToId } = buildLabelMaps(this.iab3, this.syn3);
    this.labels3 = labels;
    this.labelToId = labelToId;

    this.idToRow = new Map();
    for (const row of this.iab3) {
      this.idToRow.set(row.id, row);
    }

    // Build retriever if needed
    if (this.cfg.fuzzyMethod === 'tfidf') {
      this.retriever = new TFIDFIndex(this.labels3);
    }

    // Load vector catalogs
    this.vectors = {
      channel: this.tryLoadJson(path.join(baseDataDir, 'vectors_channel.json')) || {},
      type: this.tryLoadJson(path.join(baseDataDir, 'vectors_type.json')) || {},
      format: this.tryLoadJson(path.join(baseDataDir, 'vectors_format.json')) || {},
      language: this.tryLoadJson(path.join(baseDataDir, 'vectors_language.json')) || {},
      source: this.tryLoadJson(path.join(baseDataDir, 'vectors_source.json')) || {},
      environment: this.tryLoadJson(path.join(baseDataDir, 'vectors_environment.json')) || {}
    };

    // Load overrides
    this.overrides = [];
    if (this.cfg.overridesPath) {
      this.overrides = this.tryLoadJson(this.cfg.overridesPath) || [];
    }
  }

  private loadJson(filePath: string): any {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  }

  private tryLoadJson(filePath: string): any {
    try {
      return this.loadJson(filePath);
    } catch {
      return null;
    }
  }

  /**
   * Map a single label/code to IAB 3.0 topics
   */
  mapTopics(inLabel: string): TopicMatch[] {
    const out: TopicMatch[] = [];
    const q = this.aliasIdx.get(normalize(inLabel)) || inLabel;

    const addHits = (hits: Array<[string, number]>, source: string) => {
      for (const [lbl, score] of hits) {
        const id = this.labelToId.get(lbl);
        if (!id) continue;

        const row = this.idToRow.get(id);
        if (!row) continue;

        if (this.cfg.dropScd && row.scd) continue;

        const existing = out.find(x => x.id === id);
        if (existing) {
          if (score > existing.confidence) {
            existing.confidence = parseFloat(score.toFixed(3));
            existing.source = source;
          }
          continue;
        }

        out.push({
          id,
          label: row.label,
          confidence: parseFloat(score.toFixed(3)),
          source
        });
      }
    };

    // Fuzzy matching
    if (this.cfg.fuzzyMethod === 'rapidfuzz') {
      const fuzzHits = fuzzyMulti(q, this.labels3, Math.max(5, this.cfg.maxTopics), this.cfg.fuzzyCut);
      addHits(fuzzHits, 'rapidfuzz');
    } else if (this.cfg.fuzzyMethod === 'tfidf' && this.retriever) {
      const tfidfHits = this.retriever.search(q, Math.max(5, this.cfg.maxTopics), this.cfg.fuzzyCut);
      addHits(tfidfHits, 'tfidf');
    }

    // Sort by confidence and trim
    out.sort((a, b) => b.confidence - a.confidence);
    return out.slice(0, this.cfg.maxTopics);
  }

  private applyOverrides(inCode: string | undefined, inLabel: string): TopicMatch[] | null {
    if (this.overrides.length === 0) return null;

    const normLabel = normalize(inLabel);
    for (const rule of this.overrides) {
      const codeOk = rule.code === null || rule.code === undefined || (inCode && rule.code === inCode);
      const labelOk = rule.label === null || rule.label === undefined || normalize(rule.label) === normLabel;
      const ids = rule.ids || [];

      if (codeOk && labelOk && ids.length > 0) {
        const out: TopicMatch[] = [];
        for (const id of ids) {
          const row = this.idToRow.get(id);
          if (row) {
            out.push({
              id,
              label: row.label,
              confidence: 1.0,
              source: 'override'
            });
          }
        }
        return out.length > 0 ? out : null;
      }
    }
    return null;
  }

  private mapVectors(rec: InputRecord): { values: VectorValues; ids: string[] } {
    const values: VectorValues = {};
    const ids: string[] = [];

    const dims: Array<keyof VectorValues> = ['channel', 'type', 'format', 'language', 'source', 'environment'];

    for (const dim of dims) {
      const rawVal = rec[dim];
      if (!rawVal) continue;

      const val = String(rawVal).trim();
      if (!val) continue;

      const id = this.vectors[dim][val];
      if (id) {
        values[dim] = val;
        ids.push(id);
      }
    }

    return { values, ids };
  }

  /**
   * Map a complete record with code, label, and optional vector attributes
   */
  mapRecord(rec: InputRecord): MappedRecord {
    const inCode = rec.code;
    const inLabel = rec.label || '';

    // 1) Check overrides first
    let topics = this.applyOverrides(inCode, inLabel);
    if (topics === null) {
      topics = this.mapTopics(inLabel);
    }

    // Add SCD flags
    for (const t of topics) {
      const row = this.idToRow.get(t.id);
      t.scd = row?.scd || false;
    }

    const topicIds = topics.map(t => t.id);
    const topicLabels = topics.map(t => t.label);
    const topicConf = topics.map(t => t.confidence);
    const topicSrcs = topics.map(t => t.source);
    const topicScd = topics.map(t => t.scd || false);

    // 2) Map vectors
    const { values: vectorsVals, ids: vectorIds } = this.mapVectors(rec);

    // 3) Compose outputs
    const outIds: string[] = [];
    const seen = new Set<string>();
    
    for (const id of [...topicIds, ...vectorIds]) {
      if (!seen.has(id)) {
        outIds.push(id);
        seen.add(id);
      }
    }

    const vast = outIds.map(i => `"${i}"`).join(',');
    const openrtb = {
      content: {
        cat: outIds,
        cattax: this.cfg.cattax
      }
    };

    return {
      in_code: inCode,
      in_label: inLabel,
      out_ids: outIds,
      out_labels: topicLabels,
      topic_ids: topicIds,
      topic_confidence: topicConf,
      topic_sources: topicSrcs,
      topic_scd: topicScd,
      vectors: vectorsVals,
      cattax: this.cfg.cattax,
      openrtb,
      vast_contentcat: vast,
      topics
    };
  }

  /**
   * Map multiple records
   */
  mapRecords(records: InputRecord[]): MappedRecord[] {
    return records.map(rec => this.mapRecord(rec));
  }
}

