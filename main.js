import * as THREE from 'three';
import { MMDLoader } from 'three/addons/loaders/MMDLoader.js';

import { MyGui } from './gui.js';
import { initCamera } from './camera.js';

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
const camera = initCamera(renderer);

renderer.setSize(window.innerWidth, window.innerHeight);

const div = document.getElementById('canvascontainer');
div.appendChild(renderer.domElement);

function createCheckerboard(scene, planeSize) {

	const texLoader = new THREE.TextureLoader();
	const texture = texLoader.load('checker.png');
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	texture.magFilter = THREE.NearestFilter;
	texture.colorSpace = THREE.SRGBColorSpace;
	const repeats = planeSize / 2;
	texture.repeat.set(repeats, repeats);

	const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
	const planeMat = new THREE.MeshPhongMaterial({
		map: texture,
		side: THREE.DoubleSide,
	});
	const mesh = new THREE.Mesh(planeGeo, planeMat);
	mesh.rotation.x = Math.PI * -.5;
	scene.add(mesh);
}
const planeSize = 40;
createCheckerboard(scene, planeSize);

const color = 0xFFFFFF;
const intensity = 1;
const light = new THREE.AmbientLight(color, intensity);
scene.add(light);

const guiContainer = document.getElementById("gui");
const gui = new MyGui(guiContainer, light);

const manager = new THREE.LoadingManager();
manager.onStart = function ( url, itemsLoaded, itemsTotal ) {
	console.log( 'Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
};

manager.onLoad = function ( ) {
	console.log( 'Loading complete!');
	scene.add( miku );
};

manager.onProgress = function ( url, itemsLoaded, itemsTotal ) {
	console.log( 'Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
};

manager.onError = function ( url ) {
	console.log( 'There was an error loading ' + url );
};

const loader = new MMDLoader(manager);

const modelPath = 'mmdmodels/miku4.3/miku4.3.pmx'

const miku = await loader.loadAsync(
	modelPath,
/*
//if i add the mesh to the scene here, it will appear before all parts have been fully loaded.
	function ( mesh ) {
		scene.add( mesh );
	},
*/
	function ( xhr ) {
		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
	},
	function ( error ) {
		console.log( 'An error happened' );
	}
);

function animate() {
	requestAnimationFrame( animate );
	//miku.rotation.x += 0.01;
	miku.rotation.y += 0.01;
	renderer.render( scene, camera );
}
animate();
