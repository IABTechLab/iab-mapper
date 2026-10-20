# Changelog

All notable changes to this project will be documented here.

## [1.1.0] - 2026-10-20
- Default `cattax` is now `"9"` (IAB Content Taxonomy 3.1) in the Python pipeline, CLI, web server and JS mapper. The old default `"2"` means Content Taxonomy 2.0 in AdCOM, so receivers read 3.x IDs as 2.0 codes.
- npm package: ships the full catalogs the Python package already had (3.1: 704 categories; 2.2: 1,197). The published 1.0.0 shipped a 6-row 3.x sample with IDs that are not in the official file (for example "3-5-2" for Cooking, which is 216).
- `synonyms_3x.json`: keyed by label, which is how both mappers look synonyms up. The path-keyed entries never matched, and "Team Sports" is not a 3.1 label.
- README examples use real 3.1 IDs and `cattax: "9"`.
- A record with a 2.x `code` and no `label` now maps: the label is looked up in the bundled 2.x catalog (1,197 codes). Before, `{"code": "1"}` returned no IDs. A supplied label still wins; `label` is optional in the TypeScript `InputRecord`.

## [0.3.1] - 2025-09-10
- CLI: add `update-catalogs` subcommand (fetch exact or latest 2.x/3.x)
- Script: `scripts/update_catalogs.py` robust TSV header detection
- README: document catalog updater (script and CLI)
- Data: refreshed catalogs (3.1 and 2.2)

## [0.3.0] - 2025-09-09
- Vectors catalogs and output wiring
- Configurable cattax flag
- Overrides support
- Unmapped report and richer outputs
- Tests for new features; README and Python API docs
- PyPI packaging and metadata

