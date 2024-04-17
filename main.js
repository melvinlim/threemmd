import * as THREE from 'three';

import { MMDAnimationHelper } from 'three/addons/animation/MMDAnimationHelper.js';

import { initGUI } from './gui.js';
import { initCamera } from './camera.js';
import { loadMMDModel } from './mmd.js';
import { loadMMDAnimation } from './mmd.js';
import { loadMMD } from './mmd.js';

//import { MMDPhysics } from 'three/addons/animation/MMDPhysics.js';

import { createCheckerboard } from './misc.js';

const shadows = true;
//let physics;

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
const camera = initCamera(renderer);

if (shadows) {
	renderer.shadowMap.enabled = true;
}

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.append(renderer.domElement);

const planeSize = 40;
createCheckerboard(scene, planeSize);

const color = 0xFFFFFF;
//const intensity = 1;
//const light = new THREE.AmbientLight(color, intensity);
const intensity = 500;
const light = new THREE.PointLight(color, intensity);
light.position.set(20, 20, 20);

if (shadows) {
	light.castShadow = true;
}

scene.add(light);

const modelPath = 'mmdmodels/miku4.3/miku4.3.pmx'
//const modelPath = 'mmdmodels/miku-yyb-default/YYB Hatsune Miku_default_1.0ver.pmx'

const animationPath = 'mmdanimations/tricolor_motion_kozakuramiru_distribution/tricolor-motion-yyb-miku-nt.vmd'
//const animationPath = 'mmdanimations/tricolor_motion_kozakuramiru_distribution/tricolor_lip_and_face_motions_by_non/just_face_expressions_YYB_miku.vmd'

const helper = new MMDAnimationHelper();

loadMMDModel(scene, 'miku1', modelPath);
loadMMD(helper, scene, 'miku2', modelPath, animationPath);
let miku1, miku2, floor;

const waitForModel = function () {
	if (!scene.getObjectByName('miku1') ||
		!scene.getObjectByName('miku2')) {
		setTimeout(waitForModel, 250);
	} else {
		miku1 = scene.getObjectByName('miku1');
		miku1.position.x += 20;
		if (shadows) {
			floor = scene.getObjectByName('checkerboard')
			floor.receiveShadow = true;
			miku1.castShadow = true;
			miku2 = scene.getObjectByName('miku2');
			miku2.castShadow = true;
		}
	}
}
waitForModel();

const doInitGUI = function () {
	if (!helper || !helper.objects || !helper.meshes ||
		!helper.objects.get(miku2) ||
		!helper.objects.get(miku2).mixer ||
		!helper.objects.get(miku2).physics) {
		setTimeout(doInitGUI, 250);
	} else {
		initGUI(scene, renderer, helper, light);
		//const FaceAnimationPath = 'mmdanimations/tricolor_motion_kozakuramiru_distribution/tricolor_lip_and_face_motions_by_non/just_face_expressions_YYB_miku.vmd';
		const FaceAnimationPath = 'mmdanimations/tricolor_motion_kozakuramiru_distribution/tricolor_lip_and_face_motions_by_non/just_face_expressions_light_blinking_eyes.vmd'
		loadMMDAnimation(helper, miku2, FaceAnimationPath);
		const LipAnimationPath = 'mmdanimations/tricolor_motion_kozakuramiru_distribution/tricolor_lip_and_face_motions_by_non/just_lip_motion_nothing.vmd'
		loadMMDAnimation(helper, miku2, LipAnimationPath);
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
