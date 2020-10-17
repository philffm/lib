import {subscribe,DomList,GetJsonIPFS, getElement,FitOneLine,publish,setElementVal,ConvertDurationToString } from '../lib/koiosf_util.mjs';
import {GetCourseInfo,GlobalCourseList} from './koiosf_course.mjs';
import {GetToggleState} from '../genhtml/startgen.mjs'

export var CurrentCourseTitle="";
export var maxduration=0;

subscribe("setcurrentcourse",NewCourseSelected)

class LessonList {    
    constructor (source) {
        this.chapters=[]
        this.lessons=[];
        if (source) {// otherwise no lessonlist yet
            this.LessonListPromise=GetJsonIPFS(source).then(items=>{ // so we can wait for it later            
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
				this.literature=items.literature; // literature combined with videoinfo (e.g. from youtube)
            })
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
    
    async SetCurrentLesson(lessonid) {
        var currentcourse=GlobalCourseList.GetCurrentCourse()
        if (lessonid <0) lessonid=0
        if (lessonid >= this.lessons.length) lessonid = this.lessons.length-1;
         
        localStorage.setItem(`lesson-${currentcourse}`, lessonid);  
         
        var lessons=await this.GetLessonsList()
        publish("loadvideo",lessons[lessonid])
        return lessonid;
    }

    GetCurrentLesson() {
        var currentcourse=GlobalCourseList.GetCurrentCourse()
        var currentlesson=localStorage.getItem(`lesson-${currentcourse}`); // could be undefined        
        if (!currentlesson) currentlesson=0; // start at first lesson
        return currentlesson;
    }

	async SaveCourseSeen() {
	    var lessons=await this.GetLessonsList()   
		var totaltime=0
        for (var i=0;i<lessons.length;i++)  {      
			var seeninfo=this.LoadVideoSeen(lessons[i])
            if (seeninfo) {
                if (seeninfo.seenend)
                    totaltime += lessons[i].duration
                else 
                    if (seeninfo.seensum) totaltime += seeninfo.seensum
            }
		}
				
		var currentcourse=GlobalCourseList.GetCurrentCourse()
		var storageid=`course-${currentcourse}-totaltime`;    
		localStorage.setItem(storageid,totaltime)  
		publish("courseseenupdated")
    }	
    
	GetCourseSeen(courseid) {
		var storageid=`course-${courseid}-totaltime`;    		
		var get=localStorage.getItem(storageid);
		return get;
	}	

    LoadVideoSeen(vidinfo) {
        if (!vidinfo) return;
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
        return jsonparsed;
    }    

    async SaveVideoSeen(seeninfo,vidinfo) {
        var storageid=`video-${vidinfo.videoid}`;
        //var seenperc=parseFloat(seeninfo.seensum / vidinfo.duration).toFixed(3) - unused
        var obj = { seensec: seeninfo.seensec, seenperc: seeninfo.seenperc, seenend: seeninfo.seenend };
        var myJSON = JSON.stringify(obj);    
        localStorage.setItem(storageid,myJSON)  
    }    
}    

var PrepareLessonsList;
var PrepareChapterList;
export var GlobalLessonList;

async function NewCourseSelected() {   
	prefindex=undefined;
    PrepareLessonsList.EmptyList()
    PrepareChapterList.EmptyList()    
    var videocid=await GetCourseInfo("videoinfo")     
    GlobalLessonList=new LessonList(videocid)    
    var lessons=await GlobalLessonList.GetLessonsList()
    if (lessons) {
		var seentotal=0
        for (var i=0;i<lessons.length;i++)
               seentotal +=await AddLessonsItem(lessons[i],i)    
		   
		await GlobalLessonList.SaveCourseSeen()
        var chapters=await GlobalLessonList.GetChaptersList()   
        if (chapters)    
            for (var i=0;i<chapters.length;i++)
                AddChapter(chapters[i])     
        SelectLesson(await GlobalLessonList.GetCurrentLesson())    
    }
}

function AddChapter(vidinfo) {    
    var txt=vidinfo.title;    
    var cln=PrepareChapterList.AddListItem()
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
    domid.addEventListener('click', e=> {
		var prevdomid=getElement(`chapter-${oldindexchapter}`);
		if (prevdomid) {        
			prevdomid.style.borderColor=""; // reset to original
			prevdomid.style.borderStyle="";
		}
		domid.style.borderColor="#FF206E";//"red";
		domid.style.borderStyle="solid";
		oldindexchapter=mask
        PrepareLessonsList.ShowDataset("chapter",mask,true)
    });
}    

subscribe("videoseen",VideoSeen)
	
async function VideoSeen(currentvidinfo) {
	var index=await GlobalLessonList.GetCurrentLesson()
	var  el=getElement(`lesson-${index}`)
    // could also use cln.dataset.videoid	 
    getElement("seenvideo",el).dispatchEvent(new CustomEvent("displayactive"))    	 
    await GlobalLessonList.SaveCourseSeen()
}	

function SimplifyName(name) {
	var left=name.split(" ")[0];
	if (!left.includes("-")) return name; // then probably a different name
	var right=(name.replace(left,"")).trim()
	var nr=left.split("-")[1]
	return nr+" "+right
}



async function AddLessonsItem(vidinfo,index) { // txt,thumbnail,description,videoid,duration) {   
    vidinfo.txt=vidinfo.title; /// refactor
    var cln = PrepareLessonsList.AddListItem() //Template.cloneNode(true);
    getElement("lesson-name",cln).innerHTML=SimplifyName(vidinfo.txt);
    FitOneLine(getElement("lesson-name",cln))    
	if (!vidinfo.duration) vidinfo.duration=1
	
	var str=ConvertDurationToString(vidinfo.duration)
	
	setElementVal("videolength",str,cln)
	
    cln.id=`lesson-${index}`;        
    cln.dataset.chapter=vidinfo.chapter;
    cln.dataset.videoid=vidinfo.videoid; // to store & retrieve data about the video       
    SetClickPlay(cln,index)    
    var seeninfothisvideo=await GlobalLessonList.LoadVideoSeen(vidinfo)        
    var disp=seeninfothisvideo.seenend?"displayactive":"displaydefault"
    getElement("seenvideo",cln).dispatchEvent(new CustomEvent(disp))    	
	return seeninfothisvideo.seensum;
} 

async function SetClickPlay(cln,index) { // seperate function to remember state
    cln.addEventListener('click', e=> {  SelectLesson(index) }  );
	var seenvideo=getElement("seenvideo",cln) 
	cln.addEventListener('click', async e=> {          
        SelectLesson(index)
	    var fOn=GetToggleState(seenvideo,"displayactive")      
		var vidinfo=await GlobalLessonList.GetCurrentLessonData()
		var seeninfo=GlobalLessonList.LoadVideoSeen(vidinfo)
		seeninfo.seenend=fOn;		
		await GlobalLessonList.SaveVideoSeen(seeninfo,vidinfo)
	});
	 
	var playbutton=getElement("playbuttonfromlist",cln) 
    playbutton.addEventListener('click', async e=> {      
	    autoplay=true;
        await SelectLesson(index)
		if (videocued) { // already cued by previousaction
			publish("videostart")
			videocued=false;
		} 		
	});	 
}   

var videocued=false;
var autoplay=false;

function VideoCued() {
    if (autoplay) 
	    publish("videostart") // start the video
    else
	    videocued=true;
  
    autoplay=false;  
}

subscribe('videocued',    VideoCued); 
subscribe('videostopped', VideoStopped); 

  
async function VideoStopped() {
    await GlobalLessonList.SaveCourseSeen()
}
	
var prefindex=undefined;

export async function SelectLesson(index) {   
    await GlobalLessonList.SaveCourseSeen()
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
    var CurrentLesson=await GlobalLessonList.GetCurrentLesson()
    SelectLesson(parseInt(CurrentLesson) + parseInt(delta))
	autoplay=true;
}


PrepareLessonsList = new DomList("list-lessons")
if (!PrepareLessonsList)
    console.error("list-lessons not found");

PrepareChapterList = new DomList("list-chapter")
if (!PrepareChapterList)
    console.error("list-chapter not found");   