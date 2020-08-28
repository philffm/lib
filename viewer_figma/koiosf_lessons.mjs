//console.log(`In ${window.location.href} starting script: ${import.meta.url}`);

import {LinkButton,HideButton,LinkClickButton,subscribe,MonitorDomid,DomList,sleep,SelectTabBasedOnNumber,GetJsonIPFS, getElement,FitOneLine,publish,setElementVal,LinkToggleButton } from '../lib/koiosf_util.mjs';
//import {player} from './koiosf_viewer.mjs';
import {GetCourseInfo,GlobalCourseList} from './koiosf_course.mjs';
import {GetToggleState} from '../genhtml/startgen.mjs'

// var CurrentLesson=0; // dont export any more
//var LastLesson=0;
export var CurrentCourseTitle="";
export var maxduration=0;

var buttonBack;
var buttonForward;


// format vidinfo
// title   
// chapter   (boolean)
// description  
// thumbnail
// videoid


subscribe("setcurrentcourse",NewCourseSelected)

class LessonList {    
    constructor (source) {
        console.log(`LessonList constructor ${source}`);
        this.chapters=[]
        this.lessons=[];
        if (source) {// otherwise no lessonlist yet
            this.LessonListPromise=GetJsonIPFS(source).then(items=>{ // so we can wait for it later            
                console.log(items)
				if (!items) return;
                this.CurrentCourseTitle=items.title;
                var currentchapter=""
                for (var i=0;i<items.videos.length;i++) 
                    if (items.videos[i].chapter) {
                        this.chapters.push(items.videos[i]);
                        currentchapter=items.videos[i].title.split(" ")[0]
                    }
                    else {
                        items.videos[i].chapter=currentchapter;
                        this.lessons.push(items.videos[i]);
                    }
                console.log(this.chapters)
                console.log(this.lessons);                    
				this.literature=items.literature; // literature combined with videoinfo (e.g. from youtube)
				console.log("literature from youtube");
				console.log(this.literature);
            })
            console.log(this.LessonListPromise);
        } else this.LessonListPromise=undefined;
    }
        
    async GetLessonsList() {
        if (!this.LessonListPromise) return undefined;
        await this.LessonListPromise;
        return this.lessons;        
    }
    
	async GetLiterature() {
        if (!this.LessonListPromise) return undefined;
        await this.LessonListPromise;
        return this.literature;        
    }
	
    async GetChaptersList() {
        await this.LessonListPromise;
        return this.chapters;        
    }
    
    async GetCurrentLessonData() {       
        var lesson=this.GetCurrentLesson()
        var lessons=await this.GetLessonsList()
        return lessons[lesson]
    }
    async GetLessonData(lesson) {       
        
        var lessons=await this.GetLessonsList()
        return lessons[lesson]
    }

      

    UpdateMyList(courseid,fremove) {
        
    }
    
    async SetCurrentLesson(lessonid) {
         var currentcourse=GlobalCourseList.GetCurrentCourse()
         console.log(`Storing lesson nr lesson-${currentcourse} ${lessonid}`);
         if (lessonid <0) lessonid=0
         if (lessonid >= this.lessons.length) lessonid = this.lessons.length-1;
         
         localStorage.setItem(`lesson-${currentcourse}`, lessonid);  
         
         var lessons=await this.GetLessonsList()
		 console.log(lessons[lessonid]);
         publish("loadvideo",lessons[lessonid])
         return lessonid;
    }

    GetCurrentLesson() {
        var currentcourse=GlobalCourseList.GetCurrentCourse()
        var currentlesson=localStorage.getItem(`lesson-${currentcourse}`); // could be undefined        
        if (!currentlesson) currentlesson=0; // start at first lesson
        return currentlesson;
    }
    
    LoadCurrentLesson() {
        
    }



  async LoadVideoSeen(vidinfo) {
	/*  var currentcourse=GlobalCourseList.GetCurrentCourse()
	  console.log(currentcourse);
	  var lessons=await this.GetLessonsList()
	  var vidinfo=lessons[currentcourse]
	  console.log(vidinfo)
	  */
	 // console.log(videoid);
	//var vidinfo= await this.GetLessonData(videoid)
	
	//console.log(vidinfo)
	
    var storageid=`video-${vidinfo.videoid}`;
    var get=localStorage.getItem(storageid);
    var jsonparsed={}
    
    if (get) { // previous info about this video        
        jsonparsed=JSON.parse(get)
        jsonparsed.seensum=0
        for (var i=0;i<vidinfo.duration;i++)
            jsonparsed.seensum += jsonparsed.seensec[i];
        
    } else {
        jsonparsed.seensum=0;
        jsonparsed.seensec=[]
        for (var i=0;i<vidinfo.duration;i++)
            jsonparsed.seensec[i]=0;
        jsonparsed.seenend=false;
    }
	//console.log(jsonparsed);
	
	console.log(`LoadVideoSeen id ${vidinfo.videoid} seenend ${jsonparsed.seenend}`);
    return jsonparsed;
}    

  async SaveVideoSeen(seeninfo,vidinfo) {
	  console.log(`SaveVideoSeen id ${vidinfo.videoid} seenend ${seeninfo.seenend}`);
	   //var currentcourse=GlobalCourseList.GetCurrentCourse()
	  //var lessons=await this.GetLessonsList()
	  //var vidinfo=lessons[currentcourse]
    var storageid=`video-${vidinfo.videoid}`;
    var seenperc=parseFloat(seeninfo.seensum / vidinfo.duration).toFixed(3)
    var obj = { seensec: seeninfo.seensec, seenperc: seeninfo.seenperc, seenend: seeninfo.seenend };
    //console.log(obj)
    var myJSON = JSON.stringify(obj);    
    localStorage.setItem(storageid,myJSON)  
}    


// see chrome dev console / tab application / left column: Local storage




}    



    

var PrepareLessonsList;
var PrepareChapterList;

export var GlobalLessonList;

async function NewCourseSelected() {   
    console.log("In NewCourseSelected");
	prefindex=undefined;
    PrepareLessonsList.EmptyList()
    PrepareChapterList.EmptyList()    
    var videocid=await GetCourseInfo("videoinfo") 
    console.log("videocid");
    console.log(videocid);        
    GlobalLessonList=new LessonList(videocid)    
    var lessons=await GlobalLessonList.GetLessonsList()
    if (lessons) {
		console.log("Have lesson info:")
		console.log(lessons);
        for (var i=0;i<lessons.length;i++)
               await AddLessonsItem(lessons[i],i)    
        var chapters=await GlobalLessonList.GetChaptersList()   
        if (chapters)    
            for (var i=0;i<chapters.length;i++)
                AddChapter(chapters[i])     
        SelectLesson(await GlobalLessonList.GetCurrentLesson())    
    }
}

function AddChapter(vidinfo) {    
    var txt=vidinfo.title;    
    console.log(`AddChapter ${txt}`)
    var cln=PrepareChapterList.AddListItem()
    //cln.getElementsByClassName("chapter-name")[0].innerHTML=txt;
    
	
	
    var sp=txt.split(" ")
    var chapter=sp[0]
    
	cln.id=`chapter-${chapter}`;   
	
    setElementVal("__label",chapter,cln)
    
    
    txt=txt.replace(sp[0],"").trim()
    setElementVal("chapter-name",txt,cln)
    
	FitOneLine(getElement("chapter-name",cln))    
	
    SetClickFilter(cln,chapter)    //getElement("chapter",cln)
    
} 

var oldindexchapter;

function SetClickFilter(domid,mask) {
  console.log(`SetClickFilter ${mask}`);
 	
     domid.addEventListener('click', e=> {
        console.log("Click event in SetClickFilter");
        console.log(e);    
        console.log(mask);       
		
		var prevdomid=getElement(`chapter-${oldindexchapter}`);
		if (prevdomid) {        
			prevdomid.style.borderColor=""; // reset to original
			prevdomid.style.borderStyle="";
		}
		console.log(domid)
		domid.style.borderColor="#FF206E";//"red";
		domid.style.borderStyle="solid";
		oldindexchapter=mask

		
        PrepareLessonsList.ShowDataset("chapter",mask,true)
        }
     );
}    


	subscribe("videoseen",VideoSeen)
	
async function VideoSeen(currentvidinfo) {
	var index=await GlobalLessonList.GetCurrentLesson()
	
	
	 var  el=getElement(`lesson-${index}`)
	 
	 // could also use cln.dataset.videoid
	 
	 getElement("seenvideo",el).dispatchEvent(new CustomEvent("displayactive"))    
}	


function SimplifyName(name) {
	var left=name.split(" ")[0];
	var right=(name.replace(left,"")).trim()
	var nr=left.split("-")[1]
	return nr+" "+right
}

async function AddLessonsItem(vidinfo,index) { // txt,thumbnail,description,videoid,duration) {
    console.log(`AddLessonsItem ${vidinfo.title} ${vidinfo.chapter}`);
    //console.log(vidinfo);
    
    vidinfo.txt=vidinfo.title; /// refactor
    var cln = PrepareLessonsList.AddListItem() //Template.cloneNode(true);
    getElement("lesson-name",cln).innerHTML=SimplifyName(vidinfo.txt);
    FitOneLine(getElement("lesson-name",cln))    
	if (!vidinfo.duration) vidinfo.duration=1
	{
		var date = new Date(null);
		//console.log(date);
		date.setSeconds(vidinfo.duration); // specify value for SECONDS here
		var result = date.toISOString().substr(10, 9);
		result=result.replace("T00:", "T");
		result=result.replace("T", "");
		getElement("videolength",cln).innerHTML=result        
	}
    cln.id=`lesson-${index}`;    
    
    cln.dataset.chapter=vidinfo.chapter;
    cln.dataset.videoid=vidinfo.videoid; // to store & retrieve data about the video       
    SetClickPlay(cln,index)    
    var seeninfothisvideo=await GlobalLessonList.LoadVideoSeen(vidinfo)        
    //console.log("AddLessonsItem");
    //console.log(vidinfo.txt);
    console.log(seeninfothisvideo);
    var disp=seeninfothisvideo.seenend?"displayactive":"displaydefault"
    //console.log(disp);
    getElement("seenvideo",cln).dispatchEvent(new CustomEvent(disp))    
    //console.log(getElement("seenvideo",cln))
	
	//LinkToggleButton("seenvideo",ToggleSeenVideo)
	
	
} 

/*
function ToggleSeenVideo() {
	  var fOn=GetToggleState(this,"displayactive")
	  
	  console.log(this)
	  console.log(fOn);
}	
*/

async function SetClickPlay(cln,index) { // seperate function to remember state

	

//var txt=getElement("lesson-name",cln) 

    //console.log(`SetClickPlay ${index}`);
    //console.log(domid);
    
    cln.addEventListener('click', e=> {
        //console.log("Click event in SetClickPlay");
       // console.log(e);    
       // console.log(index);       
          
        SelectLesson(index)
	}
     );
	 var seenvideo=getElement("seenvideo",cln) 
	  cln.addEventListener('click', async e=> {
        //console.log("Click event in SetClickPlay");
       // console.log(e);    
       // console.log(index);       
          
        SelectLesson(index)
		console.log(this)
		  var fOn=GetToggleState(seenvideo,"displayactive")
		  console.log(fOn)
        
		var vidinfo=await GlobalLessonList.GetCurrentLessonData()
		console.log(vidinfo)
		var seeninfo=await GlobalLessonList.LoadVideoSeen(vidinfo)
		seeninfo.seenend=fOn;
		console.log(seeninfo);
		
		await GlobalLessonList.SaveVideoSeen(seeninfo,vidinfo)
	  }
     );
	 
	var playbutton=getElement("playbuttonfromlist",cln) 
    playbutton.addEventListener('click', async e=> {
        //console.log("Click event in SetClickPlay");
       // console.log(e);    
       // console.log(index);       
	    autoplay=true;
        await SelectLesson(index)
		if (videocued) { // already cued by previousaction
			publish("videostart")
			videocued=false;
		} 
			
	}
     );
	 
	 
}   
var videocued=false;
var autoplay=false;
function VideoCued() {
	console.log(`In VideoCued autoplay${autoplay} videocued${videocued}`)
  if (autoplay) 
	  publish("videostart") // start the video
  else
	  videocued=true;
  
  autoplay=false;  
}

subscribe('videocued',   VideoCued ); 

  
var prefindex=undefined;

export async function SelectLesson(index) {   
    console.log(`In SelectLesson !! index=${index}`);
    
	if (prefindex == index) return; // already set
	prefindex=index;
	
    var oldindex=await GlobalLessonList.GetCurrentLesson()
	
    var newindex=await GlobalLessonList.SetCurrentLesson(index)
       
    
    var prevdomid=getElement(`lesson-${oldindex}`);
    if (prevdomid) {        
       prevdomid.style.borderColor=""; // reset to original
       prevdomid.style.borderStyle="";
    }
    var domid=getElement(`lesson-${newindex}`);
    if (domid) {
       domid.style.borderColor="#FF206E";//"red";
       domid.style.borderStyle="solid";
	}
    
}


export async function SelectNextLesson(delta) {  
console.log( "SelectNextLesson");
var CurrentLesson=await GlobalLessonList.GetCurrentLesson()
    SelectLesson(parseInt(CurrentLesson) + parseInt(delta))
	
	autoplay=true;
	
}

 
//async function asyncloadedles() { 
    console.log("In asyncloaded PrepareLessonsList");
    PrepareLessonsList = new DomList("list-lessons")
    if (!PrepareLessonsList)
        console.error("list-lessons not found");
    PrepareChapterList = new DomList("list-chapter")
    if (!PrepareChapterList)
        console.error("list-chapter not found");   
    
//}    




//window.addEventListener('DOMContentLoaded', asyncloadedles);  // load  

