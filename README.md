<p align="center">
  <img src="assets/header.png" alt="IAB Taxonomy Mapper" width="900" />
</p>

# IAB Content Taxonomy Mapper

<p align="center">
  <!-- CI/Tests -->
  <a href="https://github.com/mixpeek/iab-mapper/actions/workflows/ci.yml">
    <img src="https://github.com/mixpeek/iab-mapper/actions/workflows/ci.yml/badge.svg" alt="CI Status" />
  </a>
  
  <!-- Python Package -->
  <a href="https://pypi.org/project/iab-mapper/">
    <img src="https://img.shields.io/pypi/v/iab-mapper.svg" alt="PyPI version" />
  </a>
  <a href="https://pypi.org/project/iab-mapper/">
    <img src="https://img.shields.io/pypi/pyversions/iab-mapper.svg" alt="Python versions" />
  </a>
  <a href="https://pypi.org/project/iab-mapper/">
    <img src="https://img.shields.io/pypi/dm/iab-mapper.svg" alt="PyPI downloads" />
  </a>
  
  <!-- npm Package -->
  <a href="https://www.npmjs.com/package/@mixpeek/iab-mapper">
    <img src="https://img.shields.io/npm/v/@mixpeek/iab-mapper.svg" alt="npm version" />
  </a>
  <a href="https://www.npmjs.com/package/@mixpeek/iab-mapper">
    <img src="https://img.shields.io/npm/dm/@mixpeek/iab-mapper.svg" alt="npm downloads" />
  </a>
  
  <!-- License & Quality -->
  <a href="https://github.com/mixpeek/iab-mapper/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/license-BSD--2--Clause-blue.svg" alt="License" />
  </a>
  <a href="https://github.com/mixpeek/iab-mapper">
    <img src="https://img.shields.io/github/stars/mixpeek/iab-mapper?style=social" alt="GitHub stars" />
  </a>
  
  <!-- Security & Trust -->
  <a href="https://github.com/mixpeek/iab-mapper/security">
    <img src="https://img.shields.io/badge/security-BSD--2--Clause-green.svg" alt="Security" />
  </a>
  <a href="https://github.com/mixpeek/iab-mapper/blob/main/CODE_OF_CONDUCT.md">
    <img src="https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg" alt="Code of Conduct" />
  </a>
</p>

<p align="center">
  <a href="https://github.com/mixpeek/iab-mapper">View iab-mapper on GitHub</a>
  •
  <a href="https://mixpeek.com/tools/iab-taxonomy-mapper">Open Mixpeek — IAB Taxonomy Mapper</a>
</p>

<p align="center">
  <a href="https://www.youtube.com/watch?v=wHLwfp8nKpc">
    <img src="https://img.youtube.com/vi/wHLwfp8nKpc/maxresdefault.jpg" alt="IAB Mapper Walkthrough Video" width="600" />
  </a>
  <br>
  <strong>📺 Watch the 5-minute walkthrough</strong>
</p>

> **Targets IAB Content Taxonomy 3.1** and emits `cattax: "9"` by default (AdCOM *List: Category Taxonomies*: 7 = 3.0, 9 = 3.1). Every 3.0 ID still exists in 3.1, so pass `cattax: "7"` if a receiver expects 3.0. Versions before 1.1.0 (npm and PyPI) defaulted to `"2"`, which tells a receiver the IDs are Content Taxonomy 2.0.

Map **IAB Content Taxonomy 2.x** labels/codes to **IAB Content Taxonomy 3.1** locally with a deterministic → fuzzy → (optional) semantic pipeline.
Outputs are **IAB 3.1 IDs** for OpenRTB/VAST, with optional **vector attributes** (Channel, Type, Format, Language, Source, Environment) and **SCD** awareness.

> **Available in both Python and JavaScript/TypeScript**

## 🎯 What it does

The IAB Mapper helps you migrate from IAB Content Taxonomy 2.x to 3.0 by:

1. **Input:** Your existing 2.x codes/labels (CSV or JSON)
2. **Process:** Deterministic matching → fuzzy matching → optional semantic enhancement
3. **Output:** Valid IAB 3.1 IDs ready for OpenRTB/VAST integration

**Example:**
```
# Input: 2.x codes
"1-4","Sports"
"2-12","Food & Drink"

# Output: 3.1 IDs
"483","Sports"
"216","Food & Drink > Cooking"
```

Perfect for ad tech teams, content platforms, and anyone migrating to IAB 3.0.

---

## 📦 Client Libraries

This repository contains client libraries in multiple languages:

### 🐍 Python

**Location:** [`/python`](./python)  
**Package:** [`iab-mapper` on PyPI](https://pypi.org/project/iab-mapper/)

```bash
pip install iab-mapper
```

**Features:**
- CLI tool (`iab-mapper`)
- Python API for programmatic use
- Optional embeddings support (Sentence-Transformers)
- Optional LLM re-ranking (Ollama)
- Web demo with FastAPI

[**→ View Python Documentation**](./python/README.md)

---

### 📦 JavaScript/TypeScript (Node.js)

**Location:** [`/javascript`](./javascript)  
**Package:** [`@mixpeek/iab-mapper` on npm](https://www.npmjs.com/package/@mixpeek/iab-mapper)

```bash
npm install @mixpeek/iab-mapper
```

**Features:**
- Full TypeScript support with type definitions
- CommonJS and ES Modules compatible
- Zero dependencies for core functionality
- Lightweight fuzzy matching (fuzzball)

[**→ View JavaScript Documentation**](./javascript/README.md)

---

## 🚀 Quick Start Examples

### Python

```python
from iab_mapper.pipeline import Mapper, MapConfig

mapper = Mapper(MapConfig(fuzzy_cut=0.92, max_topics=3), data_dir="./python/data")

result = mapper.map_record({
    "code": "2-12",
    "label": "Food & Drink",
    "channel": "editorial"
})

print(result["openrtb"])
# {"content": {"cat": ["216", "1026"], "cattax": "9"}}
```

### JavaScript

```javascript
const { Mapper } = require('@mixpeek/iab-mapper');

const mapper = new Mapper({ fuzzyCut: 0.92, maxTopics: 3 });

const result = mapper.mapRecord({
  code: '2-12',
  label: 'Food & Drink',
  channel: 'editorial'
});

console.log(result.openrtb);
// { content: { cat: ['216', '1026'], cattax: '9' } }
```

### TypeScript

```typescript
import { Mapper, MapConfig } from '@mixpeek/iab-mapper';

const config: MapConfig = { fuzzyCut: 0.92, maxTopics: 3 };
const mapper = new Mapper(config);

const result = mapper.mapRecord({
  label: 'Food & Drink',
  channel: 'editorial'
});
```

---

## 📁 Repository Structure

```
iab-mapper/
├── python/                  # Python implementation
│   ├── iab_mapper/         # Python package source
│   ├── data/               # IAB taxonomy data files
│   ├── pyproject.toml      # Python package config
│   ├── README.md           # Python documentation
│   └── ...
│
├── javascript/             # JavaScript/TypeScript implementation
│   ├── src/               # TypeScript source
│   ├── data/              # IAB taxonomy data files
│   ├── examples/          # Usage examples
│   ├── package.json       # npm package config
│   ├── tsconfig.json      # TypeScript config
│   ├── README.md          # JavaScript documentation
│   └── ...
│
├── demo/                  # Web demo (uses Python backend)
├── scripts/               # Utility scripts
├── tests/                 # Python tests
├── assets/                # Documentation assets
└── README.md             # This file
```

---

## ✨ Features

Both implementations provide:

- ✅ **Deterministic alias/exact matching** → fuzzy string matching
- ✅ **IAB 3.1 ID emission** (not just labels) with configurable `cattax` for OpenRTB
- ✅ **Multi-category output** per input
- ✅ **Vector attributes** support (Channel, Type, Format, Language, Source, Environment)
- ✅ **SCD (Sensitive Content) flag** visibility and optional exclusion
- ✅ **OpenRTB** and **VAST CONTENTCAT** helpers
- ✅ **Local-only, reproducible**, versioned catalogs
- ✅ **Override support** for manual mappings

Python-specific features:
- 🐍 Local embeddings (Sentence-Transformers) for semantic matching
- 🐍 Optional LLM re-ranking via Ollama
- 🐍 CLI tool with CSV/JSON I/O
- 🐍 Web UI demo

---

## 🔎 Why migrate to IAB 3.0?

- 3.0 introduces clearer separation of primary topic "aboutness" vs. orthogonal vectors (e.g., news vs. opinion, formats, channels)
- Better support for CTV/video, podcasts, games, and app stores
- Non‑backwards compatible in areas like News/Opinion and entertainment genres; careful migration is required

This tool makes migration practical: it emits valid 3.0 IDs and helps curate edge cases with overrides, synonyms, thresholds, and audit outputs.

---

## 🧠 How it works

1. Normalize text and apply alias/exact matches via synonyms
2. Fuzzy retrieval (rapidfuzz | TF‑IDF | BM25) with configurable thresholds
3. Optional semantic augmentation with local embeddings *(Python only)*
4. Optional local LLM re‑ranking *(Python only)*
5. Assemble outputs: topic IDs + vector IDs → OpenRTB `content.cat` with configurable `cattax`
6. SCD flags are surfaced and can be excluded with `--drop-scd`

---

## 🖥️ Web Demo

The repository includes a web UI with FastAPI backend:

```bash
cd python
python -m venv .venv && source .venv/bin/activate
pip install -e .
pip install -r requirements-dev.txt
uvicorn scripts.web_server:app --port 8000 --reload
```

Open http://localhost:8000/ in your browser.

---

## 📎 Official IAB References

- **IAB Tech Lab**: https://iabtechlab.com/
- **Content Taxonomy**: https://iabtechlab.com/standards/content-taxonomy/
- **GitHub**: https://github.com/mixpeek/iab-mapper
- **Web Tool**: https://mixpeek.com/tools/iab-taxonomy-mapper

---

## 🔐 Security & Operations

- **Local-first**: Processing happens on your machine; no external APIs needed
- **No PII required**: CSV/JSON processed in-memory
- **Air‑gapped capable**: Prebundle models and run fully offline

---

## 📜 License

BSD 2-Clause. See [LICENSE](LICENSE).

Include IAB attribution in your deployed UI/footer:
> "IAB is a registered trademark of the Interactive Advertising Bureau. This tool is an independent utility built by Mixpeek for interoperability with IAB Content Taxonomy standards."

---

## 📞 Support & Contact

- **Issues:** [GitHub Issues](https://github.com/mixpeek/iab-mapper/issues)
- **Documentation:** [Mixpeek IAB Mapper](https://mixpeek.com/tools/iab-taxonomy-mapper)
- **Questions:** [Open an issue](https://github.com/mixpeek/iab-mapper/issues/new)
- **Enterprise support:** Contact [Mixpeek](https://mixpeek.com)

For enterprise support, custom integrations, or questions about multimodal classification extensions, reach out to the Mixpeek team.

---

## 🌟 Language-Specific Documentation

- **Python:** [python/README.md](./python/README.md)
- **JavaScript/TypeScript:** [javascript/README.md](./javascript/README.md)

---

Made with ❤️ by [Mixpeek](https://mixpeek.com)
