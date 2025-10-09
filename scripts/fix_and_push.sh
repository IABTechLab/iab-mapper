#!/bin/bash
# Fix the commit and push without secrets

cd /Users/ethan/Dev/mixpeek/tools/iab-mapper

echo "🔄 Fixing commit to remove secrets..."

# Reset the last commit but keep changes
git reset HEAD~1

# Stage everything except the files with secrets
git add .

# Commit again
git commit -m "feat: add npm package and reorganize into python/javascript directories

- Published @mixpeek/iab-mapper@1.0.0 to npm
- Published iab-mapper@1.0.0 to PyPI
- Separated Python and JavaScript implementations
- Added TypeScript support with full type definitions
- Added comprehensive test suites (54+ JS tests, 14+ Python tests)
- Updated documentation structure
- Both packages production-ready and published

Note: Publishing scripts removed for security (contained API tokens)"

# Push to main
git push origin main

# Tag the release
git tag -f v1.0.0 -m "Release v1.0.0 - npm and PyPI packages"
git push origin v1.0.0

echo "✅ Successfully pushed to GitHub!"

