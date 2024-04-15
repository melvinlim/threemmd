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
export function initGUI(helper, light) {
    var gui = new GUI({ injectStyles: false });

    const colorHelper = new ColorGUIHelper(light, 'color');

    //gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
    gui.addColor(colorHelper, 'value').name('color');
    gui.add(light, 'intensity', 0, 2, 0.01).name('light');

    gui.add(helper.enabled, 'animation');
    gui.add(helper.enabled, 'physics');

    gui.add(helper.objects.get(helper.meshes[0]).mixer, 'timeScale', 0, 2, 0.1);

    //set default values to avoid warnings.
    gui.children[0].$text.id = 'color-selector';
    gui.children[1].$input.id = 'light-slider';
    gui.children[2].$input.id = 'animation-checkbox';
    gui.children[3].$input.id = 'physics-checkbox';
    gui.children[4].$input.id = 'timescale-slider';
}
