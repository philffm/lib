import {SetAllEventHandlers,SwitchPage,PrepLazy} from '../genhtml/startgen.mjs';

export var loadScriptAsync = function(uri){
    return new Promise((resolve, reject) => {
        var tag = document.createElement('script');
        tag.src = uri;
        tag.async = true;
        tag.onload = () => {
            resolve();
        };
        document.head.appendChild(tag);
    });
}

export function sleep(ms) {
    try {var prom=new Promise(resolve => setTimeout(resolve, ms)); } catch (error) {console.log(error); }
    return prom
}

export function LinkButton(nameButton,funct) {  
    var button=getElement(nameButton);
    if (button)
        button.title=nameButton; // add hoover text
    
    if (button) 
        button.addEventListener("click", ButtonClick);           
    
    async function ButtonClick(event) {
        event.preventDefault();
        var orgcolor=button.style.color;
        var buttonchildren=button.getElement("w-button")
        for (const element of buttonchildren) 
            element.style.color="white" //"#13c4a3";
        await Promise.all( [
            sleep(1000), // show color for at least 1 sec.
            funct(button)
        ]);          
    }
}

function ShowButton(button,fFirst) {    
    var buttonchildren=button.getElement("w-button")
    buttonchildren[0].style.display=fFirst?"block":"none"
    buttonchildren[1].style.display=!fFirst?"block":"none"
}    

export function HideButton(nameButton,fHide) {
    getElement(nameButton).dispatchEvent(new CustomEvent(fHide?"hide":"show"));
}    

export function LinkClickButton(domid_or_name,callback,location) {
	var domid=domid_or_name;
    if (domid_or_name && (typeof domid_or_name) =="string") 
        domid=getElement(domid_or_name,location)
		
    if (!domid) {
		console.error(`LinkClickButton: Can't find ${domid_or_name}`);
		return
	}
    domid.addEventListener('animatedclick',callback)    
}    
  
export function LinkToggleButton(domid_or_name,callback,location) { 
	var domid=domid_or_name;
    if (domid_or_name && (typeof domid_or_name) =="string") 
        domid=getElement(domid_or_name,location)
		
    if (!domid) {
		console.error(`LinkClickButton: Can't find ${domid_or_name}`);
		return
	}
    domid.addEventListener('animatedtoggle',callback)     
}

export function LinkVisible(nameButton,callback) {   
    var domid=getElement(nameButton)
    if (domid)
        domid.addEventListener('madevisible',callback)    
}

export function LinkInVisible(nameButton,callback) {   
    var domid=getElement(nameButton)
    if (domid)
        domid.addEventListener('madeinvisible',callback)    
}

export function ForceButton(nameButton,fValue) {    
    getElement(nameButton).dispatchEvent(new CustomEvent(fValue?"displayactive":"displaydefault"));     
}

export function getElement(name,domid,domid2) {    // name as well as domid can be a string or a real domid
    if ((typeof name) !="string")
        return name; // already a domid

    var elem=document.getElementById(name)
    if (elem) return (elem)
        
    if (domid2 && (typeof domid2) =="string")  {
        var newdomids2=document.getElementsByClassName(domid2);
        if (newdomids2.length > 1)
            console.error(`Multiple elements ${domid} ${newdomids.length}`)
        domid2=newdomids2?newdomids2[0]:undefined
    }        
    var searchdom2=domid2 ? domid2: document
    
    if (domid && (typeof domid) =="string")  {
        var newdomids=searchdom2.getElementsByClassName(domid);
        if (newdomids.length > 1)
            console.error(`Multiple elements ${domid} ${newdomids.length}`)
        domid=newdomids?newdomids[0]:undefined
    }    
    
    var searchdom=domid ? domid: document
    var elemlist=searchdom.getElementsByClassName(name); 
    if (!elemlist) return undefined;
    if (elemlist.length > 1)
        console.error(`Multiple elements ${name} ${elemlist.length}`)
    return elemlist[0];    
}

const blankimage="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=="    
export function setElementVal(name,value,domid,domid22) {  
    var domid2=getElement(name,domid,domid22)
    if (domid2) {
        if (domid2.nodeName.toLowerCase() == "img") {
            if (value)
                domid2.src=value // otherwise keep default , alternatively: blankimage; 
        }
        else
            domid2.innerHTML=value?value:"";
    }
}

export function appendElementVal(name,value,domid,domid22) {  
    var domid2=getElement(name,domid,domid22)
    if (domid2) {
        if (domid2.nodeName.toLowerCase() == "img") {
            if (value)
                domid2.src=value // otherwise keep default , alternatively: blankimage;            
        }
        else
            domid2.innerHTML+=value?value:"";
    }
}

export function getElementVal(name,domid,domid22) {  
    var domid2=getElement(name,domid,domid22)
    if (!domid2)
        return undefined;
    return domid2.innerText.trim();
}
 
export async function DragItem(draggable,dragarea,mousearea,XYCB,ClickCB) { 
    var domiddraggable=getElement(draggable) 
    var domidmousearea=getElement(mousearea) 
    var domiddragarea=getElement(dragarea)             
    
    async function SliderDrag(ev) {     
        var arearect=domiddragarea.getBoundingClientRect();   // recalc every time
        ev.preventDefault()            
        var x=undefined;
        var y=undefined;
        var percx=-1;
        var percy=-1;
        if (ev.touches && ev.touches[0] && ev.touches[0].clientX) x=ev.touches[0].clientX;
        if (ev.clientX) x=ev.clientX; 
        if (x) percx = (x - arearect.left) / arearect.width             
        if (ev.touches && ev.touches[0] && ev.touches[0].clientY) y=ev.touches[0].clientY;
        if (ev.clientY) y=ev.clientY; 
        if (y) percy = (y - arearect.top) / arearect.height     
        await XYCB(percx,percy);        
    }
    
    var touchstart;    
    async function SliderStartTouch(ev) {
        touchstart=new Date();        
        SliderDrag(ev);               
        domidmousearea.addEventListener("touchmove",  SliderDrag);
        domidmousearea.addEventListener("touchend",   SliderStopTouch);
    }       
    
    async function SliderStopTouch(ev) { 
        var touchend=new Date();
        domidmousearea.removeEventListener("touchmove",  SliderDrag);
        domidmousearea.removeEventListener("touchend",   SliderStopTouch);
        window.dispatchEvent(new Event('resize')); // resize window to make sure the slide scroll is calibrated again                
        if (ClickCB && (touchend.getTime()-touchstart.getTime() < 200 ) ) { // then just a click
            ClickCB();
        }
    }            
    
    var mouse;    
    var clickstart;

    async function SliderStartMouse(ev) {
        ev.preventDefault();
        clickstart=new Date();
        
        mouse=document.createElement("div");
        mouse.style.width="100%"
        mouse.style.height="100%"
        domidmousearea.parentNode.appendChild(mouse); 
        mouse.style.backgroundColor="rgba(255, 255, 255, 0.2)"
        mouse.style.position="absolute"
        mouse.style.zIndex="200"
        mouse.style.top="0%"

        mouse.addEventListener("mousemove",  SliderDrag);
        mouse.addEventListener("mouseup",    SliderStopMouse);
        mouse.addEventListener("mouseleave",    SliderStopMouse);
        mouse.style.cursor="move"
    }
    
    async function SliderStopMouse(ev) {
        ev.preventDefault();
        var clickend=new Date();
                
        mouse.removeEventListener("mousemove",  SliderDrag);           
        mouse.removeEventListener("mouseup",    SliderStopMouse);  
        mouse.removeEventListener("mouseleave",    SliderStopMouse);  
        mouse.style.cursor=""
        try { mouse.parentNode.removeChild(mouse) } catch (error) { console.log(error) } 

        if (ClickCB && (clickend.getTime()-clickstart.getTime() < 150 ) ) { // then just a click
            ClickCB();
        }  
    }
    
    domiddraggable.addEventListener('touchstart', SliderStartTouch);
    domiddraggable.addEventListener('mousedown',  SliderStartMouse);  
}

// Developers can annotate touch and wheel listeners with {passive: true} to indicate that they will never invoke preventDefault.

export function InsertIFrame(windowid,url) {
    var domid=getElement(windowid);   
    var iframe=document.createElement("iframe");
    iframe.src=url;
    iframe.width="100%"
    iframe.height="100%"
    iframe.style.height="100%"
    iframe.style.minHeight="100%" 
    iframe.style.position="absolute";
    iframe.style.top="0";
    iframe.style.left="0";
    domid.appendChild(iframe);
    return iframe;
}

// based on https://jsmanifest.com/the-publish-subscribe-pattern-in-javascript/

const subscribers = {}

export function publish(eventName, data) {
    if (!Array.isArray(subscribers[eventName])) { return }
    subscribers[eventName].forEach((callback) => {  callback(data)  })
}

export function subscribe(eventName, callback) {
    if (!Array.isArray(subscribers[eventName])) {
        subscribers[eventName] = []
    }
    subscribers[eventName].push(callback)
    const index = subscribers[eventName].length - 1 
    var f= function(){subscribers[eventName].splice(index, 1) }
    return f;
}
  
export function MonitorDomid(areaid,parentclass,childclass,triggerclass,cbChildChanged) {

    function cbMutation(mutationsList, observer) {
        for(let mutation of mutationsList) {
            if (mutation.type === 'attributes') { // console.log('The ' + mutation.attributeName + ' attribute was modified.');                
                var target = mutation.target;
                if (target.className.includes(triggerclass)) {
                    var children=domid.getElement(childclass);
                    for (var i=0;i<children.length;i++) {
                        if (children[i] == target)                       
                            cbChildChanged(mutation.target,i);
                    }
                }
            }
        }
    }    

    const observer = new MutationObserver(cbMutation);
    var domid=getElement(areaid);
    var nav=domid.getElement(parentclass)
    observer.observe(nav[0], { attributes: true, childList: true, subtree: true,attributeFilter:["class"] } ); // only trigger on class changes    
}
  
export function MonitorVisible(areaid) {
    function cbMutation(mutationsList, observer) {
        for(let mutation of mutationsList) {
            if (mutation.type === 'attributes') { // console.log('The ' + mutation.attributeName + ' attribute was modified.');                                
                var target = mutation.target;
                publish(`${areaid}display${target.style.display}`);
            }
        }
    }    

    const observer = new MutationObserver(cbMutation);
    var domid=getElement(areaid);
    observer.observe(domid, { attributes: true, childList: false, subtree: false,attributeFilter:["style"] } ); // only trigger on style changes    
}  

export function SelectTabBasedOnName(areaid,classid) {
    var domid=getElement(areaid);
    var slides=domid.getElement("w-slide");
    var dots=domid.getElement("w-slider-dot");
    for (var i=0;i<slides.length;i++) {
        var domidclass=slides[i].className;        
        domidclass = domidclass.replace("w-slide", "").trim();
        if (domidclass == classid) {
            dots[i].click();
            break;
        }
    }    
}   

export function SelectTabBasedOnNumber(areaid,id) {
    var domid=getElement(areaid);
    var dots=domid.getElement("w-slider-dot");
    dots[id].click()    
}   

export class CanvasProgressInfoClass {   
    constructor(domid,fHorizontal,primcolor) {
       var canvas=domid.getElementsByTagName("CANVAS")[0];
        if (!canvas) {
            canvas=document.createElement("CANVAS");        
            domid.appendChild(canvas); 
            canvas.width="20"  // symmetric
            canvas.height="20"  // symmetric
            canvas.style.width="100%"
            canvas.style.height="100%"
			canvas.style.position="absolute"
        }    
        this.ctx = canvas.getContext('2d');       
        canvas.width="20"
        canvas.height="20"    
        
        this.domid=domid;
        this.primcolor=primcolor;
        this.canvas=canvas;
    }
    
    Update(seeninfo) {
        var arearect=this.domid.getBoundingClientRect()
        this.canvas.width = arearect.width; 
          this.factor       = Math.round(arearect.width / seeninfo.seensec.length);
            if (this.factor < 1) this.factor = 1; // in case bounding rect is still empty
            this.canvas.width = seeninfo.seensec.length*this.factor // note, this cleans the ctx 
        
        for (var i=0;i<seeninfo.seensec.length;i++)
            if (seeninfo.seensec[i]) 
                this.UpdateItem(seeninfo,i) 
    }
    
    UpdateItem(seeninfo,cursec) {
        this.ctx.fillStyle = this.primcolor; 
        this.ctx.fillRect(cursec*this.factor, 0, this.factor, 20);
    }
}

export class DomList {    
    constructor (objectclass,parentdomid) {
        var list = getElement(objectclass,parentdomid); 
        if (list ) {
			PrepLazy(list,true); // to make sure these pictures are also retrieved
            this.template    = list;
            this.parentnode  = list.parentNode
            list.remove();
        } else
            console.error(`${objectclass} not found`);
    }
    
    AddListItem() {
        if (!this.template) return undefined;
        var target = this.template.cloneNode(true);        

        if (SetAllEventHandlers)
            SetAllEventHandlers(target);
        this.parentnode.appendChild(target);  
        return target;
    }
 
    EmptyList() {        
        while (this.parentnode && this.parentnode.firstChild)
            this.parentnode.removeChild(this.parentnode.lastChild); // first remove previous children    
    }

    HideAll() {
        var children=this.parentnode.children;
        for (var i=0;i<children.length;i++) {
            children[i].style.display="none" 
        }
    }

    ShowStyle(selectedstyle) {
        var children=this.parentnode.getElementsByClassName(selectedstyle)
        for (var i=0;i<children.length;i++)
            children[i].style.display="block"        
    }  

    ShowDataset(selecteddataset,value,fFlex) {
        var children=this.parentnode.children;
        for (var i=0;i<children.length;i++) {
            children[i].style.display=children[i].dataset[selecteddataset]==value ? (fFlex?"flex":"block"):"none"
        }
    }    

    FilterDataset(selecteddataset,value,fShow,fFlex) {
        var children=this.parentnode.children;
        for (var i=0;i<children.length;i++) {
           if (children[i].dataset[selecteddataset]==value)
                children[i].style.display= fShow? (fFlex?"flex":"block"):"none"
        }
    }    
}    
 
export function FitOneLine(domid) {
    domid.style.overflow="hidden"
    domid.style.textOverflow="ellipsis"
    domid.style.whiteSpace="nowrap"   
}

export class Toggle {
    constructor (initialstate) {
        this.currentstate=initialstate
    }
    CurrentState() { return this.currentstate; }
    SetState(state) { this.currentstate=state; }
    Toggle() { this.currentstate=!this.currentstate;return this.currentstate;}
}    
 
export function ForAllElements(components,mask,callback) { // callback(id,val)
    if (mask) // mask is leading   
        for (var j=0;j< mask.length;j++) {
            var id=mask[j]
            if (typeof(id) == "string") {
                var val=components[id];
                callback(id,val)
            }
            else {
                var val=components[id[0]];
                callback(id[1],val)
            }
        }
    else { // components is leading
        var keys = Object.keys(components);
        if (keys.length > 0) {
            for (var j=0;j< keys.length;j++) {
                var id=keys[j]
                var val=components[id];                
                callback(id,val)
            }
        } 
    }
}   

var statusarray=[]
var fetchcounter=0;
export async function FetchWithTimeout(url) {
	const controller = new AbortController()
	var index = fetchcounter++
	statusarray[index]=url
	var fetchresult;
	const timeoutId = setTimeout(() => { console.log(`timeout ${url}`);controller.abort();}, 150000)
	try { 
		fetchresult=await fetch(url,{ signal: controller.signal });   // /index.json
	} catch (error) {console.log(`Fetch error ${url} ${error}`); }

	clearTimeout(timeoutId)
	
	if (!fetchresult || !fetchresult.ok) {
		statusarray[index]+=" not loaded"
        return undefined;    
    }
	
	statusarray[index] = ""
	return fetchresult;
}	
 
export async function FetchMultipleWithTimeout(urlarray,timeout) {   
    var promisearray=[]
    var controllerarray=[]

    for (const item of urlarray) {
        const controller = new AbortController()
        controllerarray.push(controller)        
        try {var prom=fetch(item,{ signal: controller.signal }).catch( /*console.log*/ ) } catch(error) {console.log(error); }
        promisearray.push(prom)        
    }    

    promisearray.push(sleep(timeout).catch(console.log))
    var fetchresult=await Promise.race(promisearray).catch(console.log);
    for (let i=0;i<urlarray.length;i++) {         
        var checkready=await Promise.race([promisearray[i],undefined]).catch(console.log);           
        if (!checkready)
            controllerarray[i].abort()
    }
    return fetchresult;
}
    
window.addEventListener("unhandledrejection", event => {
    console.warn(event.reason)
});
 
export async function FetchIPFS(cid) {
    if (!cid) return undefined;		
	cid=stripipfsprefix(cid)
    var urlarray=[];
    for (var i=0;i<ipfsproviders.length;i++) {
        var url=GetCidViaIpfsProvider(cid,i);
		urlarray.push(url)
	}
    try { var fetchresult=await FetchMultipleWithTimeout(urlarray,150000)    } catch(error) {console.log(error);}
    if (fetchresult && fetchresult.ok) return fetchresult; // found a working version     			
	return undefined;        
}     
 
export async function GetJson(source) {    
	var f=await FetchWithTimeout(source)    
    try {
        var Items=await f.json();            
    } catch (e) {
        console.error(`Json parse error ${e} ${source}`);
    }
    return Items;  
}

 
export function GetCidViaIpfsProvider(cid,nr) {
    var url=`${ipfsproviders[nr]}/${cid}`;    
    return url;  
}    


let ipfsproviders=[ 
    "https://ipfs.io/ipfs",
    "https://gateway.ipfs.io/ipfs"
]; 

export function GetResolvableIPFS(cid) {
	if (!cid) return undefined;
	cid=stripipfsprefix(cid)
	return GetCidViaIpfsProvider(cid,0);
}	



const ipfsprefix1="https://ipfs.io/ipfs/"
const ipfsprefix2="ipfs://ipfs/"
const ipfsprefix3="ipfs://"

function stripipfsprefix(cid) {
    if (cid.includes(ipfsprefix1)) {
        cid=cid.replace(ipfsprefix1, "");// just keep the cid
    }
    if (cid.includes(ipfsprefix2)) {
        cid=cid.replace(ipfsprefix2, "");// just keep the cid
    }
    if (cid.includes(ipfsprefix3)) {
        cid=cid.replace(ipfsprefix3, "");// just keep the cid
    }
    return cid;
}    

export async function GetJsonIPFS(cid) {
    if (!cid) return undefined;
    cid=stripipfsprefix(cid)
    var indexjson=await FetchIPFS(cid)    
    if (!indexjson)
        return undefined;    
    var json = await indexjson.json();
    return json;
}    

export async function GetCSVIPFS(cid) {
    if (!cid) return undefined;
    cid=stripipfsprefix(cid)
    
    var csvdata=await FetchIPFS(cid)    
    if (!csvdata)
        return undefined;    
    var csv = await csvdata.text();
    var allTextLines = csv.split(/\r\n|\n/);
    var lines = [];
    while (allTextLines.length) {
        lines.push(allTextLines.shift().split(';'));
    }
	return lines;
}    
 
export async function GetImageIPFS(cid) {
    if (!cid) return undefined;
    cid=stripipfsprefix(cid)
    
    var data=await FetchIPFS(cid)
	if (!data) return undefined
    var blob=await data.blob()
    var url=URL.createObjectURL(blob)          
    return url;
} 

export function sortfunction(a,b) {
	if (b.url && !a.url) return -1
	if (a.url && !b.url) return 1
	
	var aa= a.url || a.cid || a.pdf
	var bb= b.url || b.cid || b.pdf
	
	if (aa < bb) return -1
	if (aa > bb) return +1
	return 0;
}  
 
export function FindDomidWithId(event) { // used in combination with a set of buttons, to located the domid of the button that was pressed (needs id in the button)
    var detail=event;
    for (var i=0;i<10;i++) {
        if (!detail.detail) break
        else {
            detail=detail.detail; // check a couple of details
        }
    }
        
    for (var i=0;i<10;i++) {
		if (!detail) return undefined; // not found
        if (detail.id) {
            return detail;
        }
        else {
            detail=detail.parentNode; // check chain up to find id
        }
    }
    return undefined;
}    

var orglocation=window.parent.location; // is changed with pushstate // take the toplevel in case running in frame

export function GetURLParam(id) {
    var params=undefined;
    if (orglocation) {
        try {
            params = (new URL(orglocation)).searchParams;
        } catch (error) { console.log(error);params=undefined;}
        if (params)
            return params.get(id);     
    }
    return undefined;
}     
 
export function ConvertDurationToString(duration) {	
	var date = new Date(null);
	if (!duration) return undefined;
	date.setSeconds(duration); // specify value for SECONDS here
	var result = date.toISOString().substr(10, 9);
	result=result.replace("T00:", "T");
	result=result.replace("T", "");
	return result;
} 