import fs from 'node:fs/promises';

const requiredFiles = [
  'src/routes/tossa-highlights.js',
  'src/lib/load-gpx.js',
  'src/main.js',
  'src/styles.css',
  'README.md'
];

for (const path of requiredFiles) {
  await fs.access(path);
}

const routeConfig = await fs.readFile('src/routes/tossa-highlights.js', 'utf8');
const requiredMarkers = ['id:', 'masterRoute:', 'chapters:', 'navigation:'];
for (const marker of requiredMarkers) {
  if (!routeConfig.includes(marker)) {
    throw new Error(`Route config is missing required marker: ${marker}`);
  }
}

const forbiddenMarkers = ['password=', 'api_key=', 'application_password', 'BEGIN PRIVATE KEY'];
for (const marker of forbiddenMarkers) {
  if (routeConfig.toLowerCase().includes(marker.toLowerCase())) {
    throw new Error(`Potential secret material detected in public route config: ${marker}`);
  }
}

console.log('Route foundation validation passed.');
