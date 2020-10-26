import {LinkButton,LinkClickButton,subscribe,getElement,setElementVal,FitOneLine} from '../lib/koiosf_util.mjs';   
import {DisplayMessage,SwitchDisplayMessageContinous,DisplayMessageContinous} from './koiosf_messages.mjs';  

subscribe("loadvideo",ShowVideoInfoInNotes) 

window.addEventListener('DOMContentLoaded', asyncloaded);  // load  

var GlobalNotesArea

async function asyncloaded() {    
    GlobalNotesArea=new NotesAreaClass(getElement("notes"))
    FitOneLine(getElement("videotitle"))
    LinkClickButton("share",ShareNotes);
}
  
function ShowVideoInfoInNotes(vidinfo) {
	if (!vidinfo) return;
    GlobalNotesArea.UpdateId(vidinfo.videoid);
    setElementVal("videotitle","Notes for: "+vidinfo.txt);
}  
 
class NotesAreaClass {    
    constructor (target) {
        this.target=target;        
        this.target.contentEditable="true"; // make div editable
        this.target.style.whiteSpace = "pre-line"; //werkt goed in combi met innerText
        this.target.style.wordWrap = "break-word";                
        this.target.innerHTML = "..."
        this.target.addEventListener('input',this.SaveTxt , true); // save the notes    
    }   // this.target.removeEventListener('input',this.SaveTxt , true); // save the notes       
    
    UpdateId(uniqueid) {
        this.uniqueid=uniqueid
        this.target.innerHTML = "..."
        var cached=localStorage.getItem("notes-"+this.uniqueid);     
        if (cached) 
            this.target.innerHTML = cached;           
    }    
    GetId() {
        return this.uniqueid
    }    
    
    GetText() {       
        return this.target.innerText;
    }
    
    SaveTxt(txt) { // this is different now(eventlistener related)
        var uniqueid=GlobalNotesArea.GetId();
        localStorage.setItem("notes-"+uniqueid, txt.target.innerText);
    }

}     
    
//var NotesArea; - unused

function getVisibleTranscriptandCopyToClipboard() {
    var text="";
    var arrchildren=innertrans.children;
    for (var i=0;i<arrchildren.length;i++) {
        if (arrchildren[i].style.display == "block") // then it's visible
            text +=arrchildren[i].textContent;
    }
    writeToClipboard(text);    
}

LinkButton("transcripttoclipboard",getVisibleTranscriptandCopyToClipboard);  
    
async function writeToClipboard(text) {   // doesn't work on blob page (no permission)
    try {
        await navigator.clipboard.writeText(text);
        var msg=`Copied to clipboard (${text.length} characters)`;
        DisplayMessage(msg);
    } catch (error) {
        DisplayMessage(error.message);
        console.error(error);
    }
}

async function ShareNotes() {
    var toShare=GlobalNotesArea.GetText()
    let err;
    
    try {
        if (navigator && navigator.share && (typeof(navigator.share)=="function")) {
            SwitchDisplayMessageContinous(true)
            DisplayMessageContinous("Select destination");
            await navigator.share({ title: "Sharing notes", text: toShare }).catch( x=>err=x);   // note crashes windows chrome Version 84.0.4147.105 
            SwitchDisplayMessageContinous(false)
            return;
        }
    } catch(error) {
        DisplayMessage(error.message);
    }
    writeToClipboard(toShare);     // if share doesn't work then write to clipboard
} 

function sendMail() { // - Unused function
    var href = "mailto:";  
    href += "?SUBJECT=Notes from: "+encodeURI(window.location.href);
    href += "&BODY="+encodeURI(getElement("notesarea").value);;
    window.open(href,"_blank"); 
}