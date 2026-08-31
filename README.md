# scrolly-route

A reusable open-source engine for cinematic, scroll-driven route storytelling.

The project combines GPX/GeoJSON route data, interactive terrain maps and narrative chapters to create premium cycling, hiking and travel route presentations that remain fast, accessible and useful on mobile.

## First reference implementation

**Tossa Highlights — Costa Brava, Spain**

The first technical prototype will prove the core experience before any WordPress production integration:

- route rendered from GPX/GeoJSON data;
- progressive route drawing tied to scroll position;
- camera movement between narrative chapters;
- optional terrain/pitch transitions;
- image and text chapters;
- responsive desktop/mobile behavior;
- `prefers-reduced-motion` fallback;
- normal HTML content remains usable if JavaScript or the map fails;
- lightweight build and CI suitable for a public repository.

## Architecture direction

```text
scrolly-route/
├── src/                 # reusable engine
├── public/routes/       # public route datasets/assets
├── demo/                # reference implementations
├── docs/                # architecture and integration notes
└── .github/workflows/   # lightweight CI
```

The engine must remain generic. Tossa Cycling is the first real-world implementation, not a hard-coded dependency.

## Planned stack

- MapLibre GL JS for interactive maps
- GSAP + ScrollTrigger for scroll synchronization
- Vite for development/build tooling
- GPX → GeoJSON conversion during route preparation

No production credentials, private customer data, private route inventory, VPS details or private AI Growth code belong in this repository.

## Project status

Foundation/bootstrap in progress.

## License

MIT
