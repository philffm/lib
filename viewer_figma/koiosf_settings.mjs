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

}

function setLangNl(){
  console.log("Set nl");
  currentlang="nl";
  SetglobalplayerSubtitle(currentlang);
}

export function setLangEn(){
  console.log("Set en")
  currentlang="en";
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
    if (globalVideospeed >=3) globalVideospeed=0;

    if (globalplayer)
        switch (globalVideospeed) {
          case 0: globalplayer.setPlaybackRate(1);console.log("Speed 1");break;
          case 1: globalplayer.setPlaybackRate(1.5);console.log("Speed 1.5");break;
          case 2: globalplayer.setPlaybackRate(2);console.log("Speed 2");break;
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

function DarkmodeOnOff(event) {
    var fOn=GetToggleState(this,"displayactive");
    console.log(`In darkmodeOnOff ${fOn}`);
    if (!fOn)
        disableDarkmode();
    else
        enableDarkmode();
}

async function enableDarkmode() {
  console.log("enableDarkmode");
  var css = await LoadCSS();
  css.disabled = false;
}

async function LoadCSS(){
  console.log("In load css");
  var link = document.createElement('link');
  link.rel  = 'stylesheet';
  link.href = "https://www.mgatsonides.online:5001/lib/viewer_figma/dm.css";
  document.body.appendChild(link);
  //link.transition="all 200 ease-in-out";
  //link.transitionDelay="2s";
  //link.disabled == false;
  globalInjectedCSS = link;
  LoadCSS = function (){return globalInjectedCSS;};
}

async function disableDarkmode() {
  console.log("disableDarkmode");
  var css = await LoadCSS();
  css.disabled = true;
}
