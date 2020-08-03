var KOIOSNFT = artifacts.require("KOIOSNFT");
const fetch = require('node-fetch');


var KoiosImage  ="QmPWgVJrKqbt86jMfYxCG4yTLmcoQzvbdstLzA3Lben2bt"
var AdminImage  ="QmdUGX6YaXa5x2k9HSjhhNyvgWngt4B683QyaraUzH1F3o"
var TeacherImage="QmPZKjkNxMWE1KSsXb3RWSQWWUsPWh261KpAj3F9C9QW7o"


var GiveKeyImage="QmeyHqMWYb83DLNFVzAxtnphM2iwu9YZ8pav8x2DX1fhvt"


module.exports = async function(deployer) {
    const IpfsHttpClient = require('ipfs-http-client')
    var ipfs = await IpfsHttpClient('https://ipfs.infura.io:5001'); //for infura node
    KOIOSNFTContract = await KOIOSNFT.deployed()
    console.log(`KOIOSNFTContract is at address:  ${KOIOSNFTContract.address}`);
    console.log(`totalSupply is now:  ${await KOIOSNFTContract.totalSupply()}`);
    var managerid=await CreateNewBadge(ipfs,"admin",               "General administrator",        AdminImage,0,false,false,false);      
    await CreateNewBadge(ipfs,"koios",               "Info for the contract",                      KoiosImage,managerid,false,false,false);    
    var coursecreatorid=await CreateNewBadge(ipfs,"coursecreator",       "Creat",                  GiveKeyImage,managerid,false,false,false);     
    
    var coursesdata=await fetch("https://gpersoon.com/koios/gerard/viewer_figma/courseinfo.json");
    var courses=await coursesdata.json()
    //console.log(courses);

    for (const courseid in courses) {
      //console.log(`Id:${courseid}`);
      var currentcourse=courses[courseid];
      //console.log(currentcourse)      
      var cidimage=""
      if (currentcourse.image) {
          var imagedata=await fetch(currentcourse.image);
          var imagebin=await imagedata.buffer()
          var cidimage =  (await ipfs.add(imagebin)).path;
          //console.log(cidimage)
      }
      
      var teacherid=await CreateNewBadge(ipfs, "teacher of "+currentcourse.courselevel, currentcourse.description,TeacherImage,coursecreatorid,false,false,false);
      
      await CreateNewBadge(ipfs, "join class of "+currentcourse.courselevel, currentcourse.description,cidimage,teacherid,true,true,false);
      await CreateNewBadge(ipfs, "attend class of "+currentcourse.courselevel, currentcourse.description,cidimage,teacherid,false,true,false);
      await CreateNewBadge(ipfs, "watch video of "+currentcourse.courselevel, currentcourse.description,cidimage,teacherid,false,true,false);
      await CreateNewBadge(ipfs, "completed "+currentcourse.courselevel, currentcourse.description,cidimage,teacherid,false,true,false);
      
    }
    console.log(`totalSupply is now:  ${await KOIOSNFTContract.totalSupply()}`);
};


async function CreateNewBadge(ipfs, name,desc,image,managerid,SelfMint,SelfBurn, AllowTransfer) {
    
    var result=await KOIOSNFTContract.CreateNewBadge(name,"",managerid,SelfMint,SelfBurn, AllowTransfer );
    var id=parseInt(result.logs[1].args[0].toString())
    var str=`
{
    "name": "${name}",
    "description": "t${id} m${managerid} sm${SelfMint?"1":"0"} sb${SelfBurn?"1":"0"} at${AllowTransfer?"1":"0"}",
    "image": "${image?"ipfs://ipfs/"+image:""}"
}
`   
    const cid = (await ipfs.add(str)).path;    
    await KOIOSNFTContract.UpdateBadge(id,name,cid,managerid,SelfMint,SelfBurn, AllowTransfer);
    console.log(`Adding Badge ${name} cid=${cid} image=${image} templateid=${id} managerid=${managerid}`)
    return id;
}

  