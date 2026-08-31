export const coastalExplorer = {
  id: 'coastal-explorer',
  title: 'Coastal Explorer',
  subtitle: 'Explore the wildest part of the Wild Coast',
  version: '2026.1',
  status: 'prototype',
  activity: 'road-cycling',
  masterRoute: {
    format: 'gpx',
    source: 'Tossa Cycling approved master GPX',
    url: 'routes/coastal-explorer/coastal-explorer.gpx'
  },
  stats: {
    distanceKm: '63.6',
    elevationM: '~1,454 m',
    duration: '4–6 h depending on stops',
    difficulty: 'Challenging'
  },
  positioning: {
    label: 'Best explored by bike',
    statement: 'A bike or e-bike is the most comfortable and complete way to explore this wild stretch of the Costa Brava: coves, viewpoints and coastal settlements are public, but car access and parking are often restricted or impractical.',
    bucketList: 'Ride it, explore it, and cross the Wild Coast off the bucket list.'
  },
  map: {
    // demotiles caps out at zoom 6, so every chapter camera here rendered an empty map.
    // OpenFreeMap needs no API key and carries full detail at the zooms this story uses.
    styleUrl: import.meta.env.VITE_MAP_STYLE_URL || 'https://tiles.openfreemap.org/styles/liberty',
    routeColor: '#f4623a',
    terrain: {
      tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
      encoding: 'terrarium',
      tileSize: 256,
      maxzoom: 12,
      exaggeration: 1.2,
      attribution: '<a href="https://registry.opendata.aws/terrain-tiles/">Terrain Tiles</a>'
    },
    initialView: { center: [2.982, 41.754], zoom: 10.8, pitch: 42, bearing: -18 }
  },
  chapters: [
    { id: 'center-of-the-universe', eyebrow: 'Start · km 0', title: 'Tossa Cycling — Center of the Universe', body: 'This is where the ride starts and where it ends. More importantly, it is the gateway to what we think is the best way to discover the wildest part of the Wild Coast: by bike. No parking hunt, no watching the coves only from the road above — ride down, stop, explore, swim, eat, climb back up and continue.', routeKm: 0, point: [2.9324079, 41.7235179], camera: { center: [2.9324079, 41.7235179], zoom: 15.2, pitch: 48, bearing: 10 } },
    { id: 'tossa-from-above', eyebrow: 'Viewpoint · km 1.4', title: 'Tossa from Above', body: 'The first scenic payoff arrives almost immediately. From this mirador, the cove of Tossa de Mar opens below — sea, cliffs and town framed by the Mediterranean landscape.', routeKm: 1.44, point: [2.942273, 41.726259], camera: { center: [2.942273, 41.726259], zoom: 14.7, pitch: 55, bearing: 70 } },
    { id: 'cala-pola', eyebrow: 'Cove · km 4.9', title: 'Cala Pola', body: 'Crystal-clear water, rocky cliffs and dense Mediterranean pines make Cala Pola one of the route’s defining coastal scenes. It is the moment where the ride stops feeling like a road loop and starts feeling unmistakably Costa Brava.', routeKm: 4.87, point: [2.951179, 41.733044], camera: { center: [2.951179, 41.733044], zoom: 14.5, pitch: 52, bearing: 80 } },
    { id: 'giverola-from-above', eyebrow: 'Local insider · km 7.8', title: 'Giverola from Above', body: 'A less-obvious clifftop viewpoint gives a dramatic perspective over Cala Giverola and the rugged coastline. Leave the bikes by the fence and approach only on foot. The cliffs are exposed with dangerous drops on both sides — stay well back from the edge and avoid the rocks in wet or windy conditions.', routeKm: 7.78, point: [2.956682360008107, 41.73668879499681], safety: 'High cliff exposure on both sides. Bikes stay by the fence; approach on foot only.', camera: { center: [2.956682360008107, 41.73668879499681], zoom: 15.0, pitch: 60, bearing: 100 } },
    { id: 'rosamar', eyebrow: 'Explore · km 16.2', title: 'Rosamar — Ride to the Water', body: 'Rosamar is more than a single viewpoint. Punta dels Canyerets, rocky Cala Canyet and sandy Platja dels Canyerets form a compact coastal micro-destination where you can stop, walk to the sea, explore the narrow path and take a proper break.', routeKm: 16.22, point: [2.9829983, 41.7600503], subpoints: [ { name: 'Cala Canyet', point: [2.9808619, 41.7595574], note: 'Rocky cove with a narrow scenic path ending at a small bridge over the sea.' }, { name: 'Platja dels Canyerets', point: [2.9836067, 41.7606285], note: 'Sandy beach and an easy cyclist stop beside the cliff wall.' } ], camera: { center: [2.9821, 41.7600], zoom: 14.3, pitch: 48, bearing: 85 } },
    { id: 'sant-feliu', eyebrow: 'Town & history · km 26–30', title: 'Sant Feliu — From Coast to History', body: 'After kilometres of cliffs and coves, the route changes character in Sant Feliu de Guíxols. Slow down through the historic centre and La Rambla, then reach Punta de l’Espigó at the exposed end of the port wall — the natural sea-facing turnaround point.', routeKm: 25.94, point: [3.029206, 41.7817301], subpoints: [ { name: 'Punta de l’Espigó', point: [3.0330688, 41.7769279], routeKm: 27.34, note: 'Exposed endpoint of the port wall and natural turnaround marker.' } ], camera: { center: [3.0292, 41.7811], zoom: 14.1, pitch: 35, bearing: 15 } },
    { id: 'sant-elm', eyebrow: 'Costa Brava story · km 30.2', title: 'Where the Costa Brava Gets Its Name', body: 'Ermita de Sant Elm is traditionally associated with Ferran Agulló’s naming of the Costa Brava — the “Wild Coast”. From here the rugged stretch toward Tossa explains the name perfectly. Today the Costa Brava runs from Blanes to the French border, but this landscape is central to its origin story.', routeKm: 30.18, point: [3.027348, 41.7746362], camera: { center: [3.027348, 41.7746362], zoom: 13.4, pitch: 58, bearing: 225 } },
    { id: 'sant-grau-choice', eyebrow: 'Optional challenge · junction km 41.7 · summit stop km 46.7', title: 'Your Choice: Climb to Sant Grau', body: 'At this junction the ride becomes yours. Continue the main coastal experience or add the climb to Sant Grau d’Ardenya: smooth asphalt, almost Alpine turns, very little traffic and changing mountain views. The destination sits deep in the cork forest, where a historic sanctuary and an ultra-authentic rustic stop connect the ride with centuries of Tossa tradition.', routeKm: 41.75, decisionPoint: [2.96697, 41.75096], point: [2.9488089, 41.7595693], destinationRouteKm: 46.67, subpoints: [ { name: 'Cork forest', note: 'Cork oak bark is traditionally harvested for bottle corks; its thick bark also gives the trees strong protection against Mediterranean fire.' }, { name: 'Puig de les Cadiretes', note: 'Nearby 519 m summit: highest point of the Ardenya/Cadiretes massif and a Catalan 100 Cims objective.' } ], camera: { center: [2.9488089, 41.7595693], zoom: 13.5, pitch: 58, bearing: -45 } },
    { id: 'cala-salions', eyebrow: 'Slow down · km 54.4', title: 'Cala Salions — Time to Decide', body: 'Far enough from Tossa to feel like a real escape, Cala Salions is where you decide how you want to spend the next part of the day: keep riding, stop for food, take a swim, or simply sit by the water. Restricted visitor car access and a locally run restaurant make it especially comfortable for cyclists.', routeKm: 54.42, point: [2.9662898, 41.7479095], camera: { center: [2.9662898, 41.7479095], zoom: 14.6, pitch: 50, bearing: 125 } },
    { id: 'back-to-center', eyebrow: 'Finish · km 63.6', title: 'Back to the Center of the Universe', body: 'Cliffs, coves, old streets, cork forest and the coast that inspired the name Costa Brava — then every good loop brings you back to Tossa Cycling. Ride complete. Wild Coast: crossed off the bucket list.', routeKm: 63.59, point: [2.9324079, 41.7235179], camera: { center: [2.9324079, 41.7235179], zoom: 15.2, pitch: 46, bearing: 190 } }
  ],
  navigation: {
    strava: 'https://www.strava.com/routes/3335317134226590564',
    komoot: null,
    rideWithGps: null,
    wikiloc: null,
    googleMaps: null,
    gpx: 'download'
  }
};
