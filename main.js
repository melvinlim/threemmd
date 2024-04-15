import * as THREE from 'three';
import { MMDLoader } from 'three/addons/loaders/MMDLoader.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

import GUI from 'lilgui'

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
//document.body.appendChild(renderer.domElement);

const div = document.getElementById('canvascontainer');
div.appendChild(renderer.domElement);

//this is pointless if using orbitcontrols.
//camera.up = new THREE.Vector3(0, 0, -1);
//camera.lookAt(new THREE.Vector3(0, 10, 0));

camera.position.y = 15;
camera.position.z = 25;

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 10, 0);		//camera looks at this point if using orbitcontrols.
controls.update();

class ColorGUIHelper {
  constructor(object, prop) {
    this.object = object;
    this.prop = prop;
  }
  get value() {
    return `#${this.object[this.prop].getHexString()}`;
  }
  set value(hexString) {
    this.object[this.prop].set(hexString);
  }
}

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
const container = document.getElementById("gui");

const gui = new GUI({ container: container, injectStyles: false});

const colorHelper = new ColorGUIHelper(light, 'color');

//gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
gui.addColor(colorHelper, 'value').name('color');
gui.add(light, 'intensity', 0, 2, 0.01).name('light');

//set default values to avoid warnings.
gui.children[0].$text.id = 0xffffff;
gui.children[1].$input.id = 1;

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
