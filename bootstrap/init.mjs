console.log(`In ${window.location.href} starting script: ${import.meta.url}`);
console.log("This is init.mjs, located at https://koiosonline.github.io/lib/bootstrap/init.mjs")
  
async function start() {    
    var d=await fetch("https://ipfs.io/ipfs/QmSwzhurFqfwEBdytiwsexAS8ZQxLPJ8LMna9ELP1xRXzq")
    //console.log(d);
    var t=await d.text();
    console.log(t);
    t=t.replace("<html>","")
    t=t.replace("</html>","")
    console.log(t);
    document.getElementsByTagName("html")[0].innerHTML=t;    
    var pb=t.indexOf("<body>");
    var head=t.substring(0,pb)    
    head=head.replace("<head>","")
    head=head.replace("</head>","")    
    var body=t.substring(pb)    
    body=body.replace("<body>","")
    body=body.replace("</body>","")    
    console.log(head)
    console.log(body)    
    document.getElementsByTagName("head")[0].innerHTML +=head;
    document.getElementsByTagName("body")[0].innerHTML +=body; 
    var tag = document.createElement('script');
    tag.src = "https://gpersoon.com/koios/gerard/viewer_figma/koiosf_viewer.mjs";
    tag.type="module"
    document.head.appendChild(tag);    
    var event = new Event('DOMContentLoaded',{  bubbles: true,  cancelable: true});
    window.document.dispatchEvent(event); 
    console.log(document);
});

start();

