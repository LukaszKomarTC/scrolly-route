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

## Previewing the prototype

The cinematic behaviour has to be judged on a real connection: the basemap, terrain and
web fonts are all external, and how the route reads against the map is the open question.

**On your own machine** — fastest, and the network URL lets you open it on a phone on the
same Wi-Fi, which is where the mobile layout matters:

```bash
npm install
npm run dev -- --host
```

**As a hosted preview** — the `Preview` workflow publishes the built prototype to GitHub
Pages. Run it from the Actions tab and choose any branch, or let it publish on push to
`main`. It uses only the workflow's own token: no secrets, no external host, nothing
pointed at production. One-time repository setup: **Settings → Pages → Source → GitHub
Actions**.

The published URL is `https://<owner>.github.io/<repo>/`. The app reads `VITE_BASE_PATH`
so it works from a subpath as well as the domain root; route assets resolve against the
document base rather than `/`, which is also what a later mount under an existing site
will need.

To try a different basemap without touching the code, copy `.env.example` to `.env` and
set `VITE_MAP_STYLE_URL`.

## Project status

Foundation/bootstrap in progress.

## License

MIT
