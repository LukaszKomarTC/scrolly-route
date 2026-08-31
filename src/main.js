import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './styles.css';
import { downloadGpx, loadGpxAsGeoJson } from './lib/load-gpx.js';
import { coastalExplorer as route } from './routes/coastal-explorer.js';

gsap.registerPlugin(ScrollTrigger);

const DEFAULT_ROUTE_COLOR = '#f4623a';
const TRANSPARENT = 'rgba(0, 0, 0, 0)';
// line-gradient stops must strictly ascend, so the revealed edge needs a minimum width.
const REVEAL_EDGE = 0.0008;

const app = document.querySelector('#app');
const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
let reduceMotion = motionQuery.matches;

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
            ${chapter.subpoints?.length ? `<ul class="subpoints">${chapter.subpoints.map(point => `<li><strong>${point.name}</strong>${point.note ? ` — ${point.note}` : ''}</li>`).join('')}</ul>` : ''}
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
        ${navItems.map(([name, url]) => {
          if (url === 'download') return `<button type="button" id="download-gpx">${name}</button>`;
          if (url) return `<a href="${url}" target="_blank" rel="noopener noreferrer">${name}</a>`;
          return `<span class="is-pending">${name}<small>Coming after verification</small></span>`;
        }).join('')}
      </div>
      <p class="fineprint">The uploaded Tossa Cycling GPX is the source of truth. Future Strava, Komoot, Ride with GPS, Wikiloc and road-safe Google Maps copies must stay synchronized with this version.</p>
    </div>
  </section>
`;

const statusEl = document.querySelector('#map-status');
const downloadButton = document.querySelector('#download-gpx');
if (downloadButton) {
  downloadButton.addEventListener('click', async () => {
    downloadButton.disabled = true;
    downloadButton.textContent = 'Preparing GPX…';
    try {
      await downloadGpx(route.masterRoute, 'Tossa-Cycling-Coastal-Explorer.gpx');
      downloadButton.textContent = 'Download GPX';
    } catch (error) {
      console.warn(error);
      downloadButton.textContent = 'GPX unavailable';
    } finally {
      downloadButton.disabled = false;
    }
  });
}

const map = new maplibregl.Map({
  container: 'map',
  style: route.map.styleUrl,
  ...route.map.initialView,
  attributionControl: true,
  // The map is sticky and fills most of the viewport, so an unmodified wheel over it would
  // zoom instead of advancing the story and leave the reader unable to scroll past it.
  // Cooperative gestures pass a plain scroll through to the page and ask for Ctrl/Cmd to
  // zoom, the same convention as an embedded Google map.
  cooperativeGestures: true
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

const routeColor = route.map.routeColor || DEFAULT_ROUTE_COLOR;

// Each chapter knows its distance along the route, so the reveal can track the story
// rather than raw scroll depth. Chapters without a distance fall back to even spacing.
const totalKm = Number(route.stats.distanceKm);
const chapterProgress = route.chapters.map((chapter, index) => {
  if (Number.isFinite(chapter.routeKm) && totalKm > 0) {
    return Math.min(Math.max(chapter.routeKm / totalKm, 0), 1);
  }
  return route.chapters.length > 1 ? index / (route.chapters.length - 1) : 1;
});

// The closing chapter completes the ride, so rounding between the declared distance and
// the last chapter's marker must not leave a sliver of the loop undrawn at the finish.
if (chapterProgress.length && chapterProgress[chapterProgress.length - 1] >= 0.99) {
  chapterProgress[chapterProgress.length - 1] = 1;
}

function revealGradient(progress) {
  if (progress >= 1) {
    return ['interpolate', ['linear'], ['line-progress'], 0, routeColor, 1, routeColor];
  }
  const edge = Math.min(Math.max(progress, REVEAL_EDGE), 1 - 2 * REVEAL_EDGE);
  return [
    'interpolate', ['linear'], ['line-progress'],
    0, routeColor,
    edge, routeColor,
    edge + REVEAL_EDGE, TRANSPARENT,
    1, TRANSPARENT
  ];
}

let routeReady = false;

function setRouteProgress(progress) {
  if (!routeReady) return;
  map.setPaintProperty('master-route-progress', 'line-gradient', revealGradient(reduceMotion ? 1 : progress));
}

// The story panel covers the left of the map on desktop, so an unpadded camera drops the
// focal point behind the text. Measured from the live element rather than duplicating the CSS.
function cameraPadding() {
  // An explicit zero on every side matters: an empty object leaves whatever padding is
  // already on the transform, so a desktop-to-mobile resize would keep the old offset.
  const none = { top: 0, right: 0, bottom: 0, left: 0 };
  const panel = document.querySelector('.story__chapters');
  if (!panel) return none;
  const width = panel.getBoundingClientRect().width;
  if (width > window.innerWidth * 0.8) {
    // Mobile: the card floats over the lower part of the map, so lift the focal point
    // above it rather than offsetting sideways.
    const card = document.querySelector('.chapter.is-active .chapter__copy')
      || document.querySelector('.chapter__copy');
    const height = card ? card.getBoundingClientRect().height : 0;
    return { ...none, bottom: Math.round(Math.min(height, window.innerHeight * 0.55)) };
  }
  return { ...none, left: Math.round(width) };
}

let mapVisible = true;

function moveCamera(camera, duration) {
  if (!camera || !mapVisible) return;
  const view = { ...camera, padding: cameraPadding() };
  if (reduceMotion) map.jumpTo(view);
  else map.easeTo({ ...view, duration });
}

// Terrain is what makes the per-chapter pitch mean anything. It is optional: if the DEM
// is unreachable the story still works as a flat map.
function addTerrain() {
  const terrain = route.map.terrain;
  if (!terrain?.tiles?.length) return;
  try {
    map.addSource('terrain-dem', {
      type: 'raster-dem',
      tiles: terrain.tiles,
      encoding: terrain.encoding || 'terrarium',
      tileSize: terrain.tileSize || 256,
      maxzoom: terrain.maxzoom || 12,
      attribution: terrain.attribution
    });
    map.setTerrain({ source: 'terrain-dem', exaggeration: terrain.exaggeration ?? 1 });
  } catch (error) {
    console.warn('Terrain unavailable; continuing without it.', error);
  }
  try {
    map.setSky({
      'sky-color': '#8fc3e8',
      'horizon-color': '#e2ecf2',
      'fog-color': '#e8eef1',
      'sky-horizon-blend': 0.6,
      'horizon-fog-blend': 0.5,
      'fog-ground-blend': 0.4,
      'atmosphere-blend': 0.7
    });
  } catch (error) {
    console.warn('Sky unavailable; continuing without it.', error);
  }
}

async function addRoute() {
  try {
    const geojson = await loadGpxAsGeoJson(route.masterRoute);

    map.addSource('master-route', { type: 'geojson', data: geojson, lineMetrics: true });

    // A faint full-route layer keeps the whole shape readable while the bright layer
    // reveals only the distance the reader has travelled.
    map.addLayer({
      id: 'master-route-base',
      type: 'line',
      source: 'master-route',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': routeColor,
        'line-width': ['interpolate', ['linear'], ['zoom'], 8, 2, 14, 4],
        'line-opacity': 0.3
      }
    });
    map.addLayer({
      id: 'master-route-progress',
      type: 'line',
      source: 'master-route',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-width': ['interpolate', ['linear'], ['zoom'], 8, 3, 14, 7],
        'line-opacity': 0.95,
        'line-gradient': revealGradient(reduceMotion ? 1 : 0)
      }
    });

    addTerrain();
    addStoryMarkers();
    routeReady = true;
    ScrollTrigger.refresh();
    statusEl.textContent = `${route.title} master GPX loaded · ${route.stats.distanceKm} km`;
    statusEl.dataset.state = 'ready';
  } catch (error) {
    console.warn(error);
    statusEl.textContent = 'Unable to load the Coastal Explorer master GPX.';
    statusEl.dataset.state = 'warning';
  }
}

map.on('error', (event) => {
  console.warn(event?.error || event);
  if (statusEl.dataset.state === 'ready' || map.isStyleLoaded()) return;
  statusEl.textContent = 'The interactive map is unavailable. Route details and navigation links below still work.';
  statusEl.dataset.state = 'warning';
});

map.on('load', addRoute);

const chapterElements = [...document.querySelectorAll('.chapter')];

chapterElements.forEach((chapter, index) => {
  ScrollTrigger.create({
    trigger: chapter,
    start: 'top 65%',
    end: 'bottom 35%',
    toggleClass: { targets: chapter, className: 'is-active' },
    onEnter: () => moveCamera(route.chapters[index].camera, 1400),
    onEnterBack: () => moveCamera(route.chapters[index].camera, 950)
  });

  // Draw the route forward as the reader moves between chapters, so the line arrives at
  // each chapter having covered exactly that chapter's distance along the ride.
  if (index === 0) return;
  ScrollTrigger.create({
    trigger: chapter,
    start: 'top 85%',
    end: 'top 45%',
    scrub: true,
    onUpdate: (self) => {
      const from = chapterProgress[index - 1];
      const to = chapterProgress[index];
      setRouteProgress(from + (to - from) * self.progress);
    }
  });
});

// Animating a map that is scrolled out of view is wasted work on mobile. Camera moves
// pause while it is off screen, and the active chapter is re-framed when it returns.
const mapWrap = document.querySelector('.story__map-wrap');
if (mapWrap && 'IntersectionObserver' in window) {
  new IntersectionObserver(([entry]) => {
    const returned = entry.isIntersecting && !mapVisible;
    mapVisible = entry.isIntersecting;
    if (!returned) return;
    const active = chapterElements.findIndex(chapter => chapter.classList.contains('is-active'));
    if (active >= 0) moveCamera(route.chapters[active].camera, 0);
  }, { threshold: 0.05 }).observe(mapWrap);
}

function applyMotionPreference() {
  document.body.classList.toggle('reduced-motion', reduceMotion);
  setRouteProgress(reduceMotion ? 1 : 0);
  ScrollTrigger.refresh();
}

motionQuery.addEventListener('change', (event) => {
  reduceMotion = event.matches;
  applyMotionPreference();
});

applyMotionPreference();

// Camera padding is derived from the live panel width, so a breakpoint change has to
// re-frame the current chapter rather than leave it offset for the old layout.
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    ScrollTrigger.refresh();
    const active = chapterElements.findIndex(chapter => chapter.classList.contains('is-active'));
    if (active >= 0) moveCamera(route.chapters[active].camera, 0);
  }, 180);
});
