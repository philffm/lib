var ERC20TokenFactory = artifacts.require("ERC20TokenFactory");
var ERC20Token = artifacts.require("ERC20Token");

const fetch = require('node-fetch');
const fs2 = require('fs');
const list = JSON.parse(fs2.readFileSync("tokens.json").toString())

module.exports = async function(deployer) {
	var tokenaddress=[];
	ERC20TokenFactoryContract = await ERC20TokenFactory.deployed()
	NrTokens=await ERC20TokenFactoryContract.NrTokens();	
	console.log(`Already deployed tokens=${NrTokens}`);
		
	for (var i=NrTokens;i<list.length;i++) // continue with the list after it might have stopped, also usefull for new tokens
		await CreateNewToken(ERC20TokenFactoryContract,list[i].name,list[i].cid);
	
	NrTokens=await ERC20TokenFactoryContract.NrTokens();	
	console.log(`Now NrTokens=${NrTokens} (should be ${list.length})`);
		
                
	var ERC20TokenContract=[];
	for (var i=0;i<NrTokens;i++) {
		tokenaddress[i]=await ERC20TokenFactoryContract.tokens(i);	
		ERC20TokenContract[i] = await ERC20Token.at(tokenaddress[i]) // don't process directly => timeouts
	}	
	for (var i=0;i<NrTokens;i++) {	   
	   name=await ERC20TokenContract[i].name()
       console.log(name)
       console.log(list[i].cid)

	   var tokenURI=await ERC20TokenContract[i].tokenURI()
       
       if (tokenURI != list[i].cid) {
            console.log(`Update tokenuri from ${tokenURI} to ${list[i].cid}`)
            await ERC20TokenContract[i].setTokenURI(list[i].cid); // update the tokenuri    
            tokenURI=await ERC20TokenContract[i].tokenURI()
       }
	   console.log(`Address token ${i} ${tokenaddress[i]} name:${name} tokenURI:${tokenURI}`)
    }	
};
 
async function CreateNewToken(contract,name,cid) {   		
	await contract.createToken(name,name,18,cid);		
    console.log(`Adding Token ${name} cid=${cid} `)	
}

  