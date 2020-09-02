var KOIOSNFT = artifacts.require("KOIOSNFT");
KOIOSNFT.synchronization_timeout = 42; //timeout in seconds

const fetch = require('node-fetch');
const fs2 = require('fs');
const token = fs2.readFileSync(".figma").toString().trim();
const documentid = fs2.readFileSync(".figmadocument").toString().trim();

module.exports = async function(deployer) {
    const IpfsHttpClient = require('ipfs-http-client')
    var ipfs = await IpfsHttpClient(/*"http://diskstation:5002"); */ 'https://ipfs.infura.io:5001'); //for infura node
	
	var url=`https://api.figma.com/v1/files/${documentid}`  // to export the vectors: ?geometry=paths    
    var documentpart=(await FigmaApiGet(url,token)).document;
	
	
	cidKoios=await MakeImage(ipfs, "Koioslogo",documentpart); 	// used for the contract itself, no longer a tokentitself	
	
	cidAdmin=await MakeImage(ipfs, "Admin",documentpart); 		
	cidKeyGiver=await MakeImage(ipfs, "Key-giver",documentpart); 	
	
    KOIOSNFTContract = await KOIOSNFT.deployed()
    console.log(`KOIOSNFTContract is at address:  ${KOIOSNFTContract.address}`);
    console.log(`totalSupply is now:  ${await KOIOSNFTContract.totalSupply()}`);
	
	
	await KOIOSNFTContract.setContractURI("https://ipfs.io/ipfs/"+cidKoios)	
	
    var managerid=await CreateNewBadge(ipfs,"Admin",               "General administrator",        cidAdmin,0,false,false,false);          
    var coursecreatorid=await CreateNewBadge(ipfs,"coursecreator",       "Creat",                  cidKeyGiver,managerid,false,false,false);     // bool _SelfMint, bool _SelfBurn, bool _AllowTransfer)
	console.log(`coursecreatorid=${coursecreatorid}`); // 2
    console.log(`totalSupply is now:  ${await KOIOSNFTContract.totalSupply()}`);
};

async function CreateNewBadge(ipfs, name,desc,cid,managerid,SelfMint,SelfBurn, AllowTransfer) {
    
    var result=await KOIOSNFTContract.CreateNewBadge(name,"",managerid,SelfMint,SelfBurn, AllowTransfer );
    var id=parseInt(result.logs[1].args[0].toString())
    await KOIOSNFTContract.UpdateBadge(id,name,cid,managerid,SelfMint,SelfBurn, AllowTransfer);
    console.log(`Adding Badge ${name} cid=${cid}  templateid=${id} managerid=${managerid}`) // image=${image}
    return id;
}

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
		var x=await fetch(url, { headers: {'X-Figma-Token': token } } );
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

    var firstpart = figdata.name.split(" ")[0]
	//console.log(firstpart);
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
	console.log(`Find ${name} in figma`);
	var g=FindObject(name,documentpart);
	if (!g) return undefined;
	console.log(g.id);
	var imagelink = `https://api.figma.com/v1/images/${documentid}?ids=${g.id}&format=png`        // png for opensea
	var buffer=await FigmaApiGetImageSrc(imagelink,token)	
	var result= await ipfs.add(buffer)
	const image =result.path;  
	//console.log(image);
	
	// note different pattern for ipfs especially for the contract image
	
    var str=`
{
    "name": "${name}",
    "description": "${name} token",
    "image": "${image?"https://ipfs.io/ipfs/"+image:""}",
    "external_link": "https://koios.online"
}
`   
    const cid = (await ipfs.add(str)).path;  
	console.log(cid);
	return cid;
}
  