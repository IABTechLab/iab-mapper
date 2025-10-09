# @mixpeek/iab-mapper

> Local IAB Content Taxonomy 2.x → 3.0 mapper for Node.js with vectors, SCD, OpenRTB/VAST exporters

[![npm version](https://badge.fury.io/js/@mixpeek%2Fiab-mapper.svg)](https://www.npmjs.com/package/@mixpeek/iab-mapper)
[![License: BSD-2-Clause](https://img.shields.io/badge/License-BSD%202--Clause-blue.svg)](https://opensource.org/licenses/BSD-2-Clause)

Map **IAB Content Taxonomy 2.x** labels/codes to **IAB 3.0** locally with deterministic → fuzzy matching. Outputs are **IAB‑3.0–compatible IDs** for OpenRTB/VAST, with optional **vector attributes** (Channel, Type, Format, Language, Source, Environment) and **SCD** awareness.

This is the **Node.js/TypeScript** version of the [Python iab-mapper](https://github.com/mixpeek/iab-mapper) package.

## 🎯 What it does

The IAB Mapper helps you migrate from IAB Content Taxonomy 2.x to 3.0 by:

1. **Input:** Your existing 2.x codes/labels
2. **Process:** Deterministic matching → fuzzy matching
3. **Output:** Valid IAB 3.0 IDs ready for OpenRTB/VAST integration

**Example:**
```javascript
const { Mapper } = require('@mixpeek/iab-mapper');

const mapper = new Mapper();
const result = mapper.mapRecord({
  code: '2-12',
  label: 'Food & Drink'
});

console.log(result.openrtb);
// { content: { cat: ['3-5-2'], cattax: '2' } }
```

Perfect for ad tech teams, content platforms, and anyone migrating to IAB 3.0.

## 🚀 Installation

```bash
npm install @mixpeek/iab-mapper
```

Or with Yarn:
```bash
yarn add @mixpeek/iab-mapper
```

## 📖 Quick Start

### JavaScript

```javascript
const { Mapper } = require('@mixpeek/iab-mapper');

// Create mapper with configuration
const mapper = new Mapper({
  fuzzyMethod: 'rapidfuzz',  // or 'tfidf'
  fuzzyCut: 0.92,           // similarity threshold
  maxTopics: 3,             // max topics per result
  cattax: '2'               // OpenRTB cattax enum
});

// Map a single record
const result = mapper.mapRecord({
  code: '1-4',
  label: 'Sports',
  channel: 'editorial',
  type: 'video'
});

console.log(result.out_ids);        // ['483', '1026', '1051']
console.log(result.openrtb);        // OpenRTB format
console.log(result.vast_contentcat); // VAST format
```

### TypeScript

```typescript
import { Mapper, MapConfig, InputRecord, MappedRecord } from '@mixpeek/iab-mapper';

const config: MapConfig = {
  fuzzyMethod: 'rapidfuzz',
  fuzzyCut: 0.92,
  maxTopics: 3,
  cattax: '2'
};

const mapper = new Mapper(config);

const input: InputRecord = {
  label: 'Sports',
  channel: 'editorial'
};

const result: MappedRecord = mapper.mapRecord(input);
console.log(result.openrtb);
```

## 🔧 Configuration Options

| Option | Default | Description |
|--------|---------|-------------|
| `fuzzyMethod` | `'rapidfuzz'` | Matching method: `'rapidfuzz'` or `'tfidf'` |
| `fuzzyCut` | `0.92` | Similarity threshold (0-1). Higher = stricter matching |
| `maxTopics` | `3` | Maximum number of topics per result |
| `dropScd` | `false` | Exclude Sensitive Content (SCD) categories |
| `cattax` | `'2'` | OpenRTB `content.cattax` enum value |
| `overridesPath` | — | Path to JSON file with manual override mappings |

## 📥 Input Format

```typescript
interface InputRecord {
  code?: string;        // IAB 2.x code (optional)
  label: string;        // Category label (required)
  channel?: string;     // Vector: editorial, ugc, branded
  type?: string;        // Vector: article, video, podcast, livestream
  format?: string;      // Vector: video, text, audio, image
  language?: string;    // Vector: en, es, fr, de
  source?: string;      // Vector: professional, brand, news, user
  environment?: string; // Vector: ctv, web, app, mobile
}
```

## 📤 Output Format

```typescript
interface MappedRecord {
  in_code?: string;           // Original 2.x code
  in_label: string;           // Original label
  out_ids: string[];          // All IAB 3.0 IDs (topics + vectors)
  out_labels: string[];       // Matched topic labels
  topic_ids: string[];        // Topic IDs only
  topic_confidence: number[]; // Confidence scores (0-1)
  topic_sources: string[];    // Match sources: 'rapidfuzz', 'tfidf', 'override'
  topic_scd: boolean[];       // Sensitive content flags
  vectors: {                  // Resolved vector attributes
    channel?: string;
    type?: string;
    format?: string;
    language?: string;
    source?: string;
    environment?: string;
  };
  cattax: string;             // OpenRTB cattax value
  openrtb: {                  // OpenRTB format
    content: {
      cat: string[];
      cattax: string;
    };
  };
  vast_contentcat: string;    // VAST format: "id1","id2",...
  topics: TopicMatch[];       // Detailed topic matches
}
```

## 🧩 Vector Attributes

Vector attributes are orthogonal IAB 3.0 dimensions that complement primary topics:

- **Channel**: `editorial`, `ugc`, `branded`
- **Type**: `article`, `video`, `podcast`, `livestream`
- **Format**: `video`, `text`, `audio`, `image`
- **Language**: `en`, `es`, `fr`, `de`
- **Source**: `professional`, `brand`, `news`, `user`
- **Environment**: `ctv`, `web`, `app`, `mobile`

Each vector value maps to a stable IAB 3.0 ID that's included in the output `cat` array.

## 📦 Examples

### Batch Processing

```javascript
const records = [
  { label: 'Sports' },
  { label: 'Food & Drink', channel: 'editorial' },
  { label: 'Automotive', type: 'article' }
];

const results = mapper.mapRecords(records);

results.forEach(result => {
  console.log(`${result.in_label} → ${result.out_ids.join(', ')}`);
});
```

### With Overrides

Create an `overrides.json` file:
```json
[
  {
    "code": "1-4",
    "label": null,
    "ids": ["483"]
  }
]
```

Use it:
```javascript
const mapper = new Mapper({
  overridesPath: './overrides.json'
});
```

### Drop Sensitive Content

```javascript
const mapper = new Mapper({
  dropScd: true  // Exclude categories marked as sensitive
});
```

## 🔍 How Matching Works

1. **Alias/Exact Match**: Checks synonyms and exact label matches first
2. **Fuzzy Match**: Uses RapidFuzz or TF-IDF for similarity scoring
3. **Threshold Filter**: Only returns matches above `fuzzyCut`
4. **Deduplication**: Combines results, keeping highest confidence
5. **Sorting**: Orders by confidence score
6. **Limit**: Returns top `maxTopics` results

## 📊 OpenRTB & VAST Integration

### OpenRTB

```javascript
const result = mapper.mapRecord({ label: 'Sports' });

// Use in OpenRTB bid request
const bidRequest = {
  site: {
    content: result.openrtb.content
    // { cat: ['483'], cattax: '2' }
  }
};
```

### VAST

```javascript
const result = mapper.mapRecord({ label: 'Sports' });

// Use in VAST XML
const contentCategories = result.vast_contentcat;
// "483"
```

## 🗂️ Data Files

The package includes sample taxonomy data. For production use, replace with official IAB data:

- `data/iab_2x.json` — IAB 2.x taxonomy
- `data/iab_3x.json` — IAB 3.0 taxonomy
- `data/synonyms_2x.json` — 2.x synonyms
- `data/synonyms_3x.json` — 3.0 synonyms
- `data/vectors_*.json` — Vector attribute mappings

## 🔗 Related Packages

- **Python version**: [`iab-mapper` on PyPI](https://pypi.org/project/iab-mapper/)
- **Web demo**: [Mixpeek IAB Taxonomy Mapper](https://mixpeek.com/tools/iab-taxonomy-mapper)
- **GitHub**: [github.com/mixpeek/iab-mapper](https://github.com/mixpeek/iab-mapper)

## 📜 License

BSD 2-Clause. See [LICENSE](LICENSE).

IAB attribution:
> "IAB is a registered trademark of the Interactive Advertising Bureau. This tool is an independent utility built by Mixpeek for interoperability with IAB Content Taxonomy standards."

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/mixpeek/iab-mapper/issues)
- **Documentation**: [Mixpeek IAB Mapper](https://mixpeek.com/tools/iab-taxonomy-mapper)
- **Enterprise support**: Contact [Mixpeek](https://mixpeek.com)

## ✨ Features

- ✅ Local-first, no external APIs required
- ✅ TypeScript support with full type definitions
- ✅ Multiple matching strategies (RapidFuzz, TF-IDF)
- ✅ Vector attributes support
- ✅ SCD (Sensitive Content) awareness
- ✅ OpenRTB & VAST format helpers
- ✅ Custom overrides support
- ✅ Batch processing
- ✅ Zero dependencies for core functionality

---

Made with ❤️ by [Mixpeek](https://mixpeek.com)

