import { Mapper, MapConfig } from '../mapper';
import * as path from 'path';

describe('Mapper', () => {
  const dataDir = path.join(__dirname, '../../data');
  
  describe('initialization', () => {
    it('should initialize with default config', () => {
      expect(() => new Mapper({}, dataDir)).not.toThrow();
    });

    it('should initialize with custom config', () => {
      const config: MapConfig = {
        fuzzyCut: 0.85,
        fuzzyMethod: 'tfidf',
        maxTopics: 5,
        dropScd: true,
        cattax: '3'
      };
      expect(() => new Mapper(config, dataDir)).not.toThrow();
    });
  });

  describe('mapTopics', () => {
    const mapper = new Mapper({}, dataDir);

    it('should map a known label', () => {
      const topics = mapper.mapTopics('Sports');
      
      expect(topics.length).toBeGreaterThan(0);
      expect(topics[0]).toHaveProperty('id');
      expect(topics[0]).toHaveProperty('label');
      expect(topics[0]).toHaveProperty('confidence');
      expect(topics[0]).toHaveProperty('source');
    });

    it('should return empty array for unknown label with high threshold', () => {
      const mapper = new Mapper({ fuzzyCut: 0.99 }, dataDir);
      const topics = mapper.mapTopics('xyz123nonsense');
      
      expect(topics).toEqual([]);
    });

    it('should respect maxTopics limit', () => {
      const mapper = new Mapper({ maxTopics: 2 }, dataDir);
      const topics = mapper.mapTopics('Sports');
      
      expect(topics.length).toBeLessThanOrEqual(2);
    });
  });

  describe('mapRecord', () => {
    const mapper = new Mapper({}, dataDir);

    it('should map a simple record', () => {
      const result = mapper.mapRecord({ label: 'Sports' });
      
      expect(result).toHaveProperty('in_label', 'Sports');
      expect(result).toHaveProperty('out_ids');
      expect(result).toHaveProperty('topic_ids');
      expect(result).toHaveProperty('openrtb');
      expect(result).toHaveProperty('vast_contentcat');
      expect(result.out_ids.length).toBeGreaterThan(0);
    });

    it('should include code in output if provided', () => {
      const result = mapper.mapRecord({ code: '1-4', label: 'Sports' });
      
      expect(result.in_code).toBe('1-4');
    });

    it('should map vector attributes', () => {
      const result = mapper.mapRecord({
        label: 'Sports',
        channel: 'editorial',
        type: 'article'
      });
      
      expect(result.vectors).toHaveProperty('channel', 'editorial');
      expect(result.vectors).toHaveProperty('type', 'article');
      expect(result.out_ids.length).toBeGreaterThan(1); // Should include vector IDs
    });

    it('should format OpenRTB correctly', () => {
      const result = mapper.mapRecord({ label: 'Sports' });
      
      expect(result.openrtb).toHaveProperty('content');
      expect(result.openrtb.content).toHaveProperty('cat');
      expect(result.openrtb.content).toHaveProperty('cattax', '2');
      expect(Array.isArray(result.openrtb.content.cat)).toBe(true);
    });

    it('should format VAST ContentCat correctly', () => {
      const result = mapper.mapRecord({ label: 'Sports' });
      
      expect(typeof result.vast_contentcat).toBe('string');
      expect(result.vast_contentcat).toMatch(/^"[^"]+"(,"[^"]+")*$/); // Format: "id1","id2",...
    });

    it('should include SCD flags', () => {
      const result = mapper.mapRecord({ label: 'Sports' });
      
      expect(Array.isArray(result.topic_scd)).toBe(true);
      expect(result.topic_scd.length).toBe(result.topic_ids.length);
    });

    it('should include confidence scores', () => {
      const result = mapper.mapRecord({ label: 'Sports' });
      
      expect(Array.isArray(result.topic_confidence)).toBe(true);
      expect(result.topic_confidence.length).toBe(result.topic_ids.length);
      result.topic_confidence.forEach(conf => {
        expect(conf).toBeGreaterThanOrEqual(0);
        expect(conf).toBeLessThanOrEqual(1);
      });
    });

    it('should use custom cattax value', () => {
      const mapper = new Mapper({ cattax: '3' }, dataDir);
      const result = mapper.mapRecord({ label: 'Sports' });
      
      expect(result.cattax).toBe('3');
      expect(result.openrtb.content.cattax).toBe('3');
    });
  });

  describe('mapRecords (batch)', () => {
    const mapper = new Mapper({}, dataDir);

    it('should map multiple records', () => {
      const records = [
        { label: 'Sports' },
        { label: 'Food & Drink' }
      ];
      
      const results = mapper.mapRecords(records);
      
      expect(results.length).toBe(2);
      expect(results[0].in_label).toBe('Sports');
      expect(results[1].in_label).toBe('Food & Drink');
    });

    it('should handle empty array', () => {
      const results = mapper.mapRecords([]);
      expect(results).toEqual([]);
    });
  });

  describe('fuzzy methods', () => {
    it('should work with rapidfuzz method', () => {
      const mapper = new Mapper({ fuzzyMethod: 'rapidfuzz' }, dataDir);
      const result = mapper.mapRecord({ label: 'Sports' });
      
      expect(result.out_ids.length).toBeGreaterThan(0);
    });

    it('should work with tfidf method', () => {
      const mapper = new Mapper({ fuzzyMethod: 'tfidf' }, dataDir);
      const result = mapper.mapRecord({ label: 'Sports' });
      
      expect(result.out_ids.length).toBeGreaterThan(0);
    });
  });

  describe('dropScd option', () => {
    it('should exclude SCD categories when enabled', () => {
      // This test would need SCD data to properly verify
      const mapper = new Mapper({ dropScd: true }, dataDir);
      const result = mapper.mapRecord({ label: 'Sports' });
      
      // All SCD flags should be false if dropScd is true
      result.topic_scd.forEach(scd => {
        expect(scd).toBe(false);
      });
    });
  });

  describe('edge cases', () => {
    const mapper = new Mapper({}, dataDir);

    it('should handle empty label', () => {
      const result = mapper.mapRecord({ label: '' });
      expect(result.in_label).toBe('');
    });

    it('should handle special characters', () => {
      const result = mapper.mapRecord({ label: 'Food & Drink!!!' });
      expect(result).toHaveProperty('out_ids');
    });

    it('should not duplicate IDs in output', () => {
      const result = mapper.mapRecord({ label: 'Sports' });
      const uniqueIds = new Set(result.out_ids);
      
      expect(uniqueIds.size).toBe(result.out_ids.length);
    });
  });
});

