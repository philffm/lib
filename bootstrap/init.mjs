console.log(`In ${window.location.href} starting script: ${import.meta.url}`);
console.log("This is init.mjs, located at https://koiosonline.github.io/lib/bootstrap/init.mjs")



    let url = new URL(document.location)
    
    console.log(url)
    
    var dest=url.toString()
    console.log(dest)
    
