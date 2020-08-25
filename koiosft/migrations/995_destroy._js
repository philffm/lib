var ERC20TokenFactory = artifacts.require("ERC20TokenFactory");

module.exports = async function(deployer) {
	
	ERC20TokenFactoryContract = await ERC20TokenFactory.deployed()
	NrTokens=await ERC20TokenFactoryContract.NrTokens();	
	console.log(`NrTokens=${NrTokens}`);
    await ERC20TokenFactoryContract.destroy();	
	
	console.log('Should give an error messsage now (because contract is no longer present)');
	NrTokens=await ERC20TokenFactoryContract.NrTokens();	
	console.log(`NrTokens=${NrTokens}`);
};

