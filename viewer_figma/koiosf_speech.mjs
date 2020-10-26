var voices = [];
var synth = window.speechSynthesis;
var currentVoice=0;
var PrepareSpeechIconsTemplate;
var PrepareSpeechIconsParent;
var fspeechon=false;

export function SetSpeechLang (lang) {
    var mainlang= lang.split("-")[0]; // take first characters before "-"
    
    for (var i=0;i<voices.length;i++) {
        var matchlang = voices[i].lang.split("-")[0]
        
        var domid=getElement("spsynth-"+i);
        
        if (matchlang == mainlang) {            
            console.log(voices[i].name);
            domid.style.display = "block"; 
            currentVoice = voices[i]; // use the last language
        }
        else
            domid.style.display = "none";   
    }
}    
    
export function StartSpeak(text) {
    StopSpeak(); // stop preview texts
    if (fspeechon) {
        var utterThis = new SpeechSynthesisUtterance(text);
        utterThis.voice = currentVoice;
        synth.speak(utterThis);
    }  
}

export function StopSpeak() {  
    if (fspeechon)
        synth.cancel();
}

function populateVoiceList() {
    voices = synth.getVoices();  
    PrepareSpeechIcons()   
    for (var i=0;i<voices.length;i++) {
        var cln = PrepareSpeechIconsTemplate.cloneNode(true);
        PrepareSpeechIconsParent.appendChild(cln);        
        var buttonid="spsynth-"+i;
        cln.id=buttonid; // assign id's
        var name = voices[i].name;
        name = name.replace(/Google/g, "");
        name = name.replace(/Microsoft /g, "");
        name = name.replace(/Desktop /g, "");
        name = name.replace(/English /g, "");
        cln.innerHTML=name;
        cln.style.display = "none"; // hide all spsynth buttons
    }    
}

function SelectSpeachSynth(event) {
    DisplayCurrentFunctionName(arguments);     
    var id=event.id.split("-")[1]; 
    currentVoice=voices[id];
    EnableSpeech(true);
}    

function PrepareSpeechIcons() {                            //==> DomList omzetten
    var list = getElement("spsynthbtn");
    if (list && list[0]) {
        PrepareSpeechIconsTemplate = list[0];        
        PrepareSpeechIconsParent   = list[0].parentNode
        list[0].remove();
    } else
        console.error("spsynthbtn not found");
    
    PrepareSpeechIcons = function(){} // next time do nothing
}    

//Function doesn't do much
export function InitSpeak() { // called once
    if (window.speechSynthesis && window.speechSynthesis.onvoiceschanged !== undefined) {
        //speechSynthesis.onvoiceschanged = populateVoiceList;   // ff uitgezet
    }
    // responsiveVoice.setDefaultVoice("Dutch Female");
}

export function EnableSpeech(on) {
    StopSpeak();
    fspeechon=on;
}

export function IsSpeechOn() {
    return fspeechon;
}