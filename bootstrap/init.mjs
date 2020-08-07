console.log(`In ${window.location.href} starting script: ${import.meta.url}`);
console.log("This is init.mjs, located at https://koiosonline.github.io/lib/bootstrap/init.mjs")



    
    
async function start() {    
    var d=await fetch("https://ipfs.io/ipfs/QmSwzhurFqfwEBdytiwsexAS8ZQxLPJ8LMna9ELP1xRXzq")
    //console.log(d);
    var t=await d.text();
    console.log(t);
 
    document.getElementsByTagName("html")[0].innerHTML=t;
        var event = new Event('DOMContentLoaded',{  bubbles: true,  cancelable: true});
    window.document.dispatchEvent(event); 
    console.log(document);
}

start();

