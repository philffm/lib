var KOIOSNFT = artifacts.require("KOIOSNFT");
 
module.exports = async function(deployer) {  
  KOIOSNFTContract = await KOIOSNFT.deployed()
  console.log(`KOIOSNFTContract is at address:  ${KOIOSNFTContract.address}`);
  var total=await KOIOSNFTContract.totalSupply()
  console.log(`totalSupply is now:  ${total}`);
  
  var toarray=[
		    "0xC3036b696Ea52F6846F3F22E2EB709C595F0e09A", // jordi
            "0x8e2A89fF2F45ed7f8C8506f846200D671e2f176f", // gerard
            
            ]
  var nrTemplates=await KOIOSNFTContract.nrTemplates()
    for (var i=0;i<nrTemplates;i++) {          
		var templateinfo = await KOIOSNFTContract.GetTemplateInfo(i);
		
		if (templateinfo.name.includes("Teacher") || templateinfo.name.includes("Coursecompleted")) {
			console.log(templateinfo);
			await KOIOSNFTContract.createTokens(toarray,i)
		}
    }
    for (var i=0;i<toarray.length;i++) 
        console.log(`Balance of ${toarray[i]} is now:  ${await KOIOSNFTContract.balanceOf(toarray[i])}`);

    console.log(`totalSupply is now:  ${await KOIOSNFTContract.totalSupply()}`);  
	
};

 