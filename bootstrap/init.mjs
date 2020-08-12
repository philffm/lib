console.log(`In ${window.location.href} starting script: ${import.meta.url}`);
console.log("This is init.mjs, located at https://koiosonline.github.io/lib/bootstrap/init.mjs")
// http://gpersoon.com/koios/lib/bootstrap/test.html

var cidlocation="http://gpersoon.com/koios/lib/bootstrap"
// var cidlocation="."
async function start() { 
	var cid=await (await fetch(cidlocation+"/.cid")).text()
	console.log(cid)	
    var iframe=document.createElement("iframe");
    iframe.src="https://ipfs.io/ipfs/"+cid
    iframe.width="100%"
    iframe.height="100%"
    iframe.style.height="100%"
    iframe.style.minHeight="100%" 
    iframe.style.position="fixed";
    iframe.style.top="0";
    iframe.style.left="0";
    document.body.appendChild(iframe);    
}

start();

