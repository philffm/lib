const fetch = require('node-fetch');
const fs2 = require('fs');
const token = fs2.readFileSync(".figma").toString().trim();
const documentid = fs2.readFileSync(".figmadocument").toString().trim();

list=[];

// module.exports
var init = async function(deployer) {
    const IpfsHttpClient = require('ipfs-http-client')
    var ipfs = await IpfsHttpClient( /*"http://diskstation:5002"); */ 'https://ipfs.infura.io:5001'); //for infura node
	var url=`https://api.figma.com/v1/files/${documentid}`  // to export the vectors: ?geometry=paths    
    var documentpart=(await FigmaApiGet(url,token)).document;
    var coursesdata=await fetch("https://gpersoon.com/koios/lib/viewer_figma/courseinfo.json");
    var courses=await coursesdata.json()

	for (const courseid in courses) {
		console.log(`Id:${courseid}`);
		var currentcourse=courses[courseid];   
		teacherid=undefined;				
		var cid=await MakeImage(ipfs, "Courseicon"+"-"+courseid,documentpart); 
		var imagepath="https://ipfs.io/ipfs/"+cid
		if (imagepath == currentcourse.image) {
			console.log(`Already have image ${imagepath}, skipping`)
			continue;
		}
		var item={}
		item.image=imagepath
		item.courseid=courseid
		list.push(item)
	}    
    console.log(list);
	fs2.writeFile('images.json', JSON.stringify(list),console.log)
};

async function FigmaApiGetImageSrc(url,token) {
        var obj=await FigmaApiGet(url,token); 
        var keys = Object.keys(obj.images);
        var key=keys[0];
        var str=obj.images[key];               
        var buffer=await FigmaGetImage(str)        
        return buffer;
}
async function FigmaGetImage(url) {
	var p1=await fetch(url)
	var buffer=await (p1).buffer()
	return buffer;    
}   

async function FigmaApiGet(url,token) { 
	for (i=0;i<10;i++) {
		try {
			var x=await fetch(url, { headers: {'X-Figma-Token': token } } );
		} catch (error) {console.log(error);continue;}
		if (x.status == 200) {
			var y=await x.json()  
			return y;
		}
	}
	return undefined;
}

function FindObject(objname,figdata) {
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

async function MakeImage(ipfs, name,documentpart) {   
	var g=FindObject(name,documentpart);
	if (!g) return undefined;
	var imagelink = `https://api.figma.com/v1/images/${documentid}?ids=${g.id}&format=png`       
	var buffer=await FigmaApiGetImageSrc(imagelink,token)	
	var result= await ipfs.add(buffer)
	const cid =result.path;
	return cid;
}

init();