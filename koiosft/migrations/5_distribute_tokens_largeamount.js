// format distribute.json
//  address, min amount of titan tokens, min amount of gaia tokens, name
//	["0x8e2A89fF2F45ed7f8C8506f846200D671e2f176f", 1000, 1, "Gerard"],



var ERC20TokenFactory = artifacts.require("ERC20TokenFactory");
var ERC20Token = artifacts.require("ERC20Token");


const fs2 = require('fs');
const toarrayamount = JSON.parse(fs2.readFileSync("distribute.json").toString())
console.log(toarrayamount)
 
module.exports = async function(deployer) {  
    ERC20TokenFactoryContract = await ERC20TokenFactory.deployed()
  	NrTokens=await ERC20TokenFactoryContract.NrTokens();	
	console.log(`NrTokens=${NrTokens}`);
	
	var ERC20TokenContract=[];
	for (var i=0;i<NrTokens;i++) {
		tokenaddress=await ERC20TokenFactoryContract.tokens(i);	
		ERC20TokenContract[i] = await ERC20Token.at(tokenaddress) // don't process directly => timeouts
	}	
	
	var acts=await web3.eth.getAccounts()
	for (var i=0;i<NrTokens;i++) {
		name=await ERC20TokenContract[i].name()		
		console.log(`Processing contract ${name}`)
        if (name != "Koios") continue;
		decimals=await ERC20TokenContract[i].decimals()	
		//console.log(`Address token ${tokenaddress} name:${name} decimals:${decimals}`)	

		for (var item of toarrayamount)  {	
            var dest=item[0]
            switch (name) {
                case "TitanOff": 
                    await MintandProcess(tokenaddress,item[1] ,ERC20TokenContract[i],dest,acts[0],decimals)
                    break
                case "Koios":
                    await MintandProcess(tokenaddress,item[2] ,ERC20TokenContract[i],dest,acts[0],decimals)
                    break
            }
		}	
		var left=await ERC20TokenContract[i].balanceOf(acts[0])
		console.log(`${name} Left on account ${acts[0]} ${web3.utils.fromWei(left,'ether')}`)
		for (var j=0;j<toarrayamount.length;j++)  {	
			var item=toarrayamount[j]
			var left=await ERC20TokenContract[i].balanceOf(item[0])
			console.log(`${name} ${item[3].padEnd(20, ' ')} ${item[0]} needs ${item[1].toString().padEnd(15, ' ')} and has ${web3.utils.fromWei(left,'ether').padEnd(15, ' ')}`)
		}
		var nrOwners=await ERC20TokenContract[i].nrOwners()
		console.log(`${name} Total ${nrOwners} owners`);
        /*
		for (var j=0;j<nrOwners;j++) {
			var owner=await ERC20TokenContract[i].GetOwner(j)
			console.log(`Owner ${j} ${owner}`);
		}
*/		
	}
error
}  
  
const BN = web3.utils.BN
  
async function MintandProcess(tokenaddress,requiredbalance,contract,dest,adminact,decimals)  {
    if (!requiredbalance) return;
    const ten = new BN("10")
    var amountinput=new BN(requiredbalance)
    var amount = ten.pow(new BN(decimals)).mul(amountinput)
    
	var destbalance=await contract.balanceOf(dest)
	console.log(`Destination ${dest} has now: ${web3.utils.fromWei(destbalance,'ether')} tokens `)
	console.log(`Required  ${web3.utils.fromWei(amount,'ether')} tokens `)
	
	if (destbalance.gte(amount) ) {
		console.log("Skipping, because already has sufficient balance")
		return
	}
	var extraneeded = amount.sub(destbalance);
	console.log(`extraneeded  ${web3.utils.fromWei(extraneeded,'ether')} tokens `)
	
	var adminbalance=await contract.balanceOf(adminact)
	console.log(`Admin ${adminact} has now: ${web3.utils.fromWei(adminbalance,'ether')} tokens`)
	
	if (extraneeded.gt(adminbalance) ) {		
		var adminneeded = extraneeded.sub(adminbalance)
		console.log(`Admin needs ${web3.utils.fromWei(adminneeded,'ether')} tokens`);
		await contract.adminmint(adminneeded)	
		var adminbalance=await contract.balanceOf(adminact)
		console.log(`Admin ${adminact} has now: ${web3.utils.fromWei(adminbalance,'ether')} tokens`)
	}
	
	
	 await contract.transfer(dest, extraneeded)
	 console.log(`Transferred  ${web3.utils.fromWei(extraneeded,'ether')} tokens to ${dest}`)
	 var newbalance=await contract.balanceOf(dest)
	 
	 console.log(`Destination ${dest} has now: ${web3.utils.fromWei(newbalance,'ether')} tokens `)	
	 var adminbalance=await contract.balanceOf(adminact)
	 console.log(`Admin ${adminact} has now: ${web3.utils.fromWei(adminbalance,'ether')} tokens`)
}

 
