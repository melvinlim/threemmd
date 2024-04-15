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

loadMMD(scene, helper, modelPath, animationPath);

let doInitGUI = function () {
	if (!helper || !helper.objects || !helper.meshes ||
		!helper.objects.get(helper.meshes[0]) ||
		!helper.objects.get(helper.meshes[0]).mixer) {
		setTimeout(doInitGUI, 250);
	} else {
		initGUI(helper, light);
	}
}
doInitGUI();

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