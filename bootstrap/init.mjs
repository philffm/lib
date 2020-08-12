console.log(`In ${window.location.href} starting script: ${import.meta.url}`);
console.log("This is init.mjs, located at https://koiosonline.github.io/lib/bootstrap/init.mjs")
// http://gpersoon.com/koios/lib/bootstrap/test.html
// dnslink=/ipfs/QmZEgAo2Su99vcSwCf14AGokucaPCcshxr8zK3fZ5fKjf5
// https://ipfs.io/ipns/koios.online
// https://ipfs.io/ipns/viewer.koios.online
// https://ipfs.io/ipns/viewer.test.koios.online
// c:\bin\dig +noall +answer TXT _dnslink.koios.online
// c:\bin\dig +noall +answer TXT _dnslink.viewer.koios.online
// c:\bin\dig +noall +answer TXT _dnslink.viewer.test.koios.online

var cidlocation="."
async function start() { 
	let url = (new URL(document.location));
	console.log(url)
    var split=url.pathname.split("/");
	console.log(split)
	var last=split[split.length-1]
	var beforelast=split[split.length-2]
	console.log(beforelast,last);
	switch (last) {
		case "viewer.test.koios.online": cidlocation="https://gpersoon.com/koios/gerard/bootstrap";break;
		case "viewer.koios.online": 	 cidlocation="https://gpersoon.com/koios/lib/bootstrap";break;
		case "newviewer": if (beforelast=="test") cidlocation="https://gpersoon.com/koios/gerard/bootstrap";
						  else 				      cidlocation="https://gpersoon.com/koios/lib/bootstrap";
						  break;
	}	
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

