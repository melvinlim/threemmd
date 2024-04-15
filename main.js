import * as THREE from 'three';

import { MyGui } from './gui.js';
import { initCamera } from './camera.js';
import { loadMMDModel } from './mmd.js';
import { loadMMDAnimation } from './mmd.js';
import { loadMMD } from './mmd.js';

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
const camera = initCamera(renderer);

renderer.setSize(window.innerWidth, window.innerHeight);

const div = document.getElementById('canvascontainer');
div.appendChild(renderer.domElement);

function createCheckerboard(scene, planeSize) {

	const texLoader = new THREE.TextureLoader();
	const texture = texLoader.load('checker.png');
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	texture.magFilter = THREE.NearestFilter;
	texture.colorSpace = THREE.SRGBColorSpace;
	const repeats = planeSize / 2;
	texture.repeat.set(repeats, repeats);

	const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
	const planeMat = new THREE.MeshPhongMaterial({
		map: texture,
		side: THREE.DoubleSide,
	});
	const mesh = new THREE.Mesh(planeGeo, planeMat);
	mesh.rotation.x = Math.PI * -.5;
	scene.add(mesh);
}
const planeSize = 40;
createCheckerboard(scene, planeSize);

const color = 0xFFFFFF;
const intensity = 1;
const light = new THREE.AmbientLight(color, intensity);
scene.add(light);

const guiContainer = document.getElementById("gui");
const gui = new MyGui(guiContainer, light);

const modelPath = 'mmdmodels/miku4.3/miku4.3.pmx'
//const modelPath = 'mmdmodels/miku-yyb-default/YYB Hatsune Miku_default_1.0ver.pmx'

//const animationPath = 'mmdanimations/トリコロール_モーション_こざくらみる配布/トリコロール_モーション_YYB初音ミクdefault.vmd'
const animationPath = 'mmdanimations/default2.vmd'

//const miku = await loadMMDModel(scene, modelPath);
//const animation = await loadMMDAnimation(miku, animationPath);

const miku = await loadMMD(scene, modelPath, animationPath);
scene.add(miku.mesh);
const mixer = new THREE.AnimationMixer(miku.mesh);
miku.mesh.animations.push(miku.animation);

//mixer.clipAction(miku.animation).play();
const clips = miku.mesh.animations;

clips.forEach(function (clip) {
	mixer.clipAction(clip).play();
});

const clock = new THREE.Clock();
clock.start();

var deltaSeconds;

function animate() {
	requestAnimationFrame( animate );
	//miku.rotation.x += 0.01;
	//miku.rotation.y += 0.01;
	deltaSeconds = clock.getDelta();
	mixer.update(deltaSeconds);
	renderer.render( scene, camera );
}
animate();
