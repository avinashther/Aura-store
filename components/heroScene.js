// The 3D scene for the hero word. This file is loaded ON DEMAND (see Hero.jsx), so the
// 3D library (three.js) is a separate download that never slows the first paint.
//
// What it builds: the four AURA letters, extruded from the very same outlines as the
// flat logo, with rounded (bevelled) edges, lit by real lights:
//   - a KEY light from the upper left  → the lit side is bright
//   - a soft FILL light from all around → the shaded side is darker but never black
//   - a RIM light from behind on the right → the back and edges glow softly
// Because it's real lighting, the shading follows the letters as they spin.

import {
  Color,
  DirectionalLight,
  ExtrudeGeometry,
  Group,
  HemisphereLight,
  MathUtils,
  Mesh,
  MeshPhysicalMaterial,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";
import { SVGLoader } from "three/addons/loaders/SVGLoader.js";

const FOV = 18; // narrow field of view = gentle perspective, like a product shot
const DEPTH = 170; // how thick the letters are (in the artwork's own units; letters are 880 tall)
const BEVEL = 15; //  how rounded the edges are
const BASE = new Color("#3c572b"); // the logo green (same as --green)
const PAPER = new Color("#f4f3ee"); // letters fade in from this colour (same as --paper)

export function createScene(canvas, letters) {
  // This throws if the device has no WebGL; Hero.jsx then keeps the flat logo.
  const renderer = new WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); // 2x is plenty, 3x just wastes battery
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const camera = new PerspectiveCamera(FOV, 1, 1, 10000);

  // ---- lights ------------------------------------------------------------
  const key = new DirectionalLight(0xfff3df, 2.6);
  key.position.set(-1500, 1000, 1300);
  const fill = new HemisphereLight(0xe9f2df, 0x3f5a31, 1.5);
  const rim = new DirectionalLight(0xc4e7a6, 1.9);
  rim.position.set(1400, 500, -1300);
  scene.add(key, fill, rim);

  const keyI = key.intensity, fillI = fill.intensity, rimI = rim.intensity;

  // ---- the letters ---------------------------------------------------------
  const material = new MeshPhysicalMaterial({
    color: BASE.clone(),
    roughness: 0.42,
    metalness: 0,
    clearcoat: 0.5, // a thin glossy layer, so highlights slide across as it turns
    clearcoatRoughness: 0.32,
    emissive: BASE,
    emissiveIntensity: 0,
  });

  const x0 = letters[0].x;
  const last = letters[letters.length - 1];
  const centreX = (x0 + last.x + last.w) / 2;

  const pivot = new Group(); //  moves, scales and spins the whole word
  const flip = new Group(); //   SVG's y axis points down, 3D's points up
  flip.scale.y = -1;
  pivot.add(flip);
  scene.add(pivot);

  const loader = new SVGLoader();
  const geometries = [];
  const meshes = letters.map((letter) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg"><path d="${letter.d}"/></svg>`;
    const shapes = loader.parse(svg).paths.flatMap((p) => SVGLoader.createShapes(p));
    const geometry = new ExtrudeGeometry(shapes, {
      depth: DEPTH,
      bevelEnabled: true,
      bevelThickness: BEVEL,
      bevelSize: BEVEL * 0.8,
      bevelSegments: 4,
      curveSegments: 14,
    });
    geometry.translate(-centreX, -440, -DEPTH / 2); // centre the word on the origin
    geometries.push(geometry);
    const mesh = new Mesh(geometry, material);
    flip.add(mesh);
    return mesh;
  });

  // ---- public controls -------------------------------------------------------
  let width = 1, height = 1;

  function resize(w, h) {
    width = w; height = h;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.z = h / 2 / Math.tan(MathUtils.degToRad(FOV / 2)); // 1 unit = 1 screen pixel at z = 0
    camera.far = camera.position.z + 4000;
    camera.updateProjectionMatrix();
  }

  /* x, y   = where the middle of the word is on screen, in pixels
     unit   = screen pixels per artwork unit (so the word has the right size)
     rotX/Y = tilt + spin in radians
     time   = seconds, for the little floating motion
     calm   = 0…1, how much floating/tilt to keep (fades out as it docks)
     flat   = 0…1, at 1 the lights fade out and it shows the exact flat logo green
     intro  = 0…1, entrance: letters fade in from the paper colour */
  function update({ x, y, unit, rotX, rotY, time, calm, flat, intro }) {
    pivot.position.set(x - width / 2, -(y - height / 2), 0);
    pivot.scale.setScalar(unit);
    pivot.rotation.set(rotX, rotY, 0);

    meshes.forEach((m, i) => {
      // each letter floats up and forward a little, one after the other
      const bob = (1 - Math.cos(((time - i * 0.3) / 5.5) * Math.PI * 2)) / 2;
      m.position.y = -bob * 18 * calm; // minus: this group is flipped
      m.position.z = bob * 44 * calm;
    });

    material.color.copy(PAPER).lerp(BASE, intro);
    key.intensity = keyI * (1 - flat);
    fill.intensity = fillI * (1 - flat);
    rim.intensity = rimI * (1 - flat);
    material.emissiveIntensity = flat;
  }

  const render = () => renderer.render(scene, camera);

  function dispose() {
    geometries.forEach((g) => g.dispose());
    material.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
  }

  return { resize, update, render, dispose };
}
