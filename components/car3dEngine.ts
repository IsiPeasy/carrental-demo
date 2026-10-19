// three.js engine for Car3D (loaded lazily by components/Car3D.tsx so three
// never lands in the initial bundle). Not used directly by themes.

import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';
import { TessellateModifier } from 'three/examples/jsm/modifiers/TessellateModifier.js';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { BodyType } from '@/lib/data';
import type { CameraPreset, Car3DProps } from './Car3D';
import { PROFILES, bodyOutline, glassOutline, type Pt } from './carProfiles';

const CAMERA_PRESETS: Record<CameraPreset, { pos: [number, number, number]; target: [number, number, number]; fov: number }> = {
  hero: { pos: [5.6, 1.7, 6.4], target: [0, 0.55, 0], fov: 30 },
  turntable: { pos: [0.01, 1.9, 9.2], target: [0, 0.55, 0], fov: 28 },
  low: { pos: [4.6, 0.55, 5.4], target: [0, 0.6, 0], fov: 34 },
  side: { pos: [0.01, 0.9, 9.6], target: [0, 0.65, 0], fov: 28 },
  top: { pos: [5.5, 4.6, 5.5], target: [0, 0.4, 0], fov: 30 },
  front: { pos: [7.4, 1.3, 0.01], target: [0, 0.6, 0], fov: 30 },
};

function shapeFrom(pts: Pt[]): THREE.Shape {
  const s = new THREE.Shape();
  pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)));
  s.closePath();
  return s;
}

function radialFadeTexture(color: string, inner = 0.0, outer = 1): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d')!;
  const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  const col = new THREE.Color(color);
  const rgb = `${Math.round(col.r * 255)},${Math.round(col.g * 255)},${Math.round(col.b * 255)}`;
  grd.addColorStop(0, `rgba(${rgb},${inner})`);
  grd.addColorStop(0.55, `rgba(${rgb},${(inner + outer) / 2})`);
  grd.addColorStop(1, `rgba(${rgb},${outer})`);
  g.fillStyle = grd;
  g.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function checkerTexture(a: string, b: string): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  for (let i = 0; i < 2; i++)
    for (let j = 0; j < 2; j++) {
      g.fillStyle = (i + j) % 2 ? b : a;
      g.fillRect(i * 64, j * 64, 64, 64);
    }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(14, 14);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function coneTexture(color: string): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 4;
  c.height = 256;
  const g = c.getContext('2d')!;
  const col = new THREE.Color(color);
  const rgb = `${Math.round(col.r * 255)},${Math.round(col.g * 255)},${Math.round(col.b * 255)}`;
  const grd = g.createLinearGradient(0, 0, 0, 256);
  grd.addColorStop(0, `rgba(${rgb},0.55)`);
  grd.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = grd;
  g.fillRect(0, 0, 4, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/**
 * Turns the straight side extrusion into a car-like plan: the body narrows
 * towards nose and tail (`endScale` at the extremes) and leans inwards towards
 * the top (`tumble` = fraction lost at the highest point).
 */
function planFactor(x: number, y: number, p: { length: number; height: number }, endScale: number, tumble: number) {
  const u = Math.min(1, Math.max(0, x / p.length)) * 2 - 1; // -1 tail … 1 nose
  const ends = 1 - (1 - endScale) * Math.pow(Math.abs(u), 3);
  const v = Math.min(1, Math.max(0, (y - 0.35) / (p.height - 0.35)));
  return ends * (1 - tumble * v * v);
}

function shapePlan(
  src: THREE.BufferGeometry,
  p: { length: number; height: number },
  endScale: number,
  tumble: number,
): THREE.BufferGeometry {
  // the flat caps are a few huge triangles: subdivide first so bending them stays smooth
  let geo = new TessellateModifier(0.14, 7).modify(src);
  src.dispose();
  geo.deleteAttribute('normal');
  geo.deleteAttribute('uv');
  geo = mergeVertices(geo, 1e-4);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    pos.setZ(i, pos.getZ(i) * planFactor(pos.getX(i), pos.getY(i), p, endScale, tumble));
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

/** Build the car group (centred at origin, wheels on y = 0). */
function buildCar(bodyType: BodyType, paint: THREE.Color, accent: string, wireframe: boolean, wireColor: string) {
  const p = PROFILES[bodyType];
  const group = new THREE.Group();
  const bevel = 0.09;
  const depth = p.width - bevel * 2 - 0.08;

  const paintMat = new THREE.MeshPhysicalMaterial({
    color: paint,
    metalness: 0.55,
    roughness: 0.32,
    clearcoat: 1,
    clearcoatRoughness: 0.06,
  });
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x0a0d12,
    metalness: 0.3,
    roughness: 0.05,
    clearcoat: 1,
    clearcoatRoughness: 0.02,
    transparent: true,
    opacity: 0.94,
  });
  const tyreMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.85 });
  const rimMat = new THREE.MeshStandardMaterial({ color: 0x8a8d91, metalness: 0.9, roughness: 0.28 });
  const caliperMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(accent), roughness: 0.4, metalness: 0.2 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x0b0b0b, roughness: 0.6 });
  const headMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff4dc, emissiveIntensity: 2.2 });
  const tailMat = new THREE.MeshStandardMaterial({ color: 0x550000, emissive: 0xff1a1a, emissiveIntensity: 1.6 });

  let bodyGeo: THREE.BufferGeometry = new THREE.ExtrudeGeometry(shapeFrom(bodyOutline(p)), {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel + 0.04,
    bevelSize: bevel,
    bevelSegments: 5,
    curveSegments: 6,
  });
  bodyGeo.translate(0, 0, -depth / 2);
  bodyGeo = shapePlan(bodyGeo, p, 0.8, 0.14);
  const body = new THREE.Mesh(bodyGeo, paintMat);
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // glass cabin: narrower (tumblehome), heavily bevelled for a rounded roof
  const gDepth = depth * 0.74;
  let glassGeo: THREE.BufferGeometry = new THREE.ExtrudeGeometry(shapeFrom(glassOutline(p)), {
    depth: gDepth,
    bevelEnabled: true,
    bevelThickness: 0.16,
    bevelSize: 0.05,
    bevelSegments: 6,
    curveSegments: 6,
  });
  glassGeo.translate(0, -0.04, -gDepth / 2);
  glassGeo = shapePlan(glassGeo, p, 0.9, 0.3);
  const glass = new THREE.Mesh(glassGeo, glassMat);
  glass.castShadow = true;
  group.add(glass);

  // under-tray (hides the extrusion underside)
  const tray = new THREE.Mesh(new THREE.BoxGeometry(p.length * 0.92, 0.04, p.width * 0.9), darkMat);
  tray.position.set(p.length / 2, p.bottom + 0.02, 0);
  group.add(tray);

  // sills, splitter, diffuser: dark trim that gives the slab some definition
  const trimMat = new THREE.MeshStandardMaterial({ color: 0x101010, roughness: 0.45, metalness: 0.3 });
  const sillLen = p.wheelX[1] - p.wheelX[0] - (p.wheelR + 0.1) * 2;
  for (const side of [-1, 1]) {
    const sill = new THREE.Mesh(new THREE.BoxGeometry(sillLen, 0.09, 0.05), trimMat);
    sill.position.set((p.wheelX[0] + p.wheelX[1]) / 2, p.bottom + 0.07, side * (p.width / 2 + 0.005));
    group.add(sill);
  }
  const splitter = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.05, p.width * 0.8), trimMat);
  splitter.position.set(p.length - 0.22, p.bottom + 0.03, 0);
  group.add(splitter);
  const diffuser = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.12, p.width * 0.7), trimMat);
  diffuser.position.set(0.2, p.bottom + 0.07, 0);
  group.add(diffuser);

  // lights
  const lightW = p.width * 0.32;
  for (const side of [-1, 1]) {
    const h = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.05, lightW), headMat);
    const hf = planFactor(p.head[0], p.head[1], p, 0.8, 0.14);
    h.position.set(p.head[0] + 0.05, p.head[1], side * (p.width / 2 - lightW / 2 - 0.1) * hf);
    h.scale.z = hf;
    group.add(h);
    const tl = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.05, lightW), tailMat);
    const tf = planFactor(p.tail[0], p.tail[1], p, 0.8, 0.14);
    tl.position.set(p.tail[0] - 0.02, p.tail[1], side * (p.width / 2 - lightW / 2 - 0.1) * tf);
    tl.scale.z = tf;
    group.add(tl);
  }

  // wheels
  const wheels: THREE.Group[] = [];
  const tyreW = 0.27;
  const tyreGeo = new THREE.CylinderGeometry(p.wheelR, p.wheelR, tyreW, 40, 1);
  tyreGeo.rotateX(Math.PI / 2);
  const rimGeo = new THREE.CylinderGeometry(p.wheelR * 0.7, p.wheelR * 0.7, tyreW + 0.012, 32, 1);
  rimGeo.rotateX(Math.PI / 2);
  const spokeGeo = new THREE.BoxGeometry(p.wheelR * 1.25, 0.05, 0.03);
  const caliperGeo = new THREE.BoxGeometry(0.16, p.wheelR * 0.55, 0.06);
  for (const wx of p.wheelX) {
    for (const side of [-1, 1]) {
      const w = new THREE.Group();
      const tyre = new THREE.Mesh(tyreGeo, tyreMat);
      tyre.castShadow = true;
      w.add(tyre);
      w.add(new THREE.Mesh(rimGeo, rimMat));
      for (let k = 0; k < 5; k++) {
        const s = new THREE.Mesh(spokeGeo, rimMat);
        s.rotation.z = (k * Math.PI) / 5;
        s.position.z = side * (tyreW / 2 + 0.008);
        w.add(s);
      }
      const cal = new THREE.Mesh(caliperGeo, caliperMat);
      cal.position.set(p.wheelR * 0.38, p.wheelR * 0.15, side * (tyreW / 2 - 0.05));
      w.position.set(wx, p.wheelR, side * (p.width / 2 - tyreW / 2 - 0.02));
      w.add(cal);
      group.add(w);
      wheels.push(w);
    }
  }

  let edges: THREE.LineSegments[] = [];
  if (wireframe) {
    const lineMat = new THREE.LineBasicMaterial({ color: new THREE.Color(wireColor), transparent: true, opacity: 0.9 });
    paintMat.transparent = true;
    paintMat.opacity = 0.08;
    paintMat.depthWrite = false;
    glassMat.opacity = 0.1;
    edges = [body, glass].map((m) => {
      const l = new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry, 18), lineMat);
      group.add(l);
      return l;
    });
  }

  group.position.x = -p.length / 2;
  const root = new THREE.Group();
  root.add(group);
  return { root, paintMat, caliperMat, wheels, edges };
}

function disposeObject(obj: THREE.Object3D) {
  obj.traverse((o) => {
    const m = o as THREE.Mesh;
    m.geometry?.dispose?.();
    const mat = m.material as THREE.Material | THREE.Material[] | undefined;
    const mats = Array.isArray(mat) ? mat : mat ? [mat] : [];
    for (const x of mats) {
      for (const v of Object.values(x)) if (v instanceof THREE.Texture) v.dispose();
      x.dispose();
    }
  });
}

export interface EngineHandle {
  setCar: (b: BodyType, wire: boolean) => void;
  setStage: () => void;
  dispose: () => void;
}

/** Mounts the renderer in `host`. Reads live props from `propsRef` every frame. */
export function mountCar3D(
  host: HTMLElement,
  propsRef: { current: Car3DProps },
  onFirstFrame: () => void,
): EngineHandle | null {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch {
    return null;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:pan-y';
  renderer.domElement.setAttribute('aria-hidden', 'true');
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const envTex = pmrem.fromScene(room, 0.04).texture;
  scene.environment = envTex;

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  const camPos = new THREE.Vector3(...CAMERA_PRESETS.hero.pos);
  const camTarget = new THREE.Vector3(...CAMERA_PRESETS.hero.target);
  camera.position.copy(camPos);

  // lights
  const hemi = new THREE.HemisphereLight(0xffffff, 0x222222, 0.35);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -4;
  key.shadow.camera.right = 4;
  key.shadow.camera.top = 4;
  key.shadow.camera.bottom = -4;
  key.shadow.bias = -0.0005;
  key.shadow.radius = 6;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffffff, 1.4);
  scene.add(rim);
  const spot = new THREE.SpotLight(0xffffff, 0, 18, Math.PI / 7, 0.55, 1.2);
  spot.position.set(0, 9, 0.5);
  spot.castShadow = true;
  spot.shadow.mapSize.set(1024, 1024);
  scene.add(spot);
  scene.add(spot.target);

  // cone (visible beam)
  const coneGeo = new THREE.ConeGeometry(3.3, 9, 48, 1, true);
  coneGeo.translate(0, -4.5, 0);
  const coneMat = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
  const cone = new THREE.Mesh(coneGeo, coneMat);
  cone.position.set(0, 9, 0.5);
  cone.visible = false;
  scene.add(cone);

  // car
  const turntable = new THREE.Group();
  scene.add(turntable);
  let car: ReturnType<typeof buildCar> | null = null;
  let carKey = '';
  const paintColor = new THREE.Color(propsRef.current.paint);
  const paintTarget = new THREE.Color(propsRef.current.paint);
  const setCar = (b: BodyType, wire: boolean) => {
    const pr0 = propsRef.current;
    const k = `${b}|${wire}|${pr0.wireColor ?? ''}`;
    if (k === carKey) return;
    carKey = k;
    if (car) {
      turntable.remove(car.root);
      disposeObject(car.root);
    }
    const pr = propsRef.current;
    car = buildCar(b, paintColor, pr.accent ?? '#b8b8b8', wire, pr.wireColor ?? pr.accent ?? '#ffffff');
    turntable.add(car.root);
  };

  // stage: background, fog, floor
  let stage: THREE.Object3D[] = [];
  let stageKey = '';
  const setStage = () => {
    const p0 = propsRef.current;
    const k = `${p0.floor}|${p0.background}|${p0.floorColors?.join(',')}`;
    if (k === stageKey) return;
    stageKey = k;
    for (const o of stage) {
      scene.remove(o);
      disposeObject(o);
      if (o instanceof Reflector) o.dispose();
    }
    stage = [];
    const pr = propsRef.current;
    const bg = pr.background ?? 'transparent';
    const transparent = bg === 'transparent';
    const bgColor = new THREE.Color(transparent ? '#000000' : bg);
    scene.background = transparent ? null : bgColor;
    scene.fog = transparent ? null : new THREE.Fog(bgColor, 12, 30);
    renderer.setClearColor(bgColor, transparent ? 0 : 1);
    const fadeColor = transparent ? '#000000' : bg;
    const kind = pr.floor ?? 'none';
    const [ca, cb] = pr.floorColors ?? ['#222222', '#444444'];

    // soft contact shadow always
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 30),
      new THREE.ShadowMaterial({ opacity: kind === 'none' ? 0.35 : 0.5 }),
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = 0.003;
    shadowPlane.receiveShadow = true;
    stage.push(shadowPlane);

    if (kind === 'reflective') {
      const mirror = new Reflector(new THREE.CircleGeometry(16, 64), {
        clipBias: 0.003,
        textureWidth: 1024,
        textureHeight: 1024,
        color: 0x8a8a8a,
      });
      mirror.rotation.x = -Math.PI / 2;
      stage.push(mirror);
      const veil = new THREE.Mesh(
        new THREE.CircleGeometry(16, 64),
        new THREE.MeshBasicMaterial({
          map: radialFadeTexture(fadeColor, transparent ? 0.6 : 0.55, 1),
          transparent: true,
          depthWrite: false,
        }),
      );
      veil.rotation.x = -Math.PI / 2;
      veil.position.y = 0.002;
      stage.push(veil);
    } else if (kind === 'grid') {
      const grid = new THREE.GridHelper(30, 60, new THREE.Color(cb), new THREE.Color(ca));
      (grid.material as THREE.Material).transparent = true;
      (grid.material as THREE.Material).opacity = 0.7;
      stage.push(grid);
    } else if (kind === 'checker') {
      const checker = new THREE.Mesh(
        new THREE.CircleGeometry(16, 64),
        new THREE.MeshStandardMaterial({ map: checkerTexture(ca, cb), roughness: 0.75, metalness: 0 }),
      );
      checker.rotation.x = -Math.PI / 2;
      checker.receiveShadow = true;
      stage.push(checker);
      if (!transparent) {
        const veil = new THREE.Mesh(
          new THREE.CircleGeometry(16.01, 64),
          new THREE.MeshBasicMaterial({ map: radialFadeTexture(fadeColor, 0, 1), transparent: true, depthWrite: false }),
        );
        veil.rotation.x = -Math.PI / 2;
        veil.position.y = 0.004;
        stage.push(veil);
      }
    }
    for (const o of stage) scene.add(o);
  };

  setCar(propsRef.current.bodyType, !!propsRef.current.wireframe);
  setStage();

  // size
  const resize = () => {
    const w = host.clientWidth || 1;
    const h = host.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // keep the car framed on portrait screens
    const preset = CAMERA_PRESETS[propsRef.current.cameraPreset ?? 'hero'];
    camera.fov = camera.aspect < 1 ? preset.fov / Math.max(camera.aspect, 0.55) : preset.fov;
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(host);
  resize();

  // visibility
  let visible = true;
  const io = new IntersectionObserver((e) => (visible = e[0]?.isIntersecting ?? true), { threshold: 0.01 });
  io.observe(host);

  // drag rotate
  let dragging = false;
  let lastX = 0;
  let dragVel = 0;
  let userYaw = 0;
  const onDown = (e: PointerEvent) => {
    if (!propsRef.current.interactive) return;
    dragging = true;
    lastX = e.clientX;
    renderer.domElement.setPointerCapture(e.pointerId);
  };
  const onMove = (e: PointerEvent) => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    lastX = e.clientX;
    dragVel = dx * 0.01;
    userYaw += dragVel;
  };
  const onUp = () => (dragging = false);
  renderer.domElement.addEventListener('pointerdown', onDown);
  renderer.domElement.addEventListener('pointermove', onMove);
  renderer.domElement.addEventListener('pointerup', onUp);
  renderer.domElement.addEventListener('pointercancel', onUp);

  // loop
  const clock = new THREE.Clock();
  const start = performance.now();
  let raf = 0;
  let first = true;
  let cycleIdx = -1;
  const tmpV = new THREE.Vector3();
  const tick = () => {
    raf = requestAnimationFrame(tick);
    const dt = Math.min(clock.getDelta(), 0.05);
    if (!visible || document.hidden) return;
    const pr = propsRef.current;
    const t = (performance.now() - start) / 1000;

    // paint (cycle or prop), smooth transition
    if (pr.paintCycle?.length) {
      const ms = pr.paintCycleMs ?? 7000;
      const idx = Math.floor((t * 1000) / ms) % pr.paintCycle.length;
      if (idx !== cycleIdx) {
        cycleIdx = idx;
        paintTarget.set(pr.paintCycle[idx]);
      }
    } else {
      paintTarget.set(pr.paint);
    }
    paintColor.lerp(paintTarget, 1 - Math.exp(-dt * 3));
    if (car) {
      car.paintMat.color.copy(paintColor);
      car.caliperMat.color.set(pr.accent ?? '#b8b8b8');
    }

    // lights
    const k = pr.keyLight ?? {};
    key.color.set(k.color ?? '#ffffff');
    key.intensity = k.intensity ?? 2.4;
    key.position.set(...(k.direction ?? [4, 6, 4]));
    const r = pr.rimLight ?? {};
    rim.color.set(r.color ?? '#ffffff');
    rim.intensity = r.intensity ?? 1.4;
    rim.position.set(...(r.direction ?? [-5, 3, -5]));
    scene.environmentIntensity = pr.envIntensity ?? 1;
    hemi.intensity = 0.35 * (pr.envIntensity ?? 1);

    // spotlight reveal
    if (pr.spotlight) {
      const reveal = Math.min(1, (t * 1000) / (pr.spotlight.revealMs ?? 2000));
      const e = 1 - Math.pow(1 - reveal, 3);
      spot.color.set(pr.spotlight.color ?? '#fff6e6');
      spot.intensity = (pr.spotlight.intensity ?? 120) * e;
      cone.visible = pr.spotlight.cone !== false;
      if (!coneMat.map) {
        coneMat.map = coneTexture(pr.spotlight.color ?? '#fff6e6');
        coneMat.needsUpdate = true;
      }
      coneMat.opacity = 0.22 * e * (0.94 + 0.06 * Math.sin(t * 2.3));
    } else {
      spot.intensity = 0;
      cone.visible = false;
    }

    // rotation
    if (!dragging) {
      dragVel *= 0.94;
      userYaw += dragVel;
    }
    if (pr.autoRotate && !dragging) userYaw += (pr.rotateSpeed ?? 0.25) * dt;
    turntable.rotation.y = userYaw;

    // camera
    const preset = CAMERA_PRESETS[pr.cameraPreset ?? 'hero'];
    tmpV.set(...preset.pos);
    if (pr.dolly) {
      const a = Math.sin(t * 0.08) * 0.32;
      const push = 1 - 0.08 * (0.5 + 0.5 * Math.sin(t * 0.11));
      const x = tmpV.x * Math.cos(a) - tmpV.z * Math.sin(a);
      const z = tmpV.x * Math.sin(a) + tmpV.z * Math.cos(a);
      tmpV.set(x * push, tmpV.y + Math.sin(t * 0.07) * 0.15, z * push);
    }
    if (first) camPos.copy(tmpV);
    camPos.lerp(tmpV, 1 - Math.exp(-dt * 2.5));
    camTarget.lerp(tmpV.set(...preset.target), 1 - Math.exp(-dt * 2.5));
    camera.position.copy(camPos);
    camera.lookAt(camTarget);

    renderer.render(scene, camera);
    if (first) {
      first = false;
      onFirstFrame();
    }
  };
  raf = requestAnimationFrame(tick);

  const dispose = () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    io.disconnect();
    renderer.domElement.removeEventListener('pointerdown', onDown);
    renderer.domElement.removeEventListener('pointermove', onMove);
    renderer.domElement.removeEventListener('pointerup', onUp);
    renderer.domElement.removeEventListener('pointercancel', onUp);
    for (const o of stage) if (o instanceof Reflector) o.dispose();
    disposeObject(scene);
    coneMat.map?.dispose();
    envTex.dispose();
    pmrem.dispose();
    room.dispose?.();
    renderer.dispose();
    renderer.forceContextLoss();
    renderer.domElement.remove();
  };
  return { setCar, setStage, dispose };
}
