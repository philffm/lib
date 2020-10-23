// https://browserhow.com/how-to-clear-chrome-android-history-cookies-and-cache-data/
// imports
import {HideButton,DragItem,publish,subscribe,LinkClickButton,CanvasProgressInfoClass,getElement,LinkVisible } from '../lib/koiosf_util.mjs';
import {SetupLogWindow} from '../lib/koiosf_log.mjs';
import {} from './koiosf_playvideo.mjs';
import {SelectNextLesson,GlobalLessonList } from './koiosf_lessons.mjs';
import {} from './koiosf_subtitles.mjs';
import {UpdateTranscript,SetVideoTranscriptCallbacks} from './koiosf_showtranscript.mjs';
import {UpdateSlide} from './koiosf_slides.mjs';
import {} from './koiosf_notes.mjs';
import {InitSpeak,StopSpeak,StartSpeak,EnableSpeech,IsSpeechOn} from './koiosf_speech.mjs';
import {} from './koiosf_popup.mjs';
import {} from './koiosf_messages.mjs';
import {} from './koiosf_music.mjs';
import {GetCourseInfo} from './koiosf_course.mjs';
import {} from './koiosf_login.mjs';
import {} from './koiosf_literature.mjs';
import {} from './koiosf_screenlayout.mjs';
import {} from './koiosf_comments.mjs';
import {} from './koiosf_quiz.mjs';
import {} from './koiosf_badges.mjs';
import {currentlang, setDarkmode} from './koiosf_settings.mjs';
import {} from './koiosf_leaderboard.mjs';

var globalplayer=0;
export var currentvidinfo;

//Unused variables
/*
var position;
var logpos;
var logtext=0;
var logipfs;
var slide;
var SecondsToSubtitle=[];
var globalyoutubeid; // global for onYouTubeIframeAPIReady
var previous_colour=""
var previous_row=-1;
var table
var tablediv
var captionLanguageGlobal = "en";
var vidproginput=0;
var vidprogress=0;
var fSoundOn=true;
*/

// Global variables
var ToggleCueVisibilityStatus=true;
var slider=0; // global
var defaultvolume=100;
var video=0;

function GetDuration() {
    if (video) return video.duration;
    if (globalplayer && globalplayer.getDuration) return  globalplayer.getDuration();
    return 0;
}

subscribe("videoplayerready",VideoPlayerReady);
function VideoPlayerReady(playerobject) {
    globalplayer = playerobject;
    if (currentvidinfo)
        LoadVideo(currentvidinfo)
}

var seeninfo;
var GlobalCanvasProgressInfo;

async function VideoLocation() {
    var CurrentPos=0;
    var Duration=GetDuration();
    var PlaybackRate=1;
    //var ReallyPlayed=0; - unused

    if (IsVideoPaused())
        return;  // probably just ended, don't update any more

    if (globalplayer) {
        if (globalplayer.getCurrentTime) {
            CurrentPos=globalplayer.getCurrentTime();
            PlaybackRate=globalplayer.getPlaybackRate()
        }
    }

    UpdateTranscript(CurrentPos);
    UpdateSlide(CurrentPos);
    SetVideoProgressBar(parseFloat (CurrentPos / Duration ));

    var cursec=Math.floor(CurrentPos)
    if (!seeninfo.seensec[cursec]) {
        seeninfo.seensec[cursec]=1;
        seeninfo.seensum++;
        GlobalCanvasProgressInfo.UpdateItem(seeninfo,cursec)
    }
    await GlobalLessonList.SaveVideoSeen(seeninfo,currentvidinfo)
}

async function SeenVideo() { // every few seconds save the progress
    seeninfo.seenend=true;
    await GlobalLessonList.SaveVideoSeen(seeninfo,currentvidinfo)
	publish("videoseen",currentvidinfo);
}

subscribe('videoend',    SeenVideo);

async function NextVideo() {
    stopVideo();
    
    if (localStorage.getItem("autoplaystatus")=="true") {
        var tempvidinfo = currentvidinfo;
        await sleep(3000);
        if (currentvidinfo == tempvidinfo) {
            SelectNextLesson(+1);
        }
    }
}


async function tcallback() {
    VideoLocation();
    if (!IsVideoPaused())
        setTimeout( tcallback, 400); // 400
}

//unused function
function SwapObjects(obj1,obj2) {
    var temp = document.createElement("div"); // create marker element
    obj1.parentNode.insertBefore(temp, obj1); // and insert it where obj1 is
    obj2.parentNode.insertBefore(obj1, obj2); // move obj1 to right before obj2
    temp.parentNode.insertBefore(obj2, temp); // move obj2 to right before where obj1 used to be
    temp.parentNode.removeChild(temp); // remove temporary marker node
    // temp should be carbage collected
}

//unused function
function swapElements(obj1, obj2) {  // not used now
    var temp = document.createElement("div"); // create marker element
    var c1 = obj1.childNodes;
    var c2 = obj2.childNodes;
    while (obj1.childNodes.length > 0) temp.appendChild(obj1.childNodes[0]);
    while (obj2.childNodes.length > 0) obj1.appendChild(obj2.childNodes[0]);
    while (temp.childNodes.length > 0) obj2.appendChild(temp.childNodes[0]);
}

//unused function
function CreateButton(name,funct,place) {
    var buttonback=document.createElement("button");
    buttonback.innerHTML = name;
    buttonback.addEventListener("click", funct);
    place.appendChild(buttonback);
}

function GetVolume() {
    if (video) return video.volume;
    if (globalplayer && globalplayer.getVolume) return globalplayer.getVolume();
    return 0;
}

function SetVolume(newvol) {
    if (video) {
        const newvolint=parseFloat( newvol/ 100);
        video.volume = newvolint;
    }
    if (globalplayer && globalplayer.setVolume) globalplayer.setVolume(newvol);
}

function CreateSoundSlider() {
    let divsoundslider=getElement("soundslider");
    var input=document.createElement("input");
    input.type="range"
    input.min="0"
    input.value=defaultvolume;
    input.max="100"
    input.step="1"
    input.addEventListener("change", obj => SetVolume(obj.target.value))
    divsoundslider.appendChild(input);
    SetVolume(defaultvolume);
}

export async function SetVideoSeconds(seconds) {
    if (globalplayer)
        globalplayer.seekTo(seconds, true);

    UpdateTranscript(seconds)
    UpdateSlide(seconds);
}

async function SetVideoProgressBar(perc) {
    if (slider)
        slider.style.left =  (perc*100)+"%";
}

export async function CreateVideoSlider() {
    slider=getElement("videodrag");//.parentElement;
    function XYUpdate(percx,percy) {
        if (percx >1) percx=1;
        if (percx <=0) percx=0;
        SetVideoProgressBar(percx);
        SetVideoSeconds(parseFloat (GetDuration()*percx ));
    }
    SetVideoProgressBar(0);
    DragItem("videodrag","videoprogressbar","mainscreen",XYUpdate);
}

function IsVideoPaused(){
    var fpaused=false;
    if (globalplayer && globalplayer.getPlayerState)
        fpaused=( globalplayer.getPlayerState() !== 1); // 1 – playing
    return fpaused;
}

export async function startVideo() {
    HideButton("StartButton",true);

    if (video) {
        video.play();
        video.autoplay=true; // so after location change the video continues to play
    }
    if (globalplayer) {
        if (IsVideoPaused()) // maybe already started via youtube interface
            globalplayer.playVideo();
    }

    publish("videostarted");
    tcallback(); // callbacks for the progress
}

function TranscriptShownCB(txt) {
    StartSpeak(txt);
}

function stopVideo() {
    HideButton("StartButton",false);
    if (video) video.pause();
    if (globalplayer) globalplayer.pauseVideo();
    StopSpeak();
    publish("videostopped");
}

//unused function
function TogglePauseVideo() {
    var fpaused=IsVideoPaused()
    if (fpaused) {
        if (video)  video.play();
        if (globalplayer) globalplayer.playVideo();
    } else {
        if (video) video.pause();
        if (globalplayer)  globalplayer.pauseVideo();
    }
    UpdateVideoIndicator(!fpaused);
    StopSpeak();
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function ToggleSpeech(){
    var fspeechon = !IsSpeechOn();
    EnableSpeech(fspeechon);
    EnableSound(!fspeechon); // disable video sound when speech is on
}

export function SetglobalplayerSubtitle(lang) {
    if (globalplayer &&  globalplayer.setOption)
        globalplayer.setOption('captions', 'track', lang==""?{}:{'languageCode': lang});
}

function CueVisible(lang) { // if lang="" then cue invisible
    if (globalplayer)
        SetglobalplayerSubtitle(lang);
}

export function ToggleCueVisibility() {
    ToggleCueVisibilityStatus = !ToggleCueVisibilityStatus;
    SetglobalplayerSubtitle(ToggleCueVisibilityStatus?currentlang:"");
}

var signs=0;
async function PlayerLoaded() {
    signs++;
    if (signs ==1) // only at exactly 1
        publish("playerloaded");
}

subscribe("youtubepluginloaded",PlayerLoaded);
subscribe('videostart',  startVideo);
subscribe('videopause',  stopVideo);
subscribe('videostop',   stopVideo);
subscribe('videoend',    NextVideo);
subscribe('slidesloaded',    PlayerLoaded);

var fVideoRunning=false;

subscribe('popupdisplayblock',x=> { fVideoRunning=!IsVideoPaused();stopVideo();} );
subscribe('popupdisplaynone', x=> { if (fVideoRunning) startVideo(); } ); // if running before, start again
subscribe("loadvideo",LoadVideo);

async function LoadVideo(vidinfo) { // call when first video is loaded or a diffent video is selected
    if (!vidinfo) return;

    if (globalplayer) {
        globalplayer.cueVideoById(vidinfo.videoid,0); // start at beginning
    }
    
    currentvidinfo = vidinfo;
    SetVideoProgressBar(0)
    seeninfo=GlobalLessonList.LoadVideoSeen(vidinfo);
    GlobalCanvasProgressInfo.Update(seeninfo)
}

subscribe("setcurrentcourse",SetCurrentCourse)
var globalcommunity
var globalcommunityinvite

async function SetCurrentCourse() {
    globalcommunity=await GetCourseInfo("community");
    globalcommunityinvite=await GetCourseInfo("communityinvite");
}

function ScrCommunityMadeVisible () {
    getElement("communitylink").href=globalcommunity
    getElement("communitylink").target="_blank"
    getElement("communitylink").textContent=globalcommunity;
}

function SlackJoin() {
	window.open(globalcommunityinvite, '_blank');
}

async function asyncloaded() {
    publish("playerstart");
    LinkVisible("scr_community" ,ScrCommunityMadeVisible)
    LinkClickButton("slackjoin",SlackJoin);
    LinkClickButton("back",stopVideo,"scr_viewer");
    getElement("StartButton").addEventListener('animatedclick',startVideo)
    subscribe('videocued', x=>{HideButton("StartButton",false);})

    var videofield=getElement("videofield");
    videofield.addEventListener('click', x=>{console.log("videofield click");if (!IsVideoPaused()) stopVideo();});
    CreateVideoSlider();  //ff uitgezet
    GlobalCanvasProgressInfo=new CanvasProgressInfoClass(getElement("videoprogressbar"),true,"#20FFB1")//"green")

    InitSpeak();
    var chatlink="https://gitter.im/web3examples/test/~embed";
    var metaDom = getElement("viewport");
    if (metaDom) {
        metaDom.content=metaDom[0].content+", user-scalable=no"; //maximum-scale=1.0, minimum-scale=1.0"; // fix zoom
    }
    var newmeta=document.createElement("meta");
    newmeta.name="theme-color"
    newmeta.content="#EBEBD3" //#20FFB1"
    getElement("head").appendChild(newmeta);
    SetglobalplayerSubtitle(localStorage.getItem("currentlang"));
    SetVideoTranscriptCallbacks(SetVideoSeconds,TranscriptShownCB);
    setDarkmode(localStorage.getItem("darkmodestatus")=="true");
}

publish("playerloading");
SetupLogWindow();
var url = window.location.pathname;
var filename = url.substring(url.lastIndexOf('/')+1);
window.addEventListener('DOMContentLoaded', asyncloaded);  // load