import * as THREE from 'three';

import { MMDAnimationHelper } from 'three/addons/animation/MMDAnimationHelper.js';
import { MMDLoader } from 'three/addons/loaders/MMDLoader.js';

import { initGUI } from './gui.js';
import { initCamera } from './camera.js';
import { loadMMDModel } from './mmd.js';
import { loadMMDAnimation } from './mmd.js';
import { loadMMD } from './mmd.js';

import { MMDPhysics } from 'three/addons/animation/MMDPhysics.js';

import { createCheckerboard } from './misc.js';

let physics;

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
const camera = initCamera(renderer);

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.append(renderer.domElement);


const planeSize = 40;
createCheckerboard(scene, planeSize);

const color = 0xFFFFFF;
const intensity = 1;
const light = new THREE.AmbientLight(color, intensity);
scene.add(light);

const modelPath = 'mmdmodels/miku4.3/miku4.3.pmx'
//const modelPath = 'mmdmodels/miku-yyb-default/YYB Hatsune Miku_default_1.0ver.pmx'

//const animationPath = 'mmdanimations/トリコロール_モーション_こざくらみる配布/トリコロール_モーション_YYB初音ミクdefault.vmd'
const animationPath = 'mmdanimations/default2.vmd'


const helper = new MMDAnimationHelper();

initGUI(helper.enabled, light);

let mmdModel;

const manager = new THREE.LoadingManager();



manager.onStart = function (url, itemsLoaded, itemsTotal) {
	console.log('Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
};

manager.onLoad = function () {
	console.log('Loading complete!');
	//scene.add(mmdModel);

	helper.add(mmdModel.mesh, {
		animation: mmdModel.animation,
		physics: true
	});

	//physics = new MMDPhysics(mmd.mesh)

	scene.add(mmdModel.mesh);
	/*
	new THREE.AudioLoader().load(
		'audios/mmd/song.mp3',
		function (buffer) {

			const listener = new THREE.AudioListener();
			const audio = new THREE.Audio(listener).setBuffer(buffer);

			listener.position.z = 1;

			scene.add(audio);
			scene.add(listener);

		}

	);
*/
};

manager.onProgress = function (url, itemsLoaded, itemsTotal) {
	console.log('Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
};

manager.onError = function (url) {
	console.log('There was an error loading ' + url);
};

// Load MMD resources and add to helper
new MMDLoader(manager).loadWithAnimation(
	modelPath,
	animationPath,
	function (mmd) {

		mmdModel = mmd;
	},
	function (xhr) {
		console.log((xhr.loaded / xhr.total * 100) + '% loaded');
	},
	function (error) {
		console.log('An error happened');
	}
);

const clock = new THREE.Clock();
clock.start();

let delta;

function render() {

	delta = clock.getDelta();

	helper.update(delta);
	//if (physics !== undefined) physics.update(delta);

	renderer.render(scene, camera);
}

function animate() {
	requestAnimationFrame(animate);
	render();
}
animate();

//const miku = await loadMMDModel(scene, modelPath);
//const animation = await loadMMDAnimation(miku, animationPath);
/*
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
*/