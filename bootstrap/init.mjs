console.log(`In ${window.location.href} starting script: ${import.meta.url}`);
console.log("This is init.mjs, located at https://koiosonline.github.io/lib/bootstrap/init.mjs")



    
    
async function start() {    
    var d=await fetch("https://ipfs.io/ipfs/QmTvG8DqfNKucvVcqBLwZtb9bGJ9p75Qwgqvif65GpiNRJ")
    //console.log(d);
    var t=await d.text();
    //console.log(t);
 
    document.getElementsByTagName("html")[0].innerHTML=t;
}

start();

