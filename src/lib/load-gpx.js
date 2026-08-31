import { gpx } from '@tmcw/togeojson';

function normalizeParts(parts) {
  return parts.flatMap((url) => url.endsWith('/part-1.b64')
    ? [url.replace('/part-1.b64', '/part-1a.b64'), url.replace('/part-1.b64', '/part-1b.b64')]
    : [url]);
}

async function decodeChunkedGzip(parts) {
  if (!('DecompressionStream' in window)) {
    throw new Error('This browser cannot decode the compressed GPX asset.');
  }

  const encoded = (await Promise.all(normalizeParts(parts).map(async (url) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Unable to load GPX asset (${response.status}) from ${url}`);
    return (await response.text()).trim();
  }))).join('');

  const bytes = Uint8Array.from(atob(encoded), char => char.charCodeAt(0));
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
  return new Response(stream).text();
}

export async function loadGpxText(source) {
  if (source.parts?.length) return decodeChunkedGzip(source.parts);

  const response = await fetch(source.url);
  if (!response.ok) throw new Error(`Unable to load GPX (${response.status}) from ${source.url}`);
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
