import {loadScriptAsync,DomList,LinkToggleButton,subscribe,getElement,MonitorVisible,ForAllElements,setElementVal,publish,GetJson,LinkClickButton,LinkVisible,sleep} from '../lib/koiosf_util.mjs';
import {DisplayMessage,SwitchDisplayMessageContinous,DisplayMessageContinous} from './koiosf_messages.mjs';  
import {GetToggleState} from '../genhtml/startgen.mjs'

var globalplayer=0;
var globalVideospeed=0;


async function asyncloaded() {    
    console.log(`In asyncloaded of script: ${import.meta.url}`); 
    LinkVisible("scr_settings"  ,ScrSettingsMadeVisible)    
    LinkClickButton("videospeed",RotateVideoSpeed);
    subscribe("videoplayerready",VideoPlayerReady);
    LinkClickButton("fontsize",FontSize);
    LinkToggleButton("audioonoff",AudioOnOff)
	
  
      
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
    if (font > 3) font= -1;
    console.log(`Setting font to: ${font}`);
    globalplayer.setOption('captions', 'fontSize', font);

    setElementVal("__label",parseInt(font)+2,"fontsize")
}


function AudioOnOff(event) {  

    var fOn=GetToggleState(this,"displayactive")    
    console.log(`In AudioOnOff ${fOn}`);    
    if (!globalplayer) return;
    if (!fOn) 
        globalplayer.unMute(); 
    else 
        globalplayer.mute(); 
}   

