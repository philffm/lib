import {DragItem,subscribe,LinkToggleButton,getElement,ForceButton,LinkVisible,LinkInVisible} from '../lib/koiosf_util.mjs';
import {SwitchPage,GetToggleState} from '../genhtml/startgen.mjs'

var fFullScreen=false;

export async function SetupSliders() {
    var grid=getElement("mainscreen");   
    var SetMiddleh="6px"
    var SetMiddlev1="6px"
    XYUpdate(0.5,0.5);

    async function XYUpdate(percx,percy) {
        const snap = 0.01;        
        var delta="3px" // to compensate for the 6 px in the middle                
        var left  = (percx      < snap) ? "0px":`${percx*100}%`;
        var right = ( (1-percx) < snap) ? "0px":`${(1-percx)*100}%`;        
        var top   = (percy      < snap) ? "0px":`${percy*100}%`;
        var bot   = ( (1-percy) < snap) ? "0px":`${(1-percy)*100}%`;        
        
        var c=`calc(${left} - ${delta}) ${SetMiddleh}  calc(${right} - ${delta})`; // extra spaces required
        var r=`calc(${top}  - ${delta}) ${SetMiddlev1} calc(${bot}   - ${delta})`;
        grid.style["gridTemplateColumns"] = c;
        grid.style["gridTemplateRows"]    = r;
        var a=window.getComputedStyle(grid).getPropertyValue("grid-template-columns")
        var b=window.getComputedStyle(grid).getPropertyValue("grid-template-rows")                
    }
    DragItem("move","mainscreen","mainscreen",XYUpdate,ToggleMainLayout);
}

function ToggleMainLayout() {
    var fOn=GetToggleState(getElement("selectnotes"),"display")   
    SetPlateau(!fOn)    
}

function SetPlateau(fOn) {
	var ev = new CustomEvent(fOn?"show":"hide");
	getElement("selectliterature1").parentNode.style.display=fOn?"block":"none"	 
	getElement("selectliterature2").parentNode.style.display=fOn?"block":"none"
	getElement("selectnotes").dispatchEvent(ev);   
	getElement("selectvideo").dispatchEvent(ev);   
	getElement("selectslides").dispatchEvent(ev);	
	
	localStorage.setItem("showplateau",fOn) 
}

function ToggleLiterature1(event) {
	var fOn=GetToggleState(this,"displayactive")
	SetLiterature1(fOn)
}  
  


  
function SetLiterature1(fOn) {  
	if (fOn) {
		getElement("9BottomRight").style.gridArea="3 /1 / span 1 / span 3"
		getElement("7ContentArea").style.display="none"
		getElement("3NotesArea").style.display="flex"
	}
	else {
		getElement("9BottomRight").style.gridArea="3 /3 / span 1 / span 1"
		getElement("7ContentArea").style.display="flex"
		getElement("3NotesArea").style.display="flex"
	}
		
	ForceButton("selectliterature1",false);
	localStorage.setItem("showliterature1",fOn) 
	getElement("selectliterature1").dispatchEvent( new CustomEvent(fOn?"displayactive":"displaydefault"));   
}  
  
function ToggleLiterature2(event) {
  	var fOn=GetToggleState(this,"displayactive")
   	SetLiterature2(fOn)
}  

function SetLiterature2(fOn) {  
	if (fOn) {
		getElement("9BottomRight").style.gridArea="1 /3 / span 3 / span 1"
		getElement("3NotesArea").style.display="none"
		getElement("7ContentArea").style.display="flex"
	}
	else {
		getElement("9BottomRight").style.gridArea="3 /3 / span 1 / span 1"
		getElement("7ContentArea").style.display="flex"
		getElement("3NotesArea").style.display="flex"
	}

	ForceButton("selectliterature2",false);
	localStorage.setItem("showliterature2",fOn) 
	getElement("selectliterature2").dispatchEvent( new CustomEvent(fOn?"displayactive":"displaydefault"));   
}    

function ToggleNotes(event) {
	var fOn=GetToggleState(this,"displayactive")
	SetNotes(fOn)
}

function SetNotes(fOn)  {
	if (fOn) {
		getElement("3NotesArea").style.gridArea="1 /3 / span 3 / span 1"
		getElement("3NotesArea").style.display="flex"
		getElement("9BottomRight").style.display="none"
	}
	else {
		getElement("3NotesArea").style.gridArea="1 /3 / span 1 / span 1"
		getElement("9BottomRight").style.display="flex"
	} 

	localStorage.setItem("shownotes",fOn) 	
	getElement("selectnotes").dispatchEvent( new CustomEvent(fOn?"displayactive":"displaydefault"));   
}  


function ToggleVideo(event) {
  	var fOn=GetToggleState(this,"displayactive")
  	SetVideo(fOn)
}  
  
function SetVideo(fOn) {    
	if (fOn) {
		getElement("1VideoPlayerContainer").style.gridArea="1 /1 / span 1 / span 3"
		getElement("3NotesArea").style.display="none"
	}
	else {
		getElement("1VideoPlayerContainer").style.gridArea="1 /1 / span 1 / span 1"
		getElement("3NotesArea").style.display="flex"
	}
	localStorage.setItem("showvideo",fOn) 
	getElement("selectvideo").dispatchEvent( new CustomEvent(fOn?"displayactive":"displaydefault"));   
}

function ToggleSlides(event) {   // row / column  / rowsspan / columnspan
	var fOn=GetToggleState(this,"displayactive")
	SetSlides(fOn)
}  
  
function SetSlides(fOn) {
	if (fOn) {
		getElement("7ContentArea").style.gridArea="3 /1 / span 1 / span 3"
		getElement("7ContentArea").style.display="flex"
		getElement("9BottomRight").style.display="none"
	}
	else {
		getElement("7ContentArea").style.gridArea="3 /1 / span 1 / span 1"
		getElement("7ContentArea").style.display="flex"
		getElement("9BottomRight").style.display="flex"
		getElement("9BottomRight").style.gridArea="3 /3 / span 1 / span 1"
	}  
	localStorage.setItem("showslides",fOn) 
	getElement("selectslides").dispatchEvent( new CustomEvent(fOn?"displayactive":"displaydefault"));   
}

function ToggleLeftMenu(event) {   // row / column  / rowsspan / columnspan  
	var fOn=GetToggleState(this,"displayactive")
	SetLeftmenu(fOn)  
}  

function SetLeftmenu(fOn) {
	getElement("Leftmenupane").style.display=!fOn?"block":"none"
	localStorage.setItem("showleftmenu",fOn) 
	  	getElement("btnleftmenu").dispatchEvent( new CustomEvent(!fOn?"displaydefault":"displayactive"));  
}	

function ToggleRightMenu(event) {   // row / column  / rowsspan / columnspan
	var fOn=GetToggleState(this,"displayactive")
	SetRightmenu(fOn)  
}  

function SetRightmenu(fOn) {	
	getElement("Rightmenupane").style.display=!fOn?"block":"none"
	localStorage.setItem("showrightmenu",fOn) 
	getElement("btnrightmenu").dispatchEvent( new CustomEvent(!fOn?"displaydefault":"displayactive"));  
}	

export async function SwitchIntroScreen(fOn) {
    var intro=getElement("scr_intro");
    intro.style.display=fOn?"flex":"none";    
}

export async function SwitchStartScreen(fOn) {
    var intro=getElement("scr_start");
    intro.style.display=fOn?"flex":"none";    
}

subscribe('playerloading',  InitScreenlayout1);
subscribe('playerloaded',   InitScreenlayout2); 
           
function InitScreenlayout1() { // when page is loaded
    SwitchIntroScreen(true);
}    

function InitScreenlayout2() { // after everything has been loaded
    SwitchPage("scr_profile");
}    

var fGlobalLargeNotes=true;

function qToggleMainLayout() {
    fGlobalLargeNotes = !fGlobalLargeNotes;
    SwitchMainLayout(fGlobalLargeNotes)
}
    
export async function SwitchMainLayout(fLargeNotes) {
    var notesfieldlarge=getElement("notesfieldlarge");
    notesfieldlarge.style.display=fLargeNotes?"flex":"none";    
    
    var notesfieldsmall=getElement("notesfieldsmall");
    notesfieldsmall.style.display=!fLargeNotes?"flex":"none";    
    
    var slideplayersmall=getElement("slideplayersmall");
    slideplayersmall.style.display=fLargeNotes?"flex":"none";    
    
    var slideplayerlarge=getElement("slideplayerlarge");
    slideplayerlarge.style.display=!fLargeNotes?"flex":"none";    
    
    var notes=getElement("notescontainer");
    var slideplayer=getElement("slideplayer");

    if (fLargeNotes) {
        notesfieldlarge.appendChild(notes);
        slideplayersmall.appendChild(slideplayer);
    }
    else {
        notesfieldsmall.appendChild(notes);
        slideplayerlarge.appendChild(slideplayer);
    }
    fGlobalLargeNotes = fLargeNotes
}
    
function ScrViewerMadeInVisible() {
	SetFullscreen (false,true)
}
	
async function ScrViewerMadeVisible() {
	SetLeftmenu   (localStorage.getItem("showleftmenu")=="true")	
	SetRightmenu  (localStorage.getItem("showrightmenu")=="true")	
	SetLiterature1(localStorage.getItem("showliterature1")=="true")
	SetLiterature2(localStorage.getItem("showliterature2")=="true")
	SetSlides     (localStorage.getItem("showslides")=="true")
	SetNotes      (localStorage.getItem("shownotes")=="true")
	SetVideo      (localStorage.getItem("showvideo")=="true")
	SetPlateau    (localStorage.getItem("showplateau")=="true")
	SetFullscreen (localStorage.getItem("showfullscreen")=="true")
}	

function FullScreenOnOff(event) {
	var fOn=GetToggleState(this,"displayactive")    
    /* was used when running in an iframe
    var x=window.parent.postMessage({"fullscreen":fOn}, "*"); // 'https://ipfs.io'); received in util
    console.log(`After postmessage ${x}`)
    */
    fFullScreen =  fOn; // !fFullScreen
	SetFullscreen(fFullScreen)
}	

function SetFullscreen(fFullScreen,fdontupdate) {
    let elem = document.body; // let elem = document.documentElement;
    if (fFullScreen) {                
        if (elem.requestFullScreen)       console.log("elem.requestFullScreen")  
        if (elem.mozRequestFullScreen)    console.log("elem.mozRequestFullScreen") 
        if (elem.webkitRequestFullScreen) console.log("elem.webkitRequestFullScreen")
        
        if (elem.requestFullScreen) {
            elem.requestFullScreen({ navigationUI: "hide" });
        } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen({ navigationUI: "hide" });
        } else if (elem.webkitRequestFullScreen) {
            elem.webkitRequestFullScreen({ navigationUI: "hide" });
        }   
    } else 
		try {
			if (document.exitFullscreen)       console.log("document.exitFullscreen")  
			if (document.mozExitFullscreen)    console.log("document.mozExitFullscreen") 
			if (document.webkitExitFullscreen) console.log("document.webkitExitFullscreen")
			if (document.exitFullscreen) {
				document.exitFullscreen().catch(console.log);
			} else if (document.mozExitFullscreen) {
				document.mozExitFullscreen();
			} else if (document.webkitExitFullscreen) {
				document.webkitExitFullscreen();
			}
		} catch (error) {console.log(error) }
	getElement("fullscreen","scr_viewer").dispatchEvent( new CustomEvent(!fFullScreen?"displaydefault":"displayactive"));  
	if (!fdontupdate)
		localStorage.setItem("showfullscreen",fFullScreen) 
}    	

function Initial(name,value) {
	if (localStorage.getItem(name)==undefined)
		localStorage.setItem(name,value)
}
    
function loaded() {
	SetupSliders()
    var ev = new CustomEvent("show"); // set initial state
    getElement("selectliterature1").dispatchEvent(ev);   
    getElement("selectliterature2").dispatchEvent(ev);   
    getElement("selectnotes").dispatchEvent(ev);   
    getElement("selectvideo").dispatchEvent(ev);   
	getElement("selectslides").dispatchEvent(ev);   
	
    LinkToggleButton("selectliterature1",ToggleLiterature1)
    LinkToggleButton("selectliterature2",ToggleLiterature2)
    LinkToggleButton("selectnotes",ToggleNotes)
    LinkToggleButton("selectvideo",ToggleVideo)
    LinkToggleButton("selectslides",ToggleSlides)
    LinkToggleButton("btnleftmenu",ToggleLeftMenu)
    LinkToggleButton("btnrightmenu",ToggleRightMenu)
    LinkVisible("scr_viewer" ,ScrViewerMadeVisible)    
	LinkInVisible("scr_viewer" ,ScrViewerMadeInVisible)    
    
	Initial("showleftmenu",false)
	Initial("showrightmenu",false)
	Initial("showplateau",true)
	Initial("shownotes",false)
	Initial("showvideo",false)
	Initial("showslides",false)	
	Initial("showliterature1",false)
	Initial("showliterature2",false)
	Initial("showfullscreen",false)
	
	LinkToggleButton("fullscreen",FullScreenOnOff,"scr_viewer")
}    

document.addEventListener("DOMContentLoaded", loaded )