Web3 = require('web3');
var address[];



async function leaderboard() {
web3 = new Web3(Web3.givenProvider);
  const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
  //Read only so we can use the .call method.
  var balance = await contract.methods.contractBalance().call();
}
