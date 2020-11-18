import {LinkToggleButton,subscribe,setElementVal,LinkClickButton,LinkVisible,sleep} from '../lib/koiosf_util.mjs';
var globalInjectedCSS;

async function asyncloaded() {

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

export function LoadCSS(cssurl){
	return new Promise( function( resolve, reject ) {
		var link = document.createElement('link');
		link.rel  = 'stylesheet';
		link.href = cssurl;
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