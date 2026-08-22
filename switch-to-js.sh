#!/bin/bash
set -e

# Backup css
cp src/index.css src_js/index.css

# Remove old ts and tsx files in src/
rm -f src/*.tsx src/*.ts
rm -f src/components/*.tsx
rm -f src/data/*.ts
rm -f src/services/*.ts

# Copy converted js and jsx files
cp src_js/main.jsx src/main.jsx
cp src_js/App.jsx src/App.jsx
cp src_js/components/*.jsx src/components/
cp src_js/data/*.js src/data/
cp src_js/services/*.js src/services/

# Remove server.ts and keep server.js
rm -f server.ts

# Clean temp directory and scripts
rm -rf src_js test-convert.sh convert-all-to-js.sh

echo "Switched to JS/JSX successfully."
