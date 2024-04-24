import * as THREE from 'three';

import { MMDAnimationHelper } from 'three/addons/animation/MMDAnimationHelper.js';

import { initGUI } from './gui.js';
import { initCamera } from './camera.js';
import { loadMMDModel } from './mmd.js';
import { loadMMDAnimation } from './mmd.js';
import { loadMMDCamera } from './mmd.js';
import { loadMMD } from './mmd.js';
import { loadMMD2 } from './mmd.js';
import { fadeToAction } from './misc.js';

import { logger } from './logger.js';

import { createCheckerboard } from './misc.js';

const shadows = true;

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
const camera = initCamera(renderer);

const loader = new THREE.TextureLoader();
const texture = loader.load(
	'starmap.png',
	() => {
		texture.mapping = THREE.EquirectangularReflectionMapping;
		texture.colorSpace = THREE.SRGBColorSpace;
		scene.background = texture;
	});
scene.background = texture;

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
const ambientIntensity = 0.05;
const ambientLight = new THREE.AmbientLight(color, ambientIntensity);
const pointIntensity = 500;
const pointLight = new THREE.PointLight(color, pointIntensity);
pointLight.position.set(20, 20, 20);

if (shadows) {
	pointLight.castShadow = true;
}

scene.add(ambientLight);
scene.add(pointLight);

const helper = new MMDAnimationHelper();
helper.configuration.resetPhysicsOnLoop = false;
helper.enabled.cameraAnimation = false;

const modelPath = 'mmdmodels/miku4.3/miku4.3.pmx';
const CameraPath = 'mmdanimations/tricolor_motion_kozakuramiru_distribution/tricolor-camera-yyb-miku-nt.vmd';

//const FacePath = 'mmdanimations/tricolor_motion_kozakuramiru_distribution/tricolor_lip_and_face_motions_by_non/just_face_expressions_YYB_miku.vmd';
//const DancePath = 'mmdanimations/tricolor_motion_kozakuramiru_distribution/tricolor-motion-yyb-miku-nt.vmd'
//const DancePath = 'mmdanimations/realize_motion/realize_motion.vmd'

const Miku2Data = []

const FacePath = 'mmdanimations/tricolor_motion_kozakuramiru_distribution/tricolor_lip_and_face_motions_by_non/just_face_expressions_light_blinking_eyes.vmd';
const FaceName = 'face';
Miku2Data.push({ name: FaceName, path: FacePath });
const LipPath = 'mmdanimations/tricolor_motion_kozakuramiru_distribution/tricolor_lip_and_face_motions_by_non/just_lip_motion_nothing.vmd';
const LipName = 'sing';
Miku2Data.push({ name: LipName, path: LipPath });
const DancePath = 'mmdanimations/highway_lover/highway_lover_motion.vmd';
const DanceName = 'dance';
Miku2Data.push({ name: DanceName, path: DancePath });
const HappyPath = 'mmdanimations/good_mood_loop/good_mood_loop_140f_no_movement.vmd';
const HappyName = 'happy';
Miku2Data.push({ name: HappyName, path: HappyPath });
const WaitingPath = 'mmdanimations/waiting_loop/waiting_465f.vmd';
const WaitingName = 'wait';
Miku2Data.push({ name: WaitingName, path: WaitingPath });

const TalkPath = 'mmdanimations/talk.vmd';
const TalkName = 'talk';

const Miku1Data = [];
Miku1Data.push({ name: WaitingName, path: WaitingPath });
Miku1Data.push({ name: HappyName, path: HappyPath });
Miku1Data.push({ name: TalkName, path: TalkPath });

const miku1_offset = new THREE.Vector3(10, 0, 0);
const miku2_offset = new THREE.Vector3(-10, 0, 0);

loadMMD2(helper, scene, 'miku1', modelPath, Miku1Data, miku1_offset);
loadMMD2(helper, scene, 'miku2', modelPath, Miku2Data, miku2_offset);

loadMMDCamera(helper, camera, 'camera', CameraPath);

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

const mixers = {};

function loopCallback(ev) {
	logger.log('looped: ' + ev.action._clip.name)
}
function finishedCallback(ev) {
	logger.log('finished: ' + ev.action._clip.name)
	if (ev.action._clip.name == 'dance') {
		ev.target.existingAction('wait').setLoop(THREE.LoopRepeat, Infinity);
		fadeToAction(ev.target.existingAction('dance'), ev.target.existingAction('wait'), 5);
	}
	if (ev.action._clip.name == 'happy') {
		ev.target.existingAction('wait').setLoop(THREE.LoopRepeat, Infinity);
		fadeToAction(ev.target.existingAction('happy'), ev.target.existingAction('wait'), 5);
	}
}
const waitForAnimations = function () {
	if (!miku1 || !miku2 || !miku2.animations ||
		miku2.animations.length < Miku2Data.length ||
		!helper.objects.get(miku2).mixer
	) {
		setTimeout(waitForAnimations, timeOutDelay);
	} else {
		miku1.visible = true;
		miku2.visible = true;
		mixers['miku1'] = helper.objects.get(miku1).mixer;
		mixers['miku2'] = helper.objects.get(miku2).mixer;
		mixers['camera'] = helper.objects.get(camera).mixer;
		
		mixers['miku1'].existingAction('wait').play();
		mixers['miku2'].existingAction('dance').play();
		mixers['miku2'].existingAction('face').play();
		mixers['miku2'].existingAction('sing').play();
		
		mixers['miku2'].addEventListener('loop', loopCallback);
		mixers['miku2'].addEventListener('finished', finishedCallback);
		mixers['miku1'].addEventListener('loop', loopCallback);
		mixers['miku1'].addEventListener('finished', finishedCallback);
		mixers['miku1']._actions[0].setLoop(THREE.LoopPingPong);
		if (mixers['camera']) {
			mixers['camera']._actions[0].reset();
			mixers['camera']._actions[0].stop();
		}

		initGUI(logger, scene, renderer, helper, ambientLight, pointLight, mixers);
	}
}
waitForAnimations();

const clock = new THREE.Clock();
clock.start();

let delta;
function render() {

	delta = clock.getDelta();

	helper.update(delta);

	renderer.render(scene, camera);
}

function animate() {
	requestAnimationFrame(animate);
	render();
}
animate();
