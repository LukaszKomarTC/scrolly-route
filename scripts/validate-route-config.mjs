import fs from 'node:fs/promises';

const routeConfigPath = 'src/routes/coastal-explorer.js';

const requiredFiles = [routeConfigPath, 'src/lib/load-gpx.js', 'src/main.js', 'src/styles.css', 'README.md'];
for (const path of requiredFiles) await fs.access(path);

const routeConfig = await fs.readFile(routeConfigPath, 'utf8');

const requiredMarkers = ['id:', 'masterRoute:', 'url:', 'chapters:', 'navigation:', 'strava:'];
for (const marker of requiredMarkers) {
  if (!routeConfig.includes(marker)) throw new Error(`Route config is missing required marker: ${marker}`);
}

const forbiddenMarkers = ['password=', 'api_key=', 'application_password', 'BEGIN PRIVATE KEY'];
for (const marker of forbiddenMarkers) {
  if (routeConfig.toLowerCase().includes(marker.toLowerCase())) {
    throw new Error(`Potential secret material detected in public route config: ${marker}`);
  }
}

// The master GPX the config points at must actually exist; a config referencing a
// missing asset should fail here rather than as a blank map in the browser.
const gpxUrl = routeConfig.match(/masterRoute:\s*\{[^}]*url:\s*'([^']+)'/)?.[1];
if (!gpxUrl) throw new Error('Route config does not declare a masterRoute.url.');

const gpxPath = `public${gpxUrl}`;
try {
  await fs.access(gpxPath);
} catch {
  throw new Error(`Route config points at a master GPX that does not exist: ${gpxPath}`);
}

const gpx = await fs.readFile(gpxPath, 'utf8');
if (!gpx.includes('<gpx')) throw new Error(`${gpxPath} is not a GPX document.`);

const points = [...gpx.matchAll(/<trkpt[^>]*lat="([-\d.]+)"[^>]*lon="([-\d.]+)"/g)]
  .map(match => [Number(match[1]), Number(match[2])]);
if (points.length < 100) throw new Error(`Master GPX has too few track points to be a real route: ${points.length}`);

// Cross-check the advertised distance against the master route itself. This catches the
// failure that actually matters — published stats drifting away from the GPX — without
// pinning a checksum that any legitimate route revision would break.
const toRadians = degrees => degrees * Math.PI / 180;
let metres = 0;
for (let i = 1; i < points.length; i += 1) {
  const [lat1, lon1] = points[i - 1];
  const [lat2, lon2] = points[i];
  const deltaLat = toRadians(lat2 - lat1);
  const deltaLon = toRadians(lon2 - lon1);
  const a = Math.sin(deltaLat / 2) ** 2
    + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(deltaLon / 2) ** 2;
  metres += 2 * 6371000 * Math.asin(Math.sqrt(a));
}
const measuredKm = metres / 1000;

const declaredKm = Number(routeConfig.match(/distanceKm:\s*'([\d.]+)'/)?.[1]);
if (!Number.isFinite(declaredKm)) throw new Error('Route config does not declare a numeric stats.distanceKm.');
if (Math.abs(measuredKm - declaredKm) > 1) {
  throw new Error(`Config claims ${declaredKm} km but the master GPX measures ${measuredKm.toFixed(2)} km.`);
}

console.log(`Coastal Explorer validation passed: ${points.length} track points, ${measuredKm.toFixed(2)} km measured against ${declaredKm} km declared.`);
