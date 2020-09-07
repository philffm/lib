var ERC20TokenFactory = artifacts.require("ERC20TokenFactory");
var ERC20Token = artifacts.require("ERC20Token");

 
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
		if (!name.includes("Titan")) continue; // only titan tokens
		console.log(`Processing contract ${name}`)
		
		decimals=await ERC20TokenContract[i].decimals()	
		//console.log(`Address token ${tokenaddress} name:${name} decimals:${decimals}`)
	
		const ten = new BN("10")
		
		
		for (var j=0;j<toarrayamount.length;j++)  {	
			var item=toarrayamount[j]
			var dest=item[0]
			var amountinput=new BN(item[1])
			var amount = ten.pow(new BN(decimals)).mul(amountinput)
			await MintandProcess(tokenaddress,amount,ERC20TokenContract[i],dest,acts[0])
		}	
		var left=await ERC20TokenContract[i].balanceOf(acts[0])
		console.log(`Left on account ${acts[0]} ${web3.utils.fromWei(left,'ether')}`)
		for (var j=0;j<toarrayamount.length;j++)  {	
			var item=toarrayamount[j]
			var left=await ERC20TokenContract[i].balanceOf(item[0])
			console.log(`${item[2].padEnd(20, ' ')} ${item[0]} needs ${item[1].toString().padEnd(15, ' ')} and has ${web3.utils.fromWei(left,'ether').padEnd(15, ' ')}`)
		}
		var nrOwners=await ERC20TokenContract[i].nrOwners()
		console.log(`Total ${nrOwners} owners`);
		for (var j=0;j<nrOwners;j++) {
			var owner=await ERC20TokenContract[i].GetOwner(j)
			console.log(`Owner ${j} ${owner}`);
		}		
	}
error
}  
  

const BN = web3.utils.BN
  
var toarrayamount=[ // addres, wanted amount
            ["0x8e2A89fF2F45ed7f8C8506f846200D671e2f176f", 1000,  "Gerard"],
            ["0xEA9a7c7cD8d4Dc3acc6f0AaEc1506C8D6041a1c5", 1000,  "Gerard canary"],
            ["0x336101f6685906fFe861ac519A98A6736d2D5b37", 1000,  "Phil"],
            ["0xe88cAc4e10C4D316E0d52B82dd54f26ade3f0Bb2", 1000,  "Corwin"],
            ["0x4Ad2eaE4137e11EB3834840f1DC38F5f0fa181c3", 1000,  "Mathieu"],
	        ["0xC3036b696Ea52F6846F3F22E2EB709C595F0e09A", 1000,  "Jordi"],	
			["0x118DF8e8557eB3DEd10Eb6Fde3EF183ca8106d56", 1000,  "Wicky"],
			["0x4373294DD0f98eC2783f759Ae546A55E527487e7", 100000,  "Dennis"],
			["0xbca3533d21a4538C43A4CC2A6f5c6D38271351C3", 1000,  "Malva"],
			["0xB268B478F4B9e501dafFCe74dA60CAb8b7449871", 1000,  "Ricardo"],
			["0xD4402f6AC4BdBdc3d966D1ACAB0c1c104bA7d89f", 1000,  "Jamie"],
			
			["0x3d07b3629a319aabb2311c3f1f2ff048b1550bea",	5,	"?"],   // give old balance back
			["0x5c84209877934c61047100121c70a4cf68ec270e",	3,	"?"]
		]
    
  
  
async function MintandProcess(tokenaddress,requiredbalance,contract,dest,adminact)  {
	var destbalance=await contract.balanceOf(dest)
	console.log(`Destination ${dest} has now: ${web3.utils.fromWei(destbalance,'ether')} tokens `)
	console.log(`Required  ${web3.utils.fromWei(requiredbalance,'ether')} tokens `)
	
	if (destbalance.gte(requiredbalance) ) {
		console.log("Skipping, because already has sufficient balance")
		return
	}
	var extraneeded = requiredbalance.sub(destbalance);
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

 
