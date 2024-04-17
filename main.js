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
window.addEventListener('resize', function (event) {
	//renderer.setPixelRatio(window.devicePixelRatio);
	//renderer.setSize(window.innerWidth, window.innerHeight);
	//renderer.setSize(renderer.getSize().x, renderer.getSize().y);
}, true);

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

//const FaceAnimationPath = 'mmdanimations/tricolor_motion_kozakuramiru_distribution/tricolor_lip_and_face_motions_by_non/just_face_expressions_YYB_miku.vmd';
const FaceAnimationPath = 'mmdanimations/tricolor_motion_kozakuramiru_distribution/tricolor_lip_and_face_motions_by_non/just_face_expressions_light_blinking_eyes.vmd'
const LipAnimationPath = 'mmdanimations/tricolor_motion_kozakuramiru_distribution/tricolor_lip_and_face_motions_by_non/just_lip_motion_nothing.vmd'

const helper = new MMDAnimationHelper();

const miku1_offset = new THREE.Vector3(10, 0, 0);
const goodMoodLoopPath = 'mmdanimations/good_mood_loop/good_mood_loop_140f_no_movement.vmd'
loadMMD(helper, scene, 'miku1', modelPath, goodMoodLoopPath, miku1_offset);

const miku2_offset = new THREE.Vector3(-10, 0, 0);
const paths = [FaceAnimationPath, LipAnimationPath];
loadMMD(helper, scene, 'miku2', modelPath, paths, miku2_offset);

let miku1, miku2, floor;

const waitForModels = function () {
	if (!scene.getObjectByName('miku1') ||
		!scene.getObjectByName('miku2') ||
		!scene.getObjectByName('checkerboard')) {
		setTimeout(waitForModels, 250);
	} else {
		miku1 = scene.getObjectByName('miku1');
		miku2 = scene.getObjectByName('miku2');
		floor = scene.getObjectByName('checkerboard')
		//the helper.add function called in loadMMD resets all durations to most recent model.
		helper.meshes.forEach(function (mesh) { mesh.animations[0].resetDuration(); });
		helper.objects.get(miku1).mixer._actions[0].setLoop(THREE.LoopPingPong);

		//miku1.position.x += 20;
		if (shadows) {
			floor.receiveShadow = true;
			miku1.castShadow = true;
			miku2.castShadow = true;
		}
	}
}
waitForModels();

const doInitGUI = function () {
	if (!helper || !helper.objects || !helper.meshes ||
		!helper.objects.get(miku2) ||
		!helper.objects.get(miku2).mixer ||
		!helper.objects.get(miku2).physics) {
		setTimeout(doInitGUI, 250);
	} else {
		initGUI(scene, renderer, helper, light);
		const animationPath = 'mmdanimations/tricolor_motion_kozakuramiru_distribution/tricolor-motion-yyb-miku-nt.vmd'
		loadMMDAnimation(helper, miku2, 'danceAnimation', animationPath);
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
