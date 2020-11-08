import {publish,subscribe,getElement,GetJsonIPFS,GetImageIPFS} from '../lib/koiosf_util.mjs';
import {GetCourseInfo} from './koiosf_course.mjs';

var SecondsArraySlides;

/* Unused variables

var prevslide=undefined;
var GlobalPrepareSlidesList; 
//var GlobalSlideIndicatorList;
var GlobalUrlList;
*/

subscribe("playerloading",  InitShowSlides);
subscribe("loadvideo",GetSlidesFromVideo) // a new video has been loaded/selected

class SlideList {    
    constructor () {        
    }

    async GetList() {
        return await this.SlideListPromise;
    }

    async SwitchList(cid) {
        this.currentSlide=0;
        if (this.cid == cid) return this.SlideListPromise// hasn't been changed
        this.cid = cid;
        this.SlideListPromise=GetJsonIPFS(cid)
        return this.SlideListPromise;
    }    

    GetCurrentSlide() {
        return this.currentList[this.currentSlide];
    }
     
    async LoadList(match) {
        if (this.currentList) {
            for (var i=0;i<this.currentList.length;i++) {
				URL.revokeObjectURL(this.currentList[i])  
			}			   
        }    
        this.currentList=[]        
        this.match=match;
        var list = await this.GetList()    
        if (list)        
            for (var i=0;i<list.length;i++) {
				var slidesinfo = list[i]	
				if (slidesinfo.png===undefined) continue;               
			    if (match && (list[i].chapter !== match) && (list[i].chapter!="*")) continue;// * means a match with all chapters                             
                var url= await GetImageIPFS(slidesinfo.png)
                this.currentList.push(url)            
            }
        return this.currentList;
    }
    
    MoveSlide(fForward) {
        if (fForward) { this.currentSlide++;if (this.currentSlide >=this.currentList.length) this.currentSlide =this.currentList.length-1;}
        else          { this.currentSlide--;if (this.currentSlide <0) this.currentSlide =0;}
    }
    isFirst() { return this.currentSlide<=0 }
	isLast()  { return this.currentSlide>=this.currentList.length-1 }
}    
    
function UpdateButtons() {
	getElement("slideleft").dispatchEvent(new CustomEvent(GlobalSlideList.isFirst()?"displaydisabled":"displaydefault"));
	getElement("slideright").dispatchEvent(new CustomEvent(GlobalSlideList.isLast()?"displaydisabled":"displaydefault"));
}	

var GlobalSlideList

async function InitShowSlides() {     
    getElement("slideleft").addEventListener('animatedclick',SlideLeft)  
    getElement("slideright").addEventListener('animatedclick',SlideRight)      
    GlobalSlideList = new SlideList();
}

async function GetSlidesFromVideo(vidinfo) {    
    ClearSlides();
    ShowSlide("loading");
    
    if (!vidinfo) return
    var match = vidinfo.txt.split(" ")[0];
    match=match.replace(/\.+$/g,'')               // remove trailing . (dots) // usefull te be able change the sort order
    console.log(`GetSlidesFromVideo match=${match}`)
    
    var cid= await GetCourseInfo("slides")

    var slideindex = await GlobalSlideList.SwitchList(cid)   
    var currentlist = await GlobalSlideList.LoadList(match)   
    publish ("slidesloaded");
    ShowSlide();
	UpdateButtons()
}    
   
export function UpdateSlide(CurrentPos) {   // called frequently
    if (SecondsArraySlides) {
        var res=SecondsArraySlides[ parseInt(CurrentPos)]
    } 
}

function ClearSlides() {
	var url="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" // otherwise previous slide is still shown
	var slide=getElement("slideimage")
    slide.src=url;
    slide.style.width="100%"
    slide.style.height="";
    slide.style.left="0px"
    slide.style.top="0px"
    slide.style.objectFit="contain"    
}	

function ShowSlide(template) {    
	if (template)
		url=getElement(template).src
	else {
		var url=GlobalSlideList.GetCurrentSlide()
		if (!url)
			url=getElement("noslides").src
    }
    
    var slide=getElement("slideimage")
    slide.src=url;
    slide.style.width="100%"
    slide.style.height="";
    slide.style.left="0px"
    slide.style.top="0px"
    slide.style.objectFit="contain"
} 

function SlideLeft() {
    GlobalSlideList.MoveSlide(false);
    ShowSlide()
	UpdateButtons()
}

function SlideRight() {
    GlobalSlideList.MoveSlide(true);
    ShowSlide()
	UpdateButtons()
}    