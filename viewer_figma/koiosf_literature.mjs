import {GetJsonIPFS,subscribe,DomList,GetCidViaIpfsProvider,sortfunction,LinkToggleButton,FitOneLine,ForceButton,FetchIPFS,setElementVal,getElement } from '../lib/koiosf_util.mjs';
import {GetCourseInfo} from './koiosf_course.mjs';
import {GlobalLessonList} from './koiosf_lessons.mjs';
import {GetToggleState} from '../genhtml/startgen.mjs'

var globalslideindex

async function NewCourseSelected (courseid) {
    let cid =  await GetCourseInfo("slides") 
    globalslideindex = await GetJsonIPFS(cid);        
    if (globalslideindex) {
        globalslideindex.sort(sortfunction);
        await GetLiteratureForVideo()
    }
}    
   
window.addEventListener('DOMContentLoaded', asyncloaded);  // load  

subscribe("setcurrentcourse",NewCourseSelected)
    
async function asyncloaded() {  
    var domid=getElement("browse-window");
    var iframe=document.createElement("iframe");
    iframe.width="100%"
    iframe.height="100%"
    iframe.name="browse-window-frame"
    domid.appendChild(iframe);
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
    if (!vidinfo) return;
    
    var match=(vidinfo.title).split(" ")[0]
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
        if (match && slideindex[i].chapter !== match && slideindex[i].chapter!="*") // * means a match with all chapters
        	continue; // ignore
        var type="";
        var urlcid=undefined;
		var pdf=""
        var url = slideindex[i].url
        if (url) {
			type="topicweb"
		}
        
		if (slideindex[i].fullname)
			urlcid = slideindex[i].fullname
		
        if (!url && slideindex[i].cid) {
            type="topiclit"            
			urlcid=slideindex[i].cid
			var cid = GetCidViaIpfsProvider(slideindex[i].cid,0)			
            url = `https://docs.google.com/viewerng/viewer?url=${cid}&embedded=true`;
		}
		
        if (!url && slideindex[i].pdf) {      
            type="topiclit"
            pdf = slideindex[i].pdf
			if (pdf.substr(0, 2)=="Qm") { // probably cid
				urlcid=pdf;
				pdf = GetCidViaIpfsProvider(pdf,0)				
			}
            url = `https://docs.google.com/viewerng/viewer?url=${pdf}&embedded=true`;
		} 
		  
        if (url) {     
            str +=SetInfo(url,slideindex[i].title,type,urlcid)+"<br>"
        }
    }          
}

var prevurl=undefined

function SetInfo(url,title,type,urlcid) { 
	if (url == prevurl) return "";  // filter out duplicates (already sorted)
	prevurl = url;
	
	url = CleanUrl(url)
	if (!url) return; // ignore this url
	var txt = GetTxt(url,title)
	
	var urltarget = GlobalUrlList.AddListItem()  
	setElementVal("link_txt",txt,urltarget)
	FitOneLine(getElement("link_txt",urltarget))
	SetClickShow(urltarget,url,urlcid,title)
	urltarget.dataset.type=type;
	
	return "";
}    

function SetClickShow(cln,url,urlcid,title) { // seperate function to remember state
	
    cln.addEventListener('click', e=> {    // link_int / connect to entire gray bar
			Highlight(cln)
			window.open(url, "browse-window-frame")
	});	
	 
	var link_ext=getElement("link_ext",cln)    
	
	link_ext.addEventListener('click', e=> {         
		e.stopPropagation();
		window.open(url, "_blank")
		Highlight(cln)
    });
	 
	var link_down=getElement("link_down",cln)    
	 
	if (urlcid) {// different from url	 
		link_down.addEventListener('click', e=> {   
			e.stopPropagation();		 
			DownloadLink(urlcid,title)
			//window.open(urlcid, 'Download') // just open in a different window
			Highlight(cln)
		});
	} else {
		link_down.style.display="none" // not relevant, so hide
	}
}   



async function DownloadLink(cid,title) { 
    if (!title) title=cid;  // cid could/should contain a filename
	if (title.includes("/"))
		title=title.split("/")[1]
	
	var fileparts=title.split(".")
	var fileext=fileparts[fileparts.length-1]
	var mime="application/pdf" // default type
	switch (fileext) {
		case "ipynb": mime='application/x-ipynb+json';break;
		case "cmd": mime='application/cmd';break;
		case "": break;
		case "pdf": break;
		default: title = title+".pdf" // for the situations no realistic extenstion is present
	}
	
	var data=await FetchIPFS(cid)
	var datablob = await data.blob();
	
	var blob = new Blob([datablob], {type: mime});
	var url = URL.createObjectURL(blob);     
    var link = document.createElement('a');
	link.href = url;
	link.download = title
	document.body.appendChild(link); //Firefox requires the link to be in the body	
	link.click(); 	//simulate click
	document.body.removeChild(link); 	//remove the link when done
	URL.revokeObjectURL(url) 
}

function CleanUrl(url) {
	if (url.includes("localhost"))    // sometimes localhost http for jupyter
		return url
	
	url = url.replace("http:","https:"); // to prevent error messages from browser  	
	try { var check = new URL(url) } catch(error) { console.log(`Error ${error} ${url}`); return undefined; }
	if (check.protocol != "https:") return undefined; // strip about:, file: etc.
	url = url.replace("youtube.com/watch?v=","youtube.com/embed/");
	url = url.replace("youtu.be/","youtube.com/embed/");
	if (url.includes("youtube.com")) {
		url=url.split("&")[0]
	}
	if (url.includes("wikipedia") && !url.includes("m.wikipedia"))
		url = url.replace("wikipedia","m.wikipedia");
    return url
}

function GetTxt(url,txt) {	    
	if (!txt)
		txt=url
	txt=txt.replace("https://","")	
	txt=txt.replace(/\/+$/, ""); // remove trailing /
	txt=txt.replace(/_/g, " ")	
	txt=txt.replace("www.","")
	txt=txt.replace("youtube.com/embed/","YT:")	
	txt=txt.replace("en.m.wikipedia.org/wiki/","Wiki:")
	return txt;
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