# Architecture

## Purpose

`scrolly-route` is a reusable presentation engine for turning a verified route into a cinematic, scroll-driven story without making the route content dependent on animation.

The first reference implementation is **Tossa Highlights** for Tossa Cycling.

## Design principles

1. **One master route, many outputs.** The approved GPX is the source of truth. Strava, Komoot, Ride with GPS, Wikiloc, Google Maps and direct GPX links are distribution targets, not competing masters.
2. **Progressive enhancement.** Route facts, narrative and navigation links remain usable if the interactive map or JavaScript fails.
3. **Mobile first.** Desktop may use a sticky full-height cinematic map; mobile must reduce motion, camera aggression and layout complexity.
4. **Accessibility.** Respect `prefers-reduced-motion`, provide skip navigation and avoid encoding essential information only in motion or map visuals.
5. **No secret coupling.** The public repository must not know production WordPress credentials, VPS details, customer data or private AI Growth configuration.
6. **Generic engine.** Tossa Cycling supplies route data and theme/content; the engine itself should remain reusable.

## Route data model

Each route defines:

- stable route ID;
- title/subtitle/version/status;
- master GPX location;
- verified statistics;
- map defaults;
- ordered story chapters;
- optional camera definition per chapter;
- optional image per chapter;
- navigation destination URLs;
- verification/maintenance metadata (planned).

## Cinematic layer

Initial technical stack:

- **MapLibre GL JS** — map rendering and camera movement;
- **GSAP + ScrollTrigger** — scroll-state synchronization;
- **@tmcw/togeojson** — GPX to GeoJSON conversion;
- **Vite** — development and production bundling.

The first proof should demonstrate:

1. master GPX renders correctly;
2. route line can progressively reveal with scroll;
3. chapter activation changes camera position;
4. chapter photography/text transitions cleanly;
5. desktop and mobile treatments differ intentionally;
6. reduced-motion mode remains complete and understandable;
7. build remains lightweight enough for a tourism website.

## WordPress integration boundary

WordPress integration comes only after the standalone prototype is approved. Preferred direction: compile the engine as a self-contained frontend component and feed it route configuration/content from WordPress rather than rebuilding each route in a page builder.

The private deployment/integration layer may consume the public component, but credentials and environment-specific orchestration stay outside this repository.

## Content and copyright

Prototype photography may use neutral placeholders. Production photography must be owned by Tossa Cycling, explicitly licensed, or otherwise cleared for commercial publication. Public Strava/community photography must not be copied into production merely because it is visible in another platform.

## Route safety and versioning

Production routes should eventually carry:

- master route version;
- last verified date;
- activity type;
- difficulty;
- surface/technical notes;
- safety warnings;
- public vs customer/guide-only classification;
- verification state for each external navigation platform.

A master GPX change should invalidate external-platform verification until those copies are rechecked.
