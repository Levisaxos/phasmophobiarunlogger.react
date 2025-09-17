#!/usr/bin/env node
// scripts/set-build-info.js
// Sets build information for local development builds

const fs = require('fs');
const path = require('path');

// Get package version
const packageJson = require('../package.json');
const version = packageJson.version;

// Get current date/time
const buildDate = new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC';

// Create .env.local content
const envContent = `# Auto-generated build information
REACT_APP_VERSION=${version}
REACT_APP_BUILD_DATE=${buildDate}
`;

// Write to .env.local
const envPath = path.join(__dirname, '..', '.env.local');
fs.writeFileSync(envPath, envContent);

console.log(`✅ Build info set: v${version} built on ${buildDate}`);