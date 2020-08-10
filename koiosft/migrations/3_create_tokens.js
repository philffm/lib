var ERC20TokenFactory = artifacts.require("ERC20TokenFactory");
var ERC20Token = artifacts.require("ERC20Token");

const fetch = require('node-fetch');

var titanImage="QmXD1pspNVEjowb5g3t9dSbeAKeTFR3sJo7gjD8CLtM6w2"
var tutorImage="QmWJkLGj1h2rdFSQnEdsHuqAF6sc5PVPHvQJWweg8dNhWa"
var jediImage="QmcTzLLeKyXZLaV2qWQg3r8hkVVwp48RCgfLQStSjbFQKH"
var gaiaImage="QmVQSfWfHVcdjyNKtAxWmM4gKc4Ftobb9znL4rPorPgmrP"

module.exports = async function(deployer) {
    const IpfsHttpClient = require('ipfs-http-client')
    var ipfs = await IpfsHttpClient('https://ipfs.infura.io:5001'); //for infura node

	ERC20TokenFactoryContract = await ERC20TokenFactory.deployed()
	
	await CreateNewToken(ipfs, ERC20TokenFactoryContract,"Titan",titanImage);
	await CreateNewToken(ipfs, ERC20TokenFactoryContract,"Tutor",tutorImage);
	await CreateNewToken(ipfs, ERC20TokenFactoryContract,"Jedi",jediImage);
	await CreateNewToken(ipfs, ERC20TokenFactoryContract,"Gaia",gaiaImage);

	NrTokens=await ERC20TokenFactoryContract.NrTokens();	
	console.log(`NrTokens=${NrTokens}`);
	for (var i=0;i<NrTokens;i++) {
		tokenaddress=await ERC20TokenFactoryContract.tokens(i);	
		console.log(`Address token ${i} ${tokenaddress}`)		
	}	
};


async function CreateNewToken(ipfs, contract,name,image) {   
    var str=`
{
    "name": "${name}",
    "description": "${name} token",
    "image": "${image?"ipfs://ipfs/"+image:""}"
}
`   
    const cid = (await ipfs.add(str)).path;  
	await contract.createToken(name,name,18,cid);		
    console.log(`Adding Badge ${name} cid=${cid} image=${image}`)
}

  