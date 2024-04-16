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

let helperPtr;

function updateGravity() {
    let gravity = helperPtr.objects.get(helperPtr.meshes[0]).physics.gravity
    helperPtr.objects.get(helperPtr.meshes[0]).physics.setGravity(gravity);
}

export function initGUI(helper, light) {
    helperPtr = helper;
    var gui = new GUI({ injectStyles: false });

    const colorHelper = new ColorGUIHelper(light, 'color');
    gui.addColor(colorHelper, 'value').name('color');
    //gui.add(light, 'intensity', 0, 2, 0.01).name('light');  //ambientlight
    gui.add(light, 'intensity', 100, 1000, 10).name('light');  //pointlight

    gui.add(helper.enabled, 'animation');
    gui.add(helper.enabled, 'physics');

    gui.add(helper.objects.get(helper.meshes[0]).mixer, 'timeScale', 0, 2, 0.1);
    gui.add(helper.objects.get(helper.meshes[0]).physics.gravity, 'y', -200, 200, 1)
        .name('gravity')
        .onChange(updateGravity);

//    gui.onFinishChange(updateGravity);

    //set default values to avoid warnings.
    gui.children[0].$text.id = 'color-selector';
    gui.children[1].$input.id = 'light-slider';
    gui.children[2].$input.id = 'animation-checkbox';
    gui.children[3].$input.id = 'physics-checkbox';
    gui.children[4].$input.id = 'timescale-slider';
    gui.children[5].$input.id = 'gravity-slider';
}
