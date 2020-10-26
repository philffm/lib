import {SetglobalplayerSubtitle} from '../viewer_figma/koiosf_viewer.mjs'
import {loadScriptAsync,publish,getElement} from '../lib/koiosf_util.mjs';

/* General comments

// note: when connected via USB & full screen: playing video is flickering
//https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement
// <script src='https://raw.githubusercontent.com/web3examples/lib/master/koiosf_video.js'></script>  
// <script src='https://web3examples.com/lib/koiosf_video.js'></script>  
// <script src='https://gpersoon.com/koios/koiosf_video.js'></script>  
// https://developer.mozilla.org/en-US/docs/Web/API/VTTCue
// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/track
// http://ronallo.com/demos/webvtt-cue-settings/
// https://developer.mozilla.org/en-US/docs/Web/API/TextTrack 
https://developers.google.com/youtube/iframe_api_reference
https://developers.google.com/youtube/player_parameters
https://github.com/DefinitelyTyped/DefinitelyTyped/issues/25370  (does work)
https://stackoverflow.com/questions/13735783/youtube-api-how-to-use-custom-controls-to-turn-captions-on-off-change-languag/38346968
https://terrillthompson.com/648

player.getOptions() => "captions"
player.getOptions('captions')=>
0: "reload"
1: "fontSize"
2: "track"
3: "tracklist"
4: "translationLanguages"
5: "sampleSubtitle"

player.getOption('captions', 'tracklist');
0: {languageCode: "zh-CN", languageName: "Chinese (China)", displayName: "Chinese (China)", kind: "", name: null, …}
1: {languageCode: "nl", languageName: "Dutch", displayName: "Dutch", kind: "", name: null, …}
2: {languageCode: "en", languageName: "English", displayName: "English", kind: "", name: null, …}
3: {languageCode: "fr-FR", languageName: "French (France)", displayName: "French (France)", kind: "", name: null, …}
4: {languageCode: "de", languageName: "German", displayName: "German", kind: "", name: null, …}
5: {languageCode: "ru", languageName: "Russian", displayName: "Russian", kind: "", name: null, …}
6: {languageCode: "es", languageName: "Spanish", displayName: "Spanish", kind: "", name: null, …}

player.getOption('captions', 'track');
{languageCode: "nl", languageName: "Dutch", displayName: "Dutch", kind: "", name: null, …}

layer.getOption('captions', 'translationLanguages')
(104) [{…}, {…},

player.setOption('captions', 'track', {'languageCode': 'nl'});
player.setOption('captions', 'track', {});
player.setOption("captions", "displaySettings", {"background": "#fff"}); // doesnt work
*/  

async function onStateChange(event) {
    SetglobalplayerSubtitle(localStorage.getItem("currentlang"));
  
    switch (event.data) {
        case -1: publish ("videounstarted"); break;
        case  0: publish ("videoend");       break;
        case  1: publish ("videostart");     break;
        case  2: publish ("videopause");     break;
        case  3: publish ("videobuffering"); break;
        case  5: publish ("videocued");      break;
    }
}    
   
export async function SetupVideoWindowYouTube(id) { 
    var domid=getElement(id)
    domid.id=id; // youtube player want to have in id
    var player;
        
    await new Promise(async function(resolve, reject) {        // promise to be able to wait until ready
        window.onYouTubeIframeAPIReady = resolve;              // resolve the promise when iframe is ready    
        loadScriptAsync("https://www.youtube.com/iframe_api"); // load this way to prevent a cors message   
    });
    
    await new Promise(async function(resolve, reject) {
       player = new YT.Player(id, {      // store in a div below the grid, otherwise IOS/safari makes is full heigth
            playerVars: { 
                noCookie: true,  // testje
                modestbranding: true, 
                controls: "0", // misschien nodig voor niet fullscreen
                autoplay: 0,
                //origin:"https://koios.online",    //with this set to an wrong value, the onReady event isn't triggered
                origin:"https://gpersoon.com",
                
                rel:0, 
                cc_lang_pref:"nl",
                cc_load_policy:1,
                playsinline:"1"    // for IOS
            },     
            height: '100%',
            width: '100%',
            videoId:   "unknown",//  "z9nux3Kt7Tk", 
            events: {
                'onReady': x=>{ console.log("onReady");resolve(); }, // resolve the promise
                'onStateChange': onStateChange  // callback                   
            }          
        });  
    });  
    publish("youtubepluginloaded");
    return player; 
}

// ** IPFS version // check
async function SetupVideoWindowIPFS(ipfs,windowid,hash) {       
    var vp=getElement(windowid);
    video=document.createElement("video");
    video.controls=false;
    video.style.height="100%";
    video.style.width="100%";
    video.addEventListener('error', videoerror, true);   
    vp.appendChild(video);
    video.addEventListener('timeupdate', (event) => {  // about 4x/second
        VideoLocation();
    });    
    LoadHlsVideo(video,ipfs,hash);
}

function LoadHlsVideo(video,node,hash) {
    Hls.DefaultConfig.loader = HlsjsIpfsLoader
    Hls.DefaultConfig.debug = false
    if (Hls.isSupported()) {
        const hls = new Hls()
        hls.config.ipfs = node
        hls.config.ipfsHash = hash
        hls.loadSource('master.m3u8'); // contains link to rest of content
        hls.attachMedia(video)
        hls.on(Hls.Events.MANIFEST_PARSED, () => log("Video ready to play"))
    }
}

function videoerror(event){ 
    let error = event;
    if (event.path && event.path[0]) {     // Chrome v60
        error = event.path[0].error;
    }    
    if (event.originalTarget) { // Firefox v55
        error = error.originalTarget.error;
    }
    alert(`Video error: ${error.message}`);     // Here comes the error message
}
  
async function asyncloaded() {    
    var player = await SetupVideoWindowYouTube("realvideoplayer");   
    publish("videoplayerready",player)
}
  
window.addEventListener('DOMContentLoaded', asyncloaded);  // load      