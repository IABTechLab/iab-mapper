/**
 * Basic usage example for @mixpeek/iab-mapper
 */

const { Mapper } = require('@mixpeek/iab-mapper');

// Create a mapper instance with default configuration
const mapper = new Mapper({
  fuzzyMethod: 'rapidfuzz',
  fuzzyCut: 0.92,
  maxTopics: 3,
  cattax: '2'
});

// Example 1: Map a single label
console.log('Example 1: Basic label mapping');
console.log('================================\n');

const result1 = mapper.mapRecord({
  label: 'Sports'
});

console.log('Input:', result1.in_label);
console.log('Output IDs:', result1.out_ids);
console.log('Output Labels:', result1.out_labels);
console.log('OpenRTB format:', JSON.stringify(result1.openrtb, null, 2));
console.log('VAST format:', result1.vast_contentcat);
console.log('\n');

// Example 2: Map with code and vectors
console.log('Example 2: Mapping with code and vector attributes');
console.log('===================================================\n');

const result2 = mapper.mapRecord({
  code: '2-12',
  label: 'Food & Drink',
  channel: 'editorial',
  type: 'article',
  format: 'video',
  language: 'en',
  source: 'professional',
  environment: 'ctv'
});

console.log('Input:', result2.in_label, '(code:', result2.in_code + ')');
console.log('Topic IDs:', result2.topic_ids);
console.log('Topic Confidence:', result2.topic_confidence);
console.log('Topic Sources:', result2.topic_sources);
console.log('Vector Attributes:', result2.vectors);
console.log('All Output IDs:', result2.out_ids);
console.log('OpenRTB format:', JSON.stringify(result2.openrtb, null, 2));
console.log('\n');

// Example 3: Batch processing
console.log('Example 3: Batch processing multiple records');
console.log('=============================================\n');

const records = [
  { label: 'Sports' },
  { label: 'Automotive' },
  { label: 'Cooking how-to', channel: 'editorial' }
];

const results = mapper.mapRecords(records);
results.forEach((result, idx) => {
  console.log(`Record ${idx + 1}: "${result.in_label}"`);
  console.log(`  → Mapped to: ${result.out_labels.join(', ')}`);
  console.log(`  → IDs: ${result.out_ids.join(', ')}`);
});

