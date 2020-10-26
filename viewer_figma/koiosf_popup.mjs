import {sleep,publish,subscribe,SelectTabBasedOnName,DomList,SelectTabBasedOnNumber,getElement} from '../lib/koiosf_util.mjs';
import {CurrentCourseTitle}  from './koiosf_lessons.mjs';

var oldtarget;
var oldbackgroundColor;
var oldfontSize;

function GetAllTabs(areaid) {
    var domid=getElement(areaid);
    var slides=domid.getElement("w-slide");
    var IndexBlockList = new DomList("index-block")  
    
    for (var i=0;i<slides.length;i++) {
        var tabinfo=GetTabHeading(domid,i);
        if (tabinfo.name.toLowerCase() != "index") { // don't show the index in the index     
            var target = IndexBlockList.AddListItem() 
            CreateBlock(target,i,tabinfo.name,tabinfo.icon);
        }
        var childdomid=domid.getElement("w-slider-dot")[i]
        childdomid.innerHTML=tabinfo.icon;
        childdomid.style.fontFamily=tabinfo.fam;        
        childdomid.style.backgroundColor="transparent"   // hide circle
    }
    
    function CreateBlock(domid,id,name,icon) { // seperate function to remember state for click
        target.getElement("tab-name")[0].innerHTML = name;        
        target.getElement("large-icon")[0].innerHTML = icon;        
        domid.addEventListener("click",  x=>SelectTabBasedOnNumber(areaid,id));
    }
}    

function GetTabHeading(domid,childnr) {
    var tabheadings=domid.getElement("tab-heading");
    var target2=tabheadings[childnr];
    var name=target2.getElementsByTagName("h2")[0].innerHTML;
    var icon=target2.getElement("large-icon")[0];    
    var fam=window.getComputedStyle(icon).getPropertyValue("font-family")
    var size=window.getComputedStyle(icon).getPropertyValue("font-size")        
    return {name:name, icon:icon.innerHTML, fam:fam, size:size}
}      

function ChildChanged(childdomid,childnr) {
    if (childdomid !== oldtarget) {
        if (oldtarget) {
            oldtarget.style.fontSize=oldfontSize;
        }
        oldbackgroundColor = childdomid.style.backgroundColor;
        oldfontSize = childdomid.style.fontSize;
        
        var domid=getElement("popup");        
        var tabinfo=GetTabHeading(domid,childnr)        
        childdomid.id=tabinfo.name.toLowerCase().trim();
        childdomid.innerHTML=tabinfo.icon;
        childdomid.style.fontFamily=tabinfo.fam;
        childdomid.style.fontSize=tabinfo.size;
        childdomid.style.backgroundColor="transparent"   // hide circle
        oldtarget=childdomid;
    }
}    

subscribe("loadvideo",VideoLoaded)
 
function VideoLoaded(vidinfo) {
    var domid=getElement("popupvideoname");
    if (domid && vidinfo) {
        domid.innerHTML=`${CurrentCourseTitle} / ${vidinfo.txt}`
        domid.style.overflow="hidden"
        domid.style.textOverflow="ellipsis"  
        domid.style.whiteSpace="nowrap"
    }
}    
 
function NextCourseClick() {
    SelectTabBasedOnName("popup","courses-overview") // class of the tab
}  

subscribe('popupdisplayblock',x=> {
    window.dispatchEvent(new Event('resize')); // resize window to make sure the slide scroll is calibrated again 
});   

export async function SelectPopup(name) {
    publish (`start${name}`);
    OpenPopup(true)
    SelectTabBasedOnName("popup",name);  
    publish (`stop${name}`);
}
  
export async function OpenPopup(fOpen) {
    var style = window.getComputedStyle(getElement("popup"))
    var fCurrentlyOpen = !style.display.includes("none")
    if ((fCurrentlyOpen && !fOpen) || (!fCurrentlyOpen && fOpen)) {
        getElement('bottle').click();        
        await sleep(1000);
    }
}