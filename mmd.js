import { MMDLoader } from 'three/addons/loaders/MMDLoader.js';
import { LoadingManager } from 'three';

export async function loadMMDModel(scene, modelPath) {

	const manager = new LoadingManager();
	manager.onStart = function (url, itemsLoaded, itemsTotal) {
		console.log('Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
	};

	manager.onLoad = function () {
		console.log('Loading complete!');
		scene.add(mmdModel);
	};

	manager.onProgress = function (url, itemsLoaded, itemsTotal) {
		console.log('Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
	};

	manager.onError = function (url) {
		console.log('There was an error loading ' + url);
	};

	const loader = new MMDLoader(manager);

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

	return mmdModel;

}

export async function loadMMDAnimation(mmdModel, animationPath) {
	const loader = new MMDLoader();
	const result = loader.loadAnimation(
		animationPath,
		mmdModel,
		function (animationClip) {
			console.log('loaded animation.');
			mmdModel.animations.push(animationClip);
			return animationClip;
		},
		function (xhr) {
			console.log((xhr.loaded / xhr.total * 100) + '% loaded');
		},
		function (error) {
			console.log('An error happened');
		}
	);
	//wait 4 seconds...?
	await new Promise((resolve, reject) => setTimeout(resolve, 4000));
	return result;
}