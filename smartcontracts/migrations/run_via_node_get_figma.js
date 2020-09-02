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
    var coursesdata=await fetch("https://gpersoon.com/koios/lib/viewer_figma/courseinfo.json");
    var courses=await coursesdata.json()
    


console.log(courses);
	cidKoios=await MakeImage(ipfs, "Koioslogo",documentpart); 	// used for the contract itself, no longer a tokentitself		
	cidAdmin=await MakeImage(ipfs, "Admin",documentpart); 		
	cidKeyGiver=await MakeImage(ipfs, "Key-giver",documentpart); 	
	
	var dummy=await CreateNewBadge(ipfs,"Contract",               "Contract",        cidKoios,0,false,false,false);          
    var managerid=await CreateNewBadge(ipfs,"Admin",               "General administrator",        cidAdmin,0,false,false,false);          
    var coursecreatorid=await CreateNewBadge(ipfs,"coursecreator",       "Creat",                  cidKeyGiver,managerid,false,false,false);     // bool _SelfMint, bool _SelfBurn, bool _AllowTransfer)
	console.log(`coursecreatorid=${coursecreatorid}`); // 2


	for (const courseid in courses) {
		console.log(`Id:${courseid}`);
		var currentcourse=courses[courseid];
		console.log(currentcourse)      
		teacherid=undefined;
		cidTeacher=await MakeImage(ipfs, "Teacher"+"-"+courseid,documentpart); 
		if (cidTeacher) var teacherid=await CreateNewBadge(ipfs, "Teacher"+"-"+courseid, currentcourse.description,cidTeacher,coursecreatorid,false,true,false);

		cidStudent=await MakeImage(ipfs, "Student"+"-"+courseid,documentpart); 
		if (cidStudent) var studentid=await CreateNewBadge(ipfs, "Student"+"-"+courseid, currentcourse.description,cidStudent,teacherid,true,true,false);

		cidNetworked=await MakeImage(ipfs, "Networked"+"-"+courseid,documentpart); 
		if (cidNetworked) await CreateNewBadge(ipfs, "Networked"+"-"+courseid, currentcourse.description,cidNetworked,teacherid,false,true,false);

		cidNotestaken=await MakeImage(ipfs, "Notestaken"+"-"+courseid,documentpart); 
		if (cidNotestaken) await CreateNewBadge(ipfs, "Notestaken"+"-"+courseid, currentcourse.description,cidNotestaken,teacherid,false,true,false);
		  
		cidQuestionsasked=await MakeImage(ipfs, "Questionsasked"+"-"+courseid,documentpart); 
		if (cidQuestionsasked) await CreateNewBadge(ipfs, "Questionsasked"+"-"+courseid, currentcourse.description,cidQuestionsasked,teacherid,false,true,false);

		cidCoursecompleted=await MakeImage(ipfs, "Coursecompleted"+"-"+courseid,documentpart); 
		if (cidCoursecompleted) await CreateNewBadge(ipfs, "Coursecompleted"+"-"+courseid, currentcourse.description,cidCoursecompleted,teacherid,false,true,false);

		cidKnowledgetransfered=await MakeImage(ipfs, "Knowledgetransfered"+"-"+courseid,documentpart); 
		if (cidKnowledgetransfered) await CreateNewBadge(ipfs, "Knowledgetransfered"+"-"+courseid, currentcourse.description,cidKnowledgetransfered,teacherid,false,true,false);

		cidVideowatched=await MakeImage(ipfs, "Videowatched"+"-"+courseid,documentpart); 
		if (cidVideowatched) await CreateNewBadge(ipfs, "Videowatched"+"-"+courseid, currentcourse.description,cidVideowatched,teacherid,false,true,false);
	}    
    console.log(list);
	fs2.writeFile('badges.json', JSON.stringify(list),console.log)
};


var id=0

async function CreateNewBadge(ipfs, name,desc,cid,managerid,SelfMint,SelfBurn, AllowTransfer) {
    
	
	var store={}
	store.name=name
	store.desc=desc
	store.cid=cid
	store.managerid=managerid
	store.SelfMint=SelfMint
	store.SelfBurn=SelfBurn
	store.AllowTransfer=AllowTransfer
	
	list.push(store);
    return id++;
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
	var imagelink = `https://api.figma.com/v1/images/${documentid}?ids=${g.id}&format=png`       
	var buffer=await FigmaApiGetImageSrc(imagelink,token)	
	var result= await ipfs.add(buffer)
	const image =result.path;  
	//console.log(image);
	
    var str=`
{
    "name": "${name}",
    "description": "${name} token",
    "image": "${image?"ipfs://ipfs/"+image:""}"
}
`   
    const cid = (await ipfs.add(str)).path;  
	console.log(cid);
	return cid;
}

init();

  