/**
 * TypeScript usage example for @mixpeek/iab-mapper
 */

import { Mapper, MapConfig, InputRecord, MappedRecord } from '@mixpeek/iab-mapper';

// Configure the mapper with TypeScript types
const config: MapConfig = {
  fuzzyMethod: 'rapidfuzz',
  fuzzyCut: 0.92,
  maxTopics: 3,
  dropScd: false,
  cattax: '2'
};

const mapper = new Mapper(config);

// Type-safe input records
const input: InputRecord = {
  code: '1-4',
  label: 'Sports',
  channel: 'editorial',
  type: 'video',
  format: 'video',
  language: 'en',
  source: 'professional',
  environment: 'ctv'
};

// Get typed output
const result: MappedRecord = mapper.mapRecord(input);

console.log('Input:', result.in_label);
console.log('Mapped Topics:', result.topics);
console.log('OpenRTB Output:', result.openrtb);
console.log('VAST ContentCat:', result.vast_contentcat);

// Batch processing with types
const inputs: InputRecord[] = [
  { label: 'Sports' },
  { label: 'Food & Drink', channel: 'editorial' },
  { label: 'Automotive', type: 'article' }
];

const results: MappedRecord[] = mapper.mapRecords(inputs);

results.forEach((res, idx) => {
  console.log(`\nRecord ${idx + 1}:`);
  console.log(`  Label: ${res.in_label}`);
  console.log(`  Mapped IDs: ${res.out_ids.join(', ')}`);
  console.log(`  Confidence: ${res.topic_confidence.join(', ')}`);
});

export { mapper, result };

