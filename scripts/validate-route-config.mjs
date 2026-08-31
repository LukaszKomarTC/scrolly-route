import fs from 'node:fs/promises';

const requiredFiles = [
  'src/routes/coastal-explorer.js',
  'src/lib/load-gpx.js',
  'src/main.js',
  'src/styles.css',
  'README.md',
  'public/routes/coastal-explorer/master/part-1.b64',
  'public/routes/coastal-explorer/master/part-2.b64',
  'public/routes/coastal-explorer/master/part-3.b64',
  'public/routes/coastal-explorer/master/part-4.b64'
];

for (const path of requiredFiles) await fs.access(path);

const routeConfig = await fs.readFile('src/routes/coastal-explorer.js', 'utf8');
const requiredMarkers = ['id:', 'masterRoute:', 'parts:', 'chapters:', 'navigation:', 'strava:'];
for (const marker of requiredMarkers) {
  if (!routeConfig.includes(marker)) throw new Error(`Route config is missing required marker: ${marker}`);
}

const forbiddenMarkers = ['password=', 'api_key=', 'application_password', 'BEGIN PRIVATE KEY'];
for (const marker of forbiddenMarkers) {
  if (routeConfig.toLowerCase().includes(marker.toLowerCase())) {
    throw new Error(`Potential secret material detected in public route config: ${marker}`);
  }
}

const chunks = await Promise.all(
  [1, 2, 3, 4].map(index => fs.readFile(`public/routes/coastal-explorer/master/part-${index}.b64`, 'utf8'))
);
const encoded = chunks.join('').trim();
const compressed = Buffer.from(encoded, 'base64');
if (compressed.length < 20000) throw new Error('Coastal Explorer master route asset looks incomplete.');

console.log('Coastal Explorer route validation passed.');
