import { MMDLoader } from 'three/addons/loaders/MMDLoader.js';
import { LoadingManager } from 'three';
import * as THREE from 'three';
import { LoopOnce } from 'three';

import { logger } from './logger.js';

const timeOutDelay = 100;

//loadMMDModel does not work because helper.mixer is never created and set up.
//i could create helper.mixer manually in loadMMDModel, but it wouldn't be configured...
//not doing it for now because it's a hassle to implement.
//also need to verify in wait loop that mmdModel has been assigned.  in manager.onLoad.
export function loadMMDModel(helper, scene, mmdName, modelPath, offset = undefined) {
	let mmdModel;
	const manager = new LoadingManager();
	manager.onStart = function (url, itemsLoaded, itemsTotal) {
		logger.log('Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
	};
	manager.onLoad = function () {
		//logger.log('Loading complete!');
		mmdModel.name = mmdName;
		if (offset) {
			mmdModel.position.x += offset.x;
			mmdModel.position.y += offset.y;
			mmdModel.position.z += offset.z;
		}
		mmdModel.visible = false;
		helper.add(mmdModel, {
			physics: true
		});
		scene.add(mmdModel);
	};
	manager.onProgress = function (url, itemsLoaded, itemsTotal) {
		logger.log('Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
	};

	manager.onError = function (url) {
		logger.error('There was an error loading ' + url);
	};

	const loader = new MMDLoader(manager);

	loader.load(
		modelPath,
		function (mesh) {
			mmdModel = mesh;
		//if i add the mesh to the scene here, it will appear before all parts have been fully loaded.
		//scene.add( mesh );
		},
		function (xhr) {
			//logger.log((xhr.loaded / xhr.total * 100) + '% loaded');
		},
		function (error) {
			logger.error(error);
		}
	);
}

export function loadMMDCamera(helper, mmdModel, animationName, animationPath) {
	const loader = new MMDLoader();
	loader.loadAnimation(
		animationPath,
		mmdModel,
		function (animationClip) {
			logger.log('loaded animation.');
			animationClip.name = animationName;
			animationClip.resetDuration();
			mmdModel.animations.push(animationClip);
			//helper.objects.get(mmdModel).mixer.clipAction(animationClip).play();
			helper.add(mmdModel, {
				animation: animationClip,
				physics: false
			});
		},
		function (xhr) {
			//logger.log((xhr.loaded / xhr.total * 100) + '% loaded');
		},
		function (error) {
			logger.error(error);
		}
	);
}

export function loadMMDAnimation(helper, mmdModel, animationName, animationPath, runAnim = false) {
	const loader = new MMDLoader();
	loader.loadAnimation(
		animationPath,
		mmdModel,
		function (animationClip) {
			logger.log('loaded animation.');
			animationClip.name = animationName;
			animationClip.resetDuration();
			mmdModel.animations.push(animationClip);
			let action = helper.objects.get(mmdModel).mixer.clipAction(animationClip);
			action.stop();
			action.setLoop(LoopOnce);
			//action.setLoop(THREE.LoopPingPong);
			//action.repetitions = 1;
			action.clampWhenFinished = true;
			if (runAnim) {
				action.play();
			}
		},
		function (xhr) {
			//logger.log((xhr.loaded / xhr.total * 100) + '% loaded');
		},
		function (error) {
			logger.error(error);
		}
	);
}

export function replaceModel(helper, scene, mmdName, modelPath) {
	const HappyPath = 'mmdanimations/good_mood_loop/good_mood_loop_140f_no_movement.vmd';
	const HappyName = 'happy';
	const WaitingPath = 'mmdanimations/waiting_loop/waiting_465f.vmd';
	const WaitingName = 'wait';
	const TalkPath = 'mmdanimations/talk.vmd';
	const TalkName = 'talk';
	const WalkPath = 'mmdanimations/walk.vmd';
	const WalkName = 'walk';

	const Miku1Data = [];
	Miku1Data.push({ name: WaitingName, path: WaitingPath });
	Miku1Data.push({ name: HappyName, path: HappyPath });
	Miku1Data.push({ name: TalkName, path: TalkPath });
	Miku1Data.push({ name: WalkName, path: WalkPath });

	const miku1_offset = new THREE.Vector3(10, 0, 0);

	let previousModel = scene.getObjectByName(mmdName);
	previousModel.visible = false;
	scene.remove(previousModel);
	let prevIdx = helper.meshes.indexOf(previousModel);
	helper.meshes.splice(prevIdx, 1);
	helper.objects.delete(previousModel);

	loadMMD2(helper, scene, mmdName, modelPath, Miku1Data, miku1_offset);

	let mmdModel;

	const waitForAnimations = function () {
		if (!mmdModel || !mmdModel.animations ||
			mmdModel.animations.length < Miku1Data.length ||
			!helper.objects.get(mmdModel).mixer
		) {
			mmdModel = scene.getObjectByName(mmdName);
			setTimeout(waitForAnimations, timeOutDelay);
		} else {
			let mixer = helper.objects.get(mmdModel).mixer;
			mixer.existingAction('wait').play();
			mmdModel.visible = true;
		}
	}
	waitForAnimations();
}

export function loadMMD(helper, scene, mmdName, modelPath, animName, animationPath, offset = undefined) {

	let mmdModel;
	const manager = new LoadingManager();

	manager.onStart = function (url, itemsLoaded, itemsTotal) {
		logger.log('Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
	};

	manager.onLoad = function () {
		//logger.log('Loading complete!');

		const waitForAnimation = function () {
			if (!mmdModel ||
				!mmdModel.animation) {
				setTimeout(waitForAnimation, timeOutDelay);
			} else {
				mmdModel.animation.name = animName;
				mmdModel.animation.resetDuration();
				helper.add(mmdModel.mesh, {
					animation: mmdModel.animation,
					physics: true
				});
				mmdModel.mesh.name = mmdName;
				mmdModel.mesh.animations.push(mmdModel.animation);
				let action = helper.objects.get(mmdModel.mesh).mixer.clipAction(mmdModel.animation);
				action.stop();
				if (offset) {
					mmdModel.mesh.position.x += offset.x;
					mmdModel.mesh.position.y += offset.y;
					mmdModel.mesh.position.z += offset.z;
				}
				mmdModel.mesh.visible = false;
				scene.add(mmdModel.mesh);
			}
		}
		waitForAnimation();

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
		logger.log('Loading file: ' + url + '.');
		logger.log('Loaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
	};

	manager.onError = function (url) {
		logger.error('There was an error loading ' + url);
	};

	// Load MMD resources and add to helper
	new MMDLoader(manager).loadWithAnimation(
		modelPath,
		animationPath,
		function (mmd) {

			mmdModel = mmd;
		},
		function (xhr) {
			//logger.log((xhr.loaded / xhr.total * 100) + '% loaded');
		},
		function (error) {
			logger.error(error);
		}
	);
}

export function loadMMD2(mixers, helper, scene, mmdName, modelPath, data, offset = undefined, activeAnims = undefined) {
	let mmdModelObj;
	const firstData = data[0];
	loadMMD(helper, scene, mmdName, modelPath, firstData.name, firstData.path, offset);
	const waitForModels = function () {
		if (!scene.getObjectByName(mmdName)) {
			setTimeout(waitForModels, timeOutDelay);
		} else {
			mmdModelObj = scene.getObjectByName(mmdName);
		}
	}
	waitForModels();

	const waitForModel = function () {
		if (!helper || !helper.objects || !helper.meshes ||
			!helper.objects.get(mmdModelObj) ||
			!helper.objects.get(mmdModelObj).mixer) {
			setTimeout(waitForModel, timeOutDelay);
		} else {
			for (let i = 1; i < data.length; i++) {
				let runAnim = false;
				var j = 0;
				const len = activeAnims.length;
				while (j < len) {
					if (data[i].name == activeAnims[j]) {
						runAnim = true;
					}
					j++;
				}
				loadMMDAnimation(helper, mmdModelObj, data[i].name, data[i].path, runAnim);
			}
		}
	}
	waitForModel();

	const waitForAnimations = function () {
		if (!helper || !helper.meshes || !mmdModelObj || !mmdModelObj.animations ||
			mmdModelObj.animations.length < data.length
		) {
			setTimeout(waitForAnimations, timeOutDelay);
		} else {
			mixers[mmdName] = helper.objects.get(mmdModelObj).mixer;
			//the helper.add function called in loadMMD resets all durations to most recent model.
			helper.meshes.forEach(
				function (mesh) {
					mesh.animations.forEach(
						function (animation) {
							animation.resetDuration();
						}
					);
				}
			);
		}
	}
	waitForAnimations();
}