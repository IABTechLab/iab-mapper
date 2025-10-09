/**
 * Integration tests for the complete IAB mapper workflow
 */

import { Mapper } from '../mapper';
import * as path from 'path';

describe('Integration Tests', () => {
  const dataDir = path.join(__dirname, '../../data');

  describe('End-to-end mapping workflow', () => {
    it('should successfully map a complete record with all attributes', () => {
      const mapper = new Mapper({
        fuzzyMethod: 'rapidfuzz',
        fuzzyCut: 0.92,
        maxTopics: 3,
        cattax: '2'
      }, dataDir);

      const input = {
        code: '1-4',
        label: 'Sports',
        channel: 'editorial',
        type: 'article',
        format: 'video',
        language: 'en',
        source: 'professional',
        environment: 'ctv'
      };

      const result = mapper.mapRecord(input);

      // Verify all expected fields are present
      expect(result.in_code).toBe('1-4');
      expect(result.in_label).toBe('Sports');
      expect(result.out_ids).toBeDefined();
      expect(result.out_labels).toBeDefined();
      expect(result.topic_ids).toBeDefined();
      expect(result.topic_confidence).toBeDefined();
      expect(result.topic_sources).toBeDefined();
      expect(result.topic_scd).toBeDefined();
      expect(result.vectors).toBeDefined();
      expect(result.openrtb).toBeDefined();
      expect(result.vast_contentcat).toBeDefined();

      // Verify vector mapping
      expect(result.vectors.channel).toBe('editorial');
      expect(result.vectors.type).toBe('article');
      expect(result.vectors.format).toBe('video');
      expect(result.vectors.language).toBe('en');
      expect(result.vectors.source).toBe('professional');
      expect(result.vectors.environment).toBe('ctv');

      // Verify output includes both topic and vector IDs
      expect(result.out_ids.length).toBeGreaterThan(result.topic_ids.length);

      // Verify OpenRTB structure
      expect(result.openrtb.content.cat).toEqual(result.out_ids);
      expect(result.openrtb.content.cattax).toBe('2');
    });

    it('should handle batch processing efficiently', () => {
      const mapper = new Mapper({}, dataDir);

      const inputs = [
        { label: 'Sports' },
        { label: 'Food & Drink', channel: 'editorial' },
        { label: 'Automotive', type: 'article' },
        { label: 'Business', format: 'video' }
      ];

      const results = mapper.mapRecords(inputs);

      expect(results.length).toBe(4);
      results.forEach((result, idx) => {
        expect(result.in_label).toBe(inputs[idx].label);
        expect(result.out_ids).toBeDefined();
        expect(result.out_ids.length).toBeGreaterThan(0);
      });
    });

    it('should produce consistent results for same input', () => {
      const mapper = new Mapper({ fuzzyMethod: 'rapidfuzz', fuzzyCut: 0.92 }, dataDir);
      const input = { label: 'Sports' };

      const result1 = mapper.mapRecord(input);
      const result2 = mapper.mapRecord(input);

      expect(result1.out_ids).toEqual(result2.out_ids);
      expect(result1.topic_confidence).toEqual(result2.topic_confidence);
    });
  });

  describe('Real-world scenarios', () => {
    it('should handle various sports-related labels', () => {
      const mapper = new Mapper({}, dataDir);
      
      const labels = ['Sports', 'Sport', 'Athletics', 'Athletic'];
      
      labels.forEach(label => {
        const result = mapper.mapRecord({ label });
        expect(result.out_ids.length).toBeGreaterThan(0);
      });
    });

    it('should handle punctuation variations', () => {
      const mapper = new Mapper({}, dataDir);
      
      const variations = [
        'Food & Drink',
        'Food and Drink',
        'Food&Drink',
        'food-and-drink'
      ];
      
      variations.forEach(label => {
        const result = mapper.mapRecord({ label });
        expect(result.out_ids).toBeDefined();
      });
    });
  });

  describe('Configuration variations', () => {
    it('should respect different fuzzy cut thresholds', () => {
      const strictMapper = new Mapper({ fuzzyCut: 0.98 }, dataDir);
      const lenientMapper = new Mapper({ fuzzyCut: 0.80 }, dataDir);

      const ambiguousLabel = 'Sportz'; // Intentional typo

      const strictResult = strictMapper.mapRecord({ label: ambiguousLabel });
      const lenientResult = lenientMapper.mapRecord({ label: ambiguousLabel });

      // Lenient should find more matches
      expect(lenientResult.out_ids.length).toBeGreaterThanOrEqual(strictResult.out_ids.length);
    });

    it('should work with both fuzzy methods', () => {
      const rapidfuzzMapper = new Mapper({ fuzzyMethod: 'rapidfuzz' }, dataDir);
      const tfidfMapper = new Mapper({ fuzzyMethod: 'tfidf' }, dataDir);

      const input = { label: 'Sports' };

      const rapidfuzzResult = rapidfuzzMapper.mapRecord(input);
      const tfidfResult = tfidfMapper.mapRecord(input);

      // Both should produce valid results
      expect(rapidfuzzResult.out_ids.length).toBeGreaterThan(0);
      expect(tfidfResult.out_ids.length).toBeGreaterThan(0);
    });
  });

  describe('OpenRTB/VAST format compatibility', () => {
    it('should produce valid OpenRTB format', () => {
      const mapper = new Mapper({ cattax: '2' }, dataDir);
      const result = mapper.mapRecord({ label: 'Sports' });

      const openrtb = result.openrtb;

      // Verify structure matches OpenRTB spec
      expect(openrtb).toHaveProperty('content');
      expect(openrtb.content).toHaveProperty('cat');
      expect(openrtb.content).toHaveProperty('cattax');
      expect(Array.isArray(openrtb.content.cat)).toBe(true);
      expect(openrtb.content.cat.length).toBeGreaterThan(0);
      expect(typeof openrtb.content.cattax).toBe('string');
    });

    it('should produce valid VAST ContentCat format', () => {
      const mapper = new Mapper({}, dataDir);
      const result = mapper.mapRecord({ label: 'Sports' });

      const vast = result.vast_contentcat;

      // VAST format should be comma-separated quoted IDs
      expect(typeof vast).toBe('string');
      expect(vast).toMatch(/^"[^"]+"(,"[^"]+")*$/);
      
      // Parse and verify
      const ids = vast.match(/"([^"]+)"/g);
      expect(ids).toBeDefined();
      expect(ids!.length).toBeGreaterThan(0);
    });
  });
});

