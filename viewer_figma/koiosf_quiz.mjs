import {subscribe,getElement,setElementVal,LinkClickButton,LinkVisible,GetCSVIPFS,sleep} from '../lib/koiosf_util.mjs';
import {GetCourseInfo} from './koiosf_course.mjs';
import {GlobalLessonList} from './koiosf_lessons.mjs';
import {GetToggleState} from '../genhtml/startgen.mjs'

window.addEventListener('DOMContentLoaded', init);  // load  

function init() {
	subscribe("setcurrentcourse",NewCourseSelected)
	LinkClickButton("quizleft",QuizLeft);
	LinkClickButton("quizright",QuizRight);
	subscribe("loadvideo",NewVideoSelected);
	LinkVisible("scr_quiz" ,ScrQuizMadeVisible)   
	LinkClickButton("checkanswer",CheckAnwer)
}	

class QuizList {    
    constructor (source) {
        this.QuizListPromise=GetCSVIPFS(source)
    }
 
    async GetList() {
        return await this.QuizListPromise;
    }
    
    async SetMatch(match) {    
        if (match.includes("-"))
            match=match.split("-")[1] // take the part after the -
        
        var List=await this.GetList();
        
        this.subset=[]
        for (var i=0;i<List.length;i++) {
            var line=List[i]
            if ((line[0]===match) && line[1]) // skip empty questions
               this.subset.push(line)
        } 
        this.start=0
        return this.subset.length;
    }    
    
	GetNrQuestions() {
		return this.subset.length;
	}
	
    GetCurrentQuestion() {
        if (this.start >= this.subset.length) 
            return undefined;       
        return this.subset[this.start]
    }
    
    Move(delta) {		
       this.start += delta
	   if (this.start < 0) this.start=0
	   if (this.start >= this.subset.length) this.start=this.subset.length-1
    }

    isFirst() { return this.start<=0 }
	isLast()  { return this.start>=this.subset.length-1 }
}    

export var GlobalQuizList;

async function NewCourseSelected() {   
    var quizcid=await GetCourseInfo("quizinfo") 
    if (quizcid) {    
        GlobalQuizList=new QuizList(quizcid)   
 
        var List=await GlobalQuizList.GetList();
    }    
}    

function QuizLeft() {
	GlobalQuizList.Move(-1)
	UpdateButtons() 
	ScrQuizMadeVisible()
}

function QuizRight() {
	GlobalQuizList.Move(+1)
	UpdateButtons() 
	ScrQuizMadeVisible()
}

function UpdateButtons() {
	getElement("quizleft").dispatchEvent(new CustomEvent(GlobalQuizList.isFirst()?"displaydisabled":"displaydefault"));
	getElement("quizright").dispatchEvent(new CustomEvent(GlobalQuizList.isLast()?"displaydisabled":"displaydefault"));
}	

async function CheckAnwer() {
	setElementVal("quizresult","");
    
    var answers=[]
    answers.push(GetToggleState(getElement("answera","scr_quiz"),"displayactive"))
    answers.push(GetToggleState(getElement("answerb","scr_quiz"),"displayactive"))
    answers.push(GetToggleState(getElement("answerc","scr_quiz"),"displayactive"))
    answers.push(GetToggleState(getElement("answerd","scr_quiz"),"displayactive"))

    var btnlist=[];
    
    btnlist.push(getElement("answera","scr_quiz"))
    btnlist.push(getElement("answerb","scr_quiz"))
    btnlist.push(getElement("answerd","scr_quiz"))  // note order, d after b
    btnlist.push(getElement("answerc","scr_quiz"))
    
    
    for (var i=0;i<10;i++) {    
        btnlist[(i )  % btnlist.length].dispatchEvent(new CustomEvent("displaydisabled"));
        btnlist[(i+1) % btnlist.length].dispatchEvent(new CustomEvent("displaydefault"));
        btnlist[(i+2) % btnlist.length].dispatchEvent(new CustomEvent("displayactive"));
        //window.getComputedStyle(btnlist[nr])
        await sleep(50);
    }
    
    var question=GlobalQuizList.GetCurrentQuestion();
    var btnlist2=[];
    
    btnlist2.push(getElement("answera","scr_quiz"))
    btnlist2.push(getElement("answerb","scr_quiz"))    
    btnlist2.push(getElement("answerc","scr_quiz"))
    btnlist2.push(getElement("answerd","scr_quiz"))  
    
    var countok=0
    for (var i=0;i<btnlist2.length;i++) {    
        var letter=String.fromCharCode(65+i);
        var answerok=question[2].includes(letter) // check answer column
        btnlist2[i].dispatchEvent(new CustomEvent(answerok?"displayactive":"displaydefault"));
        
        var rightanswer=(answers[i] == answerok)
		
		if (rightanswer)
			 countok++
            
        btnlist2[i].style.outline=(rightanswer?"#4DFFC1 solid 5px":"#FF79A8 dashed 5px")
        btnlist2[i].style.outlineOffset="2px"
    }
     
    var str=(countok==4)?"Well done":`${countok*25}% right, try again`
    setElementVal("quizresult",str);
}    

async function ScrQuizMadeVisible() { // also used with next/prev question
    setElementVal("quizresult","");
	const answerlist = ["answera", "answerb", "answerc","answerd"]

	for (const element of answerlist) {
		var domid=getElement(element,"scr_quiz")
		domid.dispatchEvent(new CustomEvent("displaydefault"));			
		domid.style.borderColor=""
		domid.style.borderStyle=""
	    domid.style.outline=""
        domid.style.outlineOffset=""
	}
    
    if (!GlobalQuizList) return;
    
    var question=GlobalQuizList.GetCurrentQuestion() // GetNext();
    if (!question) return;
    setElementVal("question",question[1],"scr_quiz")
    setElementVal("__label",question[3],"answera","scr_quiz")
    setElementVal("__label",question[4],"answerb","scr_quiz")
    setElementVal("__label",question[5],"answerc","scr_quiz")
    setElementVal("__label",question[6],"answerd","scr_quiz")
}

async function NewVideoSelected() {   
    if (GlobalQuizList) {
        var vidinfo=await GlobalLessonList.GetCurrentLessonData()    
        var match=(vidinfo.title).split(" ")[0]
        var nrquestions=await GlobalQuizList.SetMatch(match);    
    }    
    
    var btn=getElement("btnquiz","scr_viewer")

	if (btn)
	    btn.dispatchEvent(new CustomEvent((nrquestions >0 )?"show":"hide"));
}