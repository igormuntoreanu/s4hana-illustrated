# Assets and licences

The 3D village does not download any model, texture, HDRI or animation file.
Every mesh is built procedurally from three.js primitives when the page loads. That covers buildings, props, vehicles, trees, characters, the terrain, the river and the bridge.
Materials use vertex colours only.
Nothing third-party ships as an art asset, so no CC0 attribution list is needed for the scene.

## 3D scene (procedural, made for this project)

| Asset | Source | Licence |
| --- | --- | --- |
| Ten building shells (drafting studio, counting house, guild hall, trading post, shop, warehouse, workshop, yard, repair shop, construction site) | `src/components/village3d/buildings.ts`, procedural geometry | Project code (same licence as this repository) |
| Props: desks, crates, carts, conveyor, scaffold, crane, noticeboard, market stalls and more | `src/components/village3d/props.ts`, procedural geometry | Project code |
| Vehicles: coin cart, forklift, truck, van, wagon, handcart | `src/components/village3d/props.ts`, procedural geometry | Project code |
| Characters and their animations (walk, carry, idle, work, talk, point, cheer and more) | `src/components/village3d/characters.tsx`, instanced primitives with procedural poses | Project code |
| Terrain, river shader, roads, bridge, trees, bushes, rocks | `src/components/village3d/terrain.ts`, procedural geometry and GLSL | Project code |
| Stamp banners, flags, confetti, chimney smoke, route highlight | `src/components/village3d/props.ts`, `scene.tsx` | Project code |
| Paper grain overlay | Inline SVG `feTurbulence` noise in `src/styles.css` | Project code |

## Libraries

| Package | Use | Licence |
| --- | --- | --- |
| [three](https://github.com/mrdoob/three.js) 0.182 | WebGL renderer, geometry | MIT |
| [@react-three/fiber](https://github.com/pmndrs/react-three-fiber) | React renderer for three.js | MIT |
| [@react-three/drei](https://github.com/pmndrs/drei) | `Outlines`, `PerformanceMonitor` | MIT |

## Fonts (unchanged)

| Font | Source | Licence |
| --- | --- | --- |
| Fraunces | Google Fonts | SIL Open Font License 1.1 |
| Nunito Sans | Google Fonts | SIL Open Font License 1.1 |

## Existing illustrations (unchanged)

The watercolour interiors, the 2D village and city maps, the 2D building art and the apple trees in `public/art/` were made for this project before the 3D remake.
They are still used for the interiors, the City view and the 2D fallback.
