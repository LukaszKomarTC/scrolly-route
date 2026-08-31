import fs from 'node:fs/promises';
import { gunzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';

const masterChunks = [
  'public/routes/coastal-explorer/master/part-1a.b64',
  'public/routes/coastal-explorer/master/part-1b.b64',
  'public/routes/coastal-explorer/master/part-2.b64',
  'public/routes/coastal-explorer/master/part-3.b64',
  'public/routes/coastal-explorer/master/part-4.b64'
];

const requiredFiles = [
  'src/routes/coastal-explorer.js',
  'src/lib/load-gpx.js',
  'src/main.js',
  'src/styles.css',
  'README.md',
  ...masterChunks
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

const chunks = await Promise.all(masterChunks.map(path => fs.readFile(path, 'utf8')));
const compressed = Buffer.from(chunks.join('').trim(), 'base64');
const gpx = gunzipSync(compressed);
const sha256 = createHash('sha256').update(gpx).digest('hex');
const expectedSha256 = 'fcff17f2bd8fabe50965e15caf9d86c4b1ad4cb0a48e31800ba28b25f0caadfe';

if (sha256 !== expectedSha256) {
  throw new Error(`Coastal Explorer master GPX checksum mismatch: ${sha256}`);
}

const text = gpx.toString('utf8');
const trackPoints = (text.match(/<trkpt\b/g) || []).length;
if (!text.includes('<gpx') || trackPoints !== 2765) {
  throw new Error(`Unexpected Coastal Explorer GPX structure: ${trackPoints} track points`);
}

console.log(`Coastal Explorer validation passed: exact master GPX verified (${trackPoints} points, sha256 ${sha256}).`);
