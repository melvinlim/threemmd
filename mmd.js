import { MMDLoader } from 'three/addons/loaders/MMDLoader.js';
import { LoadingManager } from 'three';

export async function loadMMDModel(scene, modelPath) {

	const manager = new LoadingManager();
	manager.onStart = function (url, itemsLoaded, itemsTotal) {
		console.log('Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
	};
	manager.onLoad = function () {
		console.log('Loading complete!');
		scene.add(mmdModel);	//mmdModel is declared further down but javascript can access it here.
		return mmdModel;
	};

	manager.onProgress = function (url, itemsLoaded, itemsTotal) {
		console.log('Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
	};

	manager.onError = function (url) {
		console.log('There was an error loading ' + url);
	};

	const loader = new MMDLoader(manager);

	//MMDLoader.loadAsync is the only function which returns the model.
	const mmdModel = await loader.loadAsync(
		modelPath,
		function ( mesh ) {
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

export function loadMMDAnimation(helper, mmdModel, animationPath) {
	const loader = new MMDLoader();
	loader.loadAnimation(
		animationPath,
		mmdModel,
		function (animationClip) {
			console.log('loaded animation.');
			helper.objects.get(helper.meshes[0]).mixer.clipAction(animationClip).play();

			return animationClip;
		},
		function (xhr) {
			console.log((xhr.loaded / xhr.total * 100) + '% loaded');
		},
		function (error) {
			console.log('An error happened');
		}
	);
}
export function loadMMD(scene, helper, modelPath, animationPath) {

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