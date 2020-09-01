import {loadScriptAsync,GetJsonIPFS,subscribe,publish,DomList,GetCidViaIpfsProvider,sortfunction,LinkToggleButton,FitOneLine,ForceButton,FetchIPFS,setElementVal,getElement } from '../lib/koiosf_util.mjs';
import {GetCourseInfo,GlobalCourseList} from './koiosf_course.mjs';
import {GlobalLessonList} from './koiosf_lessons.mjs';
import {GetToggleState} from '../genhtml/startgen.mjs'

var globalslideindex

async function NewCourseSelected (courseid) {
    console.log(`In NewCourseSelected ${courseid}`);
    let cid =  await GetCourseInfo("slides") 
    console.log(`In NewCourseSelected cid=${cid}`);
    globalslideindex = await GetJsonIPFS(cid);        
	console.log(globalslideindex)
    if (globalslideindex) {
        globalslideindex.sort(sortfunction);
        await GetLiteratureForVideo()
    }
}    
   

window.addEventListener('DOMContentLoaded', asyncloaded);  // load  

subscribe("setcurrentcourse",NewCourseSelected)
    
async function asyncloaded() {  
    //publish("playerloading"); // to init notes done twice
   
    var domid=getElement("browse-window");
    var iframe=document.createElement("iframe");
    iframe.width="100%"
    iframe.height="100%"
    iframe.name="browse-window-frame"
    domid.appendChild(iframe);
    console.log("Prepare for setcurrentcourse");
    GlobalUrlList = new DomList("browser-url") // before real-slides (because is child)  
    
    
     LinkToggleButton("topicweb",TopicOnOff) 
     LinkToggleButton("topiclit",TopicOnOff) 
     LinkToggleButton("topicpod",TopicOnOff) 
     
      ForceButton("topicweb",true);
       ForceButton("topiclit",true);
        ForceButton("topicpod",true);
}
 
 
function  TopicOnOff(event) {
    
    var mask=this.classList[1]
    var fOn=GetToggleState(this,"displayactive"); 
    
    console.log(`TopicOnOff ${mask} ${fOn}`);
    ShowItems(mask,fOn);
 
}
 
function ShowItems(tag,fOn) {
  GlobalUrlList.FilterDataset("type",tag,fOn,true);

}

    

subscribe("loadvideo",GetLiteratureForVideo);


var GlobalUrlList 

async function GetLiteratureForVideo() {   
    var vidinfo=await GlobalLessonList.GetCurrentLessonData()
    
	prevdomid=undefined;
	
	window.open("about:blank", "browse-window-frame")
	
	var lit=await GlobalLessonList.GetLiterature()
	console.log("Literature from youtube in GetLiteratureForVideo")
	console.log(lit)
	
    console.log(vidinfo);
        
    if (!vidinfo) return;
    
    var match=(vidinfo.title).split(" ")[0]
    console.log(`In GetLiteratureForVideo match=${match}`);
    GlobalUrlList.EmptyList()    
    
    if (!globalslideindex) return; // not loaded yet
    var slideindex=globalslideindex
prevurl=undefined; // reset again
	await SearchArray(slideindex,match)
	await SearchArray(lit,match)
 
}

async function SearchArray(slideindex,match) {
	if (!slideindex) return;
    var str="";
       for (var i=0;i<slideindex.length;i++) {
		  // console.log(slideindex[i]);
        if (match && slideindex[i].chapter !== match && slideindex[i].chapter!="*") // * means a match with all chapters
            continue; // ignore
  //     console.log(slideindex[i]);
        var type="";
        
        var url = slideindex[i].url
        if (url) type="topicweb"
        
        if (!url && slideindex[i].cid) {
            type="topiclit"            
			/*
			console.log(`Trying to find ${slideindex[i].cid}`)
			var result=await FetchIPFS(slideindex[i].cid)
			console.log(result);
			if (result) 
				url=result.url;   // this one works, because just loaded
			else {
			*/	
				console.log(`Not found ${slideindex[i].cid}`)
                url = GetCidViaIpfsProvider(slideindex[i].cid,0)
			//}
            url = `https://docs.google.com/viewerng/viewer?url=${url}&embedded=true`;
        }
        if (!url && slideindex[i].pdf) {      
            type="topiclit"
            url = slideindex[i].pdf
			if (url.substr(0, 2)=="Qm")  // probably cid
				url = GetCidViaIpfsProvider(url,0)
            url = `https://docs.google.com/viewerng/viewer?url=${url}&embedded=true`;
        }    
        if (url) {     
//console.log(		slideindex[i])
            str +=SetInfo(url,slideindex[i].title,"browse-window-frame",slideindex[i].url?false:true,type)+"<br>"
        }
		
    }          
}


function CleanUrl(url) {
	if (url.includes("localhost"))    // sometimes localhost http for jupyter
		return url

	try { var check = new URL(url) } catch(error) { console.log(`Error ${error} ${url}`); return undefined; }
	//console.log(`${url} ${check.protocol}`);
	//console.log(check);
	
	if (check.protocol != "https:") return undefined; // strip about:, file: etc.
	
	//if (url.includes("about:")) return undefined;
	
	url = url.replace("http:","https:"); // to prevent error messages from browser  

	url = url.replace("youtube.com/watch?v=","youtube.com/embed/");
	url = url.replace("youtu.be/","youtube.com/embed/");
	
	
	
	if (url.includes("youtube.com")) {
		console.log(url);
		url=url.split("&")[0]
		console.log(url);
	}
	
	if (url.includes("wikipedia") && !url.includes("m.wikipedia"))
		url = url.replace("wikipedia","m.wikipedia");
		
    return url
}

function GetTxt(url,txt) {	    
	if (!txt)
		txt=url
	txt=txt.replace("https://","")
	
	txt = txt.replace(/\/+$/, ""); // remove trailing /
	txt=txt.replace(/_/g, " ")
	
	txt=txt.replace("www.","")
	txt=txt.replace("youtube.com/embed/","YT:")
	
	txt=txt.replace("en.m.wikipedia.org/wiki/","Wiki:")
	
	
	
	return txt;
}

    

var prevurl=undefined

    function SetInfo(url,txt,target,fDocument,type) { 
        if (url == prevurl) return "";  // filter out duplicates (already sorted)
        prevurl = url;
    	
		url = CleanUrl(url)
		if (!url) return; // ignore this url
		txt = GetTxt(url,txt)
		
		var urltarget = GlobalUrlList.AddListItem()  
		setElementVal("link_txt",txt,urltarget)
		FitOneLine(getElement("link_txt",urltarget))
		SetClickShow(urltarget,url)
        urltarget.dataset.type=type;
		
        return "";
    }    

/*
    function SetExtLink(html) {
        var blob = new Blob([html], {type: 'text/html'});
        var url = URL.createObjectURL(blob);      
        SetInfo(url,"external","_blank",false);    
    }    
*/

function SetClickShow(cln,url) { // seperate function to remember state
	var link_ext=getElement("link_ext",cln)    
    cln.addEventListener('click', e=> {    
			Highlight(cln)
			window.open(url, "browse-window-frame")
        }
     );	 
	 link_ext.addEventListener('click', e=> {         
			window.open(url, "_blank")
			Highlight(cln)
        }
     );
}   


  var prevdomid=undefined;

    
function Highlight(domid) {
    if (prevdomid) {        
       prevdomid.style.borderColor=""; // reset to original
       prevdomid.style.borderStyle="";
    }
	prevdomid=domid;
    if (domid) {
       domid.style.borderColor="#FF206E";//"red";
       domid.style.borderStyle="solid";
	}
}


