import * as THREE from 'three';
export function createCheckerboard(scene, planeSize) {

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
	mesh.geometry.scale(10, 10, 10);
	mesh.rotation.x = Math.PI * -.5;
	mesh.matrixAutoUpdate = false;
	mesh.matrixWorldAutoUpdate = false;
	mesh.updateMatrix();
	mesh.updateMatrixWorld();

	mesh.name = 'checkerboard';
	scene.add(mesh);
}

export function fadeToAction(action1, action2, duration) {
	action1.repetitions = 0;
	action1.paused = true;
	action1.fadeOut(duration);
	action2
		.reset()
		.setEffectiveTimeScale(1)
		.setEffectiveWeight(1)
		.fadeIn(duration)
		.play();
}
