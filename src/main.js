import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './styles.css';
import { loadGpxAsGeoJson } from './lib/load-gpx.js';
import { tossaHighlights as route } from './routes/tossa-highlights.js';

gsap.registerPlugin(ScrollTrigger);

const app = document.querySelector('#app');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

app.innerHTML = `
  <header class="hero">
    <div class="hero__inner">
      <p class="kicker">Scrolly Route · Technical prototype</p>
      <h1>${route.title}</h1>
      <p class="hero__subtitle">${route.subtitle}</p>
      <dl class="stats" aria-label="Route summary">
        <div><dt>Distance</dt><dd>${route.stats.distanceKm} km</dd></div>
        <div><dt>Elevation</dt><dd>${route.stats.elevationM}</dd></div>
        <div><dt>Difficulty</dt><dd>${route.stats.difficulty}</dd></div>
      </dl>
      <p class="prototype-note">Prototype content only. Geometry, chapter positions, photography and factual copy must be verified before publication.</p>
    </div>
  </header>

  <section id="route-story" class="story" aria-label="Cinematic route story">
    <div class="story__map-wrap">
      <div id="map" class="story__map" role="img" aria-label="Interactive route map"></div>
      <div id="map-status" class="map-status" aria-live="polite">Loading master route…</div>
    </div>
    <div class="story__chapters">
      ${route.chapters.map((chapter, index) => `
        <article class="chapter" data-chapter="${index}">
          <div class="chapter__media" aria-hidden="true"><span>Photo placeholder</span></div>
          <div class="chapter__copy">
            <p class="kicker">${chapter.eyebrow}</p>
            <h2>${chapter.title}</h2>
            <p>${chapter.body}</p>
          </div>
        </article>
      `).join('')}
    </div>
  </section>

  <section class="practical" aria-labelledby="practical-title">
    <div class="practical__inner">
      <p class="kicker">After the story</p>
      <h2 id="practical-title">Take this route with you</h2>
      <p>The production page will expose the verified master route through the visitor's preferred navigation ecosystem.</p>
      <div class="navigation-grid" aria-label="Navigation options">
        <span>Strava</span><span>Komoot</span><span>Ride with GPS</span><span>Wikiloc</span><span>Google Maps*</span><span>GPX</span>
      </div>
      <p class="fineprint">* Google Maps only where the road route has been manually verified against the Tossa Cycling master route.</p>
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
        'line-opacity': 0.9
      }
    });
    statusEl.textContent = 'Verified master route loaded.';
    statusEl.dataset.state = 'ready';
  } catch (error) {
    console.warn(error);
    statusEl.textContent = 'Master GPX not added yet — map interaction shell is running with no route geometry.';
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
        if (camera) map.easeTo({ ...camera, duration: 1200 });
      },
      onEnterBack: () => {
        const camera = route.chapters[index].camera;
        if (camera) map.easeTo({ ...camera, duration: 900 });
      }
    });
  });
} else {
  document.body.classList.add('reduced-motion');
}
