 import {GetJson,subscribe,DomList,setElementVal,GetJsonIPFS,GetImageIPFS,GetURLParam,GetResolvableIPFS,getElement,LinkClickButton,LinkVisible} from '../lib/koiosf_util.mjs';
 import {SwitchDisplayMessageContinous,DisplayMessageContinous,DisplayMessage} from './koiosf_messages.mjs'
import {getWeb3,getWeb3Provider} from './koiosf_login.mjs'
import {GlobalCourseList} from './koiosf_course.mjs'
 
var accounts, contract, web3, isCreator;


async function getBadgeBalance(badgeId) {
    return await contract.methods.balanceOf(accounts[0], badgeId).call();
}

async function reloadBadges() {
    var totalBadges = await contract.methods.nonce().call();

    for (var i = 1; i <= totalBadges; i++) {
        var balance = await contract.methods.balanceOf(accounts[0], i).call();
        var badge = document.getElementById(i.toString())

        if (badge !== undefined) {
            if (parseInt(balance) === 0) {
                badge.style.opacity = 0.5;
            } else {
                badge.style.opacity = 1;
            }
        }
    }
}
 

var GlobalBadgeList;
var GlobalTokenList;
 

async function getBadges() {
    console.log("In getBadges");
     GlobalBadgeList.EmptyList()    


    var totalBadges =   await contract.methods.balanceOf(accounts[0]).call();
    console.log(`totalBadges=${totalBadges}`)
    // await contract.methods.nonce().call();
    
 //   tokenOfOwnerByIndex
    

    for (var i = 1; i <= totalBadges; i++) {
        var urltarget = GlobalBadgeList.AddListItem() 
        GetBadgeDetails(urltarget,i)
    }
}
 // images are loaded from https://cloudflare-ipfs.com/ipfs/..  (svg doesn't allways work)


 async function CheckCourses() {
	var nrTemplates=await contract.methods.nrTemplates().call()
	console.log(`nrTemplates=${nrTemplates}`);
    console.log(nrTemplates);
	
    
    var currentcourse=GlobalCourseList.GetCurrentCourse()
    console.log(currentcourse);
    
     for (var i=0;i<nrTemplates;i++) {
         var info=await contract.methods.GetTemplateInfo(i).call()
         console.log(info);
         /*
         var cid=info[1]
         console.log(cid)
        var badgecontent=await GetJsonIPFS(cid)
        console.log(badgecontent);        
        var name=badgecontent.name
        */
        var name=info[0]
        console.log(name);
        if (name=="Student-"+currentcourse) {
            console.log(`Found ${name}`)
            return i;
        }
	 }
	return undefined;
}	

async function GetBadgeDetails(urltarget,i) { // put in function to be able to run in parallel
        var tokenid = await contract.methods.ownedTokens(accounts[0],i-1).call(); // should be tokenOfOwnerByIndex
        console.log(`tokenid=${tokenid}`)
        var uri = await contract.methods.tokenURI(tokenid).call();
        console.log(uri)        
        var badgecontent=await GetJsonIPFS(uri)
        console.log(badgecontent);
        if (badgecontent) {
        //getBadgeContent(uri, i);
            if (badgecontent.image) {
                 var imageobject=await GetImageIPFS(badgecontent.image)
                 setElementVal("__icon",imageobject,urltarget)
            }        
            setElementVal("__label",badgecontent.name+" "+badgecontent.description,urltarget)
           // console.log(urltarget);
        }
}        

async function getTokens() {
	var totalTokens =   await contracttokenfactory.methods.NrTokens().call();
	console.log(`In getTokens: totalTokens=${totalTokens}`);
	for (var i=0;i<totalTokens;i++) {
		var address=await contracttokenfactory.methods.tokens(i).call();
		//console.log(address);
		
		var tokencode=await web3.eth.getCode(address)
		// console.log(tokencode);
		 if (tokencode.length <=2) {       
			console.error("No contract code");   
		    continue;
		 } 
		 
		 var contracttoken = await new web3.eth.Contract(tokenJson.abi, address);
		// console.log(contracttoken);
		 var name=await contracttoken.methods.name().call();
		 var symbol=await contracttoken.methods.symbol().call();
		 var decimals=await contracttoken.methods.decimals().call();
		 
		 var balance=await contracttoken.methods.balanceOf(accounts[0]).call();
		 
		 balance = (balance / (10 ** decimals)).toFixed(0)
		 
		 console.log(`Name=${name} Balance=${balance} address=${address}`)
		 if (balance > 0) {
		 
			 var urltarget = GlobalTokenList.AddListItem() 
			 
			var tokenImage=await GetTokenDetails(urltarget,contracttoken,balance)
			tokenImage=GetResolvableIPFS(tokenImage);
			SetLinkMetamask(urltarget,address,symbol,decimals,tokenImage)
		 }
	}
}


function SetLinkMetamask(urltarget,address,symbol,decimals,tokenImage) { // seperate function to remember state
	console.log(`In SetLinkMetamask tokenImage=${tokenImage}`);
	if (!tokenImage)
		return;
	var param={
			   type: 'ERC20', 
			   options: {
					address: address, 
					symbol: symbol, 
					decimals: decimals, 
					image: tokenImage
				  }
			}		 
	LinkClickButton(urltarget,x=> getWeb3Provider().request({method: 'wallet_watchAsset',params: param }) );
}


async function GetTokenDetails(urltarget,contracttoken,balance) { 

        var uri = await contracttoken.methods.tokenURI().call();
        console.log(uri)        
        var tokencontent=await GetJsonIPFS(uri)
        console.log(tokencontent);
        if (!tokencontent) 
			return undefined;		
		setElementVal("__label",tokencontent.name+"<br>"+balance,urltarget)
		console.log(urltarget);
		if (!tokencontent.image) 
			return undefined
		 var imageobject=await GetImageIPFS(tokencontent.image)
		 setElementVal("__icon",imageobject,urltarget)
		return tokencontent.image; // tokencontent.image
}        


async function Joincourse() {
	 console.log("In Joincourse")
 
      
      setElementVal("jointext","Joining course, getting badge","ov_join")
      
	  var wanted=await CheckCourses();
      var  mybalance=await web3.eth.getBalance(accounts[0]);
       
	  setElementVal("jointext",`Trying to get badgetemplate ${wanted} mybalance ${mybalance}`,"ov_join")
       
       
       
       
       
        const privateKey= '0x0da19552d21de3da01e4a5ff72f6722b9a86c78ee6c6a46e5cdcf0fb5a936110'; 
                               // note very insecure, but for test ETH this is usable   
            var addressFaucet = web3.eth.accounts.privateKeyToAccount(privateKey).address; 
            web3.eth.accounts.wallet.add(privateKey);
            
            result = await  web3.eth.sendTransaction({from: addressFaucet,to: accounts[0],gas: 200000,value: '1000000000000000'})
               .catch(x => console.log(`Error: ${x.code} ${x.message}`));    
            console.log(`Transaction hash: ${result.transactionHash}`);
   
          mybalance=await web3.eth.getBalance(accounts[0]);
         setElementVal("jointext",`mybalance ${mybalance}, getting badge now`,"ov_join") 
       
       
      
      var result=await contract.methods.createToken(accounts[0],wanted).send({from: accounts[0]})
      console.log(result)
      setElementVal("jointext",`result ${JSON.stringify(result)}`,"ov_join")
	  await sleep(10000)
       
}
 
  var contractJson
  var tokenfactoryJson
  var tokenJson
  

//https://gpersoon.com/koios/lib/smartcontracts/build/contracts/KOIOSNFT.json
async function init() {
	 
    LinkVisible("ov_join",Joincourse)    
    
	console.log("Init in badges");
	console.log(getElement("joincourse"))
	
    let smartcontractjson= GetURLParam("smartcontractinfo"); 
    
    var smartcontractinfo="https://koiosonline.github.io/lib/smartcontracts/build/contracts/KOIOSNFT.json"
    if (smartcontractjson)
        smartcontractinfo=smartcontractjson;
    
    
    contractJson=await GetJson(smartcontractinfo)
    
    console.log(contractJson);
    
    subscribe("web3providerfound",NextStep)
    
    GlobalBadgeList = new DomList("badge")
	GlobalTokenList = new DomList("token")
    
	
	var tokenfactoryinfo="https://koiosonline.github.io/lib/koiosft/build/contracts/ERC20TokenFactory.json"
	tokenfactoryJson=await GetJson(tokenfactoryinfo)
	console.log(tokenfactoryinfo);
	console.log(tokenfactoryJson)
	
	var tokensinfo="https://koiosonline.github.io/lib/koiosft/build/contracts/ERC20Token.json"
	tokenJson=await GetJson(tokensinfo)
	console.log(tokensinfo);
	console.log(tokenJson)
	
	
}
var contracttokenfactory;

async function NextStep() {
    console.log("In NextStep");
    web3=getWeb3()
    var nid=(await web3.eth.net.getId());
    if (nid !=4) {
      DisplayMessage(`Make sure you are on the Rinkeby network (currently ${nid})`);   
    }    
    accounts = await web3.eth.getAccounts();
		
    var code=await web3.eth.getCode(contractJson.networks[nid].address)
    //console.log(code);
    
    if (code.length <=2) {       
        console.error("No contract code");        
    } else {
		contract = await new web3.eth.Contract(contractJson.abi, contractJson.networks[nid].address);
		//console.log(contract);
		getBadges();
	}
      
	  
     var tokenfactorycode=await web3.eth.getCode(tokenfactoryJson.networks[nid].address)
	 //console.log(tokenfactorycode);
	     if (tokenfactorycode.length <=2) {       
        console.error("No contract code");        
     } else {
		 contracttokenfactory = await new web3.eth.Contract(tokenfactoryJson.abi, tokenfactoryJson.networks[nid].address);
		 console.log(contracttokenfactory);
		 getTokens();
	 }
}    

    

document.addEventListener('DOMContentLoaded', init)
