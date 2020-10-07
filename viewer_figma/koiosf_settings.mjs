import {loadScriptAsync,DomList,LinkToggleButton,subscribe,getElement,MonitorVisible,ForAllElements,setElementVal,publish,GetJson,LinkClickButton,LinkVisible,sleep} from '../lib/koiosf_util.mjs';
import {DisplayMessage,SwitchDisplayMessageContinous,DisplayMessageContinous} from './koiosf_messages.mjs';
import {GetToggleState} from '../genhtml/startgen.mjs'
import {ToggleCueVisibility} from '../viewer_figma/koiosf_viewer.mjs'
import {SetglobalplayerSubtitle} from '../viewer_figma/koiosf_viewer.mjs'

var globalplayer=0;
var globalVideospeed=0;
var globalInjectedCSS;
export var currentlang;

async function asyncloaded() {
    console.log(`In asyncloaded of script: ${import.meta.url}`);
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
  console.log("Set nl");
  currentlang="nl";
  localStorage.setItem("currentlang", currentlang);
  SetglobalplayerSubtitle(currentlang);
}

export function setLangEn(){
  console.log("Set en")
  currentlang="en";
  localStorage.setItem("currentlang", currentlang);
  SetglobalplayerSubtitle(currentlang);
}

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
    console.log("In RotateVideoSpeed");
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
      //  DisplayMessage(`Video speed set to ${globalplayer.getPlaybackRate()}x`);
}


var font=0;

function FontSize() {
  //player.setOption('captions', 'track', {'languageCode': 'es'});
  //player.setOption('captions', 'track', {});
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
      console.log(`Setting font to: ${font}`);
      globalplayer.setOption('captions', 'fontSize', font);
      setElementVal("__label",parseInt(font)+2,"fontsize");
      break;
    default:
      console.log(`Setting font to: ${font}`);
      globalplayer.setOption('captions', 'fontSize', font);
      setElementVal("__label",parseInt(font)+2,"fontsize");
  }
  //console.log(`Setting font to: ${font}`);
  //globalplayer.setOption('captions', 'fontSize', font);
  //setElementVal("__label",parseInt(font)+2,"fontsize");
}

function AudioOnOff(event) {

    var fOn=GetToggleState(this,"displayactive");
    console.log(`In AudioOnOff ${fOn}`);
    if (!globalplayer) return;
    if (!fOn)
        globalplayer.unMute();
    else
        globalplayer.mute();
}

export function DarkmodeOnOff(event) {
    var fOn=GetToggleState(this,"displayactive");
    localStorage.setItem("darkmodestatus", fOn);
    console.log(`In darkmodeOnOff ${fOn}`);
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
  console.log("enableDarkmode");
  globalInjectedCSS.disabled = false;
}

function LoadCSS(){
  console.log("In load css");
  return new Promise( function( resolve, reject ) {
  var link = document.createElement('link');
  link.rel  = 'stylesheet';
  link.href = "https://koiosonline.github.io/lib/viewer_figma/dm.css";
  document.body.appendChild(link);
  link.onload = function() {
            console.log( 'CSS has loaded!' );
            globalInjectedCSS = link;
            resolve();
        };
    } );
  //link.transition="all 200 ease-in-out";
  //link.transitionDelay="2s";
  //link.disabled == false;
  //LoadCSS = function (){return globalInjectedCSS;};
}

function disableDarkmode() {
  console.log("disableDarkmode");
  globalInjectedCSS.disabled = true;
}

function AutoplayOnOff(event) {
  console.log(this);
  var autoplayOn=GetToggleState(this,"displayactive");
  localStorage.setItem("autoplaystatus", autoplayOn);
  console.log("in settings ", localStorage.getItem("autoplaystatus"));
}