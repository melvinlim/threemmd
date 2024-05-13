import GUI from 'lilgui';
import { fadeToAction } from './misc.js';
import { LoopRepeat } from 'three';
import { Vector3 } from 'three';
import { replaceModel } from './mmd.js';
import { logger } from './logger.js';

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
        logger.log('Speech has started');
        pMixers['miku1'].existingAction('talk').setLoop(LoopRepeat, Infinity);
        pMixers['miku1'].existingAction('talk').play();
    };
    utterThis.onend = function (event) {
        logger.log('Speech has ended');
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
    logger.log('preparing to speak.');
    const url = 'https://bookshelf-jhr6l6besa-uc.a.run.app/story';
    fetch(url, reqSettings).then(function (response) {
        logger.log(response);
        return response.text();
        //return response.json();
    }).then(function (data) {
        logger.log(data);
        if (data && data.length > 0) {
            speakText(data);
        }
    }).catch(function (err) {
        //logger.log('Fetch Error: ' + err);
    });
}
/*
//this encodes %20 to + for some reason.
const url = 'https://bookshelf-jhr6l6besa-uc.a.run.app/?' + new URLSearchParams({
    data: val,
});
*/
function chatCallback(val) {
    logger.log('responding to: ' + val);
    let encodedVal = encodeURIComponent(val);
    logger.log('responding to: ' + encodedVal);
    logger.log('waiting for response...');
    const url = 'https://bookshelf-jhr6l6besa-uc.a.run.app/?data=' + encodedVal;
    fetch(url, reqSettings).then(function (response) {
        logger.log(response);
        return response.text();
    }).then(function (data) {
        logger.log(data);
        if (data && data.length > 0) {
            speakText(data);
        }
    }).catch(function (err) {
        //logger.log('Error: ' + err);
    });
}

function finishedCallback(ev) {
  logger.log('finished: ' + ev.action._clip.name)
  if (ev.action._clip.name == 'dance') {
    ev.target.existingAction('wait').setLoop(LoopRepeat, Infinity);
    fadeToAction(ev.target.existingAction('dance'), ev.target.existingAction('wait'), 5);
  }
  if (ev.action._clip.name == 'happy') {
    ev.target.existingAction('wait').setLoop(LoopRepeat, Infinity);
    fadeToAction(ev.target.existingAction('happy'), ev.target.existingAction('wait'), 5);
  }
  if (ev.action._clip.name == 'walk') {
    ev.target.existingAction('wait').setLoop(LoopRepeat, Infinity);
    fadeToAction(ev.target.existingAction('walk'), ev.target.existingAction('wait'), 5);
  }
}

let previousModel='bunny';
function bunnyCallback(){
  const HappyPath = 'mmdanimations/good_mood_loop/good_mood_loop_140f_no_movement.vmd';
  const HappyName = 'happy';
  const WaitingPath = 'mmdanimations/waiting_loop/waiting_465f.vmd';
  const WaitingName = 'wait';
  const TalkPath = 'mmdanimations/talk.vmd';
  const TalkName = 'talk';
  const WalkPath = 'mmdanimations/walk.vmd';
  const WalkName = 'walk';
  const DancePath = 'mmdanimations/realize_motion/realize_motion.vmd';
  const DanceName = 'dance';
	const Dance2Path = 'mmdanimations/tricolor_motion_kozakuramiru_distribution/tricolor-motion-yyb-miku-nt.vmd';
	const Dance2Name = 'dance2';

  const Miku1Data = [];
  Miku1Data.push({ name: WaitingName, path: WaitingPath });
  Miku1Data.push({ name: HappyName, path: HappyPath });
  Miku1Data.push({ name: TalkName, path: TalkPath });
  Miku1Data.push({ name: WalkName, path: WalkPath });
  Miku1Data.push({ name: DanceName, path: DancePath });
  Miku1Data.push({ name: Dance2Name, path: Dance2Path });

	let shadows=true;

  const miku1_offset = new Vector3(10, 0, 0);
	if(previousModel=='bunny'){
    replaceModel(pMixers,pHelper,pScene,'miku1','mmdmodels/miku4.3/miku4.3.pmx',Miku1Data,miku1_offset,[DanceName],undefined,finishedCallback,shadows);
		previousModel='miku';
	}else{
    //replaceModel(pMixers,pHelper,pScene,'miku1','mmdmodels/bunny_toon/bunny_toon.pmx',Miku1Data,miku1_offset,[DanceName],undefined,finishedCallback,shadows);
    replaceModel(pMixers,pHelper,pScene,'miku1','mmdmodels/miku4.3/miku4.3.pmx',Miku1Data,miku1_offset,[Dance2Name],undefined,finishedCallback,shadows);
		previousModel='bunny';
	}
}

const button = {
    hello: helloCallback,
    story: storyCallback,
    message: '',
    bunny: bunnyCallback,
};

let msgController;

function msgCallback(val) {
    //logger.log(val.charCodeAt(val.length - 1));
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
        logger.clearText();
    } else {
        logger.display();
    }
}

export function _initGUI(scene, renderer, helper, ambientLight, pointLight, mixers) {
    pScene = scene;
    pRenderer = renderer;
    pHelper = helper;
    pMixers = mixers;

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

export function initGUI(scene, renderer, helper, ambientLight, pointLight, mixers) {
    pMixers = mixers;
    let pMiku1;
    function waitForMixers(){
      if(!pMixers || !pMixers['miku1'] || !pMiku1 || !pMiku1.morphTargetDictionary || !pMiku1.morphTargetInfluences){
				pMiku1 = scene.getObjectByName('miku1');
        setTimeout(waitForMixers,200);
      }else{
				_initGUI(scene, renderer, helper, ambientLight, pointLight, mixers);
			}
		}
    waitForMixers();
}
