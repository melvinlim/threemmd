import GUI from 'lilgui';
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
let scenePtr;
let rendererPtr;
let helperPtr;

function updateGravity(value) {
    helperPtr.meshes.forEach(function (mesh) {
        let gravity = helperPtr.objects.get(mesh).physics.gravity
        gravity.y = value;
        helperPtr.objects.get(mesh).physics.setGravity(gravity);
    });
}
function updateSpeed(value) {
    helperPtr.meshes.forEach(function (mesh) {
        helperPtr.objects.get(mesh).mixer.timeScale = value;
    });
}

function shadowHelper() {
    if (rendererPtr.shadowMap.enabled) {
        scenePtr.children[0].receiveShadow = true;
    } else {
        scenePtr.children[0].receiveShadow = false;
    }
}

export function initGUI(scene, renderer, helper, ambientLight, pointLight) {
    scenePtr = scene;
    rendererPtr = renderer;
    helperPtr = helper;
    var gui = new GUI({ injectStyles: false });

    const colorHelper = new ColorGUIHelper(ambientLight, 'color');
    gui.addColor(colorHelper, 'value').name('color');
    gui.add(ambientLight, 'intensity', 0, 0.5, 0.01).name('ambientLight');  //ambientlight
    gui.add(pointLight, 'intensity', 100, 1000, 10).name('pointLight');  //pointlight

    gui.add(helper.enabled, 'animation');
    gui.add(helper.enabled, 'physics');

    gui.add(helper.objects.get(helper.meshes[0]).mixer, 'timeScale', 0, 4, 0.1)
        .onChange(updateSpeed);

    gui.add(helper.objects.get(helper.meshes[0]).physics.gravity, 'y', -200, 200, 1)
        .name('gravity')
        .onChange(updateGravity);

    gui.add(renderer.shadowMap, 'enabled')
        .name('shadows')
        .onChange(shadowHelper);

//    gui.onFinishChange(updateGravity);

    //set default values to avoid warnings.
    gui.children[0].$text.id = 'color-selector';
    gui.children[1].$input.id = 'light-slider1';
    gui.children[2].$input.id = 'light-slider2';
    gui.children[3].$input.id = 'animation-checkbox';
    gui.children[4].$input.id = 'physics-checkbox';
    gui.children[5].$input.id = 'timescale-slider';
    gui.children[6].$input.id = 'gravity-slider';
    gui.children[7].$input.id = 'shadows-checkbox';
}
