import * as THREE from 'three';

import { MMDAnimationHelper } from 'three/addons/animation/MMDAnimationHelper.js';

import { initGUI } from './gui.js';
import { initCamera } from './camera.js';
import { loadMMDModel } from './mmd.js';
import { loadMMDAnimation } from './mmd.js';
import { loadMMD } from './mmd.js';

//import { MMDPhysics } from 'three/addons/animation/MMDPhysics.js';

import { createCheckerboard } from './misc.js';

//let physics;

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

const animationPath = 'mmdanimations/tricolor_motion_kozakuramiru_distribution/tricolor-motion-yyb-miku-nt.vmd'
//const animationPath = 'mmdanimations/tricolor_motion_kozakuramiru_distribution/tricolor_lip_and_face_motions_by_non/just_face_expressions_YYB_miku.vmd'

const helper = new MMDAnimationHelper();

loadMMD(scene, helper, modelPath, animationPath);

const mmdModels = []
loadMMDModel(scene, mmdModels, modelPath);

let waitForModel = function () {
	if (mmdModels.length==0) {
		setTimeout(waitForModel, 250);
	} else {
		let anotherMiku = mmdModels[0];
		anotherMiku.position.x += 20;
	}
}
waitForModel();

let doInitGUI = function () {
	if (!helper || !helper.objects || !helper.meshes ||
		!helper.objects.get(helper.meshes[0]) ||
		!helper.objects.get(helper.meshes[0]).mixer ||
		!helper.objects.get(helper.meshes[0]).physics) {
		setTimeout(doInitGUI, 250);
	} else {
		initGUI(helper, light);
		//const FaceAnimationPath = 'mmdanimations/tricolor_motion_kozakuramiru_distribution/tricolor_lip_and_face_motions_by_non/just_face_expressions_YYB_miku.vmd';
		const FaceAnimationPath = 'mmdanimations/tricolor_motion_kozakuramiru_distribution/tricolor_lip_and_face_motions_by_non/just_face_expressions_light_blinking_eyes.vmd'
		loadMMDAnimation(helper, helper.meshes[0], FaceAnimationPath);
		const LipAnimationPath = 'mmdanimations/tricolor_motion_kozakuramiru_distribution/tricolor_lip_and_face_motions_by_non/just_lip_motion_nothing.vmd'
		loadMMDAnimation(helper, helper.meshes[0], LipAnimationPath);
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
