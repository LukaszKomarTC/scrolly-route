import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './styles.css';
import { loadGpxAsGeoJson } from './lib/load-gpx.js';
import { coastalExplorer as route } from './routes/coastal-explorer.js';

gsap.registerPlugin(ScrollTrigger);

const app = document.querySelector('#app');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const navItems = [
  ['Strava', route.navigation.strava],
  ['Komoot', route.navigation.komoot],
  ['Ride with GPS', route.navigation.rideWithGps],
  ['Wikiloc', route.navigation.wikiloc],
  ['Google Maps', route.navigation.googleMaps],
  ['Download GPX', route.navigation.gpx]
];

app.innerHTML = `
  <header class="hero">
    <div class="hero__inner">
      <p class="kicker">Tossa Cycling · Route experience</p>
      <h1>${route.title}</h1>
      <p class="hero__subtitle">${route.subtitle}</p>
      <dl class="stats" aria-label="Route summary">
        <div><dt>Distance</dt><dd>${route.stats.distanceKm} km</dd></div>
        <div><dt>Elevation</dt><dd>${route.stats.elevationM}</dd></div>
        <div><dt>Difficulty</dt><dd>${route.stats.difficulty}</dd></div>
      </dl>
      <div class="positioning">
        <p class="kicker">${route.positioning.label}</p>
        <p>${route.positioning.statement}</p>
        <strong>${route.positioning.bucketList}</strong>
      </div>
      <p class="prototype-note">First cinematic build using the approved Coastal Explorer GPX and verified local story points. Photography and some operational details remain prototype placeholders.</p>
    </div>
  </header>

  <section id="route-story" class="story" aria-label="Cinematic route story">
    <div class="story__map-wrap">
      <div id="map" class="story__map" role="img" aria-label="Interactive Coastal Explorer route map"></div>
      <div id="map-status" class="map-status" aria-live="polite">Loading Coastal Explorer master route…</div>
    </div>
    <div class="story__chapters">
      ${route.chapters.map((chapter, index) => `
        <article class="chapter" data-chapter="${index}" id="${chapter.id}">
          <div class="chapter__media" aria-hidden="true"><span>Production photo pending</span></div>
          <div class="chapter__copy">
            <p class="kicker">${chapter.eyebrow}</p>
            <h2>${chapter.title}</h2>
            <p>${chapter.body}</p>
            ${chapter.safety ? `<p class="safety-note"><strong>Safety:</strong> ${chapter.safety}</p>` : ''}
            ${chapter.subpoints?.length ? `
              <ul class="subpoints">
                ${chapter.subpoints.map(point => `<li><strong>${point.name}</strong>${point.note ? ` — ${point.note}` : ''}</li>`).join('')}
              </ul>
            ` : ''}
          </div>
        </article>
      `).join('')}
    </div>
  </section>

  <section class="practical" aria-labelledby="practical-title">
    <div class="practical__inner">
      <p class="kicker">Take it with you</p>
      <h2 id="practical-title">Navigate Coastal Explorer your way</h2>
      <p>One Tossa Cycling master route, distributed through the navigation ecosystem you already use. Strava and the master GPX are live in this first build; the remaining platform links stay visibly pending until their copies are verified against the same master.</p>
      <div class="navigation-grid" aria-label="Navigation options">
        ${navItems.map(([name, url]) => url
          ? `<a href="${url}" ${url.startsWith('http') ? 'target="_blank" rel="noopener noreferrer"' : ''}>${name}</a>`
          : `<span class="is-pending">${name}<small>Coming after verification</small></span>`
        ).join('')}
      </div>
      <p class="fineprint">The uploaded Tossa Cycling GPX is the source of truth. Future Strava, Komoot, Ride with GPS, Wikiloc and road-safe Google Maps copies must stay synchronized with this version.</p>
    </div>
  </section>
`;

const statusEl = document.querySelector('#map-status');
const map = new maplibregl.Map({
  container: 'map',
  style: route.map.styleUrl,
  ...route.map.initialView,
  attributionControl: true
});

map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');

function addStoryMarkers() {
  route.chapters.forEach((chapter) => {
    if (chapter.point) {
      const el = document.createElement('div');
      el.className = 'story-marker';
      el.title = chapter.title;
      new maplibregl.Marker({ element: el }).setLngLat(chapter.point).addTo(map);
    }
    chapter.subpoints?.forEach((subpoint) => {
      if (!subpoint.point) return;
      const el = document.createElement('div');
      el.className = 'story-marker story-marker--minor';
      el.title = subpoint.name;
      new maplibregl.Marker({ element: el }).setLngLat(subpoint.point).addTo(map);
    });
  });
}

async function addRoute() {
  try {
    const geojson = await loadGpxAsGeoJson(route.masterRoute.url);
    if (!map.loaded()) await new Promise(resolve => map.once('load', resolve));

    map.addSource('master-route', { type: 'geojson', data: geojson, lineMetrics: true });
    map.addLayer({
      id: 'master-route-line',
      type: 'line',
      source: 'master-route',
      paint: {
        'line-width': ['interpolate', ['linear'], ['zoom'], 8, 3, 14, 7],
        'line-opacity': 0.92
      }
    });
    addStoryMarkers();
    statusEl.textContent = 'Coastal Explorer master GPX loaded · 63.6 km';
    statusEl.dataset.state = 'ready';
  } catch (error) {
    console.warn(error);
    statusEl.textContent = 'Unable to load the Coastal Explorer master GPX.';
    statusEl.dataset.state = 'warning';
  }
}

map.on('load', addRoute);

if (!reduceMotion) {
  document.querySelectorAll('.chapter').forEach((chapter, index) => {
    ScrollTrigger.create({
      trigger: chapter,
      start: 'top 65%',
      end: 'bottom 35%',
      toggleClass: { targets: chapter, className: 'is-active' },
      onEnter: () => {
        const camera = route.chapters[index].camera;
        if (camera) map.easeTo({ ...camera, duration: 1400 });
      },
      onEnterBack: () => {
        const camera = route.chapters[index].camera;
        if (camera) map.easeTo({ ...camera, duration: 950 });
      }
    });
  });
} else {
  document.body.classList.add('reduced-motion');
}
