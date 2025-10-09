# IAB Content Taxonomy Mapper (Python)

<p align="center">
  <a href="https://pypi.org/project/iab-mapper/">View on PyPI</a>
  •
  <a href="https://github.com/mixpeek/iab-mapper">View on GitHub</a>
  •
  <a href="https://mixpeek.com/tools/iab-taxonomy-mapper">Open Web Tool</a>
</p>

Map **IAB Content Taxonomy 2.x** labels/codes to **IAB 3.0** locally with a deterministic → fuzzy → (optional) semantic pipeline.

> This is the **Python** implementation. For JavaScript/TypeScript, see [`@mixpeek/iab-mapper`](../javascript).

## 🔧 Install

### From PyPI (recommended)
```bash
pip install iab-mapper
```

### From source
```bash
cd python
python -m venv .venv && source .venv/bin/activate
pip install -e .
# Optional (enable local embeddings / KNN search)
pip install -e ".[emb]"
```

## 🚀 Quick Start

```bash
# simplest path: fuzzy only, CSV in → JSON out
iab-mapper sample_2x_codes.csv -o mapped.json

# enable local embeddings (improves recall on free‑text labels)
iab-mapper sample_2x_codes.csv -o mapped.json --use-embeddings
```

## 🐍 Python API

```python
from pathlib import Path
from iab_mapper.pipeline import Mapper, MapConfig
import iab_mapper as pkg

# Use packaged stub catalogs or point data_dir to your own
data_dir = Path(pkg.__file__).parent / "data"

cfg = MapConfig(
    fuzzy_method="bm25",   # rapidfuzz|tfidf|bm25
    fuzzy_cut=0.92,
    use_embeddings=False,   # set True and choose emb_model to enable
    max_topics=3,
    drop_scd=False,
    cattax="2",            # OpenRTB content.cattax enum
    overrides_path=None     # path to JSON overrides if desired
)

mapper = Mapper(cfg, str(data_dir))

# Single record with optional vectors
rec = {
    "code": "2-12",
    "label": "Food & Drink",
    "channel": "editorial",
    "type": "article",
    "format": "video",
    "language": "en",
    "source": "professional",
    "environment": "ctv",
}

out = mapper.map_record(rec)
print(out["out_ids"])         # topic + vector IDs
print(out["openrtb"])         # {"content": {"cat": [...], "cattax": "2"}}
print(out["vast_contentcat"]) # "id1","id2",...

# Or just map topics
topics = mapper.map_topics("Cooking how-to")

# Batch over a list of dicts
rows = [rec, {"label": "Sports"}]
mapped = [mapper.map_record(r) for r in rows]
```

## ⚙️ Useful Flags

| Flag | Default | What it does |
|------|---------|--------------|
| `--fuzzy-cut` | `0.92` | Stricter = fewer, higher-confidence matches |
| `--use-embeddings` | off | Enable local embeddings for near-miss labels |
| `--emb-model` | `all-MiniLM-L6-v2` | Sentence-Transformers model or `tfidf` |
| `--emb-cut` | `0.80` | Cosine similarity threshold for embeddings |
| `--max-topics` | `3` | Cap topic IDs per row |
| `--drop-scd` | off | Exclude Sensitive Content nodes |
| `--cattax` | `2` | OpenRTB `content.cattax` enum |
| `--unmapped-out` | — | Write misses to file for audit |
| `--overrides` | — | Force mappings before match |

## 🖥️ Web Demo

```bash
cd python
python -m venv .venv && source .venv/bin/activate
pip install -e .
pip install -r requirements-dev.txt
uvicorn scripts.web_server:app --port 8000 --reload
```

Open http://localhost:8000/

## 📜 License

BSD 2-Clause. See [LICENSE](LICENSE).

For full documentation, see the [main README](../README.md).
