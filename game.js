import * as THREE from "https://unpkg.com/three@0.164.1/build/three.module.js";

const canvas = document.querySelector("#game");
const speedEl = document.querySelector("#speed");
const bankEl = document.querySelector("#bank");
const timeEl = document.querySelector("#time");
const penaltyEl = document.querySelector("#penalty");
const runStateEl = document.querySelector("#runState");
const rankDeltaEl = document.querySelector("#rankDelta");
const needleEl = document.querySelector("#needle");
const toast = document.querySelector("#toast");
const mapBike = document.querySelector("#mapBike");
const mapCones = document.querySelector("#mapCones");
const modeButtons = [...document.querySelectorAll(".mode")];

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xaebccc);
scene.fog = new THREE.Fog(0xaebccc, 62, 210);

const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 500);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.06;

const hemi = new THREE.HemisphereLight(0xeaf3ff, 0x73806d, 2.1);
scene.add(hemi);

const sun = new THREE.DirectionalLight(0xffffff, 3.4);
sun.position.set(-32, 54, 28);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -90;
sun.shadow.camera.right = 90;
sun.shadow.camera.top = 90;
sun.shadow.camera.bottom = -90;
scene.add(sun);

const asphaltMat = new THREE.MeshStandardMaterial({ color: 0x50565c, roughness: 0.83 });
const grassMat = new THREE.MeshStandardMaterial({ color: 0x5f804f, roughness: 0.9 });
const curbRedMat = new THREE.MeshStandardMaterial({ color: 0xbd3532, roughness: 0.62 });
const curbWhiteMat = new THREE.MeshStandardMaterial({ color: 0xe8e5dc, roughness: 0.58 });
const lineMat = new THREE.MeshStandardMaterial({ color: 0xf5f2df, roughness: 0.62 });
const tireMarkMat = new THREE.MeshStandardMaterial({ color: 0x1d2227, roughness: 0.92, transparent: true, opacity: 0.52 });
const coneMat = new THREE.MeshStandardMaterial({ color: 0xf47633, roughness: 0.54 });
const redConeMat = new THREE.MeshStandardMaterial({ color: 0xe33b32, roughness: 0.54 });
const greenConeMat = new THREE.MeshStandardMaterial({ color: 0x2fbf68, roughness: 0.54 });
const coneBandMat = new THREE.MeshStandardMaterial({ color: 0xf8f3dd, roughness: 0.48 });
const yellowMat = new THREE.MeshStandardMaterial({ color: 0xf4c84e, roughness: 0.5 });
const redMat = new THREE.MeshStandardMaterial({ color: 0xd9473f, roughness: 0.48 });
const tireMat = new THREE.MeshStandardMaterial({ color: 0x111317, roughness: 0.7 });
const metalMat = new THREE.MeshStandardMaterial({ color: 0x9ea8b7, roughness: 0.36, metalness: 0.45 });
const rubberMat = new THREE.MeshStandardMaterial({ color: 0x0d0f11, roughness: 0.78 });
const rimMat = new THREE.MeshStandardMaterial({ color: 0xc8d0d8, roughness: 0.32, metalness: 0.68 });
const darkPaintMat = new THREE.MeshStandardMaterial({ color: 0x151b21, roughness: 0.44, metalness: 0.12 });
const bluePaintMat = new THREE.MeshStandardMaterial({ color: 0x1e8bc3, roughness: 0.36, metalness: 0.18 });
const smokeMat = new THREE.MeshBasicMaterial({ color: 0xd9dde0, transparent: true, opacity: 0.34, depthWrite: false });

const grass = new THREE.Mesh(new THREE.PlaneGeometry(220, 170), grassMat);
grass.rotation.x = -Math.PI / 2;
grass.position.y = -0.035;
grass.receiveShadow = true;
scene.add(grass);

function makeBox(w, h, d, mat, x, y, z) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}

function makeLine(x, z, w, d, rot = 0, mat = lineMat) {
  const line = makeBox(w, 0.035, d, mat, x, 0.035, z);
  line.rotation.y = rot;
  return line;
}

const coursePoints = [
  [-31, 17],
  [-30, 30],
  [-14, 35],
  [0, 34],
  [14, 32],
  [3, 22],
  [-22, 22],
  [-31, 9],
  [-23, -5],
  [-31, -22],
  [-18, -35],
  [-7, -29],
  [-2, -15],
  [8, 0],
  [23, 13],
  [34, 4],
  [27, -12],
  [16, -23],
  [29, -34],
  [39, -24],
  [34, -6],
  [40, 13],
  [31, 29],
  [10, 28],
  [-10, 27],
  [-31, 17],
];

const conePlan = [
  [-31, 17, "start"], [-30, 30, "left"], [-17, 34, "left"], [-2, 31, "right"], [14, 32, "right"],
  [4, 22, "right"], [-19, 22, "left"], [-30, 10, "left"], [-24, -6, "right"], [-31, -22, "left"],
  [-18, -34, "left"], [-7, -28, "right"], [-3, -15, "right"], [7, 0, "left"], [22, 13, "left"],
  [34, 4, "right"], [27, -12, "right"], [16, -23, "left"], [29, -34, "right"], [39, -24, "right"],
  [34, -6, "left"], [40, 13, "left"], [31, 29, "right"], [10, 28, "right"], [-10, 27, "left"],
];

function roadGeometry(points, width) {
  const left = [];
  const right = [];
  for (let i = 0; i < points.length; i += 1) {
    const prev = points[Math.max(0, i - 1)];
    const next = points[Math.min(points.length - 1, i + 1)];
    const dx = next[0] - prev[0];
    const dz = next[1] - prev[1];
    const len = Math.hypot(dx, dz) || 1;
    const nx = -dz / len;
    const nz = dx / len;
    left.push([points[i][0] + nx * width * 0.5, points[i][1] + nz * width * 0.5]);
    right.push([points[i][0] - nx * width * 0.5, points[i][1] - nz * width * 0.5]);
  }

  const vertices = [];
  for (let i = 0; i < points.length - 1; i += 1) {
    const a = left[i];
    const b = right[i];
    const c = left[i + 1];
    const d = right[i + 1];
    vertices.push(a[0], 0, a[1], b[0], 0, b[1], c[0], 0, c[1]);
    vertices.push(c[0], 0, c[1], b[0], 0, b[1], d[0], 0, d[1]);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geo.computeVertexNormals();
  return geo;
}

const road = new THREE.Mesh(new THREE.PlaneGeometry(104, 92), asphaltMat);
road.rotation.x = -Math.PI / 2;
road.position.y = 0;
road.receiveShadow = true;
scene.add(road);

makeLine(-31, 17, 0.34, 14, Math.PI / 2, yellowMat);
makeLine(43, 0, 0.24, 78);
makeLine(-43, 0, 0.24, 78);
makeLine(0, 39, 86, 0.24);
makeLine(0, -39, 86, 0.24);

for (let i = 0; i < coursePoints.length - 1; i += 1) {
  const [x1, z1] = coursePoints[i];
  const [x2, z2] = coursePoints[i + 1];
  const midX = (x1 + x2) / 2;
  const midZ = (z1 + z2) / 2;
  const angle = Math.atan2(x2 - x1, z2 - z1);
  const length = Math.hypot(x2 - x1, z2 - z1);
  makeLine(midX, midZ, 0.1, length, angle, new THREE.MeshStandardMaterial({ color: 0x9cc7ff, roughness: 0.7, transparent: true, opacity: 0.4 }));
  if (i % 2 === 0) {
    const arrow = makeBox(0.42, 0.04, 1.05, yellowMat, midX, 0.07, midZ);
    arrow.rotation.y = angle;
  }
}

function makeCourseArrow(x, z, angle, scale = 1) {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0xf4c84e, roughness: 0.52, transparent: true, opacity: 0.92 });
  const shaft = new THREE.Mesh(new THREE.BoxGeometry(0.28 * scale, 0.035, 1.8 * scale), mat);
  shaft.position.z = 0.24 * scale;
  const head = new THREE.Mesh(new THREE.ConeGeometry(0.46 * scale, 0.82 * scale, 3), mat);
  head.position.z = -0.82 * scale;
  head.rotation.x = Math.PI / 2;
  group.add(shaft, head);
  group.position.set(x, 0.095, z);
  group.rotation.y = angle;
  scene.add(group);
  return group;
}

for (let i = 1; i < coursePoints.length; i += 1) {
  const [x1, z1] = coursePoints[i - 1];
  const [x2, z2] = coursePoints[i];
  const dx = x2 - x1;
  const dz = z2 - z1;
  if (Math.hypot(dx, dz) < 7) continue;
  makeCourseArrow((x1 + x2) / 2, (z1 + z2) / 2, Math.atan2(dx, dz), i % 3 === 0 ? 0.9 : 0.75);
}

for (let i = 0; i < 36; i += 1) {
  const mat = i % 2 ? curbWhiteMat : curbRedMat;
  const side = i % 3 === 0 ? -1 : 1;
  const x = side * (27 + (i % 5) * 2.2);
  const z = 30 - i * 1.8;
  const block = makeBox(3.0, 0.08, 0.42, mat, x, 0.075, z);
  block.rotation.y = (side > 0 ? -0.24 : 0.24) + (i % 4) * 0.03;
}

for (let i = 0; i < 46; i += 1) {
  const x = Math.sin(i * 0.9) * 13 + (i % 2 ? -1.7 : 1.7);
  const z = 29 - i * 1.35;
  const mark = makeBox(0.26, 0.012, 5.8 + (i % 4) * 0.8, tireMarkMat, x, 0.055, z);
  mark.rotation.y = Math.sin(i * 0.55) * 0.7;
  mark.castShadow = false;
}

for (let i = 0; i < 12; i += 1) {
  makeBox(7, 2.8, 0.4, new THREE.MeshStandardMaterial({ color: i % 2 ? 0xd9e6f2 : 0x2c5c6b, roughness: 0.6 }), -58 + i * 10, 1.4, -52);
}

const cones = [];
function createCone(x, z, turn = "neutral") {
  const group = new THREE.Group();
  const mat = turn === "right" ? redConeMat : turn === "left" ? greenConeMat : coneMat;
  const cone = new THREE.Mesh(new THREE.ConeGeometry(0.48, 1.1, 28), mat);
  cone.position.y = 0.58;
  cone.castShadow = true;
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.42, 0.08, 28), coneBandMat);
  band.position.y = 0.46;
  band.castShadow = true;
  const arrowMat = turn === "right" ? redConeMat : turn === "left" ? greenConeMat : yellowMat;
  const turnArrow = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.035, 8, 28, Math.PI * 1.55), arrowMat);
  turnArrow.position.y = 0.08;
  turnArrow.rotation.x = Math.PI / 2;
  turnArrow.rotation.z = turn === "right" ? -0.55 : 2.6;
  turnArrow.visible = turn === "right" || turn === "left";
  group.add(cone, band, turnArrow);
  group.position.set(x, 0.02, z);
  group.userData = { hit: false, turn, fallX: 0, fallZ: 0 };
  scene.add(group);
  cones.push(group);

  const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  dot.setAttribute("r", turn === "start" ? "3.4" : "2.4");
  dot.setAttribute("cx", mapX(x));
  dot.setAttribute("cy", mapY(z));
  dot.setAttribute("fill", turn === "right" ? "#e33b32" : turn === "left" ? "#2fbf68" : "#f47633");
  mapCones.append(dot);
  return group;
}

conePlan.forEach(([x, z, turn]) => createCone(x, z, turn));

for (let i = 0; i < 8; i += 1) {
  createCone(-35 + i * 10, 43, "neutral");
  createCone(-35 + i * 10, -43, "neutral");
}

function makeBike() {
  const bike = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.24, 2.18), darkPaintMat);
  body.position.y = 0.96;
  body.rotation.x = -0.07;
  body.castShadow = true;
  const tank = new THREE.Mesh(new THREE.SphereGeometry(0.48, 28, 16), bluePaintMat);
  tank.position.set(0, 1.2, -0.26);
  tank.scale.set(1.0, 0.48, 1.35);
  tank.rotation.x = -0.2;
  tank.castShadow = true;
  const tankStripe = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.045, 1.1), yellowMat);
  tankStripe.position.set(0, 1.43, -0.26);
  tankStripe.rotation.x = -0.2;
  tankStripe.castShadow = true;
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x252a2f, roughness: 0.42, metalness: 0.35 });
  const engineMat = new THREE.MeshStandardMaterial({ color: 0x6f7780, roughness: 0.46, metalness: 0.62 });
  const headlight = new THREE.Mesh(new THREE.SphereGeometry(0.25, 24, 16), new THREE.MeshStandardMaterial({ color: 0xf6f0cf, roughness: 0.22, metalness: 0.05 }));
  headlight.position.set(0, 1.16, -1.34);
  headlight.scale.set(1, 0.9, 0.46);
  headlight.castShadow = true;
  const engine = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.36, 0.64, 20), engineMat);
  engine.position.set(0, 0.86, 0.06);
  engine.rotation.z = Math.PI / 2;
  engine.castShadow = true;
  const cylinderBlock = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.38, 0.3), engineMat);
  cylinderBlock.position.set(0, 1.05, -0.12);
  cylinderBlock.castShadow = true;
  const radiator = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.42, 0.08), frameMat);
  radiator.position.set(0, 1.0, -0.58);
  radiator.castShadow = true;
  const frameLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.36, 10), frameMat);
  frameLeft.position.set(-0.38, 1.08, -0.1);
  frameLeft.rotation.set(0.75, 0, 0.18);
  frameLeft.castShadow = true;
  const frameRight = frameLeft.clone();
  frameRight.position.x = 0.38;
  frameRight.rotation.z = -0.18;
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.16, 0.96), rubberMat);
  seat.position.set(0, 1.25, 0.56);
  seat.rotation.x = 0.04;
  seat.castShadow = true;
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.22, 0.58), bluePaintMat);
  tail.position.set(0, 1.13, 1.15);
  tail.rotation.x = 0.14;
  tail.castShadow = true;
  const tailLamp = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.12, 0.04), redMat);
  tailLamp.position.set(0, 1.15, 1.47);
  tailLamp.castShadow = true;
  const plate = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.24, 0.035), lineMat);
  plate.position.set(0, 0.88, 1.58);
  plate.rotation.x = -0.32;
  plate.castShadow = true;

  const wheelGeo = new THREE.TorusGeometry(0.42, 0.095, 14, 34);
  const frontWheel = new THREE.Group();
  const frontTire = new THREE.Mesh(wheelGeo, rubberMat);
  frontTire.rotation.y = Math.PI / 2;
  const frontRim = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.025, 8, 26), rimMat);
  frontRim.rotation.y = Math.PI / 2;
  const frontDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.025, 28), rimMat);
  frontDisc.rotation.z = Math.PI / 2;
  frontWheel.add(frontTire, frontRim, frontDisc);
  frontWheel.position.set(0, 0.48, -1.23);
  frontWheel.traverse((part) => {
    part.castShadow = true;
  });
  const rearWheel = frontWheel.clone();
  rearWheel.position.z = 1.18;
  const fork = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.96, 0.12), metalMat);
  fork.position.set(0, 0.88, -1.08);
  fork.rotation.x = -0.18;
  fork.castShadow = true;
  const swingArm = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 1.16), metalMat);
  swingArm.position.set(0, 0.72, 0.72);
  swingArm.rotation.x = 0.12;
  swingArm.castShadow = true;
  const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 1.25, 18), metalMat);
  exhaust.position.set(-0.48, 0.98, 0.46);
  exhaust.rotation.set(Math.PI / 2, 0.25, 0);
  exhaust.castShadow = true;
  const bar = new THREE.Mesh(new THREE.BoxGeometry(1.28, 0.08, 0.12), metalMat);
  bar.position.set(0, 1.36, -1.02);
  bar.castShadow = true;
  const leftMirror = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.11, 0.04), metalMat);
  leftMirror.position.set(-0.68, 1.5, -1.12);
  leftMirror.rotation.y = -0.35;
  leftMirror.castShadow = true;
  const rightMirror = leftMirror.clone();
  rightMirror.position.x = 0.68;
  rightMirror.rotation.y = 0.35;
  const riderMat = new THREE.MeshStandardMaterial({ color: 0x19232c, roughness: 0.52 });
  const suitAccentMat = new THREE.MeshStandardMaterial({ color: 0x21d8e7, roughness: 0.44, emissive: 0x06383e, emissiveIntensity: 0.25 });
  const protectorMat = new THREE.MeshStandardMaterial({ color: 0x11161d, roughness: 0.35, metalness: 0.08 });
  const rider = new THREE.Mesh(new THREE.CapsuleGeometry(0.23, 0.72, 8, 16), riderMat);
  rider.position.set(0, 1.7, -0.02);
  rider.rotation.x = 0.78;
  rider.castShadow = true;
  const chest = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.16, 0.42), suitAccentMat);
  chest.position.set(0, 1.75, -0.28);
  chest.rotation.x = 0.76;
  chest.castShadow = true;
  const backPad = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.13, 0.5), suitAccentMat);
  backPad.position.set(0, 1.77, 0.1);
  backPad.rotation.x = 0.62;
  backPad.castShadow = true;
  const spinePad = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.08, 0.58), protectorMat);
  spinePad.position.set(0, 1.79, 0.18);
  spinePad.rotation.x = 0.62;
  spinePad.castShadow = true;
  const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.24, 24, 16), new THREE.MeshStandardMaterial({ color: 0x17212b, roughness: 0.38 }));
  helmet.position.set(0, 2.08, -0.42);
  helmet.castShadow = true;
  const helmetStripe = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.42), suitAccentMat);
  helmetStripe.position.set(0, 2.22, -0.42);
  helmetStripe.castShadow = true;
  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.1, 0.04), new THREE.MeshStandardMaterial({ color: 0x101419, roughness: 0.2 }));
  visor.position.set(0, 2.08, -0.64);
  visor.castShadow = true;
  const leftArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.58, 6, 10), suitAccentMat);
  leftArm.position.set(-0.33, 1.48, -0.58);
  leftArm.rotation.set(1.12, 0.08, -0.32);
  leftArm.castShadow = true;
  const rightArm = leftArm.clone();
  rightArm.position.x = 0.33;
  rightArm.rotation.z = 0.32;
  const leftShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.12, 14, 10), protectorMat);
  leftShoulder.position.set(-0.27, 1.78, -0.25);
  leftShoulder.scale.set(1.2, 0.75, 0.9);
  leftShoulder.castShadow = true;
  const rightShoulder = leftShoulder.clone();
  rightShoulder.position.x = 0.27;
  const leftElbow = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 8), protectorMat);
  leftElbow.position.set(-0.45, 1.36, -0.56);
  leftElbow.scale.set(1, 0.7, 0.9);
  leftElbow.castShadow = true;
  const rightElbow = leftElbow.clone();
  rightElbow.position.x = 0.45;
  const leftLeg = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.7, 6, 10), suitAccentMat);
  leftLeg.position.set(-0.35, 1.12, 0.32);
  leftLeg.rotation.set(0.68, -0.08, -0.38);
  leftLeg.castShadow = true;
  const rightLeg = leftLeg.clone();
  rightLeg.position.x = 0.35;
  rightLeg.rotation.z = 0.38;
  const leftKnee = new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 10), protectorMat);
  leftKnee.position.set(-0.44, 0.95, -0.02);
  leftKnee.scale.set(1.1, 0.6, 0.9);
  leftKnee.castShadow = true;
  const rightKnee = leftKnee.clone();
  rightKnee.position.x = 0.44;

  bike.add(body, tank, tankStripe, headlight, engine, cylinderBlock, radiator, frameLeft, frameRight, seat, tail, tailLamp, plate, frontWheel, rearWheel, fork, swingArm, exhaust, bar, leftMirror, rightMirror, rider, chest, backPad, spinePad, helmet, helmetStripe, visor, leftArm, rightArm, leftShoulder, rightShoulder, leftElbow, rightElbow, leftLeg, rightLeg, leftKnee, rightKnee);
  bike.userData = { rider, helmet, helmetStripe, visor, leftArm, rightArm, leftLeg, rightLeg, leftShoulder, rightShoulder, leftElbow, rightElbow, leftKnee, rightKnee, frontWheel, rearWheel, frontTire, frontRim, rearTire: rearWheel.children[0], rearRim: rearWheel.children[1], fork, bar };
  return bike;
}

const bike = makeBike();
scene.add(bike);

const skidMarks = Array.from({ length: 90 }, () => {
  const mark = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.01, 1.15), tireMarkMat);
  mark.visible = false;
  mark.castShadow = false;
  mark.receiveShadow = true;
  scene.add(mark);
  return mark;
});
let skidIndex = 0;

const smokePuffs = Array.from({ length: 26 }, () => {
  const puff = new THREE.Mesh(new THREE.SphereGeometry(0.36, 12, 8), smokeMat);
  puff.visible = false;
  puff.userData.life = 0;
  scene.add(puff);
  return puff;
});
let smokeIndex = 0;

const keys = new Set();
const clock = new THREE.Clock();
const cameraControl = {
  dragging: false,
  yaw: 0,
  pitch: 0,
  lastX: 0,
  lastY: 0,
};
const state = {
  x: -31,
  z: 12,
  heading: Math.PI,
  speed: 0,
  throttle: 0,
  brake: 0,
  steer: 0,
  yawRate: 0,
  leanRate: 0,
  frontSteer: 0,
  rearSlip: 0,
  travelHeading: 0,
  bank: 0,
  leanBias: 0,
  mode: "with",
  started: false,
  finished: false,
  crashed: false,
  elapsed: 0,
  penalty: 0,
  nextGate: 1,
  overbankTime: 0,
  fallSide: 1,
  restartTimer: 0,
};

function mapX(x) {
  return THREE.MathUtils.clamp(60 + x * 1.28, 8, 112);
}

function mapY(z) {
  return THREE.MathUtils.clamp(148 - (z + 45) * 1.55, 8, 152);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => toast.classList.remove("is-visible"), 1600);
}

function restart() {
  Object.assign(state, {
    x: -31,
    z: 12,
    heading: Math.PI,
    speed: 0,
    throttle: 0,
    brake: 0,
    steer: 0,
    yawRate: 0,
    leanRate: 0,
    frontSteer: 0,
    rearSlip: 0,
    travelHeading: 0,
    bank: 0,
    leanBias: 0,
    started: false,
    finished: false,
    crashed: false,
    elapsed: 0,
    penalty: 0,
    nextGate: 1,
    overbankTime: 0,
    fallSide: 1,
    restartTimer: 0,
  });
  cones.forEach((cone) => {
    cone.userData.hit = false;
    cone.userData.fallX = 0;
    cone.userData.fallZ = 0;
    cone.scale.setScalar(1);
    cone.rotation.set(0, 0, 0);
  });
  bike.rotation.set(0, 0, 0);
  skidMarks.forEach((mark) => {
    mark.visible = false;
  });
  smokePuffs.forEach((puff) => {
    puff.visible = false;
    puff.userData.life = 0;
  });
  showToast("白線からスタート");
}

function setMode(mode) {
  state.mode = mode;
  modeButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.mode === mode));
}

function crash(reason) {
  if (state.crashed || state.finished) return;
  state.crashed = true;
  state.finished = true;
  state.speed *= 0.18;
  state.fallSide = Math.sign(state.bank || state.leanBias || 1);
  state.leanRate = 0;
  state.yawRate = 0;
  state.restartTimer = 2.4;
  runStateEl.textContent = "DNF";
  showToast(`${reason} / 自動再開`);
}

modeButtons.forEach((button) => {
  button.addEventListener("click", () => setMode(button.dataset.mode));
});

document.querySelectorAll(".inputs [data-key]").forEach((button) => {
  const key = button.dataset.key;
  const press = (event) => {
    event.preventDefault();
    button.classList.add("is-pressed");
    if (key === "r") {
      restart();
    } else {
      keys.add(key);
    }
  };
  const release = (event) => {
    event.preventDefault();
    button.classList.remove("is-pressed");
    if (key !== "r") keys.delete(key);
  };
  button.addEventListener("pointerdown", press);
  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
  button.addEventListener("pointerleave", release);
});

window.addEventListener("keydown", (event) => {
  keys.add(event.key.toLowerCase());
  if (event.key.toLowerCase() === "r") restart();
  if (event.key === "1") setMode("with");
  if (event.key === "2") setMode("in");
  if (event.key === "3") setMode("out");
});

window.addEventListener("keyup", (event) => keys.delete(event.key.toLowerCase()));

canvas.addEventListener("pointerdown", (event) => {
  cameraControl.dragging = true;
  cameraControl.lastX = event.clientX;
  cameraControl.lastY = event.clientY;
  canvas.setPointerCapture(event.pointerId);
});

canvas.addEventListener("pointermove", (event) => {
  if (!cameraControl.dragging) return;
  const dx = event.clientX - cameraControl.lastX;
  const dy = event.clientY - cameraControl.lastY;
  cameraControl.lastX = event.clientX;
  cameraControl.lastY = event.clientY;
  cameraControl.yaw = THREE.MathUtils.clamp(cameraControl.yaw - dx * 0.005, -1.65, 1.65);
  cameraControl.pitch = THREE.MathUtils.clamp(cameraControl.pitch + dy * 0.003, -0.72, 0.72);
});

canvas.addEventListener("pointerup", (event) => {
  cameraControl.dragging = false;
  canvas.releasePointerCapture(event.pointerId);
});

canvas.addEventListener("pointercancel", () => {
  cameraControl.dragging = false;
});

function updatePhysics(dt) {
  if (state.finished) {
    state.speed *= 1 - Math.min(1, dt * 1.9);
    if (state.crashed && state.restartTimer > 0) {
      state.restartTimer -= dt;
      if (state.restartTimer <= 0) restart();
    }
    return;
  }

  const throttle = keys.has("w") || keys.has("arrowup") ? 1 : 0;
  const brake = keys.has("s") || keys.has("arrowdown") ? 1 : 0;
  const rearBrake = keys.has(" ") ? 1 : 0;
  const steer = (keys.has("d") || keys.has("arrowright") ? 1 : 0) - (keys.has("a") || keys.has("arrowleft") ? 1 : 0);
  const leanInput = (keys.has("e") ? 1 : 0) - (keys.has("q") ? 1 : 0);

  state.throttle = THREE.MathUtils.damp(state.throttle, throttle, 7, dt);
  state.brake = THREE.MathUtils.damp(state.brake, brake + rearBrake * 0.65, 9, dt);
  state.steer = THREE.MathUtils.damp(state.steer, steer, 6.2, dt);

  const drag = 0.18 * state.speed * Math.abs(state.speed) + 0.92 * state.speed;
  const engineForce = state.throttle * 8.5 * (1 - THREE.MathUtils.clamp(Math.abs(state.speed) / 19, 0, 0.55));
  const brakeForce = state.brake * 12.5 * Math.sign(Math.max(0.2, state.speed));
  state.speed += (engineForce - brakeForce - drag) * dt;
  state.speed = THREE.MathUtils.clamp(state.speed, -1.4, 15.2);

  const speedAbs = Math.abs(state.speed);
  const speedFactor = THREE.MathUtils.clamp(speedAbs / 7.2, 0.12, 1);
  const maxLean = THREE.MathUtils.degToRad(54);
  const targetBank = -(state.steer * THREE.MathUtils.degToRad(49) * speedFactor + leanInput * THREE.MathUtils.degToRad(8));
  const leanAccel = (targetBank - state.bank) * 18 - state.leanRate * 6.5;
  state.leanRate += leanAccel * dt;
  state.bank += state.leanRate * dt;
  state.bank = THREE.MathUtils.clamp(state.bank, -maxLean, maxLean);
  state.leanBias = THREE.MathUtils.damp(state.leanBias, -leanInput * THREE.MathUtils.degToRad(13), 5.8, dt);
  state.frontSteer = THREE.MathUtils.damp(state.frontSteer, state.steer * THREE.MathUtils.degToRad(24) - state.bank * 0.18, 9, dt);

  const modeGain = state.mode === "in" ? 1.06 : state.mode === "out" ? 0.82 : 0.94;
  const slideDemand = THREE.MathUtils.clamp(
    (Math.abs(THREE.MathUtils.radToDeg(state.bank)) - 31) / 35 + rearBrake * 0.68 + state.throttle * Math.abs(state.steer) * 0.16,
    0,
    1,
  ) * THREE.MathUtils.clamp(Math.abs(state.speed) / 5.2, 0, 1);
  state.rearSlip = THREE.MathUtils.damp(state.rearSlip, slideDemand, rearBrake ? 7 : 4.2, dt);

  const gravity = 9.8;
  const speedForYaw = Math.max(2.0, speedAbs);
  const leanYaw = (gravity * Math.tan(state.bank) / speedForYaw) * modeGain;
  const lowSpeedYaw = -state.frontSteer * THREE.MathUtils.clamp(speedAbs / 4.5, 0, 1) * 1.15;
  const slideYaw = state.rearSlip * Math.sign(state.bank || -state.steer) * 0.28;
  state.yawRate = THREE.MathUtils.damp(state.yawRate, leanYaw + lowSpeedYaw + slideYaw, 5.5, dt);
  state.heading += state.yawRate * dt * Math.sign(Math.max(0.2, state.speed));

  state.travelHeading = state.heading - state.rearSlip * Math.sign(state.bank || -state.steer) * 0.28;
  state.x -= Math.sin(state.travelHeading) * state.speed * dt;
  state.z -= Math.cos(state.travelHeading) * state.speed * dt;

  const absBank = Math.abs(THREE.MathUtils.radToDeg(state.bank + state.leanBias * 0.3));
  const lowSpeedLimit = 42 + Math.abs(state.speed) * 3.2;
  const modeBonus = state.mode === "out" ? 4 : state.mode === "in" ? -2 : 0;
  const fallLimit = Math.min(58 + modeBonus, lowSpeedLimit + modeBonus);
  if (absBank > fallLimit) {
    state.overbankTime += dt;
    if (state.overbankTime > 0.22) {
      crash(`転倒: バンク角 ${Math.round(absBank)}° / 限界 ${Math.round(fallLimit)}°`);
    }
  } else {
    state.overbankTime = Math.max(0, state.overbankTime - dt * 2);
  }

  if (!state.started && Math.abs(state.speed) > 0.8) {
    state.started = true;
    runStateEl.textContent = "RUN";
    showToast("計測開始");
  }

  if (state.started) {
    state.elapsed += dt;
  }

  if (Math.abs(state.x) > 48 || Math.abs(state.z) > 50) {
    state.penalty += state.started ? 10 : 0;
    state.speed *= 0.35;
    state.x = THREE.MathUtils.clamp(state.x, -49, 49);
    state.z = THREE.MathUtils.clamp(state.z, -51, 51);
    showToast("+10 コースアウト");
  }
}

function updateEffects(dt) {
  const slipActive = state.rearSlip > 0.18 && Math.abs(state.speed) > 3 && !state.crashed;
  if (slipActive && Math.random() < 0.92) {
    const rearX = state.x + Math.sin(state.heading) * 1.15;
    const rearZ = state.z + Math.cos(state.heading) * 1.15;
    const side = Math.sign(state.bank || 1);
    const mark = skidMarks[skidIndex];
    skidIndex = (skidIndex + 1) % skidMarks.length;
    mark.visible = true;
    mark.position.set(rearX + Math.cos(state.heading) * side * 0.08, 0.068, rearZ - Math.sin(state.heading) * side * 0.08);
    mark.rotation.y = state.travelHeading;
    mark.scale.set(1 + state.rearSlip * 1.6, 1, 0.7 + state.rearSlip * 1.3);

    const puff = smokePuffs[smokeIndex];
    smokeIndex = (smokeIndex + 1) % smokePuffs.length;
    puff.visible = true;
    puff.userData.life = 1;
    puff.position.set(rearX, 0.45, rearZ);
    puff.scale.setScalar(0.5 + state.rearSlip * 0.9);
  }

  for (const puff of smokePuffs) {
    if (!puff.visible) continue;
    puff.userData.life -= dt * 1.25;
    if (puff.userData.life <= 0) {
      puff.visible = false;
      continue;
    }
    puff.position.y += dt * 0.8;
    puff.position.x += Math.sin(state.heading + 0.8) * dt * 0.25;
    puff.position.z += Math.cos(state.heading + 0.8) * dt * 0.25;
    puff.scale.multiplyScalar(1 + dt * 0.78);
  }
}

function updateCourse(dt) {
  for (const cone of cones) {
    const dx = cone.position.x - state.x;
    const dz = cone.position.z - state.z;
    const distance = Math.hypot(dx, dz);
    if (!cone.userData.hit && distance < 1.05) {
      cone.userData.hit = true;
      cone.userData.fallX = THREE.MathUtils.clamp(dx, -1, 1);
      cone.userData.fallZ = THREE.MathUtils.clamp(dz, -1, 1);
      cone.rotation.x = cone.userData.fallZ * THREE.MathUtils.degToRad(82);
      cone.rotation.z = -cone.userData.fallX * THREE.MathUtils.degToRad(82);
      cone.scale.setScalar(0.92);
      state.penalty += 5;
      showToast("+5 パイロン接触");
    } else if (cone.userData.hit) {
      const targetX = cone.userData.fallZ * THREE.MathUtils.degToRad(82);
      const targetZ = -cone.userData.fallX * THREE.MathUtils.degToRad(82);
      cone.rotation.x = THREE.MathUtils.damp(cone.rotation.x, targetX, 12, dt);
      cone.rotation.z = THREE.MathUtils.damp(cone.rotation.z, targetZ, 12, dt);
    }
  }

  const gate = coursePoints[state.nextGate];
  if (gate) {
    const distance = Math.hypot(gate[0] - state.x, gate[1] - state.z);
    if (distance < 4.4) {
      state.nextGate += 1;
      if (state.nextGate >= coursePoints.length) {
        state.finished = true;
        runStateEl.textContent = "FINISH";
        showToast(`FINISH ${state.elapsed.toFixed(2)} +${state.penalty}`);
      } else {
        showToast(`GATE ${state.nextGate}`);
      }
    }
  }
}

function updateBike(dt) {
  bike.position.set(state.x, 0, state.z);
  bike.rotation.y = state.heading;

  if (state.crashed) {
    bike.rotation.x = THREE.MathUtils.damp(bike.rotation.x, -0.35, 5, dt);
    bike.rotation.z = THREE.MathUtils.damp(bike.rotation.z, -state.fallSide * 1.42, 5.8, dt);
  } else {
    bike.rotation.x = THREE.MathUtils.damp(bike.rotation.x, 0, 9, dt);
    bike.rotation.z = THREE.MathUtils.damp(bike.rotation.z, state.bank, 12, dt);
  }

  const riderOffset = state.mode === "out" ? state.bank * 0.72 : state.mode === "in" ? -state.bank * 0.42 : 0;
  bike.userData.rider.position.x = THREE.MathUtils.damp(bike.userData.rider.position.x, riderOffset + state.leanBias * 0.9, 8, dt);
  bike.userData.helmet.position.x = THREE.MathUtils.damp(bike.userData.helmet.position.x, riderOffset + state.leanBias * 1.1, 8, dt);
  bike.userData.helmetStripe.position.x = bike.userData.helmet.position.x;
  bike.userData.visor.position.x = bike.userData.helmet.position.x;
  bike.userData.leftArm.position.x = THREE.MathUtils.damp(bike.userData.leftArm.position.x, -0.33 + riderOffset * 0.55, 8, dt);
  bike.userData.rightArm.position.x = THREE.MathUtils.damp(bike.userData.rightArm.position.x, 0.33 + riderOffset * 0.55, 8, dt);
  bike.userData.leftLeg.position.x = THREE.MathUtils.damp(bike.userData.leftLeg.position.x, -0.35 + state.bank * 0.34, 8, dt);
  bike.userData.rightLeg.position.x = THREE.MathUtils.damp(bike.userData.rightLeg.position.x, 0.35 + state.bank * 0.34, 8, dt);
  bike.userData.leftKnee.position.x = bike.userData.leftLeg.position.x - 0.09;
  bike.userData.rightKnee.position.x = bike.userData.rightLeg.position.x + 0.09;
  bike.userData.frontTire.rotation.x -= state.speed * dt * 2.6;
  bike.userData.frontRim.rotation.x -= state.speed * dt * 2.6;
  bike.userData.rearTire.rotation.x -= state.speed * dt * (2.6 + state.rearSlip * 3.2);
  bike.userData.rearRim.rotation.x -= state.speed * dt * (2.6 + state.rearSlip * 3.2);
  bike.userData.frontWheel.rotation.y = state.frontSteer;
  bike.userData.fork.rotation.y = state.frontSteer * 0.55;
  bike.userData.bar.rotation.y = state.frontSteer * 0.65;
}

function updateCamera(dt) {
  if (!cameraControl.dragging) {
    cameraControl.yaw = THREE.MathUtils.damp(cameraControl.yaw, 0, 1.4, dt);
    cameraControl.pitch = THREE.MathUtils.damp(cameraControl.pitch, 0, 1.4, dt);
  }
  const sidePeek = Math.sign(state.bank || 1) * state.rearSlip * 1.5;
  const cameraHeading = state.heading + cameraControl.yaw;
  const behind = new THREE.Vector3(
    Math.sin(cameraHeading) * 7.1 + Math.cos(cameraHeading) * sidePeek,
    3.35 + Math.abs(state.speed) * 0.04 + cameraControl.pitch * 2.1,
    Math.cos(cameraHeading) * 7.1 - Math.sin(cameraHeading) * sidePeek,
  );
  const target = new THREE.Vector3(state.x, 0.9, state.z).add(behind);
  camera.position.lerp(target, 1 - Math.exp(-dt * 5.6));
  camera.lookAt(
    state.x - Math.sin(state.heading) * (4.4 + state.rearSlip * 2.2),
    0.95 - cameraControl.pitch * 0.6,
    state.z - Math.cos(state.heading) * (4.4 + state.rearSlip * 2.2),
  );
}

function updateHud() {
  const kmh = Math.round(Math.abs(state.speed) * 7.4);
  const bankDeg = Math.round(THREE.MathUtils.radToDeg(state.bank));
  speedEl.textContent = kmh.toString();
  bankEl.textContent = `BANK ${bankDeg}`;
  timeEl.textContent = state.elapsed.toFixed(3).padStart(6, "0");
  penaltyEl.textContent = `PEN ${state.penalty}`;
  rankDeltaEl.textContent = state.started ? `+${Math.max(0, state.elapsed - 59.657 + state.penalty).toFixed(3)}` : "--.---";
  needleEl.style.transform = `rotate(${THREE.MathUtils.clamp(-118 + kmh * 1.95, -118, 116)}deg)`;
  mapBike.setAttribute("cx", mapX(state.x));
  mapBike.setAttribute("cy", mapY(state.z));
  mapBike.setAttribute("r", state.rearSlip > 0.25 ? "5.4" : "4");
  if (!state.started && !state.finished) runStateEl.textContent = "READY";
}

function animate() {
  const dt = Math.min(clock.getDelta(), 0.033);
  updatePhysics(dt);
  updateCourse(dt);
  updateEffects(dt);
  updateBike(dt);
  updateCamera(dt);
  updateHud();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

restart();
animate();
