var KOIOSNFT = artifacts.require("KOIOSNFT");

const fetch = require('node-fetch');
const fs2 = require('fs');

const list = JSON.parse(fs2.readFileSync("badges.json").toString())
//console.log(list)

module.exports = async function(deployer) {
    KOIOSNFTContract = await KOIOSNFT.deployed()
    console.log(`KOIOSNFTContract is at address:  ${KOIOSNFTContract.address}`);
    console.log(`totalSupply is now:  ${await KOIOSNFTContract.totalSupply()}`);
	
	var nrTemplates=await KOIOSNFTContract.nrTemplates()
	console.log(`nrTemplates=${nrTemplates}`);
	
	if (nrTemplates==0)
		await KOIOSNFTContract.setContractURI("https://ipfs.io/ipfs/"+list[0].cid)	
	
	
    for (var i=nrTemplates;i<list.length;i++) {
		var item=list[i]
		//console.log(item);	
		var id=await CreateNewBadge(item.name,item.desc,item.cid,item.managerid,item.SelfMint,item.SelfBurn, item.AllowTransfer)
	console.log(`name ${item.name} i=${i} id=${id} (should be equal)`)
		
	}
	console.log(`totalSupply is now:  ${await KOIOSNFTContract.totalSupply()}`);
};


async function CreateNewBadge(name,desc,cid,managerid,SelfMint,SelfBurn, AllowTransfer) {
    
    var result=await KOIOSNFTContract.CreateNewBadge(name,cid,managerid,SelfMint,SelfBurn, AllowTransfer );
    var id=parseInt(result.logs[1].args[0].toString())
    // await KOIOSNFTContract.UpdateBadge(id,name,cid,managerid,SelfMint,SelfBurn, AllowTransfer);
    console.log(`Adding Badge ${name} cid=${cid}  templateid=${id} managerid=${managerid}`) // image=${image}
    return id;
}


