export const tossaHighlights = {
  id: 'tossa-highlights',
  title: 'Tossa Highlights',
  subtitle: 'Costa Brava road cycling',
  version: 'prototype-0.1',
  status: 'prototype',
  activity: 'road-cycling',
  masterRoute: {
    format: 'gpx',
    url: '/routes/tossa-highlights/tossa-highlights.gpx',
    note: 'The approved Tossa Cycling master GPX must be added before the map prototype is considered route-accurate.'
  },
  stats: {
    distanceKm: '40–70',
    elevationM: 'TBC from master GPX',
    duration: 'TBC',
    difficulty: 'TBC'
  },
  map: {
    styleUrl: import.meta.env.VITE_MAP_STYLE_URL || 'https://demotiles.maplibre.org/style.json',
    initialView: {
      center: [2.933, 41.720],
      zoom: 10.5,
      pitch: 35,
      bearing: 0
    }
  },
  chapters: [
    {
      id: 'departure',
      eyebrow: 'Chapter 01',
      title: 'Leaving Tossa',
      body: 'Prototype copy. Final text will be replaced with first-hand Tossa Cycling route knowledge after the interaction is approved.',
      image: null,
      camera: null
    },
    {
      id: 'coast',
      eyebrow: 'Chapter 02',
      title: 'Costa Brava opens up',
      body: 'Placeholder narrative for testing pacing, typography and map synchronization.',
      image: null,
      camera: null
    },
    {
      id: 'climb',
      eyebrow: 'Chapter 03',
      title: 'The decisive climb',
      body: 'The production version should show verified climb data, local advice and an appropriate terrain camera angle.',
      image: null,
      camera: null
    },
    {
      id: 'return',
      eyebrow: 'Chapter 04',
      title: 'Back to Tossa',
      body: 'The closing chapter should reveal the full completed route before handing the visitor into practical route information and navigation choices.',
      image: null,
      camera: null
    }
  ],
  navigation: {
    strava: null,
    komoot: null,
    rideWithGps: null,
    wikiloc: null,
    googleMaps: null,
    gpx: '/routes/tossa-highlights/tossa-highlights.gpx'
  }
};
