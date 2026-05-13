// scripts/coverage-report.js
const fs = require('fs');
const path = require('path');

const coverageSummaryPath = path.resolve(__dirname, '..', 'coverage', 'coverage-summary.json');
if (!fs.existsSync(coverageSummaryPath)) {
  console.error('Coverage summary not found at', coverageSummaryPath);
  process.exit(1);
}

const summary = JSON.parse(fs.readFileSync(coverageSummaryPath, 'utf-8'));
const total = summary.total;

function format(metric) {
  const value = total[metric].pct;
  return `${metric}: ${value}%`;
}

console.log('=== Test Coverage Summary ===');
['lines', 'statements', 'functions', 'branches'].forEach(m => {
  console.log(format(m));
});

const threshold = 80;
let below = [];
['lines', 'statements', 'functions', 'branches'].forEach(m => {
  if (total[m].pct < threshold) {
    below.push(`${m} (${total[m].pct}%)`);
  }
});

if (below.length > 0) {
  console.error('Coverage below threshold:', below.join(', '));
  process.exit(1);
} else {
  console.log('All coverage metrics are above', threshold + '%');
  process.exit(0);
}
