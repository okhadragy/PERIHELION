import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js';
import { gsap } from 'gsap';

import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

// STARS
import getStarfield from "./getStarfield.js";

// EARTH
import { getFresnelMat } from "./earthGlowMat.js";
import earthmap from "../assets/textures/earth/earthmap1k.png";
import earthlights from "../assets/textures/earth/earthlights1k.jpg";
import earthspec from "../assets/textures/earth/earthspec1k.jpg";
import earthbump from "../assets/textures/earth/earthbump1k.jpg";
import earthcloud from "../assets/textures/earth/earthcloudmap.jpg";
import earthcloudtrans from "../assets/textures/earth/earthcloudmaptrans.jpg";

// JUPITER
import { getFresnelMatJUP } from "./jupiterGlowMat.js";
import jupitermap from "../assets/textures/jupiter/jupiter.jpg";
import jupiterNightmap from "../assets/textures/jupiter/jupiternight.jpg";

// MERCURY
import { getFresnelMatMERC } from "./mercuryGlowMat.js";
import mercurymap from "../assets/textures/mercury/mercurymap.jpg";
import mercuryBumpmap from "../assets/textures/mercury/mercurybump.jpg";
import mercuryNightmap from "../assets/textures/mercury/mercurynightmap.jpg";

// VENUS
import { getFresnelMatVEN } from "./venusGlowMat.js";
import venussmap from "../assets/textures/venus/venusmap.jpg";
import venusNightmap from "../assets/textures/venus/venusmapnight.jpg";
import venusClouds from "../assets/textures/venus/venusclouds.jpg";

// MARS
import { getFresnelMatMARS } from "./marsGlowMat.js";
import marsmap from "../assets/textures/mars/marsmap.png";
import marsbump from "../assets/textures/mars/marsbump.jpg";
import marsclouds from "../assets/textures/mars/marsclouds.png";
import marslights from "../assets/textures/mars/marsnight.jpg";

// SATURN
import { getFresnelMatSAT } from "./saturnGlowMat.js";
import saturnmap from "../assets/textures/saturn/th_saturn.png";
import saturnbump from "../assets/textures/saturn/th_saturnbump.png";
import saturnclouds from "../assets/textures/saturn/th_saturnclouds.png";
import saturnlights from "../assets/textures/saturn/th_saturnnight.png";
import saturnrings from "../assets/textures/saturn/t00fri_gh_saturnrings.png";

// URANUS
import { getFresnelMatURA } from "./uranusGlowMat.js";
import uranusmap from "../assets/textures/uranus/uranusmap.png";
import uranuslights from "../assets/textures/uranus/uranuslights.png";
import uranusrings from "../assets/textures/uranus/uranusrings.png";

// NEPTUNE
import { getFresnelMatNEP } from "./neptuneGlowMat.js";
import neptunemap from "../assets/textures/neptune/neptunemap.jpg";
import neptunebump from "../assets/textures/neptune/neptunebump.png";
import neptuneclouds from "../assets/textures/neptune/neptuneclouds.png";
import neptunelights from "../assets/textures/neptune/neptunelights.jpg";
import neptunerings from "../assets/textures/neptune/neptunerings.png";


// SUN
import sunMap from "../assets/textures/sun/sunmap.jpg";
import sunFluid from "../assets/textures/sun/sunfluids.png";

// SUBTITLES
import { audioData } from "./subtitles.js";


// Speed factor for adjusting time flow. EX: speedFactor = 1600, then it runs at 1600 seconds per second.
let speedFactor = 1;
const planetGroupArr = [];
const DEG2RAD = Math.PI / 180;

// FOR REFERENCE
// 1 THREE JS UNIT = 1 AU * 10 = 149597870.7 KM * 10
// SIZES ARE CALCULATED ACCORDING TO DIAMETER OF EACH BODY IN AU
// EX: SUN'S SIZE = DIAMETER / 1 AU IN KM = 1,391,000 / 149,597,870.7 = 0.0093

const loadingManager = new THREE.LoadingManager();
const song1 = document.getElementById('song1')
const musicslider = document.getElementById('musicslider');
const narrslider = document.getElementById('narrslider');
song1.volume = musicslider.value;

//
loadingManager.onLoad = function() {

  gsap.to("#loadingcontainer", { 
    opacity: 0,
    duration: 1.5,
    onUpdate: function(){
      song1.play()
    },
    onComplete: function(){
      document.getElementById('loadingcontainer').classList.add('hidden');
      playAudio(0, 4);
    }
  });

  document.getElementById('everything').classList.remove('hidden');
};

musicslider.addEventListener('input', function() {
  song1.volume = this.value;
});

//
const audioClip = document.getElementById('audioClip');
const subtitle = document.getElementById('subtitle');

audioClip.volume = narrslider.value;
narrslider.addEventListener('input', function() {
  audioClip.volume = this.value;
});

let currentSubtitles = [];
let currentPlanetIndex = 0; // Index for selected planet
let currentClipIndex = 0; // Index for selected audio clip
let lowerFlag = false;

function playAudio(planetIndex, clipIndex) {
  
    const selectedPlanet = audioData[planetIndex];
    const selectedClip = selectedPlanet.audioClips[clipIndex];

    audioClip.src = selectedClip.file;
    audioClip.currentTime = 0;
    audioClip.play();
    audioflag = true;

    currentSubtitles = selectedClip.subtitles; // Set current subtitles to the selected clip

    if(lowerFlag == false){
    gsap.to(song1, {
      volume: song1.volume * 0.25, //
      duration: 1,
    });
    lowerFlag = true;
    }

    /* */ // hide and unhide etc etc 
    updateSubtitles();
}

function updateSubtitles() {
  const currentTime = audioClip.currentTime;
  let subtitleFound = false;

  for (const { text, start, end } of currentSubtitles) {
      if (currentTime >= start && currentTime <= end) {
          subtitle.style.display = "block";
          subtitle.innerText = text; // Show current subtitle
          subtitleFound = true;
          break; // Break out of the loop after displaying the current subtitle
      }
  }

  if (!subtitleFound) {
      subtitle.innerText = ""; // Clear subtitle if none are active
  }

  if (audioClip.ended) {
    
      subtitle.style.display = "none";
      
      gsap.to(song1, {
        volume: song1.volume * 4, //
        duration: 1,
      });

      lowerFlag = false;
      audioflag = false;

  } else {
      requestAnimationFrame(updateSubtitles); // Continue checking subtitles
  }
}


// fun fact button

document.getElementById("playfact").addEventListener("click", function() {
  if((clickedLabel.factTracker == audioData[labels.indexOf(clickedLabel)].audioClips.length) || ((clickedLabel.factTracker == 4) && (clickedLabel == sunSprite))){
    clickedLabel.factTracker = 1; // ranges from 1 to max amount of facts per planet
  }
  currentSubtitles = [];
  playAudio(labels.indexOf(clickedLabel), clickedLabel.factTracker);
  clickedLabel.factTracker++;
});

//

const w = window.innerWidth;
const h = window.innerHeight;
const scene = new THREE.Scene();



const camera = new THREE.PerspectiveCamera(
    75, // fov
    w / h, // aspect ratio
    0.0001, // near
    2000 // far
);
camera.position.x = 15;
camera.position.y = 5;

const renderer = new THREE.WebGLRenderer({antialias: true,});
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

//                                                                CINEMATIC CAMERA CONTROLS // dont forget animate()
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.055;
controls.enableZoom = false;
controls.enablePan = false;

const controls2 = new TrackballControls(camera, renderer.domElement);
controls2.noRotate = true;
controls2.noPan = true;
controls2.noZoom = false;
controls2.zoomSpeed = 2.5;
controls2.minDistance = 5;
controls2.maxDistance = 500;


const detail = 12;
const loader = new THREE.TextureLoader(loadingManager);

////////////////////////// STARS ////////////////////////////

const stars = getStarfield({numStars: 2500});
scene.add(stars);

////////////////////////// JUPITER //////////////////////////

const jupiterGroup = new THREE.Group();
jupiterGroup.rotation.y = 3.13 * Math.PI / 180;
jupiterGroup.rotation.x = -3.13 * Math.PI / 180;
scene.add(jupiterGroup);

const jupiterGeometry = new THREE.IcosahedronGeometry(0.0093, detail);
const jupiterMaterial = new THREE.MeshPhongMaterial({
  map: loader.load(jupitermap),
  //specularMap: loader.load(earthspec),
  //bumpMap: loader.load(earthbump),
  //bumpScale: 0.04,
}); 

const jupiterMesh = new THREE.Mesh(jupiterGeometry, jupiterMaterial);
jupiterGroup.add(jupiterMesh);

const jupiterNightMat = new THREE.MeshBasicMaterial({
  map: loader.load(jupiterNightmap),
  blending: THREE.AdditiveBlending,
});
const jupiterNightMesh = new THREE.Mesh(jupiterGeometry, jupiterNightMat);
jupiterGroup.add(jupiterNightMesh);

const fresnelMatJUP = getFresnelMatJUP(); // for glowing

const jupiterGlowMesh = new THREE.Mesh(jupiterGeometry, fresnelMatJUP);
jupiterGlowMesh.scale.setScalar(1.005);
jupiterGroup.add(jupiterGlowMesh);

////////////////////////// EARTH //////////////////////////

const earthGroup = new THREE.Group();
earthGroup.rotation.y = 23.4 * Math.PI / 180;
earthGroup.rotation.x = -23.4 * Math.PI / 180;
scene.add(earthGroup);

const earthGeometry = new THREE.IcosahedronGeometry(0.00085, detail); // 0.0092
const earthMaterial = new THREE.MeshPhongMaterial({
  map: loader.load(earthmap),
  specularMap: loader.load(earthspec),
  bumpMap: loader.load(earthbump),
  bumpScale: 0.04,
}); 

const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
earthGroup.add(earthMesh);

const earthNightlightsMat = new THREE.MeshBasicMaterial({
  map: loader.load(earthlights),
  blending: THREE.AdditiveBlending,
});
const earthNightlightsMesh = new THREE.Mesh(earthGeometry, earthNightlightsMat);
earthGroup.add(earthNightlightsMesh);

const earthCloudsMat = new THREE.MeshStandardMaterial({
  map: loader.load(earthcloud),
  transparent: true,
  opacity: 0.65,
  blending: THREE.AdditiveBlending,
  // alphaMap: loader.load(earthcloudtrans),
});
const earthCloudsMesh = new THREE.Mesh(earthGeometry, earthCloudsMat);
earthCloudsMesh.scale.setScalar(1.003);
earthGroup.add(earthCloudsMesh);

const fresnelMat = getFresnelMat(); // for glowing

const earthGlowMesh = new THREE.Mesh(earthGeometry, fresnelMat);
earthGlowMesh.scale.setScalar(1.005);
earthGroup.add(earthGlowMesh);

////////////////////////// MERCURY //////////////////////////

const mercuryGroup = new THREE.Group();
mercuryGroup.rotation.y = 0.01 * Math.PI / 180;
mercuryGroup.rotation.x = -0.01 * Math.PI / 180;
scene.add(mercuryGroup);

const mercuryGeometry = new THREE.IcosahedronGeometry(0.00033, detail);
const mercuryMaterial = new THREE.MeshPhongMaterial({
  map: loader.load(mercurymap),
  bumpMap: loader.load(mercuryBumpmap),
  bumpScale: 0.8,
}); 

const mercuryMesh = new THREE.Mesh(mercuryGeometry, mercuryMaterial);
mercuryGroup.add(mercuryMesh);

const mercuryNightMat = new THREE.MeshBasicMaterial({
  map: loader.load(mercuryNightmap), 
  blending: THREE.AdditiveBlending,
});
const mercuryNightMesh = new THREE.Mesh(mercuryGeometry, mercuryNightMat);
mercuryGroup.add(mercuryNightMesh);

const fresnelMatMERC = getFresnelMatMERC();
const mercuryGlowMesh = new THREE.Mesh(mercuryGeometry, fresnelMatMERC);
mercuryGlowMesh.scale.setScalar(1.005);
mercuryGroup.add(mercuryGlowMesh);

////////////////////////// VENUS //////////////////////////

const venusGroup = new THREE.Group();
venusGroup.rotation.y = 177.4 * Math.PI / 180;
venusGroup.rotation.x = -177.4 * Math.PI / 180;
scene.add(venusGroup);

const venusGeometry = new THREE.IcosahedronGeometry(0.00081, detail);
const venusMaterial = new THREE.MeshPhongMaterial({
  map: loader.load(venussmap),
});

const venusMesh = new THREE.Mesh(venusGeometry, venusMaterial);
venusGroup.add(venusMesh);

const venusNightMat = new THREE.MeshBasicMaterial({
  map: loader.load(venusNightmap), 
  blending: THREE.AdditiveBlending,
});
const venusNightMesh = new THREE.Mesh(venusGeometry, venusNightMat);
venusGroup.add(venusNightMesh);

const venusCloudsMat = new THREE.MeshStandardMaterial({
  map: loader.load(venusClouds),
  blending: THREE.AdditiveBlending,
  // alphaMap: loader.load(earthcloudtrans),
});
const venusCloudsMesh = new THREE.Mesh(venusGeometry, venusCloudsMat);
venusCloudsMesh.scale.setScalar(1.005);
venusGroup.add(venusCloudsMesh);

const fresnelMatVEN = getFresnelMatVEN();
const venusGlowMesh = new THREE.Mesh(venusGeometry, fresnelMatVEN);
venusGlowMesh.scale.setScalar(1.005);
venusGroup.add(venusGlowMesh);

venusGroup.position.set(-6, 0, 0);
////////////////////////// MARS //////////////////////////
const marsGroup = new THREE.Group();
marsGroup.rotation.y = 25.19 * Math.PI / 180;
marsGroup.rotation.x = -25.19 * Math.PI / 180;
scene.add(marsGroup);

const marsGeometry = new THREE.IcosahedronGeometry(0.00045, detail);
const marsMaterial = new THREE.MeshPhongMaterial({
  map: loader.load(marsmap),
  bumpMap: loader.load(marsbump),
  bumpScale: 2.5,
});

const marsMesh = new THREE.Mesh(marsGeometry, marsMaterial);
marsGroup.add(marsMesh);

const marsNightlightsMat = new THREE.MeshBasicMaterial({
  map: loader.load(marslights),
  blending: THREE.AdditiveBlending,
});
const marsNightlightsMesh = new THREE.Mesh(marsGeometry, marsNightlightsMat);
marsGroup.add(marsNightlightsMesh);

const marsCloudsMat = new THREE.MeshStandardMaterial({
  map: loader.load(marsclouds),
  blending: THREE.AdditiveBlending,
});
const marsCloudsMesh = new THREE.Mesh(marsGeometry, marsCloudsMat);
marsCloudsMesh.scale.setScalar(1.003);
marsGroup.add(marsCloudsMesh);

const fresnelMatMARS = getFresnelMatMARS();
const marsGlowMesh = new THREE.Mesh(marsGeometry, fresnelMatMARS);
marsGlowMesh.scale.setScalar(1.005);
marsGroup.add(marsGlowMesh);

marsGroup.position.set(6, 0, 0);
////////////////////////// SATURN //////////////////////////
const saturnGroup = new THREE.Group();


saturnGroup.rotation.y = 26.73 * Math.PI / 180;
saturnGroup.rotation.x = -26.73 * Math.PI / 180;
scene.add(saturnGroup);

const saturnGeometry = new THREE.IcosahedronGeometry(1, detail);
const saturnMaterial = new THREE.MeshPhongMaterial({
  map: loader.load(saturnmap),
  bumpMap: loader.load(saturnbump),
  bumpScale: 3,
});

const saturnMesh = new THREE.Mesh(saturnGeometry, saturnMaterial);
saturnGroup.add(saturnMesh);

const saturnNightlightsMat = new THREE.MeshBasicMaterial({
  map: loader.load(saturnlights),
  blending: THREE.AdditiveBlending,
});
const saturnNightlightsMesh = new THREE.Mesh(saturnGeometry, saturnNightlightsMat);
saturnGroup.add(saturnNightlightsMesh);

const saturnCloudsMat = new THREE.MeshStandardMaterial({
  map: loader.load(saturnclouds),
  transparent: true,
  opacity: 0.4,
  blending: THREE.AdditiveBlending,
});
const saturnCloudsMesh = new THREE.Mesh(saturnGeometry, saturnCloudsMat);
saturnCloudsMesh.scale.setScalar(1.01);
saturnGroup.add(saturnCloudsMesh);

const fresnelMatSAT = getFresnelMatSAT();
const saturnGlowMesh = new THREE.Mesh(saturnGeometry, fresnelMatSAT);
saturnGlowMesh.scale.setScalar(1.011);
saturnGroup.add(saturnGlowMesh);

// RING

const saturnRingGeometry = new THREE.RingGeometry(1, 2.5, 64);
const saturnRingMaterial = new THREE.MeshBasicMaterial({
  map: loader.load(saturnrings),
  color: 0xffffff,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0.5,
});

const saturnRingMesh = new THREE.Mesh(saturnRingGeometry, saturnRingMaterial);

saturnRingMesh.rotation.x = -Math.PI / 2.25;

saturnGroup.add(saturnRingMesh);
saturnGroup.scale.set(0.0078, 0.0078, 0.0078);

////////////////////////// URANUS //////////////////////////

const uranusGroup = new THREE.Group();
uranusGroup.rotation.y = 97.77 * Math.PI / 180;
uranusGroup.rotation.x = -97.77 * Math.PI / 180;
scene.add(uranusGroup);

const uranusGeometry = new THREE.IcosahedronGeometry(1, detail);
const uranusMaterial = new THREE.MeshPhongMaterial({
  map: loader.load(uranusmap),
});

const uranusMesh = new THREE.Mesh(uranusGeometry, uranusMaterial);
uranusGroup.add(uranusMesh);

const uranusNightlightsMat = new THREE.MeshBasicMaterial({
  map: loader.load(uranuslights),
  blending: THREE.AdditiveBlending,
});
const uranusNightlightsMesh = new THREE.Mesh(uranusGeometry, uranusNightlightsMat);
uranusGroup.add(uranusNightlightsMesh);

const fresnelMatURA = getFresnelMatURA();
const uranusGlowMesh = new THREE.Mesh(uranusGeometry, fresnelMatURA);
uranusGlowMesh.scale.setScalar(1.005);
uranusGroup.add(uranusGlowMesh);

// RING
const uranusRingGeometry = new THREE.RingGeometry(1, 2.5, 64);
const uranusRingMaterial = new THREE.MeshBasicMaterial({
  map: loader.load(uranusrings),
  color: 0xffffff,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0.35,
});

const uranusRingMesh = new THREE.Mesh(uranusRingGeometry, uranusRingMaterial);
uranusRingMesh.rotation.y = Math.PI / 2;

uranusGroup.add(uranusRingMesh);
uranusGroup.scale.set(0.0034, 0.0034, 0.0034);

////////////////////////// NEPTUNE //////////////////////////
const neptuneGroup = new THREE.Group();
neptuneGroup.rotation.y = 28.32 * Math.PI / 180;
neptuneGroup.rotation.x = -28.32 * Math.PI / 180;
scene.add(neptuneGroup);

const neptuneGeometry = new THREE.IcosahedronGeometry(1, detail);
const neptuneMaterial = new THREE.MeshPhongMaterial({
  map: loader.load(neptunemap),
  bumpMap: loader.load(neptunebump),
  bumpScale: 1.5,
});

const neptuneMesh = new THREE.Mesh(neptuneGeometry, neptuneMaterial);
neptuneGroup.add(neptuneMesh);

const neptuneNightlightsMat = new THREE.MeshBasicMaterial({
  map: loader.load(neptunelights),
  blending: THREE.AdditiveBlending,
});
const neptuneNightlightsMesh = new THREE.Mesh(neptuneGeometry, neptuneNightlightsMat);
neptuneGroup.add(neptuneNightlightsMesh);

const neptuneCloudsMat = new THREE.MeshStandardMaterial({
  map: loader.load(neptuneclouds),
  transparent: true,
  opacity: 1,
  blending: THREE.AdditiveBlending,
});
const neptuneCloudsMesh = new THREE.Mesh(neptuneGeometry, neptuneCloudsMat);
neptuneCloudsMesh.scale.setScalar(1.01);
neptuneGroup.add(neptuneCloudsMesh);

const fresnelMatNEP = getFresnelMatNEP();
const neptuneGlowMesh = new THREE.Mesh(neptuneGeometry, fresnelMatNEP);
neptuneGlowMesh.scale.setScalar(1.005);
neptuneGroup.add(neptuneGlowMesh);

// RING
const neptuneRingGeometry = new THREE.RingGeometry(1, 2.5, 64);
const neptuneRingMaterial = new THREE.MeshBasicMaterial({
  map: loader.load(neptunerings),
  color: 0xffffff,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0.35,
});

const neptuneRingMesh = new THREE.Mesh(neptuneRingGeometry, neptuneRingMaterial);

neptuneGroup.add(neptuneRingMesh);
neptuneGroup.scale.set(0.0033, 0.0033, 0.0033);

///////////////////////////// SUN ///////////////////////////

const sunGroup = new THREE.Group();
scene.add(sunGroup);

sunGroup.rotation.y = 7.25 * Math.PI / 180;
sunGroup.rotation.x = -7.25 * Math.PI / 180;

const sunGeometry = new THREE.IcosahedronGeometry(0.093, detail);
const sunMaterial = new THREE.MeshBasicMaterial({
  map: loader.load(sunMap)
})

const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
sunGroup.add(sunMesh);

/*
const sunfluidMaterial = new THREE.MeshBasicMaterial({
  map: loader.load(sunFluid),
  transparent: true,
  opacity: 1,
})

const sunfluidMesh = new THREE.Mesh(sunGeometry, sunfluidMaterial);
sunGroup.add(sunfluidMesh);
sunfluidMesh.scale.setScalar(1.015);
*/

const sunlight = new THREE.PointLight( 0xffffff, 2.5, 500, 0, 0, 0);
sunGroup.add(sunlight);


sunGroup.position.set(0, 0, 0);

//

planetGroupArr.push(mercuryGroup); // Mercury
planetGroupArr.push(venusGroup);   // Venus
planetGroupArr.push(earthGroup);    // Earth
planetGroupArr.push(marsGroup);     // Mars
planetGroupArr.push(jupiterGroup);  // Jupiter
planetGroupArr.push(saturnGroup);   // Saturn
planetGroupArr.push(uranusGroup);   // Uranus
planetGroupArr.push(neptuneGroup);   // Neptune

//

/////////////////////////////////////// BLOOM ////////////////////////////////////// 

/*
const BLOOM_SCENE = 1;

			const bloomLayer = new THREE.Layers();
			bloomLayer.set( BLOOM_SCENE );

            const darkMaterial = new THREE.MeshBasicMaterial( { color: 'black' } );
			const materials = {};

            const renderScene = new RenderPass( scene, camera );

			const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 0.8, 0.36, 0.27);

			const bloomComposer = new EffectComposer( renderer );
			bloomComposer.renderToScreen = false;
			bloomComposer.addPass( renderScene );
			bloomComposer.addPass( bloomPass );

			const mixPass = new ShaderPass(
				new THREE.ShaderMaterial( {
					uniforms: {
						baseTexture: { value: null },
						bloomTexture: { value: bloomComposer.renderTarget2.texture }
					},
					vertexShader: document.getElementById( 'vertexshader' ).textContent,
					fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
					defines: {}
				} ), 'baseTexture'
			);
			mixPass.needsSwap = true;

			const outputPass = new OutputPass();

			const finalComposer = new EffectComposer( renderer );
			finalComposer.addPass( renderScene );
			finalComposer.addPass( mixPass );
			finalComposer.addPass( outputPass );

sunMesh.layers.enable(BLOOM_SCENE);
*/

/*                                       DAT.GUI FOR THE SUN
import * as dat from 'dat.gui';

// Create a GUI instance
const gui = new dat.GUI();

// Add folder for bloom settings
const bloomFolder = gui.addFolder('Bloom Settings');

// Add controls for bloom parameters
const bloomParams = {
    intensity: bloomPass.strength,
    radius: bloomPass.radius,
    threshold: bloomPass.threshold
};

// Intensity control
bloomFolder.add(bloomParams, 'intensity', 0, 3).onChange(value => {
    bloomPass.strength = value;
});

// Radius control
bloomFolder.add(bloomParams, 'radius', 0, 2).onChange(value => {
    bloomPass.radius = value;
});

// Threshold control
bloomFolder.add(bloomParams, 'threshold', 0, 1).onChange(value => {
    bloomPass.threshold = value;
});


// Open the bloom settings folder by default
bloomFolder.open();
*/

////////////// REAL-TIME SIMULATOR AND ORBIT /////////////////////////


const orbits = [];

// Julian date calculation
let currentJulianDate = getJulianDate();
function getJulianDate() {
    const now = new Date();
    return now.getTime() / 86400000.0 + 2440587.5;
}

// Class to define a planet's orbital trajectory
class Trajectory {
    constructor(name, smA, oI, oE, aN, lP, mAe, Sidereal) {
        this.name = name;
        this.smA = smA * 10;   // Semi-major axis in AU (Multiply by 10 inside the function for scale)
        this.oI = oI * DEG2RAD;   // Orbital inclination (degrees to radians)
        this.oE = oE;    // Orbital eccentricity
        this.aN = aN * DEG2RAD;   // Longitude of ascending node (degrees to radians)
        this.lP = lP * DEG2RAD; // Longitude of perihelion (degrees to radians)

        this.aP = this.lP - this.aN;   // Argument of perihelion (radians)

        this.period = Sidereal / 365.256;    // Sidereal period (days to years)
        this.epochMeanAnomaly = mAe * DEG2RAD; // Mean anomaly at epoch (degrees to radians)
        this.trueAnomaly = 0;
        this.position = [0, 0, 0];
        this.time = 0;
    }

    propagate(uA) {
        const pos = [];
        const theta = uA;
        const smA = this.smA;
        const oI = this.oI;
        const aP = this.aP;
        const oE = this.oE;
        const aN = this.aN;

        const sLR = smA * (1 - oE ** 2);
        const r = sLR / (1 + oE * Math.cos(theta));

        pos[0] = r * (Math.cos(aP + theta) * Math.cos(aN) - Math.cos(oI) * Math.sin(aP + theta) * Math.sin(aN)); // X
        pos[1] = r * Math.sin(aP + theta) * Math.sin(oI); // Y
        pos[2] = r * (Math.cos(aP + theta) * Math.sin(aN) + Math.cos(oI) * Math.sin(aP + theta) * Math.cos(aN)); // Z

        return pos;
    }
}

const planetDataList = [
  {
      name: 'Mercury',
      elements: new Trajectory('Mercury', 0.387, 7.004, 0.2056, 48.33, 77.46, 174.796, 87.969),
      color: 0xF6C8A4
  },
  {
      name: 'Venus',
      elements: new Trajectory('Venus', 0.723, 3.395, 0.0068, 76.68069, 131.53298, 50.115, 224.701),
      color: 0xA2C2E2
  },
  {
      name: 'Earth',
      elements: new Trajectory('Earth', 1, 0, 0.01671022, -11.26064, 102.94719, 100.46435, 362.256),
      color: 0xA3D9A5
  },
  {
      name: 'Mars',
      elements: new Trajectory('Mars', 1.524, 1.848, 0.0935, 49.57854, 336.04084, 19.412, 686.980),
      color: 0xF5A9B8
  },
  {
      name: 'Jupiter',
      elements: new Trajectory('Jupiter', 5.204, 1.304, 0.0487, 100.55615, 14.75385, 20.0209, 4332.589),
      color: 0xB2E0D3
  },
  {
      name: 'Saturn',
      elements: new Trajectory('Saturn', 9.573, 2.486, 0.0520, 113.71504, 92.43194, 317.0205, 10759.22),
      color: 0xF5EAB3
  },
  {
      name: 'Uranus',
      elements: new Trajectory('Uranus', 19.165, 0.770, 0.0469, 74.22988, 170.96424, 142.5903, 30685.4),
      color: 0xD6A6E2
  },
  {
      name: 'Neptune',
      elements: new Trajectory('Neptune', 30.181, 1.770, 0.0097, 131.72, 44.97, 304.8801, 60189),
      color: 0xF6B2A4
  }
];

traceOrbits();

function updatePosition(trajectory, timeIncrement) {
  trajectory.time += timeIncrement;
  const meanAnomaly = trajectory.epochMeanAnomaly + (2 * Math.PI / (trajectory.period * 365.25)) * trajectory.time;

  // Calculate the eccentric anomaly and true anomaly
  const eccAnomaly = meanToEccentricAnomaly(trajectory.oE, meanAnomaly);
  const trueAnomaly = eccentricToTrueAnomaly(trajectory.oE, eccAnomaly);

  // Get the planet's position based on the true anomaly
  const position = trajectory.propagate(trueAnomaly);
  return position;
}

// Function to calculate eccentric anomaly from mean anomaly
function meanToEccentricAnomaly(e, M) {
  let E = M;
  let deltaE;
  do {
      deltaE = (M - (E - e * Math.sin(E))) / (1 - e * Math.cos(E));
      E += deltaE;
  } while (Math.abs(deltaE) > 1e-6);
  return E;
}

// Function to calculate true anomaly from eccentric anomaly
function eccentricToTrueAnomaly(e, E) {
  return 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2));
}

// Function to trace the orbits of planets
function traceOrbits() {
  for (const planet of planetDataList) {
      const points = [];
      let anomaly = 0;

      // Loop to generate points for the entire orbit
      while (anomaly <= 2 * Math.PI) {
          const orbPos = planet.elements.propagate(anomaly);
          points.push(new THREE.Vector3(orbPos[0], orbPos[1], orbPos[2]));
          anomaly += Math.PI / 180; // Increment anomaly by 1 degree in radians
      }

      // Create orbit geometry from the points
      const orbitGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const orbitMaterial = new THREE.LineBasicMaterial({ color: planet.color, transparent: true, opacity: 0.1 });
      const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
      scene.add(orbitLine);
      orbits.push(orbitLine);
  }
}

////////////////////////////////////// LABELS
const labels = [];

const labelColor = { r: 255, g: 255, b: 255, a: 1 }; // WHITE

// associatedNumber = 2.5 * size 
// 4 for saturn and uranus and neptune


var sunSprite = createPlanetLabel("SUN", 72, labelColor);
sunSprite.name = "SUN";
scene.add(sunSprite);
sunSprite.associatedGroup = sunGroup;
sunSprite.associatedNumber = 0.2325;
sunGroup.description = "A massive, glowing sphere of hot plasma at the center of the solar system. It generates energy through nuclear fusion, producing light and heat that sustains life on Earth. Its gravity holds the planets in orbit. The Sun is so vast that it accounts for about 99.8% of the total mass of the solar system.";
sunGroup.mass = "1,988,400";
sunGroup.radius = "695,700 km";
sunGroup.orbitalPeriod = "230 million years";
sunGroup.factLink = "https://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html";
sunSprite.position.y += 0.5;

var mercurySprite = createPlanetLabel("MERCURY", 72, labelColor);
mercurySprite.name = "MERCURY";
scene.add(mercurySprite);
mercurySprite.associatedGroup = mercuryGroup;
mercurySprite.associatedNumber = 0.000825;
mercuryGroup.description = "The closest planet to the Sun, Mercury has a rocky surface with extreme temperature variations between day and night. It lacks an atmosphere substantial enough to retain heat, and its surface is heavily cratered, resembling Earth's Moon. Despite its small size, Mercury has a significant gravitational pull that affects nearby celestial bodies.";
mercuryGroup.mass = "0.33010";
mercuryGroup.radius = "2439.7	km";
mercuryGroup.orbitalPeriod = "88 days";
mercuryGroup.factLink = "https://nssdc.gsfc.nasa.gov/planetary/factsheet/mercuryfact.html";

var venusSprite = createPlanetLabel("VENUS", 72, labelColor);
venusSprite.name = "VENUS";
scene.add(venusSprite);
venusSprite.associatedGroup = venusGroup;
venusSprite.associatedNumber = 0.002025;
venusGroup.description = "Often called Earth's twin due to its similar size and composition, Venus has a thick, toxic atmosphere primarily composed of carbon dioxide, with clouds of sulfuric acid. It experiences a runaway greenhouse effect, making it the hottest planet in the solar system. Venus also rotates in the opposite direction of most planets, meaning the Sun rises in the west and sets in the east.";
venusGroup.mass = "4.8673";
venusGroup.radius = "6051.8 km";
venusGroup.orbitalPeriod = "225 days";
venusGroup.factLink = "https://nssdc.gsfc.nasa.gov/planetary/factsheet/venusfact.html";

var earthSprite = createPlanetLabel("EARTH", 72, labelColor);
earthSprite.name = "EARTH";
scene.add(earthSprite);
earthSprite.associatedGroup = earthGroup;
earthSprite.associatedNumber = 0.002125;
earthGroup.description = "The only planet known to support life, Earth has a balanced atmosphere of nitrogen, oxygen, and other gases. It has vast oceans, diverse ecosystems, and a dynamic climate, with active geological processes such as plate tectonics. Earth's magnetic field, generated by its core, helps protect the planet from harmful solar radiation.";
earthGroup.mass = "5.9722";
earthGroup.radius = "6371 km";
earthGroup.orbitalPeriod = "365 days";
earthGroup.factLink = "https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html";

var marsSprite = createPlanetLabel("MARS", 72, labelColor);
marsSprite.name = "MARS";
scene.add(marsSprite);
marsSprite.associatedGroup = marsGroup;
marsSprite.associatedNumber = 0.001125;
marsGroup.description = "Known as the Red Planet due to its iron oxide-rich surface, Mars has a thin atmosphere and polar ice caps. Its surface features include the largest volcano and one of the longest canyon systems in the solar system. Scientists believe that Mars once had liquid water on its surface, raising the possibility of ancient life.";
marsGroup.mass = "0.64169";
marsGroup.radius = "3389.5 km";
marsGroup.orbitalPeriod = "687 days";
marsGroup.factLink = "https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html";

var jupiterSprite = createPlanetLabel("JUPITER", 72, labelColor);
jupiterSprite.name = "JUPITER";
scene.add(jupiterSprite);
jupiterSprite.associatedGroup = jupiterGroup;
jupiterSprite.associatedNumber = 0.02325;
jupiterGroup.description = "The largest planet, Jupiter is a gas giant primarily composed of hydrogen and helium. It has a thick atmosphere with colorful cloud bands and storms, including the Great Red Spot, a massive, long-lasting storm. It also has a strong magnetic field. Jupiter’s 95 known moons include Ganymede, the largest moon in the solar system.";
jupiterGroup.mass = "1,898.13";
jupiterGroup.radius = "69,911 km";
jupiterGroup.orbitalPeriod = "4,333 days";
jupiterGroup.factLink = "https://nssdc.gsfc.nasa.gov/planetary/factsheet/jupiterfact.html";

var saturnSprite = createPlanetLabel("SATURN", 72, labelColor);
saturnSprite.name = "SATURN";
scene.add(saturnSprite);
saturnSprite.associatedGroup = saturnGroup;
saturnSprite.associatedNumber = 0.0312;
saturnGroup.description = "Famous for its extensive and bright ring system, Saturn is another gas giant composed largely of hydrogen and helium. Its rings are made up of ice, rock, and dust particles, and it has many moons, including Titan, which has a dense atmosphere. Despite its massive size, Saturn is the least dense planet, so light it could float in water.";
saturnGroup.mass = "568.32";
saturnGroup.radius = "58,232 km";
saturnGroup.orbitalPeriod = "10,759 days";
saturnGroup.factLink = "https://nssdc.gsfc.nasa.gov/planetary/factsheet/saturnfact.html";

var uranusSprite = createPlanetLabel("URANUS", 72, labelColor);
uranusSprite.name = "URANUS";
scene.add(uranusSprite);
uranusSprite.associatedGroup = uranusGroup;
uranusSprite.associatedNumber = 0.0136;
uranusGroup.description = "An ice giant with a pale blue-green color due to methane in its atmosphere, Uranus has a unique rotation, with its axis tilted sideways. It has faint rings and a cold, featureless atmosphere. Uranus also experiences extreme seasonal changes, with each pole facing 42 years of continuous sunlight followed by 42 years of darkness.";
uranusGroup.mass = "86.811";
uranusGroup.radius = "25,362 km";
uranusGroup.orbitalPeriod = "30,687 days";
uranusGroup.factLink = "https://nssdc.gsfc.nasa.gov/planetary/factsheet/uranusfact.html";

var neptuneSprite = createPlanetLabel("NEPTUNE", 72, labelColor);
neptuneSprite.name = "NEPTUNE";
scene.add(neptuneSprite);
neptuneSprite.associatedGroup = neptuneGroup;
neptuneSprite.associatedNumber = 0.0132;
neptuneGroup.description = "The farthest ice giant, Neptune has a deep blue color also caused by methane. Its atmosphere is more dynamic than Uranus, with strong winds and storms. Neptune's moon Triton is geologically active and orbits the planet in the opposite direction of its rotation. Neptune has the fastest winds in the solar system, reaching speeds over 1,200 miles per hour.";
neptuneGroup.mass = "102.409";
neptuneGroup.radius = "24,622 km";
neptuneGroup.orbitalPeriod = "60,190 days";
neptuneGroup.factLink = "https://nssdc.gsfc.nasa.gov/planetary/factsheet/neptunefact.html";

labels.forEach(object => {
  object.introplayed = false;
  object.factTracker = 1;
});

function createPlanetLabel(planetName, fontsize, color) {
  return makeTextSprite(planetName, {
      fontsize: fontsize,
      textColor: color
  });
}

function makeTextSprite(message, parameters) {
  if (parameters === undefined) parameters = {};
  var fontface = parameters.hasOwnProperty("fontface") ? parameters["fontface"] : "Verdana";
  var fontsize = parameters.hasOwnProperty("fontsize") ? parameters["fontsize"] : 30;
  var textColor = parameters.hasOwnProperty("textColor") ? parameters["textColor"] : { r: 0, g: 0, b: 0, a: 1.0 };

  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');

  context.font = "Bold " + fontsize + "px " + fontface;
  var metrics = context.measureText(message);
  var textWidth = metrics.width;
  var textHeight = fontsize; 

  canvas.width = textWidth + 20;
  canvas.height = textHeight + 25;

  context.font = "Bold " + fontsize + "px " + fontface;
  context.textAlign = "center"; 
  context.textBaseline = "middle";

  context.fillStyle = "rgba(" + textColor.r + "," + textColor.g + "," + textColor.b + "," + textColor.a + ")";
  context.fillText(message, canvas.width / 2, canvas.height / 2);

  var texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;
  var spriteMaterial = new THREE.SpriteMaterial({ map: texture, useScreenCoordinates: false, depthTest: false });
  var sprite = new THREE.Sprite(spriteMaterial);

  sprite.scale.set(canvas.width / 10, canvas.height / 10, 1);
  labels.push(sprite);
  return sprite;
}


function updateSpriteOpacity(sprite, zoomValue, minZoom, maxZoom) {

  if(fadeOutFlag == true){
    
    labels.forEach(label => {
      gsap.to(label.material, {
        opacity: 0, // fade out all labels
        duration: 3,
      });
    });
    return;

  }

  if (sprite.isHovered) {
    return; // dont update opacity if the sprite is hovered
  }

  

  if (sprite == sunSprite){
    sprite.material.opacity = 0.5;
  }

  let alpha;
  if (zoomValue >= maxZoom) {
    alpha = 0.5; 
  } else if (zoomValue <= minZoom) {
    alpha = 0;
  } else {
    alpha = THREE.MathUtils.mapLinear(zoomValue, maxZoom, minZoom, 0.3, 0);
  }
  sprite.material.opacity = alpha;
}

// TO FIND CURRENT ZOOM LEVEL
var originalDistance = null;
function getControlsZoom() {
    if (originalDistance === null) {
        originalDistance = controls.getDistance();
    }
    
    var zoom = originalDistance / controls.getDistance();
    zoom = Math.round(zoom * 1e4) / 1e4;
    
    return zoom;
}

// USE THIS TO GET THE ZOOM LEVEL IN YOUR CONSOLE
controls.addEventListener('change', function() {
    var zoomValue = getControlsZoom();
    console.log('Zoom:', zoomValue); // Do whatever you want with zoomValue here
});

///////////////////////////////////// CURSOR CONTROLS AND RAYCASTING!!!!!!!!!!!!
let raycaster, mouse;
let hoveredObject = null;
raycaster = new THREE.Raycaster();
mouse = new THREE.Vector2();
window.addEventListener('mousemove', onMouseMove, false);
function onMouseMove(event) {
    // Calculate mouse position in normalized device coordinates (-1 to +1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

// REST IS IN ANIMATE FUNCTION

////////////////// SETTINGS   /////////////////////

const settingsMenu = document.getElementById("settings");
settingsMenu.classList.add('hidden'); // hide

document.getElementById("settingsbutton").addEventListener("click", function() {
  settingsMenu.classList.toggle('hidden'); // toggle the hidden class
});

document.getElementById("closebutton").addEventListener("click", function() {
  settingsMenu.classList.add('hidden'); // hide the settings menu
});

const orbitbutton = document.getElementById('orbitcheck'); 

function updateOrbitVisibility() {
  if (orbitbutton.checked) {
    orbits.forEach(element => {
      element.visible = true;
    });
  } else {
    orbits.forEach(element => {
      element.visible = false;
    });
  }
}

updateOrbitVisibility();
orbitbutton.addEventListener('click', updateOrbitVisibility);

const subbutton = document.getElementById('subcheck'); 
subbutton.addEventListener('click', function() {
  if (!(subbutton.checked)) {
    document.getElementById('subtitle').style.opacity = 0;
  } else {
    document.getElementById('subtitle').style.opacity = 1;
  }
});

const colorblindmenu = document.getElementById('cb');
colorblindmenu.addEventListener('change', function() {
  applyFilter(this.value);
});

function applyFilter(filterType) {
  const body = document.body;

  // Remove any existing filter classes
  body.classList.remove('protanopia', 'deuteranopia', 'tritanopia');

  // Apply the selected filter
  if (filterType === 'protanopia') {
      body.classList.add('protanopia');
  } else if (filterType === 'deuteranopia') {
      body.classList.add('deuteranopia');
  } else if (filterType === 'tritanopia') {
      body.classList.add('tritanopia');
  }
}


//////////////////////////////////////////////// CLICK AND ZOOM /////////////////
let isZooming = false;

window.addEventListener('click', onSpriteClick, false);

const headertitle = document.getElementById("headertext");

const returnbutton = document.getElementById('resetButton');
returnbutton.style.display = 'none';
returnbutton.addEventListener('click', resetCamera);

const planetui = document.getElementById('planetui');
planetui.style.display = 'none';

const prevbutton = document.getElementById('prevbutton');
prevbutton.style.display = 'none';

const nextbutton = document.getElementById('nextbutton');
nextbutton.style.display = 'none';

let clickedLabel = null;
let targetPlanet = null;
let targetPosition = null;
let fadeOutFlag = null;
let currentIndex = null;

function onSpriteClick(event) {

  if(!isZooming || (event.target === prevbutton) || (event.target === nextbutton)){
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(labels);

  if (intersects.length > 0 || (event.target === prevbutton) || (event.target === nextbutton) ) {
    
    if(event.target === prevbutton){
      currentIndex = labels.indexOf(clickedLabel);
      clickedLabel = labels[currentIndex-1];
      currentIndex -=1;
    }
    
    else if(event.target === nextbutton){
      currentIndex = labels.indexOf(clickedLabel);
      clickedLabel = labels[currentIndex+1];
      currentIndex += 1;
    }

    else{
    clickedLabel = intersects[0].object
    currentIndex = labels.indexOf(clickedLabel);
    }
    
    targetPlanet = clickedLabel.associatedGroup;
    targetPosition = targetPlanet.position.clone().add(new THREE.Vector3(0, 0, 0)); // adjust zoom distance
    fadeOutFlag = true;

    document.getElementById("description-value").textContent = targetPlanet.description
    document.getElementById("mass-value").textContent = targetPlanet.mass
    document.getElementById("radius-value").textContent = targetPlanet.radius
    document.getElementById("orbital-period-value").textContent = targetPlanet.orbitalPeriod
    document.getElementById("fact-sheet-link").href = targetPlanet.factLink

    camera.lookAt(targetPlanet.position); // ensure the camera looks at the planet before animation

    if(!((event.target === prevbutton) || (event.target === nextbutton))){
      
      
      gsap.to(camera.position, {
          x: targetPosition.x+clickedLabel.associatedNumber,
          y: targetPosition.y, // adjustable?
          z: targetPosition.z,
          duration: 2, // adjustable duration
          onUpdate: function () {
            controls.update();
            controls2.update();
            controls2.noZoom = true;
            controls.enableRotate = false;
            
            gsap.to(headertitle, { opacity: 0, duration: 0.5 }); // fade out
          },

          onComplete: function(){
            //
            labels.forEach(object => {
              object.visible = false; // HIDE EVERYTHING
            });
            
            if(clickedLabel.introplayed == false){
            playAudio(labels.indexOf(clickedLabel),0);
            clickedLabel.introplayed = true;
            }

            gsap.to(headertitle, { opacity: 1, duration: 1 }); // fade in

            planetui.style.opacity = 0;
            planetui.style.display = '';
            gsap.to(planetui, { opacity: 1, duration: 1 }); // fade in

            prevbutton.style.opacity = 0;
            if(!(currentIndex === 0)){
            prevbutton.style.display = '';
            gsap.to(prevbutton, { opacity: 1, duration: 1 }); // fade in
            }

            nextbutton.style.opacity = 0;
            if(!(currentIndex === labels.length - 1)){
            nextbutton.style.display = '';
            gsap.to(nextbutton, { opacity: 1, duration: 1 }); // fade in
            }

            returnbutton.style.opacity = 0;
            returnbutton.style.display = '';
            gsap.to(returnbutton, { opacity: 1, duration: 1 }); // fade in

            //
              isZooming = true;
              controls.enableRotate = true;
              headertitle.innerText = clickedLabel.name;
          }
      });
      
      gsap.to(controls.target, {
        x: targetPosition.x,
        y: targetPosition.y,
        z: targetPosition.z,
        duration: 1.5,
        onUpdate: function() {
          controls.update();
          controls2.update();
        }
      });
  
    }

    else{

      camera.position.set(targetPosition.x+clickedLabel.associatedNumber,targetPosition.y,targetPosition.z);
      controls.target.copy(targetPosition);
      headertitle.innerText = clickedLabel.name;
      updateButtonVisibility(currentIndex);

      if(audioflag == true){
        if(clickedLabel.introplayed == false){
          audioClip.pause();
          playAudio(labels.indexOf(clickedLabel),0);
          clickedLabel.introplayed = true;
          }
      }
      else{
        if(clickedLabel.introplayed == false){
          playAudio(labels.indexOf(clickedLabel),0);
          clickedLabel.introplayed = true;
          }
      }

    }

  }
  }
}

function updateButtonVisibility() {
  if (currentIndex === 0) {
    prevbutton.style.display = 'none';
  } else {
    prevbutton.style.display = '';
    prevbutton.style.opacity = 1;
  }

  if (currentIndex === labels.length - 1) {
    nextbutton.style.display = 'none';
  } else {
    nextbutton.style.display = '';
    nextbutton.style.opacity = 1;
  }
}

function resetCamera() {

  fadeOutFlag = false;

  isZooming = false;
  controls.maxDistance = Infinity;
  
  gsap.to(headertitle, { opacity: 0, duration: 1 }); // fade out

  gsap.to(planetui, { opacity: 0, duration: 1 }); // fade out

  gsap.to(prevbutton, { opacity: 0, duration: 1 }); // fade out
  prevbutton.style.cursor = 'default';

  gsap.to(nextbutton, { opacity: 0, duration: 1 }); // fade out
  nextbutton.style.cursor = 'default';

  gsap.to(returnbutton, { opacity: 0, duration: 1 }); // fade out
  returnbutton.style.cursor = 'default';

  gsap.to(camera.position, {
      x:15,
      y:5,  // OG CAMERA POSITION
      z:0,
      duration: 3, // adjustable duration
      onUpdate: function () {//
        labels.forEach(object => {
          object.visible = true; // UNHIDE EVERYTHING
        });
        //
        controls.enableRotate = false;
      },
      onComplete: function (){
        
        planetui.style.display = 'none';
        prevbutton.style.display = 'none';
        nextbutton.style.display = 'none';
        returnbutton.style.display = 'none';

        prevbutton.style.cursor = 'pointer';
        nextbutton.style.cursor = 'pointer';
        returnbutton.style.cursor = 'pointer';

        fadeOutFlag = null;
        controls.enableRotate = true;
        controls2.noZoom = false;
        
        gsap.to(headertitle, { opacity: 1, duration: 1 }); // fade in
        headertitle.innerText = "THE SOLAR SYSTEM";
      }
  });
  
  gsap.to(controls.target, {
    x: 0,
    y: 0,
    z: 0,
    duration: 2,
    onUpdate: function() {
      controls.update();
            controls2.update();
    },
  });


  }

/////////////////////////////////////////////////////////////////////////////////

const cloudSpeed = 20e-5;

let previousTime = Date.now();
function animate() {

  const currentTime = Date.now();
  const deltaTime = (currentTime - previousTime) / 1000;
  previousTime = currentTime;
  const timeIncrement = (deltaTime * speedFactor) / 86400;

  // Update positions of each planet
  planetGroupArr.forEach((planetGroup, index) => {
      const planetData = planetDataList[index];
      const position = updatePosition(planetData.elements, timeIncrement);
      planetGroup.position.set(position[0], position[1], position[2]);
      labels[index+1].position.set(position[0], position[1], position[2]);
  });

  if(isZooming){

    targetPosition = targetPlanet.position.clone();

    controls.maxDistance = clickedLabel.associatedNumber;

    controls.target.copy(targetPosition)
    controls2.target.copy(targetPosition)
    controls.update();
    controls2.update();

    }

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(labels);
      
    if (intersects.length > 0) {
      // If hovering over a new object
      const newHoveredObject = intersects[0].object;

      if ((hoveredObject !== newHoveredObject) && (fadeOutFlag == null)) {
          // Change color on hover
          if (hoveredObject) {
              // OG
              hoveredObject.isHovered = false;
          }
          
          // NEW
          newHoveredObject.isHovered = true;
          newHoveredObject.material.opacity = 1;
          newHoveredObject.material.transparent = true;
          document.body.style.cursor = 'pointer'; // Change cursor to pointer
          hoveredObject = newHoveredObject; // Update the hovered object
      }
  } else if (hoveredObject) {
      // OG
      hoveredObject.isHovered = false;
      document.body.style.cursor = 'default'; // Reset cursor to default
      hoveredObject = null; // Clear hovered object
  }

  requestAnimationFrame(animate);

  // for the labels to remain constant
  var scaleFactor = 2.5; // GLOBAL
  var scaleVector = new THREE.Vector3();

  var scale = scaleVector.subVectors(sunSprite.position, camera.position).length() / scaleFactor;
  sunSprite.scale.set(scale * 0.15, scale * 0.1, 1); // adjust size

  var scale = scaleVector.subVectors(mercurySprite.position, camera.position).length() / scaleFactor;
  mercurySprite.scale.set(scale * 0.25, scale * 0.1, 1); // adjust size
  
  scale = scaleVector.subVectors(venusSprite.position, camera.position).length() / scaleFactor;
  venusSprite.scale.set(scale * 0.18, scale * 0.1, 1); // adjust size
  
  scale = scaleVector.subVectors(earthSprite.position, camera.position).length() / scaleFactor;
  earthSprite.scale.set(scale * 0.175, scale * 0.1, 1); // adjust size
  
  scale = scaleVector.subVectors(marsSprite.position, camera.position).length() / scaleFactor;
  marsSprite.scale.set(scale * 0.15, scale * 0.1, 1); // adjust size
  
  scale = scaleVector.subVectors(jupiterSprite.position, camera.position).length() / scaleFactor;
  jupiterSprite.scale.set(scale * 0.225, scale * 0.1, 1); // adjust size
  
  scale = scaleVector.subVectors(saturnSprite.position, camera.position).length() / scaleFactor;
  saturnSprite.scale.set(scale * 0.225, scale * 0.1, 1); // adjust size
  
  scale = scaleVector.subVectors(uranusSprite.position, camera.position).length() / scaleFactor;
  uranusSprite.scale.set(scale * 0.225, scale * 0.1, 1); // adjust size
  
  scale = scaleVector.subVectors(neptuneSprite.position, camera.position).length() / scaleFactor;
  neptuneSprite.scale.set(scale * 0.225, scale * 0.1, 1); // adjust size
  
  // LABEL FADE IN AND OUT
  var zoomValue = getControlsZoom();

  // add 0, find median
  updateSpriteOpacity(mercurySprite, zoomValue, 0.05, 0.5);
  updateSpriteOpacity(venusSprite, zoomValue, 0.005, 0.275);
  updateSpriteOpacity(earthSprite, zoomValue, 0.0005, 0.139);
  updateSpriteOpacity(marsSprite, zoomValue, 0.00005, 0.072);
  updateSpriteOpacity(jupiterSprite, zoomValue, 0.000005, 0.036);
  updateSpriteOpacity(saturnSprite, zoomValue, 0.0000005, 0.018);
  updateSpriteOpacity(uranusSprite, zoomValue, 0.0000005, 0.009);
  updateSpriteOpacity(neptuneSprite, zoomValue, 0.0000005, 0.0045);
  updateSpriteOpacity(sunSprite, zoomValue, 0, 0);

  
  //                                                        cinematic camera controls
  const target = controls.target;
  controls.update();
  controls2.target.set(target.x, target.y, target.z);
  controls2.update();
  

  stars.rotation.y -= 0.0001;

  // rotation around itself
  earthGroup.rotation.y += 0.00007272205 * speedFactor;
  jupiterGroup.rotation.y += 0.00017453293 * speedFactor;
  mercuryGroup.rotation.y += 0.00000125383 * speedFactor;
  venusGroup.rotation.y += 0.00000029927 * speedFactor;
  marsGroup.rotation.y += 0.00007123793 * speedFactor;

  saturnMesh.rotation.y += 0.00016622183 * speedFactor;
  saturnNightlightsMesh.rotation.y += 0.00016622183 * speedFactor;
  saturnCloudsMesh.rotation.y += 0.00016622183 * speedFactor;
  saturnGlowMesh.rotation.y += 0.00016622183 * speedFactor;
    // to prevent ring spin ^ v
  uranusMesh.rotation.y += 0.00016622183 * speedFactor;
  uranusNightlightsMesh.rotation.y += 0.00016622183 * speedFactor;
  uranusGlowMesh.rotation.y += 0.00016622183 * speedFactor;
    // to prevent ring spin ^ v
  neptuneMesh.rotation.y += 0.00010908308 * speedFactor;
  neptuneGlowMesh.rotation.y += 0.00010908308 * speedFactor;
  neptuneCloudsMesh.rotation.y += 0.00010908308 * speedFactor;
  neptuneNightlightsMesh.rotation.y += 0.00010908308 * speedFactor;


  sunGroup.rotation.y += 0.00000269341 * speedFactor;
  
// rotation around the sun


if (earthCloudsMesh) earthCloudsMesh.rotation.y += cloudSpeed;
if (venusCloudsMesh) venusCloudsMesh.rotation.y -= cloudSpeed; // VENUS ROTATES IN OPPOSITE DIRECTION
if (marsCloudsMesh) marsCloudsMesh.rotation.y += cloudSpeed;
if (saturnCloudsMesh) saturnCloudsMesh.rotation.y += cloudSpeed;
if (neptuneCloudsMesh) neptuneCloudsMesh.rotation.y += cloudSpeed;
// if (sunfluidMesh) sunfluidMesh.rotation.y += 0.002;

  /*
  scene.traverse( darkenNonBloomed );
	bloomComposer.render();
  scene.traverse( restoreMaterial );
	// render the entire scene, then render bloom scene on top
	finalComposer.render();
  */

  renderer.render(scene, camera);
}

/*
function darkenNonBloomed( obj ) {

  if ( obj.isMesh && bloomLayer.test( obj.layers ) === false ) {

    materials[ obj.uuid ] = obj.material;
    obj.material = darkMaterial;

  }

}

function restoreMaterial( obj ) {

  if ( materials[ obj.uuid ] ) {

    obj.material = materials[ obj.uuid ];
    delete materials[ obj.uuid ];

  }

}
*/

animate();

function handleWindowResize () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  bloomComposer.setSize(window.innerWidth, window.innerHeight);
  finalComposer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', handleWindowResize, false);