var ERC20TokenFactory = artifacts.require("ERC20TokenFactory");

module.exports = async function(deployer) {
	ERC20TokenFactoryContract = await ERC20TokenFactory.deployed()
	await ERC20TokenFactoryContract.createToken("Titan","Titan",18);	
	await ERC20TokenFactoryContract.createToken("Tutor","Tutor",18);	
	await ERC20TokenFactoryContract.createToken("Jedi","Jedi",18);	
	await ERC20TokenFactoryContract.createToken("Gaia","Gaia",18);	
	
	NrTokens=await ERC20TokenFactoryContract.NrTokens();	
	console.log(`NrTokens=${NrTokens}`);
	for (var i=0;i<NrTokens;i++) {
		tokens=await ERC20TokenFactoryContract.tokens(i);	
		console.log(`Address token ${i} ${tokens}`)
	}
	
};

