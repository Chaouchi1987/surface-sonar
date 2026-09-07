# GeoAnomaly Pro — roadmap

## In progress
- Align frontend with the verified FastAPI contract (types, store, services, UI).
- Attach backend-issued bearer token to every API call.

## Requested (frontend repair)
- RightPanel: guard processing time with `typeof === "number"` (no store field invented).
- types.ts: LayerDescriptor supports vector (count) AND raster (tile_url, opacity, min, max, resolution_m, statistics).
- analysis-store: raster layers available from a real tile_url; keep vector count behaviour.
- MapCanvas: render backend raster layers via TileLayer using the real tile_url and store opacity.
- LayerControl: change only if TypeScript requires it.
- Run typecheck/build; report changed files and validation result.
