var KOIOSNFT = artifacts.require("KOIOSNFT");
const fs2 = require('fs');

const list = JSON.parse(fs2.readFileSync("badges.json").toString())
//console.log(list)

module.exports = async function(deployer) {
    KOIOSNFTContract = await KOIOSNFT.deployed()
    console.log(`KOIOSNFTContract is at address:  ${KOIOSNFTContract.address}`);
    console.log(`totalSupply is now:  ${await KOIOSNFTContract.totalSupply()}`);	
	
    for (var i=0;i<list.length;i++) {
		var item=list[i]		
		
			console.log(`To update: #${i} ${item.name} ${item.cid}`);	
				var templateinfo = await KOIOSNFTContract.GetTemplateInfo(i);
				console.log(`Current: ${templateinfo.name} ${templateinfo.cid}`);	
				await KOIOSNFTContract.UpdateBadge(i,item.name,item.cid,item.managerid,item.SelfMint,item.SelfBurn, item.AllowTransfer)
				var templateinfo = await KOIOSNFTContract.GetTemplateInfo(i);
				console.log(`Updated: ${templateinfo.name} ${templateinfo.cid}`);

		
	}
	console.log(`totalSupply is now:  ${await KOIOSNFTContract.totalSupply()}`);
	
};

