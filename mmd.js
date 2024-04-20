import { MMDLoader } from 'three/addons/loaders/MMDLoader.js';
import { LoadingManager } from 'three';
//import * as THREE from 'three';
import { LoopOnce } from 'three';

import { Logger } from './logger.js';

const logger = new Logger();

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

export function loadMMDAnimation(helper, mmdModel, animationName, animationPath) {
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
		},
		function (xhr) {
			//logger.log((xhr.loaded / xhr.total * 100) + '% loaded');
		},
		function (error) {
			logger.error(error);
		}
	);
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
		logger.log('Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
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

export function loadMMD2(helper, scene, mmdName, modelPath, data, offset = undefined) {
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
				loadMMDAnimation(helper, mmdModelObj, data[i].name, data[i].path);
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