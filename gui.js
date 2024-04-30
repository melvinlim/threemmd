import GUI from 'lilgui';
import { fadeToAction } from './misc.js';
import { LoopRepeat } from 'three';
import { replaceModel } from './mmd.js';

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
let pScene;
let pRenderer;
let pHelper;
let pMixers;
let pLogger;
function updateGravity(value) {
    pHelper.meshes.forEach(function (mesh) {
        let gravity = pHelper.objects.get(mesh).physics.gravity
        gravity.y = value;
        pHelper.objects.get(mesh).physics.setGravity(gravity);
    });
}
function updateSpeed(value) {
    pHelper.meshes.forEach(function (mesh) {
        pHelper.objects.get(mesh).mixer.timeScale = value;
    });
}

function shadowHelper() {
    if (pRenderer.shadowMap.enabled) {
        pScene.children[0].receiveShadow = true;
    } else {
        pScene.children[0].receiveShadow = false;
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

const reqSettings = {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    headers: {
        "Content-Type": "text/plain"
    }
}

function storyCallback(val) {
    pLogger.log('preparing to speak.');
    const url = 'https://bookshelf-jhr6l6besa-uc.a.run.app/story';
    fetch(url, reqSettings).then(function (response) {
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
/*
//this encodes %20 to + for some reason.
const url = 'https://bookshelf-jhr6l6besa-uc.a.run.app/?' + new URLSearchParams({
    data: val,
});
*/
function chatCallback(val) {
    pLogger.log('responding to: ' + val);
    let encodedVal = encodeURIComponent(val);
    pLogger.log('responding to: ' + encodedVal);
    pLogger.log('waiting for response...');
    const url = 'https://bookshelf-jhr6l6besa-uc.a.run.app/?data=' + encodedVal;
    fetch(url, reqSettings).then(function (response) {
        pLogger.log(response);
        return response.text();
    }).then(function (data) {
        pLogger.log(data);
        if (data && data.length > 0) {
            speakText(data);
        }
    }).catch(function (err) {
        //pLogger.log('Error: ' + err);
    });
}

function bunnyCallback(){
    replaceModel(pHelper, pScene, 'miku1', 'mmdmodels/miku4.3/miku4.3.pmx');
}

const button = {
    hello: helloCallback,
    story: storyCallback,
    message: '',
    bunny: bunnyCallback,
};

let msgController;

function msgCallback(val) {
    //pLogger.log(val.charCodeAt(val.length - 1));
    if (val.charCodeAt(val.length - 1) == 13) {     //smart phone go/submit button keycode.
/*
        chatCallback(val);
        if (msgController) {
            msgController.setValue('');
        }
        */
    }
}
function msgFinishedCallback(val) {
    chatCallback(val);
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
}

export function initGUI(logger, scene, renderer, helper, ambientLight, pointLight, mixers) {
    pScene = scene;
    pRenderer = renderer;
    pHelper = helper;
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
        logger.log("Web Speech API supported!");
        gui.add(button, 'hello');
    } else {
        logger.log("Web Speech API not supported.");
    }
    gui.add(button, 'story').name('story');

    gui.add(actions, 'waitToWalk').name('waitToWalk');

    gui.add(button, 'bunny').name('bunny');

    msgController = gui.add(button, 'message').name('message')
        .onChange(msgCallback)
        .onFinishChange(msgFinishedCallback);

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
    gui.children[15].$input.id = 'msg-textbox';
    gui.children[15].$input.name = 'msg-textbox';
    //gui.children[15].$input.id = 'bunny-button';
}
