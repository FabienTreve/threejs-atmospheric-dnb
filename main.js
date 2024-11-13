import './style.css';
import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';

// ------------------------------------ AUDIO ------------------------------------
// 1. Créatier le contexte audio
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// 2. Charger et décoder le fichier audio
async function loadAudio(url) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return await audioContext.decodeAudioData(arrayBuffer);
}

// 3. Fonction pour démarrer la lecture en boucle
async function playLoop(url) {
    // Chargement de l'audio
    const audioBuffer = await loadAudio(url);
    
    // Créer une source audio
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.loop = true;
    
    // Connecter la source à la destination (sortie audio)
    source.connect(audioContext.destination);
    
    // Jouer le son
    source.start();
}

// 4. Appeler la fonction avec l'URL de ton fichier audio
playLoop('/mp3/dnb-jungle-2.mp3');

// ------------------------------------ SETUP ------------------------------------
// Scène
const scene = new THREE.Scene();

// Skybox
const loader = new THREE.CubeTextureLoader();
const sky = loader.load([
  '/img/sky-right.jpg',
  '/img/sky-left.jpg',
  '/img/sky-top.jpg',
  '/img/sky-bottom.jpg',
  '/img/sky-front.jpg',
  '/img/sky-back.jpg',
]);
scene.background = sky;

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.setZ(30);
camera.position.setY(10);

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#canvas'),
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;  // Activer les ombres
renderer.shadowMap.type = THREE.PCFSoftShadowMap;  // Ombres plus douces


// ------------------------------------ MATERIAUX ------------------------------------
//___MATERIAUX___
const metal_material = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  metalness: 1,
  roughness: 0,
  envMap: sky,
  envMapIntensity: 1
});

// ------------------------------------ MESHS ------------------------------------
// Sol
const floor_geometry = new THREE.PlaneGeometry(1000, 1000, 250, 250);
const floor_texture = new THREE.TextureLoader().load('/img/floor_tiles_3.png' ); 
const floor_material_tex = new THREE.MeshStandardMaterial({ map : floor_texture});
floor_texture.wrapS = THREE.RepeatWrapping;
floor_texture.wrapT = THREE.RepeatWrapping;
floor_texture.repeat.set(40, 40);
const floor_material_base = new THREE.MeshStandardMaterial({ color: 0x4a90e2 });
const floor = new THREE.Mesh(floor_geometry, floor_material_tex);

floor.rotateX(-Math.PI / 2);
floor.receiveShadow = true;
scene.add(floor);

// Cone
const cone_geometry = new THREE.ConeGeometry(8, 16, 16, 16);
const cone_material_tex = new THREE.MeshToonMaterial({ color : 0xf67104});
const cone = new THREE.Mesh(cone_geometry, cone_material_tex);
cone.position.setY(5);
cone.castShadow = true;
cone.receiveShadow = true;
scene.add(cone);

// Sphere
const sphere_geometry = new THREE.SphereGeometry(6, 16, 16);
const sphere = new THREE.Mesh(sphere_geometry, metal_material);
sphere.position.setY(20);
sphere.position.setX(-10);
sphere.position.setZ(-20);
sphere.castShadow = true;
sphere.receiveShadow = true;
scene.add(sphere);

// Cube
const crateTexture = new THREE.TextureLoader().load('/img/cube_crate_low.jpg');
const cube_material_tex = [
  new THREE.MeshStandardMaterial({ map: crateTexture }),
  new THREE.MeshStandardMaterial({ map: crateTexture }),
  new THREE.MeshStandardMaterial({ map: crateTexture }),
  new THREE.MeshStandardMaterial({ map: crateTexture }),
  new THREE.MeshStandardMaterial({ map: crateTexture }),
  new THREE.MeshStandardMaterial({ map: crateTexture })
];
const cube_geometry = new THREE.BoxGeometry(10, 10, 10);
const cube = new THREE.Mesh(cube_geometry, cube_material_tex);
cube.position.setY(5);
cube.position.setX(-20);
cube.position.setZ(-7);
cube.rotation.y = 45;
cube.castShadow = true;
cube.receiveShadow = true;
scene.add(cube);


// ------------------------------------ LIGHTS ------------------------------------
// Lumière directionnelle (soleil)
const sunlight = new THREE.DirectionalLight(0xffffff, 0.7);  // Second paramètre : Intensité de la lumière
sunlight.position.set(25, 30, 15);
sunlight.castShadow = true;
sunlight.shadow.mapSize.width = 1024;
sunlight.shadow.mapSize.height = 1024;
sunlight.shadow.camera.left = -50;
sunlight.shadow.camera.right = 50;
sunlight.shadow.camera.top = 50;
sunlight.shadow.camera.bottom = -50;
sunlight.shadow.camera.near = 0.5;
sunlight.shadow.camera.far = 100;
sunlight.shadow.bias = -0.005;
scene.add(sunlight);

// Lumière ambiante
const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(ambientLight);

// ------------------------------------ TOOLS (Helpers, GUI) ------------------------------------
// Helpers
//const gridHelper = new THREE.GridHelper(500, 100);
//const lightHelper = new THREE.DirectionalLightHelper(sunlight);
//scene.add(lightHelper);
//scene.add(gridHelper);


// ------------------------------------ Controls ------------------------------------
const controls = new PointerLockControls(camera, renderer.domElement);

// Variables pour les déplacements
const move = { forward: false, backward: false, left: false, right: false };
const moveSpeed = 1;  // Vitesse de déplacement de la caméra

document.addEventListener('click', () => { // Active le suivi du curseur dès le premier clic sur la page
  controls.lock();
});

// Gérer les touches du clavier pour le mouvement
document.addEventListener('keydown', (event) => {
  audioContext.resume();
  switch (event.code) {
    case 'KeyW': move.forward = true; break;
    case 'KeyS': move.backward = true; break;
    case 'KeyA': move.left = true; break;
    case 'KeyD': move.right = true; break;
  }
});

document.addEventListener('keyup', (event) => {
  switch (event.code) {
    case 'KeyW': move.forward = false; break;
    case 'KeyW': move.forward = false; break;
    case 'KeyS': move.backward = false; break;
    case 'KeyA': move.left = false; break;
    case 'KeyD': move.right = false; break;
  }
});


// ------------------------------------ Fonction animate() (pour render) ------------------------------------
// Variables pour contrôler la direction et la limite de déplacement
let direction = 1; // 1 pour monter, -1 pour descendre
const speed = 0.01; // Vitesse de déplacement
const maxY = 22; // Limite supérieure
const minY = 20;  // Limite inférieure

function animate() {
  requestAnimationFrame(animate);

  // Animations
  sphere.rotation.y += 0.01;
  
  // Changer la position de la sphère en fonction de la direction
  sphere.position.y += speed * direction;

  // Inverser la direction si la limite supérieure ou inférieure est atteinte
  if (sphere.position.y >= maxY || sphere.position.y <= minY) {
    direction *= -1; // Inverser la direction
  }

  // Déplacement de la caméra selon les touches pressées
  if (move.forward) controls.moveForward(moveSpeed);
  if (move.backward) controls.moveForward(-moveSpeed);
  if (move.left) controls.moveRight(-moveSpeed);
  if (move.right) controls.moveRight(moveSpeed);

  renderer.render(scene, camera);
}

animate();
