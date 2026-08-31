import { gpx } from '@tmcw/togeojson';

export async function loadGpxAsGeoJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Unable to load GPX (${response.status}) from ${url}`);
  }

  const xml = new DOMParser().parseFromString(await response.text(), 'application/xml');
  const parserError = xml.querySelector('parsererror');
  if (parserError) {
    throw new Error('The GPX document could not be parsed.');
  }

  const geojson = gpx(xml);
  if (!geojson.features?.length) {
    throw new Error('The GPX document contains no route or track geometry.');
  }

  return geojson;
}
