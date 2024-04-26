import GUI from 'lilgui';
import { fadeToAction } from './misc.js';
import { LoopRepeat } from 'three';
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
let pMixers;
let pLogger;
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
function waitToWalk() {
    fadeToAction(pMixers['miku1'].existingAction('wait'), pMixers['miku1'].existingAction('walk'), 5);
}

function waitToHappy() {
    fadeToAction(pMixers['miku1'].existingAction('wait'), pMixers['miku1'].existingAction('happy'), 5);
}
function danceToWait() {
    fadeToAction(pMixers['miku2'].existingAction('dance'), pMixers['miku2'].existingAction('wait'), 5);
}

function speakText(ourText) {
    const synth = window.speechSynthesis;
    const utterThis = new SpeechSynthesisUtterance(ourText);

    utterThis.onstart = function (event) {
        pLogger.log('Speech has started');
        pMixers['miku1'].existingAction('talk').setLoop(LoopRepeat, Infinity);
        pMixers['miku1'].existingAction('talk').play();
    };
    utterThis.onend = function (event) {
        pLogger.log('Speech has ended');
        pMixers['miku1'].existingAction('talk').stop();
    };

    let voices = synth.getVoices();
    utterThis.voice = voices[2];

    const speak = function () {
        if (voices.length == 0 ||
            utterThis.voice != voices[2]) {
            voices = synth.getVoices();
            utterThis.voice = voices[2];
            setTimeout(speak, 100);
        } else {
            synth.speak(utterThis);
        }
    }
    speak();
}

function helloCallback(val) {
    let greeting = "Hey there what's up!!!!";
    speakText(greeting);
}

function storyCallback(val) {
    pLogger.log('preparing to speak.');
    //const url = 'https://bookshelf-jhr6l6besa-uc.a.run.app/';
    const url = 'https://bookshelf-jhr6l6besa-uc.a.run.app/story';
    //const url = 'https://google.com';
    //fetch(url).then(function (response) {
    fetch(url, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        headers: {
            "Content-Type": "text/plain"
        }
    }).then(function (response) {
        pLogger.log(response);
        return response.text();
        //return response.json();
    }).then(function (data) {
        pLogger.log(data);
        if (data && data.length > 0) {
            speakText(data);
        }
    }).catch(function (err) {
        //pLogger.log('Fetch Error: ' + err);
    });
}

const button = {
    hello: helloCallback,
    story: storyCallback,
    msg: '',
};

let msgController;

function msgCallback(val) {
    pLogger.log(val);
    //button.msg = '';
    if (msgController) {
        msgController.setValue('');
    }
}

const actions = {
    danceToWait: danceToWait,
    waitToHappy: waitToHappy,
    waitToWalk: waitToWalk,
};

function logCallback(value) {
    if (value == false) {
        pLogger.clearText();
    } else {
        pLogger.display();
    }
    console.log(value);
}

export function initGUI(logger, scene, renderer, helper, ambientLight, pointLight, mixers) {
    scenePtr = scene;
    rendererPtr = renderer;
    helperPtr = helper;
    pMixers = mixers;
    pLogger = logger;

    let pMiku1;
    pMiku1 = scene.getObjectByName('miku1');

    const morphKeys = Object.keys(pMiku1.morphTargetDictionary);
    let morphVals = new Array(pMiku1.morphTargetInfluences.length);
    for (let i = 0; i < pMiku1.morphTargetInfluences.length; i++) {
        let tmpvar = pMiku1.morphTargetDictionary[morphKeys[i]];
        morphVals[tmpvar] = morphKeys[i];
    }

    const morphs = [];
    const morphCallbacks = [];
    for (let i = 0; i < pMiku1.morphTargetInfluences.length; i++) {
        function morphCallback(value) {
            pMixers['miku1'].stopAllAction();
            pMiku1.morphTargetInfluences[i] = value;
        }
        morphCallbacks.push(morphCallback);
        morphs.push({
            [morphVals[i]]: 0,
        });
    }

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

    //gui.add(actions, 'danceToWait').name('danceToWait');
    gui.add(actions, 'waitToHappy').name('waitToHappy');

    gui.add(logger, 'logging').name('logging')
        .onChange(logCallback);

    const folder = gui.addFolder('Morphs');
    folder.close();

    for (let i = 0; i < pMiku1.morphTargetInfluences.length; i++) {
        folder.add(morphs[i], morphVals[i], 0, 1, 0.1)
            .onChange(morphCallbacks[i]);
        folder.children[i].$input.id = 'morph-slider' + i;
    }

    if ('speechSynthesis' in window) {
        console.log("Web Speech API supported!");
        gui.add(button, 'hello');
    } else {
        console.log("Web Speech API not supported.");
    }
    gui.add(button, 'story').name('story');

    gui.add(actions, 'waitToWalk').name('waitToWalk');

    msgController = gui.add(button, 'msg').name('msg')
        .onFinishChange(msgCallback);

    gui.close();

    //set default values to avoid warnings.
    gui.children[0].$text.id = 'color-selector';
    gui.children[1].$input.id = 'light-slider1';
    gui.children[2].$input.id = 'light-slider2';
    gui.children[3].$input.id = 'animation-checkbox';
    gui.children[4].$input.id = 'physics-checkbox';
    gui.children[5].$input.id = 'timescale-slider';
    gui.children[6].$input.id = 'gravity-slider';
    gui.children[7].$input.id = 'shadows-checkbox';
    //gui.children[8].$input.id = 'dance2wait-button';
    gui.children[9].$input.id = 'logging-checkbox';
    gui.children[14].$input.id = 'msg-textbox';
    gui.children[14].$input.name = 'msg-textbox';
}
