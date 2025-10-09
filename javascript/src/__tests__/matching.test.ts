import { buildAliasIndex, buildLabelMaps, fuzzyMulti, TFIDFIndex } from '../matching';

describe('buildAliasIndex', () => {
  it('should build alias index from catalog and synonyms', () => {
    const catalog = [
      { code: '1-4', label: 'Sports' }
    ];
    const synonyms = {
      'Sports': ['Athletics', 'Sport']
    };

    const index = buildAliasIndex(catalog, synonyms);
    
    expect(index.get('sports')).toBe('Sports');
    expect(index.get('athletics')).toBe('Sports');
    expect(index.get('sport')).toBe('Sports');
  });

  it('should handle empty synonyms', () => {
    const catalog = [{ code: '1-4', label: 'Sports' }];
    const index = buildAliasIndex(catalog, {});
    
    expect(index.get('sports')).toBe('Sports');
  });
});

describe('buildLabelMaps', () => {
  it('should build label maps from IAB3 catalog', () => {
    const iab3 = [
      { id: '483', label: 'Sports', path: ['Sports'], scd: false }
    ];
    const synonyms = {
      'Sports': ['Athletics']
    };

    const { labels, labelToId } = buildLabelMaps(iab3, synonyms);
    
    expect(labels).toContain('Sports');
    expect(labels).toContain('Athletics');
    expect(labelToId.get('Sports')).toBe('483');
    expect(labelToId.get('Athletics')).toBe('483');
  });
});

describe('fuzzyMulti', () => {
  const choices = ['Sports', 'Food & Drink', 'Automotive', 'Business'];

  it('should find close matches', () => {
    const results = fuzzyMulti('Sport', choices, 3, 0.85);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0][0]).toBe('Sports');
  });

  it('should respect threshold', () => {
    const results = fuzzyMulti('xyz123', choices, 3, 0.95);
    expect(results.length).toBe(0);
  });

  it('should respect top_k limit', () => {
    const results = fuzzyMulti('s', choices, 2, 0.0);
    expect(results.length).toBeLessThanOrEqual(2);
  });

  it('should handle empty query', () => {
    const results = fuzzyMulti('', choices, 3, 0.90);
    expect(results).toEqual([]);
  });
});

describe('TFIDFIndex', () => {
  const texts = ['Sports and Athletics', 'Food and Drink', 'Automotive Industry', 'Business'];

  it('should initialize and build index', () => {
    expect(() => new TFIDFIndex(texts)).not.toThrow();
  });

  it('should find relevant documents', () => {
    const index = new TFIDFIndex(texts);
    const results = index.search('Sports', 3, 0.1);
    
    expect(results.length).toBeGreaterThan(0);
    expect(results[0][0]).toContain('Sports');
  });

  it('should respect threshold', () => {
    const index = new TFIDFIndex(texts);
    const results = index.search('xyz123', 3, 0.99);
    
    expect(results.length).toBe(0);
  });

  it('should handle empty query', () => {
    const index = new TFIDFIndex(texts);
    const results = index.search('', 3, 0.1);
    
    expect(results).toEqual([]);
  });

  it('should limit results to top_k', () => {
    const index = new TFIDFIndex(texts);
    const results = index.search('and', 2, 0.0);
    
    expect(results.length).toBeLessThanOrEqual(2);
  });
});

