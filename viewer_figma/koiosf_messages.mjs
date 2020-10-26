import {sleep,getElement} from '../lib/koiosf_util.mjs'; 
import {SwitchPage} from '../genhtml/startgen.mjs';

export async function DisplayMessage(text) {    
    getElement("ov_message").dispatchEvent(new CustomEvent("show"));  
    var msgtext=getElement("msg-text");
    msgtext.innerText=text; 
    await sleep(3000);   
   	getElement("ov_message").dispatchEvent(new CustomEvent("hide"));  
}

export async function SwitchDisplayMessageContinous(fOn) {
  	getElement("ov_message").dispatchEvent(new CustomEvent(fOn?"show":"hide"));  
  
    if (!fOn) 
      	SwitchPage("close") // close message overlay
    
    var msgtext=getElement("msg-text");
    msgtext.innerText = ""; 
}

export async function DisplayMessageContinous(text) {    
    var msgtext=getElement("msg-text");
    msgtext.innerText +=text+"\n";
    msgtext.scrollTop = msgtext.scrollHeight; // keep the windows "scrolled down"
}