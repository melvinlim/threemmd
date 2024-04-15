import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PerspectiveCamera } from 'three';
export function initCamera(renderer) {
	const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

	//this is pointless if using orbitcontrols.
	//camera.up = new THREE.Vector3(0, 0, -1);
	//camera.lookAt(new THREE.Vector3(0, 10, 0));

	camera.position.y = 15;
	camera.position.z = 25;

	const controls = new OrbitControls(camera, renderer.domElement);
	controls.target.set(0, 10, 0);		//camera looks at this point if using orbitcontrols.
	controls.update();

	return camera;
}
