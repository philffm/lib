import {LinkToggleButton,subscribe,setElementVal,LinkClickButton,LinkVisible,sleep} from '../lib/koiosf_util.mjs';
//import {} from './koiosf_messages.mjs';
import {GetToggleState} from '../genhtml/startgen.mjs'
import {ToggleCueVisibility} from '../viewer_figma/koiosf_viewer.mjs'
import {SetglobalplayerSubtitle} from '../viewer_figma/koiosf_viewer.mjs'

var globalplayer=0;
var globalVideospeed=0;
var globalInjectedCSS;
export var currentlang;

async function asyncloaded() {
    LinkVisible("scr_settings"  ,ScrSettingsMadeVisible);
    LinkClickButton("videospeed",RotateVideoSpeed);
    subscribe("videoplayerready",VideoPlayerReady);
    LinkClickButton("fontsize",FontSize);
    LinkToggleButton("audioonoff",AudioOnOff);
    LinkClickButton("lang_nl", setLangNl);
    LinkClickButton("lang_en", setLangEn);
    LinkToggleButton("darkmodeTog", DarkmodeOnOff);
    LinkToggleButton("autoplayToggle", AutoplayOnOff);
}

function setLangNl(){
	currentlang="nl";
	localStorage.setItem("currentlang", currentlang);
	SetglobalplayerSubtitle(currentlang);
}

export function setLangEn(){
	currentlang="en";
	localStorage.setItem("currentlang", currentlang);
	SetglobalplayerSubtitle(currentlang);
}

//Not very useful
async function ScrSettingsMadeVisible() {
  	console.log("In ScrSettingsMadeVisible");
}

async function VideoPlayerReady(playerobject) {
    globalplayer = playerobject;
    await sleep(500);
    FontSize(); // can use the player object now // to show the initial value
}

window.addEventListener('DOMContentLoaded', asyncloaded);  // load

async function RotateVideoSpeed() {
    globalVideospeed++
    if (globalVideospeed >=4) globalVideospeed=0;

    if (globalplayer)
        switch (globalVideospeed) {
			case 0: globalplayer.setPlaybackRate(1);console.log("Speed 1");break;
			case 1: globalplayer.setPlaybackRate(1.25);console.log("Speed 1.25");break;
			case 2: globalplayer.setPlaybackRate(1.5);console.log("Speed 1.5");break;
			case 3: globalplayer.setPlaybackRate(2);console.log("Speed 2");break;
      	}
	
	await sleep(100); // wait until speed is processed
	setElementVal("__label",globalplayer.getPlaybackRate(),"videospeed")
}

var font=0;

function FontSize() {
	font++;
	if (font > 3) font= -2;
	switch(font){
		case -2:
		ToggleCueVisibility();
		setElementVal("__label","Off","fontsize");
		break;
		case -1:
		ToggleCueVisibility();
		SetglobalplayerSubtitle(localStorage.getItem("currentlang"));
		globalplayer.setOption('captions', 'fontSize', font);
		setElementVal("__label",parseInt(font)+2,"fontsize");
		break;
		default:
		globalplayer.setOption('captions', 'fontSize', font);
		setElementVal("__label",parseInt(font)+2,"fontsize");
	}
}

function AudioOnOff(event) {
    var fOn=GetToggleState(this,"displayactive");
    if (!globalplayer) return;
    if (!fOn)
        globalplayer.unMute();
    else
        globalplayer.mute();
}

export function DarkmodeOnOff(event) {
    var fOn=GetToggleState(this,"displayactive");
    localStorage.setItem("darkmodestatus", fOn);
    if (!fOn)
        disableDarkmode();
    else
        enableDarkmode();
}

export function setDarkmode(temp){    //ran on start
	LoadCSS().then( function() {
		if(!temp){
			disableDarkmode();
		}
		else {
			enableDarkmode();
		}
	});
}

function enableDarkmode() {
  	globalInjectedCSS.disabled = false;
}

function LoadCSS(){
	return new Promise( function( resolve, reject ) {
		var link = document.createElement('link');
		link.rel  = 'stylesheet';
		link.href = "https://koiosonline.github.io/lib/viewer_figma/dm.css";
		document.body.appendChild(link);
		link.onload = function() {
			globalInjectedCSS = link;
			resolve();
		};
	});
}

function disableDarkmode() {
  	globalInjectedCSS.disabled = true;
}

function AutoplayOnOff(event) {
	var autoplayOn=GetToggleState(this,"displayactive");
	localStorage.setItem("autoplaystatus", autoplayOn);
}