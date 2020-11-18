// https://browserhow.com/how-to-clear-chrome-android-history-cookies-and-cache-data/
// imports
import {HideButton,DragItem,publish,subscribe,LinkClickButton,LinkToggleButton,CanvasProgressInfoClass,LinkVisible,ForAllElements,setElementVal,getElementVal,DomList,getElement} from '../lib/koiosf_util.mjs';
import {SetupLogWindow} from '../lib/koiosf_log.mjs';
import {GetToggleState} from '../genhtml/startgen.mjs';

var darkModeactive = false;
var githubRepoUrl = 'https://philffm.github.io/lib/openflasq/';



async function asyncloaded() {
    addStyle(`
        [class*="Button"] {
            border-radius: 7px;
            
        }
    `);
    LoadCSS(githubRepoUrl +'flasq.css');
    init();
    
    LinkToggleButton("partymode", switchDarkmode);
}
function switchDarkmode(event) {
    var fOn=GetToggleState(this,"displayactive");
    if (!fOn)
        setDarkmode();
    else
        setDarkmode();
        
}

function setDarkmode(){
    if (darkModeactive == false){
        LoadCSS(githubRepoUrl +'dm.css');
        darkModeactive = true;
        console.log('DARKMODE HALLO');
    }else if(darkModeactive == true){
        RemoveCSS('dm.css');
        darkModeactive = false;
        console.log('DARKMODE CIAO');

    }
    

}

//document.querySelector('.E-Mail').textContent();
            

async function init(){
    initTextFields();
    initYoutube('https://www.youtube.com/watch?v=7dzNcHe1mL0');
    initLottie('https://assets3.lottiefiles.com/private_files/lf30_c7yhrgse.json');
    initFonts();
}

async function initYoutube(youtubeUrl){
    var youtubeElement = getElement("videowrapper");
    youtubeElement.innerHTML = '<iframe width="100%" height="100%" src="https://www.youtube-nocookie.com/embed/7dzNcHe1mL0?controls=0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';

}

async function initLottie(lottieUrl){
    LoadJS('https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js');
    var lottieElement = getElement("glasscaraffe");

    lottieElement.innerHTML = '<lottie-player src="'+ lottieUrl +  '" background="transparent"  speed=".5"  style="width: 500px; height: 500px;" loop autoplay></lottie-player>';
}


function initTextFields(){
    var target=getElement("Input");
    target.contentEditable="true"; // make div editable
    target.style.whiteSpace = "pre"; //werkt goed in combi met innerText
    target.style.color = "black";
}


SetupLogWindow();
var url = window.location.pathname;
var filename = url.substring(url.lastIndexOf('/')+1);
window.addEventListener('DOMContentLoaded', asyncloaded);  // load



async function LoadCSS(cssurl){
    var link = document.createElement('link');
    link.rel  = 'stylesheet';
    link.href = cssurl;
    document.head.appendChild(link);
}

async function RemoveCSS(cssurl){
    document.querySelector('link[href$="'+cssurl+'"]').remove();
}


async function LoadJS(jsurl){
    var script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', jsurl);
    document.head.appendChild(script);
}

async function addStyle(styleString) {
    const style = document.createElement('style');
    style.textContent = styleString;
    document.head.append(style);
  }
  

async function initFonts(){
    LoadCSS("https://fonts.gstatic.com");
    LoadCSS("https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;1,100;1,300;1,400&display=swap");
}
