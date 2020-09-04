console.log(`In ${window.location.href} starting script: ${import.meta.url}`);
console.log("This is init.mjs, located at https://koiosonline.github.io/lib/bootstrap/init.mjs")

/*
while (document.firstChild) {
  document.removeChild(document.firstChild);
}

var html=document.createElement("html")
document.appendChild(html);
var head=document.createElement("head")
html.appendChild(head);
var body=document.createElement("body")
html.appendChild(body);
*/
/*
document.getElementsByTagName("html")[0].innerHTML=""


var head=document.getElementsByTagName("head")[0]
head.innerHTML=""

console.log(document.getElementsByTagName("body").length)
console.log(document.getElementsByTagName("head").length)
var body=document.getElementsByTagName("body")[0]
body.innerHTML=""
document.getElementsByTagName("body")[1].outerHTML="" // sometimes

var html=document.getElementsByTagName("html")[0]
// html.innerHTML=


	var list=document.childNodes
	console.log(list.length)
	for (var i=0;i<list.length;i++) { // https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
		if (list[i].nodeType === Node.COMMENT_NODE)	   
			document.removeChild(list[i]);		
    }
*/


var html=document.getElementsByTagName("html")[0]
console.log("Cleaned html");
html.removeAttribute("data-wf-domain") // remove webflow stuff
html.removeAttribute("data-wf-page")
html.removeAttribute("data-wf-site")
html.removeAttribute("class")

delete window.$
delete window.WebFont
delete window.Webflow
delete window.GoogleAnalyticsObject
delete window.ga
delete window.jQuery
delete window.google_tag_data
delete window.google_tag_manager
delete window.gaplugins
delete window.gaGlobal
delete window.gaData
delete window.datalayer
delete window.google_optimize
console.log(window)
// for (var i in window) if (delete window[i]) console.log(i)
// delete window.gtag

// http://gpersoon.com/koios/lib/bootstrap/test.html
// dnslink=/ipfs/QmZEgAo2Su99vcSwCf14AGokucaPCcshxr8zK3fZ5fKjf5
// https://ipfs.io/ipns/koios.online
// https://ipfs.io/ipns/viewer.koios.online
// https://ipfs.io/ipns/viewer.test.koios.online
// c:\bin\dig +noall +answer TXT _dnslink.koios.online
// c:\bin\dig +noall +answer TXT _dnslink.viewer.koios.online
// c:\bin\dig +noall +answer TXT _dnslink.viewer.test.koios.online

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function MakeBlob(html,fjavascript) {
    var blob = new Blob([html], {type: (fjavascript?'text/javascript':'text/html')});
    var url = URL.createObjectURL(blob);      
    return url;
}   


async function start() { 
console.log("start");
	let url = (new URL(document.location));
	console.log(url)
    var split=url.pathname.split("/");
	console.log(split)
	var last=split[split.length-1]
	var beforelast=split[split.length-2]
	console.log(beforelast,last);
	
	var cid=url.searchParams.get("ipfs");   	
	if (!cid) {	
		var prod="https://koiosonline.github.io/lib/bootstrap"
		var test="https://gpersoon.com/koios/lib/bootstrap"
		var cidlocation=(beforelast=="test")?test:prod;
		var cidfile=last;
		switch (last) {
			case "viewer.test.koios.online": 							
												cidlocation=test;cidfile="newviewer";break;
			case "viewer.koios.online": 	 						 
			case "QmZEgAo2Su99vcSwCf14AGokucaPCcshxr8zK3fZ5fKjf5": 	 
												cidlocation=prod;cidfile="newviewer";break;
		}
		var loadfile=cidlocation+"/"+cidfile
		console.log(`Loading config file ${loadfile}`)
		try { cid=(await (await fetch(loadfile)).text()).trim(); } catch (error) { console.log(error); }
	}
	console.log(`cid ${cid}`)
	if (cid) {
		var modulesource=(await (await fetch("https://ipfs.io/ipfs/"+cid)).text()).trim();
		var tag="//--script--"
		var n = modulesource.indexOf(tag);
		if (n <0 ) { console.error("Can't find tag");return;} 
		modulesource = modulesource.substring(n+tag.length);		
		//console.log(modulesource);
		var url2=MakeBlob(modulesource,true);    
      
        //document.getElementsByTagName("head")[0].innerHTML=""
        //document.getElementsByTagName("body")[0].innerHTML=""
        var html=document.getElementsByTagName("html")[0]
              //  console.log(html);
        
        
		
		let list = html.classList;
		console.log(list)
		for (var i=0;i<list.length;i++) {
			console.log(list[i])
			list.remove(list[i])
		}
		
        console.log(html);
        
		await import(url2);		
		html.removeAttribute("class")		 // try again
	}
	
	/*
    var iframe=document.createElement("iframe");
    iframe.src="https://ipfs.io/ipfs/"+cid
    iframe.width="100%"
    iframe.height="100%"
    iframe.style.height="100%"
    iframe.style.minHeight="100%" 
    iframe.style.position="fixed";
    iframe.style.top="0";
    iframe.style.left="0";
    
    window.addEventListener('message', Receive);
    
	console.log(`Loading ${iframe.src}`);
    document.body.appendChild(iframe);    	
	await Send(iframe,url);
	*/
	
	console.log("checking scripts")
	console.log(document)
	await sleep(1000)
	var todelete=[]
	var scriptlist=document.getElementsByTagName("script")
	for (var i=0;i<scriptlist.length;i++) {
		if (scriptlist[i].outerHTML.includes("google-analytics"))
		   todelete.push(scriptlist[i])
	}
	
	for (var i=0;i<todelete.length;i++)
		todelete[i].parentNode.removeChild(todelete[i])
	
}

start();
  
  
async function Send(iframe,url) {
    for (var i=0;i<10;i++) { // give it a few tries; iframe needs to be loaded first		
		console.log(`Send ${url.href}`)
		iframe.contentWindow.postMessage({"urlhref":url.href,"try":i}, "*"); // 'https://ipfs.io'); received in util
		await sleep(1000)
	}
}    
  
  
function Receive(event) {
	  //console.log(event.origin);
	 // console.log(event);
     // IMPORTANT: check the origin of the data! 
     if (event.origin.includes('ipfs.io') || event.origin.includes('gpersoon')) { 
	 console.log("In receive msssage");
	 // console.log(event)
         // The data was sent from your site.
         // Data sent with postMessage is stored in event.data:
         console.log(event.data); 
		 var FullScreenOnOff=event.data.fullscreen;
         console.log(FullScreenOnOff);
         if (FullScreenOnOff !=undefined)
             SetFullScreenOnOff(FullScreenOnOff)
		 
         
     } else {
         // The data was NOT sent from your site! 
         // Be careful! Do not use it. This else branch is
         // here just for clarity, you usually shouldn't need it.
         return; 
     } 
 }
 
 
 
 function SetFullScreenOnOff(fFullScreen) {
    console.log("In SetFullScreenOnOff");
 
    
    console.log(`Making fullscreen ${fFullScreen}`);
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
    } else {
        if (document.exitFullscreen)       console.log("document.exitFullscreen")  
        if (document.mozExitFullscreen)    console.log("document.mozExitFullscreen") 
        if (document.webkitExitFullscreen) console.log("document.webkitExitFullscreen")
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozExitFullscreen) {
            document.mozExitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }          
 
   console.log(`Making fullscreen at end ${fFullScreen}`);
}    


/* code in webflow:
<script>
var save=document.firstChild
while (document.firstChild) 
   document.removeChild(document.firstChild);
document.appendChild(save);   // restore the previous first child
var html=document.createElement("html")   
document.appendChild(html);
var head=document.createElement("head")
html.appendChild(head);
var body=document.createElement("body")
html.appendChild(body);
import("https://koiosonline.github.io/lib/bootstrap/init.mjs")
</script>
*/
