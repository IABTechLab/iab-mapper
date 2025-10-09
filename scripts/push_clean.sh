#!/bin/bash
set -e

cd /Users/ethan/Dev/mixpeek/tools/iab-mapper

echo "🧹 Cleaning up any secrets..."
rm -f python/.pypirc javascript/.npmrc python/publish*.sh python/publish*.py

echo "🔄 Resetting previous commit with secrets..."
git reset --soft HEAD~1

echo "📋 Staging all changes..."
git add .

echo "💾 Committing changes..."
git commit -m "feat: add npm package and reorganize into python/javascript directories

- Published @mixpeek/iab-mapper@1.0.0 to npm
- Published iab-mapper@1.0.0 to PyPI
- Separated Python and JavaScript implementations into /python and /javascript directories
- Added TypeScript support with full type definitions
- Added comprehensive test suites (54+ JS tests, 14+ Python tests)
- Updated documentation structure
- Both packages production-ready and published

Changes:
- Created JavaScript/TypeScript implementation with npm package
- Reorganized Python package into /python directory
- Added language-specific READMEs
- Created test suites for both implementations
- Updated main README to document both packages
- Cleaned up internal documentation files"

echo "🚀 Pushing to main..."
git push origin main --force-with-lease

echo "🏷️  Creating and pushing tag..."
git tag -f v1.0.0 -m "Release v1.0.0 - npm and PyPI packages"
git push origin v1.0.0 --force

echo ""
echo "✅ Successfully pushed to GitHub!"
echo "📦 npm: https://www.npmjs.com/package/@mixpeek/iab-mapper"
echo "🐍 PyPI: https://pypi.org/project/iab-mapper/"
echo "💻 GitHub: https://github.com/mixpeek/iab-mapper"

