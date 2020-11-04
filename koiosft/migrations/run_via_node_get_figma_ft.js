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
console.log(documentpart)
  //  var coursesdata=await fetch("https://gpersoon.com/koios/lib/viewer_figma/courseinfo.json");
  //  var courses=await coursesdata.json()
    
    cid=await MakeImage(ipfs, "TitanToken",documentpart); 	   list.push({name:"Titan",cid:cid} );
	cid=await MakeImage(ipfs, "TutorToken",documentpart); 	   list.push({name:"Tutor",cid:cid} );
	cid=await MakeImage(ipfs, "JediToken",documentpart); 	  list.push({name:"Jedi",cid:cid} );
	cid=await MakeImage(ipfs, "GaiaToken",documentpart); 	  list.push({name:"Gaia",cid:cid} );
    cid=await MakeImage(ipfs, "KoiosToken",documentpart); 	  list.push({name:"Koios",cid:cid} );
	
    console.log(list);
	fs2.writeFile('tokens.json', JSON.stringify(list),console.log)
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
	//console.log(url)
	var p1=await fetch(url)
	var buffer=await (p1).buffer()
	return buffer;    
}   



async function FigmaApiGet(url,token) { 
	for (i=0;i<10;i++) {
		console.log(`Get ${url} try ${i}`)
		try {
			var x=await fetch(url, { headers: {'X-Figma-Token': token } } );
		} catch (error) {console.log(error);continue;}
		console.log(`Status: ${x.status}`)
		if (x.status == 200) {
			var y=await x.json()    
			console.log("Json");
			console.log(y)
			console.log("end of Json");
			return y;
		}
	}
	return undefined;
}

function FindObject(objname,figdata) {
//console.log(figdata);
    if (figdata.name.includes(objname))
        return figdata;
    /*
    var firstpart = figdata.name.split(" ")[0]
	//console.log(firstpart);
    if (firstpart == objname || figdata.id==objname) 
        return figdata;
    */
    var children=figdata.children;
    if (children)
        for (var i=0;i<children.length;i++) {
            var child=FindObject(objname,children[i] )
            if (child) return child;
        }
    return undefined; // not found        
}


async function MakeImage(ipfs, name,documentpart) {   
	console.log(`Find ${name} in figma`);
	var g=FindObject(name,documentpart);
	if (!g) return undefined;
	console.log(g.id);
	var imagelink = `https://api.figma.com/v1/images/${documentid}?ids=${g.id}&format=png`       
	var buffer=await FigmaApiGetImageSrc(imagelink,token)	
	var result= await ipfs.add(buffer)
	const image =result.path;  
	//console.log(image);
	
    var str=`
{
    "name": "${name}",
    "description": "${name}",
    "image": "${image?"ipfs://"+image:""}"
}
`   // this shouldn't be neccesary: //ipfs/
    const cid = (await ipfs.add(str)).path;  
	console.log(cid);
	return cid;
}

init();

  