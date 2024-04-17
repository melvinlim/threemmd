import { MMDLoader } from 'three/addons/loaders/MMDLoader.js';
import { LoadingManager } from 'three';
export function loadMMDModel(scene, mmdName, modelPath, offset = undefined) {
	let mmdModel;
	const manager = new LoadingManager();
	manager.onStart = function (url, itemsLoaded, itemsTotal) {
		console.log('Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
	};
	manager.onLoad = function () {
		console.log('Loading complete!');
		mmdModel.name = mmdName;
		if (offset) {
			mmdModel.position.x += offset.x;
			mmdModel.position.y += offset.y;
			mmdModel.position.z += offset.z;
		}
		scene.add(mmdModel);
		
	};
	manager.onProgress = function (url, itemsLoaded, itemsTotal) {
		console.log('Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
	};

	manager.onError = function (url) {
		console.log('There was an error loading ' + url);
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
			console.log((xhr.loaded / xhr.total * 100) + '% loaded');
		},
		function (error) {
			console.log('An error happened');
		}
	);
}

export function loadMMDAnimation(helper, mmdModel, animationName, animationPath) {
	const loader = new MMDLoader();
	loader.loadAnimation(
		animationPath,
		mmdModel,
		function (animationClip) {
			console.log('loaded animation.');
			animationClip.name = animationName;
			mmdModel.animations.push(animationClip);
			//now animation can be stopped with helper.objects.get(miku2).mixer.existingAction("danceAnimation").stop()
			helper.objects.get(mmdModel).mixer.clipAction(animationClip).play();
		},
		function (xhr) {
			console.log((xhr.loaded / xhr.total * 100) + '% loaded');
		},
		function (error) {
			console.log('An error happened');
		}
	);
}
export function loadMMD(helper, scene, mmdName, modelPath, animationPath) {

	let mmdModel;
	const manager = new LoadingManager();

	manager.onStart = function (url, itemsLoaded, itemsTotal) {
		console.log('Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
	};

	manager.onLoad = function () {
		console.log('Loading complete!');

		helper.add(mmdModel.mesh, {
			animation: mmdModel.animation,
			physics: true
		});
		mmdModel.mesh.name = mmdName;
		mmdModel.mesh.animations.push(mmdModel.animation);
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
}