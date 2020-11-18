

function genhtmlsleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function log(s) {
    var logtext=document.getElementById("log"); 
    if ((typeof s) !="string")  {
        console.log("converting to string");
        s = JSON.stringify(s);
    }   
    if (logtext)
        logtext.innerHTML +=s+"\r";
    logtext.scrollTop = logtext.scrollHeight; // keep the windows "scrolled down"
}

function SetupField(id) {
    let params = (new URL(document.location)).searchParams;
    let idvalue= params.get(id); 
    var target=document.getElementById(id)    
    target.contentEditable="true"; // make div editable
    target.style.whiteSpace = "pre"; //werkt goed in combi met innerText
    
    if (!idvalue)
        idvalue=localStorage.getItem(id); 
    if (!idvalue) 
            idvalue = target.innerHTML   
    target.innerHTML=idvalue    
    target.addEventListener('input',SaveTxt , true); // save the notes    
    
    function SaveTxt(txt) { 
        localStorage.setItem(id, txt.target.innerText);
        console.log("input");
        console.log(txt.target.innerText); 
    }
}    


//const fetch = require('node-fetch');



SetupField("figmakey")
SetupField("pageid")
SetupField("components")
SetupField("objname")
SetupField("mjspath")
SetupField("embed")
SetupField("pin")


start();


async function FigmaApiGet(url,token) { // cache to prevent rate limit errors by figma
    var fcache=url.includes("images")    
    if (fcache) {
        var cache=localStorage.getItem(url);
        if (cache) return JSON.parse(cache);
    }    
    var x=await fetch(url, { headers: {'X-Figma-Token': token } } );
    var y=await x.text()
    var obj=JSON.parse(y); // to be able to check if an error has occured
    if (!obj.err && fcache)
        localStorage.setItem(url, y);
    return obj;    
}

async function FigmaGetImage(url) {
        //console.log(`FigmaApiGetImage Loading ${url}`);
        var p1=await fetch(url)
        //console.log(p1);
        var blob=await (p1).blob()
        //console.log(blob)
        
        //if (blob.type=="image/svg+xml") // then its text   // also stored by diskcache
        //    localStorage.setItem(url, await blob.text());
        return blob;
    
}    


async function ClearCache() {
console.log("In ClearCache")
console.log(localStorage);
var keys = Object.keys(localStorage);
        if (keys.length > 0) {
            for (var j=0;j< keys.length;j++) {
                var id=keys[j]
                var val=localStorage[id];                
                console.log(id,val)
                 if (val.includes("figma"))                
                    localStorage.removeItem(id);
            }
        } 



}


function MakeBlob(html,fjavascript) {
    var blob = new Blob([html], {type: (fjavascript?'text/javascript':'text/html')});
    var url = URL.createObjectURL(blob);      
    return url;
}    


var genhtmlsleeptimer=0;

var retry=0;
var imagesloaded=0;

async function FigmaApiGetImageSrc(url,token) {
    for (var i=0;i<8;i++) {
        if (i > 0) {
            console.log(`Retry ${i} for ${url}`); 
            genhtmlsleeptimer +=200; 
            retry++;
            document.getElementById("retry").innerHTML=retry;
        }

//console.log(`FigmaApiGetImageSrc check url ${url}`);
        
        await genhtmlsleep(Math.random() * genhtmlsleeptimer); // some extra time to prevent rate limits
        var obj=await FigmaApiGet(url,token); 
                            
        if (!obj || obj.err || !obj.images) continue; // try again

//console.log(`FigmaApiGetImageSrc check url ${url}`);
//console.log(obj);

        var keys = Object.keys(obj.images);
        var key=keys[0];
        var str=obj.images[key];       
        
        
        var blob=await FigmaGetImage(str)
        

        imagesloaded++;
        document.getElementById("images").innerHTML=imagesloaded;
        //log(`Loaded ${str}`);
        var url2= URL.createObjectURL(blob)
        //console.log(`In FigmaApiGetImageSrc url=${url2}`);
         
        //var picturedata=await fetch(str);
        //console.log(picturedata);
        //var svg=await picturedata.txt() // assume it is in svg (txt) format
        //var blob=await picturedata.blob()
        //console.log(data);       
        //var blob = new Blob([data], { type: "image/svg" });
        //console.log(blob)
        //var url = URL.createObjectURL(blob);      
        //*/
        //console.log(url)
        //btoa() 
        // src="data:image/png;base64,
        // readAsDataURL
        
        
        return { type: "image", blob:blob, url:url2 }; // also end for loop
    }
}


var ipfscounter=0




async function SaveToIPFS(data) {            
    console.log("SaveToIPFS");
	ipfscounter++;
	var result;
	var cid;
	var hashHex;
	document.getElementById("ipfs").innerHTML=ipfscounter;	

	if ( typeof(data)!= "string") { // don't do this for strings (most usefull for the images anyway)
		var buffer = await data.arrayBuffer();
		var hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
		
		const hashArray = Array.from(new Uint8Array(hashBuffer));                     // convert buffer to byte array
	var hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string
		hashHex="hash-"+hashHex.toString();
		
		
		console.log(hashHex);
		var hashcid=localStorage.getItem(hashHex)
		if (hashcid) return hashcid; // already uploaded
	}
	
	console.log(`Storing on infura ${data.size} bytes `)
	var timeout=2000;
	
	for (var i=0;i<15;i++) {
        if (i > 0) {
            console.log(`Retry ${i} for ${data.size} bytes`); 
            timeout +=2000; 
            retry++;
            document.getElementById("retry").innerHTML=retry;
        }
		try {
			result = await ipfs.add(data,{timeout:timeout}) 	
		} catch(error) { console.log(error); continue; } // try again
		console.log(result);
		if (hashHex)
			localStorage.setItem(hashHex, result.path);
		if (result.path) return result.path;
	}	
    return result.path;    
}
	
	
	
	/*
	
	if (ipfs2) {

		if (result) {
			
			for await (const file of ipfs1.get(cid)) {				
				console.log(file.content);
				if (file.content) ;
			       return cid; // already present, no need to upload
		    }
		}
	}
	console.log("saving on infura");
    result = await ipfs1.add(data) 	
	*/
	


// http://www.gpersoon.com:8080/ipfs/QmRDDFeTUve2Lxq77t5MqjNNQrGVMYoD5Nje9ai3YPug3U

// http://192.168.0.40:8080/ipfs/QmfQkD8pBSBCBxWEwFSu4XaDVSWK6bjnNuaWZjMyQbyDub/#/welcome
// http://gpersoon.com:8080/ipfs/QmfQkD8pBSBCBxWEwFSu4XaDVSWK6bjnNuaWZjMyQbyDub/#/welcome


var globalpinlocation;



let globalconnectto=[]
let imagelist=[]

var ipfs;



async function SaveOnIpfs(data) {
console.log(`in SaveOnIpfs ${globalpinlocation}`);
console.log(data);


document.getElementById("SaveOnIpfs").innerHTML=""
    var result=await SaveToIPFS(data)
    console.log("saved SaveOnIpfs");
    console.log(result);
    return "https://ipfs.io/ipfs/"+result; // fix to get it to work also on ipns

    //document.getElementById("output").innerHTML += str2;
    //return `http://www.gpersoon.com:8080/ipfs/${result}`;
    //return `https://ipfs.io/ipfs/${result}`;
}




function FindObject(objname,figdata) {
//console.log(figdata);

    var firstpart = figdata.name.split(" ")[0]
    if (firstpart == objname || figdata.id==objname) 
        return figdata;
    var children=figdata.children;
    if (children)
        for (var i=0;i<children.length;i++) {
            var child=FindObject(objname,children[i] )
            if (child) return child;
        }
    return undefined; // not found        
}

var globalobjname;
var globalembed;
var globalpagesfirstpass=1;


/*
function FindRelated(components,object) {
    var keys = Object.keys(components);
    if (keys.length > 0) {
        for (var j=0;j< keys.length;j++) {
            var id2=keys[j]
            var val2=components[id2];
            if (val2.name.includes(val.name))
                console.log(val2.name)
                    
}    

*/


function IsButton(name) {
    return name.includes("btn-")
}    
/*
async function GetComponents(componentsid,token) {
    var componentlist=[];
    if (componentsid) {
        var componentspart=await FigmaApiGet(`https://api.figma.com/v1/files/${componentsid}`,token)        
        var components=componentspart.components
        var figmadocument=componentspart.document;
        console.log(components)

        
        var keys = Object.keys(components);
        if (keys.length > 0) {
            //console.log(keys);
            for (var i = 0; i < keys.length; i++) {
                var id=keys[i];
                var val = components[id];
                if (IsButton(val.name)) {
                    componentlist[val.name] = ConvertToHTML(id,figmadocument,componentsid,token)
                }
            }
        }
        console.log(componentlist);
           
        var keys = Object.keys(componentlist);
        if (keys.length > 0) {
            //console.log(keys);
            for (var i = 0; i < keys.length; i++) {
                var id=keys[i];
                console.log(id)
                var val = (await componentlist[id]).htmlobj;
                console.log(val);
                
            }
        }
        var res=await RetrieveLinkedPages(componentlist,false)
        console.log(res);
        return res;               
    }
}
*/

 //var globalbuttons;
 var globalcomponentsdocument=undefined;

var globalcomponentsid;
var orglocation


async function Reload() {    
   location.href=orglocation;
}   
var globalmjspath;
var globalfigmadocument;
var globaldocumentid;
var globaltoken;

async function start() {
    
    orglocation=location.href
    
    globaltoken=document.getElementById("figmakey").innerHTML.trim();
    globaldocumentid=document.getElementById("pageid").innerHTML.trim();    
    globalcomponentsid=document.getElementById("components").innerHTML.trim();    
    globalobjname=document.getElementById("objname").innerHTML.trim();
    globalembed=document.getElementById("embed").innerHTML.trim();
    globalmjspath=document.getElementById("mjspath").innerHTML.trim();
    
    if (globaltoken.replace(/\./g,'')=="") { log("Figma token missing");return;}
    if (globaldocumentid.replace(/\./g,'')=="") { log("Document id missing");return;}
    if (globalembed.replace(/\./g,'')=="") globalembed=undefined; // if only ..., then no embed
    if (globalcomponentsid.replace(/\./g,'')=="") globalcomponentsid=undefined; // if only ..., then no embed
    
    
    log("Pass 1");
    globalpinlocation=document.getElementById("pin").innerHTML.trim();
    console.log(`Start ${globaltoken} ${globaldocumentid}`);
	ipfs = window.IpfsHttpClient(globalpinlocation); // 'https://ipfs.infura.io:5001'
//ipfs2 = window.IpfsHttpClient('http://diskstation:5002'); 
console.log(ipfs);


	
	
    
    //globalbuttons=await GetComponents(componentsid,token)
    if (globalcomponentsid) {
        var components=(await FigmaApiGet(`https://api.figma.com/v1/files/${globalcomponentsid}`,globaltoken));
        if (components.err) {log(`Error retrieving figma info: ${components.status} ${components.err} `);return;}
        console.log(components);
        globalcomponentsdocument=components.document
    }
    
    var url=`https://api.figma.com/v1/files/${globaldocumentid}`  // to export the vectors: ?geometry=paths    
    var documentpart=await FigmaApiGet(url,globaltoken)
    
    if (documentpart.err) {log(`Error retrieving figma info: ${documentpart.status} ${documentpart.err} `);return;}
    console.log(documentpart);
          
    
 
    
    
    
    globalfigmadocument=documentpart.document;
    console.log(globalfigmadocument);
    //log(`Found page: ${globalfigmadocument.name?globalfigmadocument.name:""} ${globalfigmadocument.id}`);    
    var fo=FindObject(globalobjname,globalfigmadocument)
    console.log(fo);
    
    if (!fo) {
         log(`Can't find: ${globalobjname}`);
         return;
    }
    
    //log(`Page: ${globalpagesfirstpass++} ${globalobjname} ${fo.id}`); // id: ${fo.id}
    

    globalconnectto[fo.id] = ConvertToHTML(fo.id,globalfigmadocument,globaldocumentid,globaltoken)
	
	await RetrieveLinkedPages(globalconnectto);
    
    //log(`globalconnectto: ${JSON.stringify(Object.keys(globalconnectto))}`);
	console.log(globalconnectto);
	
    await ShowInBrowser()
    document.getElementById("SaveOnIpfs").innerHTML="Save on IPFS"  
    document.getElementById("AlsoInject").innerHTML="Inject in current page"  
}    
    
async function ShowInBrowser() {	
	var completepage=await RenderPages(globalconnectto,false);
    //console.log(completepage);
    var html=await MakePage2(completepage,globalembed,globalfonts,globalmediastyles,globalobjname,false,globalmjspath)        
    var url=MakeBlob(html);    
    document.getElementById("output").innerHTML += `Complete page=${MakeUrl(url)}`   
}		
	
    
export async function SaveAlsoOnIpfs() {
    console.log(`SaveAlsoOnIpfs firstpage=${globalobjname}`);
    var completepage=await RenderPages(globalconnectto,true);
	var javascript1=await MakePage2(completepage,globalembed,globalfonts,globalmediastyles,globalobjname,true,globalmjspath)    
	var javascript2=await MakePage2(completepage,globalembed,globalfonts,globalmediastyles,globalobjname,true,"https://koiosonline.github.io/lib")    
	var resultjavascript1=await SaveOnIpfs(javascript1)
	var resultjavascript2=await SaveOnIpfs(javascript2)
    var str2=""
	resultjavascript1=resultjavascript1.replace("https://ipfs.io/ipfs/","")
	resultjavascript2=resultjavascript2.replace("https://ipfs.io/ipfs/","")
    str2 +="IPFS test link: "+MakeUrl(`https://ipfs.io/ipfs/${resultjavascript1}`); // 
	str2 +="Koios embedtest link:"+MakeUrl(`https://www.koios.online/test/newviewer?ipfs=${resultjavascript1}`);	
	
	
	str2 +="IPFS prod  link: "+MakeUrl(`https://ipfs.io/ipfs/${resultjavascript2}`); // 
	str2 +="Koios embedprod link:"+MakeUrl(`https://www.koios.online/newviewer?ipfs=${resultjavascript2}`);	
	
    document.getElementById("output").innerHTML += str2;
}
 
export async function AlsoInject() {
	var completepage=await RenderPages(globalconnectto,false);
	var modulesource=await MakePage2(completepage,globalembed,globalfonts,globalmediastyles,globalobjname,false,globalmjspath)     
    var tag="//--script--"
    var n = modulesource.indexOf(tag);
    if (n <0 ) { console.error("Can't find tag");return;} 
    modulesource = modulesource.substring(n+tag.length);		
    var url2=MakeBlob(modulesource,true);    
    document.getElementsByTagName("html")[0].innerHTML=""
    var html=document.getElementsByTagName("html")[0]
    await import(url2);		   
} 

 
    
async function RetrieveLinkedPages(globalconnectto) {
    log("Pass 2: RetrieveLinkedPages");
	//log(`globalconnectto: ${JSON.stringify(Object.keys(globalconnectto))}`);
	
	do {	
		var keys = Object.keys(globalconnectto);
		if (keys.length > 0) {
			for (var i = 0; i < keys.length; i++) {                
				var key=keys[i];
				//log(`Wait for ${i} ${key}`);
				//console.log(globalconnectto[key]);
				if (globalconnectto[key]==true) {
				   log(`Retrieving ${key}`)
				   globalconnectto[key]=ConvertToHTML(key,globalfigmadocument,globaldocumentid,globaltoken,embed) // = promise, so executed in parallel
			    } 
				
				var val = await globalconnectto[key];			
				//console.log(val);
				//log(`Page ${i+1} of ${keys.length}  ${val?val.name:"not found:"} ${key}`);			 
			}
		} 		
		var left=0;
		var keys = Object.keys(globalconnectto);	
		for (var i = 0; i < keys.length; i++) {                
			var key=keys[i];
			if (globalconnectto[key]==true) 
				left++				
		} 		
		//if (left >0) log(`Remaining ${left}`);
	} while (left > 0);
    
}


async function RenderPages(globalconnectto,fIPFS) {
	log("Step 3: RenderPages");
	var completepage=""
	var keys = Object.keys(globalconnectto);
		if (keys.length > 0) {
			for (var i = 0; i < keys.length; i++) {                
				var key=keys[i];				
				var val = await globalconnectto[key];			
				log(`Page ${i+1} of ${keys.length}  ${val?val.name:"not found:"} ${key}`);
				if (val) {                
					var html= await recursehtml(val.htmlobj,fIPFS);    
					completepage += html; // already a div
				}
			}
		} 
		return completepage
}    
    
    
    
    
let globalmediastyles = []
let globalfonts = []

   
 
    
    
    
    
async function ConvertToHTML(foid,figmadocument,documentid,token) {  
    var currentobject=FindObject(foid,figmadocument)
    
    //log(`Page ${globalpagesfirstpass} ${foid} ${currentobject?currentobject.name:"(not found)"} ${currentobject?currentobject.id:""}`);
    
    if (!currentobject) return undefined;
    globalpagesfirstpass++ // only increase if a page is really present
    
    //console.log(currentobject)
    var htmlobj=await recurse(currentobject,figmadocument,documentid,token,false,0,false,undefined); // retrieve the found object
    
    var returnset={ name:currentobject.name, id: foid, htmlobj: htmlobj }    
    //log(`Exit ConvertToHTML ${foid} name: ${currentobject.name}`);    
    return returnset;
}    
    
    
    
function GetMediaStyles(globalmediastyles) {
    var stylestr=""
    var keys = Object.keys(globalmediastyles);
    if (keys.length > 0) {
        stylestr +="<style>\n"
        console.log(keys);    
        for (var i = 0; i < keys.length; i++) {
            var key=keys[i];
            var val = globalmediastyles[key];
            stylestr +=`.${key} \{ display: none; \} \n`
            stylestr +=`@media only screen and  ${val} \{  .${key}  \{ display: block; \} \} \n`
        }
        stylestr +="</style>\n"
        console.log(stylestr);
    }
    return stylestr;
}
      

function GetFontsArray(globalfonts) { 
    var list=[]
    var fontstr=""
    var keys = Object.keys(globalfonts);
    if (keys.length > 0) {
        for (var i = 0; i < keys.length; i++) {
            var key=keys[i];
            switch (key) {
                case "Arial": break; // standard font                
                case "FontAwesome":             
                case "Font Awesome 5 Free":  
                case "Font Awesome 5 Brands": list.push("https://use.fontawesome.com/releases/v5.0.1/css/all.css");break;
                default:                      list.push(`https://fonts.googleapis.com/css2?family=${key}&display=swap`);break;
            }
        }
        console.log(fontstr);
    }
    return list;
}    
	  

function GetFonts(globalfonts) { 
	var list =GetFontsArray(globalfonts)
	var fontstr=""
	for (var i=0;i<list.length;i++)
		fontstr +=`<link href="${list[0]}" rel="stylesheet">`
	console.log(fontstr);
    return fontstr;
}    

function MakeScriptTag(fModule,src,content) { // string trick to prevent confusion by javascript interpreter
       var str="<"+"script "
       if (fModule)
          str +=' type="module" '
       if (src)
          str +=` src="${src}" `
       str +=">"
       if (content)
          str +=content;       
       str +="<"+"/"+"script"+">"        
       return str;
}


var errorscript=`<script>

window.onerror = function(message, source, lineno, colno, error) {   // especially for ios
    console.log("In onerror");
    var str="Error: "+message+" "+source+" "+lineno+" "+colno+" ";
    if (error && error.stack) str += error.stack;
    
    //console.log(error.stack);
    
    alert(str)
    
} 
</script>
`

/*            
function MakeHeader(embed,globalfonts,globalmediastyles) {   
    var strprefix=""    
    
    strprefix +='<head>'	
	strprefix +='<meta charset="utf-8" />'
    strprefix +='<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">'    
    strprefix +=errorscript;
    strprefix += GetFonts(globalfonts);
    if (embed) {
        console.log(`Embedding ${embed}`); 
        strprefix +=MakeScriptTag(true,embed)        
    }
    strprefix += GetMediaStyles(globalmediastyles);
    strprefix +='</head>'
    return strprefix;
}
    
*/


 

async function MakePage2(strinput,embed,globalfonts,globalmediastyles,firstpage,fIPFS,mjspath) {
	
	var loadimagescript= mjspath+"/genhtml/startgen.mjs"
	var embedstr=mjspath+"/"+embed
	
	var injectscript=""
	injectscript+='   var head=document.getElementsByTagName("head")[0];\n'
    injectscript+='   var meta=document.createElement("meta");\n'
    injectscript+='   meta.name="viewport";\n'
    injectscript+='   meta.content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0";\n'
    injectscript+='   head.appendChild(meta);\n'
		
	var list=GetFontsArray(globalfonts)
	for (var i=0;i<list.length;i++) {
		injectscript+='   var link=document.createElement("link");\n'
        injectscript+=`   link.href="${list[i]}";\n`
        injectscript+='   link.rel="stylesheet";\n'
        injectscript+='   head.appendChild(link);\n'
	}	
	// add errorscript
	
	injectscript +='\nasync function init() { \n'
    injectscript +=`   document.getElementsByTagName("body")[0].innerHTML = newbody;\n`    // this is a synchronous actions
	injectscript +=`   await import("${loadimagescript}");\n`  // note async
	injectscript +='   console.log("Right after loadimage");\n';
if (embed) {
    injectscript +=`   await import("${embedstr}");\n` // note async
}
	injectscript +='   console.log("Right after embed");\n';
	injectscript +='   var event = new Event("DOMContentLoaded",{  bubbles: true,  cancelable: true});'
	injectscript +='   window.document.dispatchEvent(event);\n'	
	injectscript +='}\n\n'    
    injectscript +=`var newbody=\`\n${strinput}\`;\n\n`    
    injectscript +='console.log("Starting init");\n';
	injectscript +='init();\n'
	
//	return injectscript;
	

    var str="" 	
	str +='<!DOCTYPE html>' // same as in webflow, makes a difference for the rendering
    str +='<html>' 
	str +='<head>'		
	str +='<meta charset="utf-8" />'   	// charset has to be set here	
	str +='<script type="module">\n'	
	str +='//--script--\n'   // magic string to indicate the start of the javascript
	str +=injectscript
	str +='\n'
	str +='//' // javascript ignores the rest
	str +='</script>'
	str +='</head>'
    str +='<body>'    
    str +='</body>'
    str +='</html>'
    return str;	
	
}


 
 

    
function MakeUrl(url) {
    return `<a href="${url}" target="_blank"> ${url}` + " in new page</a><br>"
}





function _convertFigmaColorToRGB(value) {
    return Math.ceil(value * 255);
}

async function  recursehtml(htmlobjpromise,fIpfs) {
    var str=""
    if (typeof(htmlobjpromise) == "string")
        return htmlobjpromise;
        
    var htmlobj = await htmlobjpromise;
    if (!htmlobj) return ""
   if (typeof(htmlobj) == "string")
        return htmlobj;
//console.log(  htmlobj)      
   if (htmlobj.type && htmlobj.type=="image") {
        if (fIpfs)
            return SaveOnIpfs(htmlobj.blob)
        else
           return htmlobj.url;
   }
   
    if (htmlobj.length > 0)
        for (var i=0;i<htmlobj.length;i++) {
            var part=htmlobj[i]
            var objtype=typeof(part)
            switch (objtype) {
                case "string": str +=part;break;
                default:       str += await recursehtml(part,fIpfs);
            }
    }    
   return str;
}


function GetAtParam(figdata,name) {
    var pos=figdata.name.indexOf(name);
    if (pos < 0) return undefined;
    
    var rest=figdata.name.substring(pos + name.length).toLowerCase();
    rest = rest.split(" ")[0]  // take the part before a space
    //rest = rest.replace(/[^0-9\-]/g, ''); // only keep numbers (includeing - sign)
    rest = rest.replace(/[:]/g, ''); // remove :
    
    //console.log(`GetAtParam ${name} ${rest}`)
    return rest.length==0?true:rest;
}


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


async function recurse(figdata,figmadocument,documentid,token,fpartofgrid,buttonlevel,fpartofflex,pb) { // pb is (optional) parent boundingbox
        var htmlobjects=[]                        
        console.log(`Processing ${figdata.name} with ${figdata.children ? figdata.children.length : 0} children`);    //Type:${figdata.type}
        console.log(figdata);
        
		//log(`Recurse ${figdata.name}`);
		
		
		
        if (figdata.visible==false) return "";        
        
        var zindex=GetAtParam(figdata,"@zindex")       
        
        
        var fsvg=    GetAtParam(figdata,"@svg")!=undefined            // console.log(`fsvg=${fsvg}`)
		var fpng=    GetAtParam(figdata,"@png")!=undefined            // console.log(`fsvg=${fsvg}`)
        var faspect= GetAtParam(figdata,"@aspect")!=undefined      //  console.log(`faspect=${faspect}`)
        var fhidden= GetAtParam(figdata,"@hidden")!=undefined      //  console.log(`faspect=${faspect}`)
        
        var click=GetAtParam(figdata,"@click")!=undefined
        var dest=GetAtParam(figdata,"@dest")
        var toggle=GetAtParam(figdata,"@toggle")!=undefined
        
        var fstaticwidth=GetAtParam(figdata,"@staticwidth")!=undefined
        
        
        var fthisisabutton= click || toggle
		if (fthisisabutton && (buttonlevel >0)) {
			console.error(`Button within a button ${figdata.name}, stopping recusing`)
			return;
		}
		
		var minwidth=   GetAtParam(figdata,"@minwidth")
        
        var gridcols=   GetAtParam(figdata,"@gridcols")
        var gridrows=   GetAtParam(figdata,"@gridrows")
        
        
        var gridcol=   GetAtParam(figdata,"@gridcol")
        var gridrow=   GetAtParam(figdata,"@gridrow")
        var scale=     GetAtParam(figdata,"@scale")
        
        var fwordwrap = GetAtParam(figdata,"@wordwrap")!=undefined
  
        
        
        var fgrid = gridcols || gridrows
        
        var frelative=   GetAtParam(figdata,"@relative")!=undefined
		var fabsolute=   GetAtParam(figdata,"@absolute")!=undefined
        
        var b=figdata.absoluteBoundingBox;
        var strtxt=""
        var strstyle=""
        var image=""
        var surroundingdiv=""
        var display=""
        var width=""
        var height=""
        var left=""
        var top=""
        var right=""
        var bottom=""
        var paddingbottom=""
        var fflex=false;
        var dimensions=""
        var objecttype="div" // standard type
        var strhref=""
        var strtarget=GetAtParam(figdata,"@target");
        var urllocation=""
        var insdata=""
        var transform=""


      if (dest && !globalconnectto[dest]) globalconnectto[dest]=true; // remember to search later


/*
    if (figdata.transitionNodeID) {
        //log(`Connect: to ${figdata.transitionNodeID}`);
        if (!globalconnectto[figdata.transitionNodeID]) {
            globalconnectto[figdata.transitionNodeID]=true; // prevent recursing too fast
            globalconnectto[figdata.transitionNodeID]=ConvertToHTML(figdata.transitionNodeID,figmadocument,documentid,token,embed) // = promise, so executed in parallel
        }
        
        var onclick=figdata.transitionNodeID;
    }
*/

    //if (figdata.type=="INSTANCE") {
//        console.log("Searching mastercomponent");
//        var mastercomponent=FindObject(figdata.componentId,figmadocument)   
//        console.log(mastercomponent);
//    }




       console.log(`${figdata.name} buttonlevel:${buttonlevel} fabsolute:${fabsolute} fthisisabutton:${fthisisabutton}`)
	   
	   display="inline-block"
	   
	   
        if (b) { //|| figdata.layoutMode
		
		var makerelative;
		if (buttonlevel) makerelative=true;
		if (fpartofflex) makerelative=true;
	//	if (buttonlevel==1) makerelative=false; // only on firstlevel absolute to overlap
		if (buttonlevel>1) makerelative=true;
		
		
		if (frelative) makerelative=true;
		if (fabsolute) makerelative=false;
		
		console.log(`makerelative=${makerelative}`);
       dimensions +=`position: ${figdata.isFixed?"fixed":makerelative?"relative":"absolute"};`;      // for grid with auto layout, relative position is neccesary          
console.log(dimensions)			     

            if (!pb) {
				if (!buttonlevel)
					strstyle +=`width:100%;height:100%;`; // no parent => so give it all the space, left & top default values // 
                // dimensions=""; // prevent minor scroll actions ==> messes up zindez
                if (figdata.name != globalobjname)
                    display="none"; // initially hidden (relevant when there are more pages), except for the first one
                    
                
            }
            else  // now pb is present
               {
                //console.log("pb-b");
                //console.log(pb)
                //console.log(b);
                var xoffset=b.x-pb.x
                var xoffsetright=-(b.x+b.width-pb.x-pb.width);
                var yoffset=b.y-pb.y	     
                var yoffsetbottom=-(b.y+b.height-pb.y-pb.height); 
                
                //console.log(`pb:${JSON.stringify(pb)} b:${JSON.stringify(b)} l:${xoffset} r:${xoffsetright} t:${yoffset} b:${yoffsetbottom}`);
              /* if (!fpartofflex) */{
                    switch(figdata.constraints ? figdata.constraints.horizontal : "default") {
                        case "SCALE":
                            left =`${(parseFloat(xoffset)/parseFloat(pb.width)*100).toFixed(2)}%`;
                            //strstyle +=`right:${(parseFloat(xoffsetright)/parseFloat(pb.width)*100).toFixed(2)}%;`;
                            width=`${(parseFloat(b.width)/parseFloat(pb.width)*100).toFixed(2)}%`;
                            
                            break;
                        case "CENTER":                              
                            //left =`${(parseFloat(xoffset)/parseFloat(pb.width)*100).toFixed(2)}%`;
//                            left =`calc(50% - ${b.width/2}px)`;  // There must be spaces surrounding the math operator. 
                            left ="50%"
                            transform += "translateX(-50%) " // note:seperated by spaces
                            width=`${b.width}px`;
                            //surroundingdiv +="display: flex; justify-content: center;";
                            //strstyle +=`left:1%;`
                            break;
                        case "RIGHT":
                            right=`${xoffsetright}px`; // negative number
                            width=`${b.width}px`;
                            break;
                            
                        case "LEFT_RIGHT":
                            //width="100%";
                            left =`${xoffset}px`
                            right=`${xoffsetright}px`; // negative number
                            break;                            
                        default:
                            left =`${xoffset}px`
                            if (parseFloat(b.width) * 100 > 1) 
                                width=`${b.width}px`;
                    }
                    switch(figdata.constraints ? figdata.constraints.vertical : "default") {
                        case "SCALE":                       
                            top =`${(parseFloat(yoffset)/parseFloat(pb.height)*100).toFixed(2)}%`;
                         if (faspect) {
                            paddingbottom =`${ (parseFloat(b.height)/parseFloat(b.width) ) * (parseFloat(b.width)/parseFloat(pb.width)*100)}%`;
                            
                            }
                         else   
                            height =`${(parseFloat(b.height)/parseFloat(pb.height)*100).toFixed(2)}%`;
                            //strstyle +=`bottom:${(parseFloat(yoffsetbottom)/parseFloat(pb.height)*100).toFixed(2)}%;`;
                            break;
                        case "CENTER":                            
                            // top =`${(parseFloat(yoffset)/parseFloat(pb.height)*100).toFixed(2)}%`;
                          //  top =`calc(50% - ${b.height/2}px)`;  // There must be spaces surrounding the math operator. 
                          top="50%"
                          transform += "translateY(-50%) " // note:seperated by spaces
                            height =`${b.height}px`;
                            //strstyle +=`top:1%`
                            //surroundingdiv +="display: flex;align-items: center; ";
                            break;
                        case "BOTTOM":
                            bottom =`${yoffsetbottom}px`; // negative number
                            height =`${b.height}px`;
                            break; 

                        case "TOP_BOTTOM":
                            //height="100%";
                            top =`${yoffset}px`
                            bottom =`${yoffsetbottom}px`; // negative number
                            break;
                        default:
                            top =`${yoffset}px`
                            if (parseFloat(b.height) * 100 > 1) 
                                height =`${b.height}px`;
                    }
                }
				
				if (fthisisabutton && !fstaticwidth) {
					width=undefined; // let the button create its width automatically
				}
                
                
				
                 if (fpartofflex) {
                    // console.log(width,height,left,right,bottom,top,paddingbottom)
                    if (figdata.type=="TEXT")  {  // ??&& !fstaticwidth
                        width=undefined; 
                        height=undefined;
                    }                
                    left=undefined
                    right=undefined
                    bottom=undefined
                    top=undefined
                    paddingbottom=undefined
                    transform=""
                    
                    
                     switch(figdata.layoutAlign) {
                        case "MIN":      strstyle +="align-self: flex-start;";break;
                        case "CENTER":   strstyle +="align-self: center;";    break;
                        case "MAX":      strstyle +="align-self: flex-end;";  break;
                        case "STRETCH":  break; // no style needed
                   } 
                    
                    
                   // console.log("fpartofflex");
                   // console.log(width,height,left,right,bottom,top,paddingbottom)
                }
                if (fpartofgrid) {
                        ;//strstyle += "grid-area: auto;" // autolayout the childeren on the grid
                    strstyle += "position:relative;" // to be a reference point for further div; don't calculate the sizes, this is done by the grid
                    dimensions =`position: relative;`;      
                    width=undefined; 
                    height=undefined;
                   
                    left=undefined
                    right=undefined
                    bottom=undefined
                    top=undefined
                    paddingbottom=undefined
                    transform=""
                    
                    
                }    
                    
                    
                
                
                if (fpartofflex && (fpartofflex!==true)) {
                  //  console.log(`Adding ${fpartofflex}`)
                    dimensions +=fpartofflex; // contains the margin values                    
                }
                
                if (figdata.layoutMode) { // autolayout
                    
                    
                    display="flex"
                    
                    switch (figdata.layoutMode) {
                        case "VERTICAL": {
                                    dimensions+="flex-direction: column;";
                                    fflex=`margin-bottom: ${figdata.itemSpacing?figdata.itemSpacing:0}px;`;
									dimensions +=`padding-top:    ${figdata.verticalPadding?figdata.verticalPadding:0}px; `
									dimensions +=`padding-bottom: ${(figdata.verticalPadding?figdata.verticalPadding:0)-(figdata.itemSpacing?figdata.itemSpacing:0)}px; `
									dimensions +=`padding-left:   ${figdata.horizontalPadding?figdata.horizontalPadding:0}px; `
									dimensions +=`padding-right:  ${figdata.horizontalPadding?figdata.horizontalPadding:0}px; `
									
																	
									
                                    height=undefined; // determined by underlying divs
                                    if (figdata.counterAxisSizingMode && figdata.counterAxisSizingMode=="FIXED") {
                                        // keep width
                                    } else    
                                        width=undefined; // determined by underlying divs
                                    break;
                        } 
                        case "HORIZONTAL": {
                                    dimensions +="flex-direction: row;";
                                    fflex=`margin-right: ${figdata.itemSpacing?figdata.itemSpacing:0}px;`; 
																		
									dimensions +=`padding-top:    ${figdata.verticalPadding?figdata.verticalPadding:0}px; `
									dimensions +=`padding-bottom: ${figdata.verticalPadding?figdata.verticalPadding:0}px; `
									dimensions +=`padding-left:   ${figdata.horizontalPadding?figdata.horizontalPadding:0}px; `
									dimensions +=`padding-right:  ${(figdata.horizontalPadding?figdata.horizontalPadding:0)-(figdata.itemSpacing?figdata.itemSpacing:0)}px; `
									
									width=undefined; // determined by underlying divsf
                                    if (figdata.counterAxisSizingMode && figdata.counterAxisSizingMode=="FIXED") {
                                        // keep height 
                                    } else 
                                        height=undefined; // determined by underlying divs                                    
                                    
                        }
                        break;
                    }
                }
                
         if (fgrid)
            display="inline-grid"
        if (gridcols)
            strstyle +=`grid-template-columns: repeat(${gridcols}, 1fr);`
        if (gridrows)
            strstyle +=`grid-template-rows: repeat(${gridrows}, 1fr);`                
        
        if (gridcols || gridrows) {
            dimensions="";
            fflex=""
            //dimensions+="flex-direction: column;";
            // dimensions +="flex-direction: row;";
            fflex+=`margin-bottom: ${figdata.itemSpacing?figdata.itemSpacing:0}px;`;
            fflex+=`margin-right: ${figdata.itemSpacing?figdata.itemSpacing:0}px;`;             
            dimensions +=`padding-top:    ${figdata.verticalPadding?figdata.verticalPadding:0}px; `
            dimensions +=`padding-bottom: ${(figdata.verticalPadding?figdata.verticalPadding:0)-(figdata.itemSpacing?figdata.itemSpacing:0)}px; `
            dimensions +=`padding-left:   ${figdata.horizontalPadding?figdata.horizontalPadding:0}px; `
            dimensions +=`padding-right:  ${(figdata.horizontalPadding?figdata.horizontalPadding:0)-(figdata.itemSpacing?figdata.itemSpacing:0)}px; `
        }
  
        if (gridcol) strstyle +=`grid-column-start: ${gridcol};grid-col-end: span 1;`
        if (gridrow) strstyle +=`grid-row-start: ${gridrow};grid-row-end: span 1;`
        
                
                if (GetAtParam(figdata,"@width")) width=GetAtParam(figdata,"@width") // allways override if present
                if (GetAtParam(figdata,"@height")) height=GetAtParam(figdata,"@height")
                
                if (GetAtParam(figdata,"@max-width")) dimensions+=`max-width:${GetAtParam(figdata,"@max-width")};`;
            
                if (width && width.length>0 && width!="true")         dimensions +=`width:${width};`;
                if (height)        dimensions +=`height:${height};`;    
                if (left)          dimensions +=`left:${left};`;    
                if (right)         dimensions +=`right:${right};`;  
                if (bottom)        dimensions +=`bottom:${bottom};`;  
                if (top)           dimensions +=`top:${top};`;  
                if (paddingbottom) dimensions +=`padding-bottom:${paddingbottom};`;  
                if (scale)         transform  +=` scale(${scale}) `  // scale:${scale} // scale doesn't work on mobile browser
                if (transform)     dimensions +=`transform: ${transform};`
				if (minwidth)	   dimensions +=`min-width: ${minwidth};`
                
               // console.log(dimensions);
            }
        }    
                
       
  
        
        if (figdata.clipsContent==true) strstyle +="overflow: hidden;"
        
        switch (figdata.overflowDirection) {
            case "VERTICAL_SCROLLING":   strstyle +="overflow-y: auto;";break;
            case "HORIZONTAL_SCROLLING": strstyle +="overflow-x: auto;";break;
            case "HORIZONTAL_AND_VERTICAL_SCROLLING": strstyle +="overflow: auto;";break;
       //  default: // includes figdata.overflowDirection == undefined
       //         strstyle +="overflow: hidden;"
        }

//console.log(`overflow: ${strstyle}`)            
        
        if (figdata.fills && figdata.fills[0] && figdata.fills[0].color && (figdata.fills[0].visible != false)) {               
            if (figdata.fills[0].type="SOLID") {
                var color=figdata.fills[0].color
                //if (figdata.fills[0].opacity)
                    color.a=figdata.fills[0].opacity
                var rgba=ConvertColor(color)
              }
          }
          
        if (figdata.fills && figdata.fills[0] && figdata.fills[0].type == "IMAGE") {
           // console.log(figdata.fills);                
            if (figdata.id) {  // link to an image??
                image = `https://api.figma.com/v1/images/${documentid}?ids=${figdata.id}&format=svg`
                objecttype="image"
            }
        }
          
          
function ConvertColor(color) {
    var a = color.a // _convertFigmaColorToRGB(color.a); opacity 0..1
    var r = _convertFigmaColorToRGB(color.r);
    var g = _convertFigmaColorToRGB(color.g);
    var b = _convertFigmaColorToRGB(color.b);
    
    if (a==undefined) a=1;
    return `rgba(${r},${g},${b},${a})`;
}
          
        if (figdata.backgroundColor) 
           var backgroundrgba=ConvertColor(figdata.backgroundColor)

        
        if (figdata.strokes && figdata.strokes[0] && figdata.strokes[0].color) 
            if (figdata.strokes[0].type="SOLID") 
                var strokesrgba=ConvertColor(figdata.strokes[0].color)
             
          var strokeWeight = figdata.strokeWeight
            
        if (figdata.effects) {
            for (var i=0;i<figdata.effects.length;i++) {
                var effect = figdata.effects[i];
                if (effect.visible)
                    switch (effect.type) {
                        case "DROP_SHADOW": {
                            strstyle +=`box-shadow: ${effect.offset.x}px ${effect.offset.y}px ${effect.radius}px ${ConvertColor(effect.color)};`
                        }
                }
            }
        }
       
       
            
        if (figdata.style && figdata.style.fontFamily) {
            switch (figdata.style.fontFamily) {
                case "FontAwesome":             figdata.style.fontFamily = "Font Awesome 5 Free"; // and continue to next line
                case "Font Awesome 5 Free":     strstyle += "font-weight: 900;";figdata.style.fontWeight=0;break; // note other weights are part of pro plan                
            }
           strstyle += `font-family: '${figdata.style.fontFamily}', sans-serif;`;
           globalfonts[figdata.style.fontFamily] = true;
        }
        
        if (figdata.style && figdata.style.fontSize)
            strstyle += `font-size:${figdata.style.fontSize}px;`;
        
        
        if (figdata.style && figdata.style.fontWeight)
            strstyle += `font-weight:${figdata.style.fontWeight};`;
        
        if (figdata.style && figdata.style.textDecoration)
            strstyle += `text-decoration-line: ${figdata.style.textDecoration};`      
        
        if (figdata.style && figdata.style.lineHeightPx)
            strstyle += `font-height:${figdata.style.lineHeightPx}px;`;
        
        
        if (figdata.style && figdata.style.hyperlink) {
            objecttype="a"
            urllocation=figdata.style.hyperlink.url;
            console.log(`Found url ${urllocation}`);
        }    
        

        
        
        switch (figdata.type) {
           case "TEXT": strtxt+=figdata.characters.replace(/\n/g,"<br>"); // replace all newlines
                console.log(figdata.style)
                console.log(strstyle);
                switch(figdata.style.textAlignVertical) {
                   case "TOP":   break // is already default // display="flex";strstyle +="align-items: flex-start;";
                   case "CENTER": display="flex";strstyle +="align-items: center;";    break
                   case "BOTTOM": display="flex";strstyle +="align-items: flex-end;";  break                   
                }                
                switch(figdata.style.textAlignHorizontal) {
                   case "LEFT":   /*display="flex";*/strstyle +="text-align: left;"; break;   // "justify-content: flex-start;";break;
                   case "CENTER": /*display="flex";*/strstyle +="text-align: center;"; break; // "justify-content: center;";    break;
                   case "RIGHT":  /*display="flex";*/strstyle +="text-align: right;"; break;  // "justify-content: flex-end;";  break;
                }    
                 console.log(strstyle);
           break;
           //case "RECTANGLE": { console.log(figdata);                          break; }
         //  case "GROUP": strstyle +=`position: relative; display:inline-block;`; break;
           case "FRAME":       break;
         //  case "COMPONENT":  strstyle +=`position: relative; display:inline-block;`; break;
          
        //  case "ELLIPSE": strstyle +="border-radius: 50%;";break; // circle for now
         // case "INSTANCE": // do same as vector
         // case "COMPONENT": // do same as vector
         
          case "REGULAR_POLYGON":
          case "ELLIPSE":
          case "STAR":
          case "LINE":   // same as vector
          case "VECTOR": fsvg=true;break; // get object as an svg
        }
        
        if (zindex)
            strstyle +=`z-index:${zindex};`
        
        if (fsvg) { // then make this into an svg {            
            image = `https://api.figma.com/v1/images/${documentid}?ids=${figdata.id}&format=svg`                
            objecttype="image"
        } 
		if (fpng){ // then make this into an png
            image = `https://api.figma.com/v1/images/${documentid}?ids=${figdata.id}&format=png` 
            objecttype="image"
        } 
			
        
        if (figdata.rectangleCornerRadii) {
            let r=figdata.rectangleCornerRadii;
            strstyle +=`border-radius: ${r[0]}px ${r[1]}px ${r[2]}px ${r[3]}px;`; // (first value applies to top-left corner, second value applies to top-right corner, third value applies to bottom-right corner, and fourth value applies to bottom-left corner)
        }
        


        if (figdata.cornerRadius) {
            let r=figdata.cornerRadius;
            strstyle +=`border-radius: ${r[0]}px ${r[1]}px ${r[2]}px ${r[3]}px;`; // (first value applies to top-left corner, second value applies to top-right corner, third value applies to bottom-right corner, and fourth value applies to bottom-left corner)
        }
        
        if (!fsvg && !fpng) {  // don't draw boxed for svgs and for vector images
            if (figdata.type!="TEXT")
                backgroundrgba = rgba;
            if (backgroundrgba)
                strstyle+=`background-color:${backgroundrgba};`
            if (rgba)
                strstyle+=`color:${rgba};`
            if (strokesrgba) 
                strstyle+=`border-color:${strokesrgba};border-style:solid;`
            switch (figdata.strokeAlign) {
               case "INSIDE": strstyle += "box-sizing: border-box;";break;
            }   
            if(strokeWeight)    
                strstyle+=`border-width:${strokeWeight}px;`    
            
            
            if (figdata.strokeDashes)
                strstyle += "border-style: dashed;"
            
        }        
        if (fwordwrap)
			strstyle +="overflow-wrap: break-word;"
        
        if (fhidden)
            display="none";
        if (display)        
            strstyle +=`display:${display};`;
//console.log(display);        
      
        
        
        var eventhandlers=""
        
        if (fthisisabutton  && !buttonlevel) { // don't do event on nested parts of the button
        
        surroundingdiv=";"
        
             //eventhandlers+='onmouseenter="onhoverhandler({event:event,this:this,hover:true})" ' //mouseover
             if (!onclick) onclick=true;
        }
        
        
        if (dest) {
            insdata+=`data-dest="${encodeURIComponent(dest)}" `
          //  console.log(`insdata : ${insdata}`);
        }
        if (strtarget) {
            insdata+=`data-target="${strtarget}" `
              console.log(`insdata : ${insdata}`);
        }
        
        if (onclick) {
             surroundingdiv=";"
          //  eventhandlers +=`onClick="onclickhandler({event:event,this:this,dest:'${onclick?onclick:""}'})" `
        }
        
        
  
        
        var classname=figdata.name;
        var mediapos=classname.indexOf("@media");
        //console.log(mediapos)
        if (mediapos >=0) {
            var rest=classname.substring(mediapos + "@media".length).toLowerCase();
            console.log(rest);
            var key = rest.replace(/[^A-Za-z0-9]/g, '');
            globalmediastyles[key]=rest;
            classname=classname.substring(0,mediapos) + " " + key;
            console.log(classname);
        }      

        classname += ` ${figdata.id} `; // to be able to access the item via the id
                
        //console.log(insrtstyle);
        
        if (surroundingdiv) {
            var strstyle2 = strstyle + dimensions;
            var insrtstyle2=strstyle2?`style="${strstyle2}"`:""
            htmlobjects.push( `<div class="${classname}" ${insrtstyle2} class="surround" ${insdata} style="${surroundingdiv};border-style:solid;border-width:1px;border-color:red;" ${eventhandlers}>` ); // width:100%;height:100%;
            dimensions=""; // dimensions are part of surroundingdiv
            
            dimensions ='position: relative;' // width:95%;height:96%;set dimension to max in order to use of surroundingdiv // only used for buttons ==> let the underlying text define the buttons
            buttonlevel++; // so the rest is relative
			if (fstaticwidth)         dimensions +=`width:${width};height:${height};`;
			
            insdata="" // don't put it on buttons itself anymore
            
            classname=classname.split(" ")[0]; // only keep the first part  to prevent confusion (when attaching eventlisteners)
             //classname = classname.replace("@click", ""); // remove the click from childbutton; its prevent in surroundingdiv
             //classname = classname.replace("@toggle", "");
            
        }
            
            
        strstyle +=dimensions;
            
        var insrtstyle=strstyle?`style="${strstyle}"`:""
           // console.log(`insrtstyle ${insrtstyle}`)
        switch (objecttype) {
            case "image":   
                htmlobjects.push(`<${objecttype} data-src=`)
                htmlobjects.push('"') // data-src= 
                if (!imagelist[image]) {
                    imagelist[image]=true;
                    imagelist[image]=FigmaApiGetImageSrc(image,token)
                }
                classname+=" lazy " // for lazy evaluatation/retrieval of images, see startgen.mjs
                htmlobjects.push(imagelist[image])
                htmlobjects.push(`"  class="${classname}" ${insrtstyle} ${insdata} ">${strtxt}\n`) //  ${figdata.type} // title="${figdata.name}
                htmlobjects.push('</image>');
                break;
            
                case "a":  strhref=`href="{urllocation}" `;
                case "div": htmlobjects.push(`<${objecttype} class="${classname}" ${insrtstyle} ${insdata} ${strhref}">${strtxt}\n`) //  ${figdata.type} // title="${figdata.name}
                            break;
        }



        
        var children=figdata.children;
    //    figdata.children=[];     (why was this done?)
        if (children && !fsvg &&!fpng) // allways recurse to try and find the intended object // don't recurse when @svg is shown
            for (var i=0;i<children.length;i++) {
                
                if (fflex) {
                    var fflextopass=fflex; // goed afjust margin here, depending on child#, but with dynamicly duplicted items not useful
                    
                } else fflextopass=fflex;
                htmlobjects.push( recurse(children[i],figmadocument,documentid,token,fgrid,(fthisisabutton || buttonlevel)?buttonlevel+1:0,fflextopass,figdata.absoluteBoundingBox) )
            }    
       
            //if (!image) // close the div
                htmlobjects.push(`</${objecttype}>`);


 
        if (fthisisabutton) { // this is a button so also get all other instance of a button 
		console.log(`Retrieving other buttons of  ${figdata.name}-----------------------------------------------------------`)
           htmlobjects.push(GetOtherButton(figdata.name,"--hover"))
           htmlobjects.push(GetOtherButton(figdata.name,"--active"))
           htmlobjects.push(GetOtherButton(figdata.name,"--focus"))
           htmlobjects.push(GetOtherButton(figdata.name,"--disabled"))
		   console.log(`End retrieving other buttons of  ${figdata.name}-----------------------------------------------------------`)
        }
  

       
       
       
            if (surroundingdiv)
                htmlobjects.push("</div>") // close the surrounding div
       
        
        
    
        
        
       // console.log("Returning from recurse");
       // console.log(htmlobjects);
        return htmlobjects;
       

    async function GetOtherButton(name,subselect) {    
        var firstpart=name.split(" ")[0]
        //console.log(firstpart);
        if (!globalcomponentsdocument) return ""
        var fo=FindObject(`${firstpart}${subselect}`,globalcomponentsdocument)
        if (!fo) return ""
        var button=await recurse(fo,figmadocument,globalcomponentsid,token,fgrid,1,fflextopass,undefined) // no bounding=> hidden &max width     // get from componentsid!!!       
      //  console.log("button info is:")
      //  console.log(button);
        return button;
    }

       
    }    


        



document.getElementById("SaveOnIpfs").addEventListener("click", SaveAlsoOnIpfs)
document.getElementById("AlsoInject").addEventListener("click", AlsoInject)
document.getElementById("ClearCache").addEventListener("click", ClearCache)
document.getElementById("Reload").addEventListener("click", Reload)




/*
var svg=""
svg +=`<svg width="${figdata.size.x}" height="${figdata.size.y}" viewBox="0 0 ${figdata.size.x} ${figdata.size.y}" fill="none" xmlns="http://www.w3.org/2000/svg">`
                
for (var i=0;i<figdata.strokeGeometry.length;i++) {
    console.log(figdata.strokeGeometry[i].path);
    console.log(figdata.strokeGeometry[i].windingRule);
    svg +=`<path d="${figdata.strokeGeometry[i].path}" stroke="#FF206E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`
}
svg +="</svg>"
*/
