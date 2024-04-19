import * as THREE from 'three';

import { MMDAnimationHelper } from 'three/addons/animation/MMDAnimationHelper.js';

import { initGUI } from './gui.js';
import { initCamera } from './camera.js';
import { loadMMDModel } from './mmd.js';
import { loadMMDAnimation } from './mmd.js';
import { loadMMDCamera } from './mmd.js';
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
	renderer.setSize(window.innerWidth, window.innerHeight);
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
}, true);

document.body.append(renderer.domElement);

const timeOutDelay = 100;

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
const FaceAnimationPath = 'mmdanimations/tricolor_motion_kozakuramiru_distribution/tricolor_lip_and_face_motions_by_non/just_face_expressions_light_blinking_eyes.vmd';
const LipAnimationPath = 'mmdanimations/tricolor_motion_kozakuramiru_distribution/tricolor_lip_and_face_motions_by_non/just_lip_motion_nothing.vmd';

const helper = new MMDAnimationHelper();
helper.configuration.resetPhysicsOnLoop = false;
helper.enabled.cameraAnimation = false;

const miku1_offset = new THREE.Vector3(10, 0, 0);
const goodMoodLoopPath = 'mmdanimations/good_mood_loop/good_mood_loop_140f_no_movement.vmd';
const waitingLoopPath = 'mmdanimations/waiting_loop/waiting_465f.vmd'
//loadMMD(helper, scene, 'miku1', modelPath, goodMoodLoopPath, miku1_offset);
loadMMD(helper, scene, 'miku1', modelPath, 'wait', waitingLoopPath, miku1_offset);

const miku2_offset = new THREE.Vector3(-10, 0, 0);
//const singingPaths = [FaceAnimationPath, LipAnimationPath];
loadMMD(helper, scene, 'miku2', modelPath, 'face', FaceAnimationPath, miku2_offset);
//loadMMDModel does not work because helper.mixer is never created and set up.
//i could create helper.mixer manually in loadMMDModel, but it wouldn't be configured...
//not doing it for now because it's a hassle to implement.
//loadMMDModel(helper, scene, 'miku2', modelPath, miku2_offset);

const cameraAnimationPath = 'mmdanimations/tricolor_motion_kozakuramiru_distribution/tricolor-camera-yyb-miku-nt.vmd';
loadMMDCamera(helper, camera, 'camera', cameraAnimationPath);

let miku1, miku2, floor;

const waitForModels = function () {
	if (!scene.getObjectByName('miku1') ||
		!scene.getObjectByName('miku2') ||
		!scene.getObjectByName('checkerboard')) {
		setTimeout(waitForModels, timeOutDelay);
	} else {
		miku1 = scene.getObjectByName('miku1');
		miku2 = scene.getObjectByName('miku2');
		floor = scene.getObjectByName('checkerboard');
		if (shadows) {
			floor.receiveShadow = true;
			miku1.castShadow = true;
			miku2.castShadow = true;
		}
	}
}
waitForModels();

const waitForModel = function () {
	if (!helper || !helper.objects || !helper.meshes ||
		!helper.objects.get(miku2) ||
		!helper.objects.get(miku2).mixer) {
		setTimeout(waitForModel, timeOutDelay);
	} else {
		const animationPath = 'mmdanimations/tricolor_motion_kozakuramiru_distribution/tricolor-motion-yyb-miku-nt.vmd'
		loadMMDAnimation(helper, miku2, 'dance', animationPath);
		loadMMDAnimation(helper, miku2, 'wait', waitingLoopPath);
		loadMMDAnimation(helper, miku2, 'happy', goodMoodLoopPath);
		loadMMDAnimation(helper, miku2, 'sing', LipAnimationPath);
	}
}
waitForModel();

const mixers = {};

function fadeToAction(action1, action2, duration) {
	action1.repetitions = 0;
	action1.fadeOut(duration);
	action2
		.reset()
		.setEffectiveTimeScale(1)
		.setEffectiveWeight(1)
		.fadeIn(duration)
		.play();
}

function loopCallback(ev) {
	console.log('looped: ' + ev.action._clip.name)
}
function finishedCallback(ev) {
	console.log('finished: ' + ev.action._clip.name)
	if (ev.action._clip.name == 'dance') {
		mixers['miku2'].existingAction('wait').setLoop(THREE.LoopRepeat, Infinity);
		fadeToAction(mixers['miku2'].existingAction('dance'), mixers['miku2'].existingAction('wait'), 20);
	}
}
const waitForAnimations = function () {
	if (!miku2 || miku2.animations.length < 5 ||
		!helper.objects.get(miku2).mixer
	) {
		setTimeout(waitForAnimations, timeOutDelay);
	} else {
		if (helper.objects.get(camera)) {
			helper.objects.get(camera).mixer._actions[0].reset();
			//helper.objects.get(camera).mixer._actions[0].stop();
		}
		miku1.visible = true;
		miku2.visible = true;
		mixers['miku1'] = helper.objects.get(miku1).mixer;
		mixers['miku2'] = helper.objects.get(miku2).mixer;
		mixers['camera'] = helper.objects.get(camera).mixer;
		mixers['miku2'].existingAction('face').play();
		mixers['miku2'].existingAction('sing').play();
		mixers['miku2'].existingAction('wait').stop();
		//mixers['miku2'].existingAction('wait').play();
		//mixers['miku2'].existingAction('dance').stop();
		//mixers['miku2'].existingAction('dance').reset();
		mixers['miku2'].existingAction('dance').play();
		mixers['miku2'].existingAction('happy').stop();
		//mixers['miku2'].existingAction('happy').play();
		mixers['miku2'].addEventListener('loop', loopCallback);
		mixers['miku2'].addEventListener('finished', finishedCallback);
		//fadeToAction(mixers['miku2'].existingAction('wait'), mixers['miku2'].existingAction('happy'), 20);
		//the helper.add function called in loadMMD resets all durations to most recent model.
		helper.meshes.forEach(function (mesh) { mesh.animations[0].resetDuration(); });
		mixers['miku1']._actions[0].setLoop(THREE.LoopPingPong);

		initGUI(scene, renderer, helper, light);
	}
}
waitForAnimations();

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
