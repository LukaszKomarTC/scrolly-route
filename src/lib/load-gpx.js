import { gpx } from '@tmcw/togeojson';

export async function loadGpxText(source) {
  // Resolved against the document base rather than the domain root, so the route still
  // loads when the app is served from a subpath.
  const url = new URL(source.url, document.baseURI).href;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Unable to load GPX (${response.status}) from ${url}`);
  return response.text();
}

export async function loadGpxAsGeoJson(source) {
  const xmlText = await loadGpxText(source);
  const xml = new DOMParser().parseFromString(xmlText, 'application/xml');
  const parserError = xml.querySelector('parsererror');
  if (parserError) throw new Error('The GPX document could not be parsed.');

  const geojson = gpx(xml);
  if (!geojson.features?.length) throw new Error('The GPX document contains no route or track geometry.');
  return geojson;
}

export async function downloadGpx(source, filename = 'route.gpx') {
  const text = await loadGpxText(source);
  const url = URL.createObjectURL(new Blob([text], { type: 'application/gpx+xml' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
