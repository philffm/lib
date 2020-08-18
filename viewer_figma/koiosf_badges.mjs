import {GetJson,subscribe,DomList,setElementVal,GetJsonIPFS,GetImageIPFS,GetURLParam,GetResolvableIPFS,getElement,LinkClickButton,LinkVisible,FindDomidWithId,appendElementVal} from '../lib/koiosf_util.mjs';
import {SwitchDisplayMessageContinous,DisplayMessageContinous,DisplayMessage} from './koiosf_messages.mjs'
import {getWeb3,getWeb3Provider} from './koiosf_login.mjs'
import {GlobalCourseList} from './koiosf_course.mjs'
 
var accounts, web3, isCreator;
var GlobalBadgeList;
var GlobalTokenList;
var nft_jsonobject
var nft_address
var nft_contract
var tokenfactoryJson
var tokenJson
var contracttokenfactory;


/////////////////// NFT //////////////////////////////////////////////////////////////////////////////
async function getBadgeBalance(badgeId) {
    return await nft_contract.methods.balanceOf(accounts[0], badgeId).call();
}
async function reloadBadges() {
    var totalBadges = await nft_contract.methods.nonce().call();

    for (var i = 1; i <= totalBadges; i++) {
        var balance = await nft_contract.methods.balanceOf(accounts[0], i).call();
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
async function getBadges() {
    console.log("In getBadges");
     GlobalBadgeList.EmptyList()    


    var totalBadges =   await nft_contract.methods.balanceOf(accounts[0]).call();
    console.log(`totalBadges=${totalBadges}`)
    // await nft_contract.methods.nonce().call();
    
 //   tokenOfOwnerByIndex
    

    for (var i = 0; i < totalBadges; i++) {
        var urltarget = GlobalBadgeList.AddListItem() 
        GetBadgeDetails(urltarget,i)                      // not runs in parallel!
    }
}
 // images are loaded from https://cloudflare-ipfs.com/ipfs/..  (svg doesn't allways work)
async function CheckCourses() {
	var nrTemplates=await nft_contract.methods.nrTemplates().call()
	console.log(`nrTemplates=${nrTemplates}`);
    console.log(nrTemplates);
	
    
    var currentcourse=GlobalCourseList.GetCurrentCourse()
    console.log(currentcourse);
    
     for (var i=0;i<nrTemplates;i++) {
         var info=await nft_contract.methods.GetTemplateInfo(i).call()
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


var globalbadgeinfo=[]

async function GetBadgeDetails(urltarget,i) { // put in function to be able to run in parallel
        var tokenid = await nft_contract.methods.tokenOfOwnerByIndex(accounts[0],i).call(); // ownedTokens
        console.log(`tokenid=${tokenid}`)		
		urltarget.id=tokenid;
		
		
		
		var template = await nft_contract.methods.GetTemplateId(tokenid).call();
		var templateinfo = await nft_contract.methods.GetTemplateInfo(template).call();
		console.log(template)
		console.log(templateinfo);
		globalbadgeinfo[tokenid]={}
		globalbadgeinfo[tokenid].template=template
		globalbadgeinfo[tokenid].templateinfo=templateinfo
		
        var uri = await nft_contract.methods.tokenURI(tokenid).call();
        console.log(uri)        
		
		globalbadgeinfo[tokenid].uri=uri;
		
        var badgecontent=await GetJsonIPFS(uri)
        console.log(badgecontent);
		
		globalbadgeinfo[tokenid].badgecontent=badgecontent;
        if (badgecontent) {
        //getBadgeContent(uri, i);
            if (badgecontent.image) {
                 var imageobject=await GetImageIPFS(badgecontent.image)
                 setElementVal("__icon",imageobject,urltarget)
            }        
            setElementVal("__label",badgecontent.name+" "+badgecontent.description,urltarget)
			
			//urltarget.dataset.name        =badgecontent.name
			//urltarget.dataset.description =badgecontent.description
			
			
           // console.log(urltarget);
        }
}        

/// FT /////////////////////////////////////////////////////////
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
			//urltarget.id=
			 
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
	function show(str) { appendElementVal("jointext",str+"<br>","ov_join")	}

	setElementVal("jointext","","ov_join")
	show("Joining course, getting badge")

	var wanted=await CheckCourses();
	var mybalance=await web3.eth.getBalance(accounts[0]);
	show(`Trying to get badgetemplate ${wanted}`)
	show(`mybalance ${mybalance}`)
	show("Wait 20 seconds to get some ETH")
	const privateKey= '0x0da19552d21de3da01e4a5ff72f6722b9a86c78ee6c6a46e5cdcf0fb5a936110'; // note very insecure, but for test ETH this is usable   
	var addressFaucet = web3.eth.accounts.privateKeyToAccount(privateKey).address; 
	web3.eth.accounts.wallet.add(privateKey);
	result = await  web3.eth.sendTransaction({from: addressFaucet,to: accounts[0],gas: 200000,value: '1000000000000000'})
	.catch(x => show(`Error: ${x.code} ${x.message}`));    
	console.log(`Transaction hash: ${result.transactionHash}`);

 var etherscan=`https://rinkeby.etherscan.io/tx/${result.transactionHash}`
		   show(`<a href="${etherscan}" target="_blank">etherscan</a>`)


	mybalance=await web3.eth.getBalance(accounts[0]);
	show(`mybalance ${mybalance}, getting badge now`) 
    show("Confirm metamask popup and wait 20 seconds");
	var result=await nft_contract.methods.createToken(accounts[0],wanted).send({from: accounts[0]})
	console.log(result)
	
	 var etherscan=`https://rinkeby.etherscan.io/tx/${result.blockHash}`
	   show(`<a href="${etherscan}" target="_blank">etherscan</a>`)

	
	//setElementVal("jointext",`result ${JSON.stringify(result)}`,"ov_join")
	show("Badge received")
	await sleep(10000)
       
}
async function OvBadgeMadeVisible(event) {
	
	function show(str) {		
		appendElementVal("badgetext",str,"ov_badge")	
	}
	
    console.log("In OvBadgeMadeVisible")    
	setElementVal("badgetext","","ov_badge")	 // empty first
    console.log(event)   
    if (!event) return; // triggered via another then via click (back event)

    var target=FindDomidWithId(event);
	if (!target) return;
	console.log(target)
	var id=target.id
	var templateid=globalbadgeinfo[id].template
	var manager=globalbadgeinfo[id].templateinfo[2];
	
	console.log(globalbadgeinfo[id])
			
    show(`Details about this badge...<br>`)
	show(`id:${id}<br>`)
	var opensea=`https://rinkeby.opensea.io/assets/${nft_address}/${target.id}`
	show(`<a href="${opensea}" target="_blank">opensea</a><br>`)
	show(`name:${globalbadgeinfo[id].templateinfo[0]}<br>`)
	show(`this badge templateid:${templateid}<br>`)
	show(`manager templateid:${manager}<br>`)
	//str +=`description:${target.dataset.description}<br>`
	
	var studentbadge=undefined;
	var keys = Object.keys(globalbadgeinfo);
	if (keys.length > 0) {
		for (var j=0;j< keys.length;j++) {
			var badgeid=keys[j]
			var badge=globalbadgeinfo[badgeid];    
			if (badge.templateinfo[2] == templateid) {
				show(`I manage: ${badge.templateinfo[0]} badgeid:${badgeid}<br>`)
				if (badge.templateinfo[0].includes("Student-"))
					studentbadge=badgeid
			}			
		}
	}
	if (studentbadge) {
		var templatestudentbadge = await nft_contract.methods.GetTemplateId(studentbadge).call();
	   show(`Also check everyone with badge with the same template as:${studentbadge}<br>`)
       show(`which is ${templatestudentbadge}<br>`)
	   
	   var nr = await nft_contract.methods.tokensOfType(templatestudentbadge).call();
	   
	   show(`With number of them: ${nr}<br>`)
	   for (var i=0;i<nr;i++) {
		   var studenttokenid = await nft_contract.methods.tokenOfTypeByIndex(templatestudentbadge,i).call();
		   var owneraddress = await nft_contract.methods.ownerOf(studenttokenid).call();		   		   
		   var opensea=`https://rinkeby.opensea.io/assets/${nft_address}/${studenttokenid}`		   
		   show(`id=${studenttokenid} `)
		   
		   show(`<a href="${opensea}" target="_blank">opensea</a> `)
		   var box3=`https://3box.io/${owneraddress}`;
		   show(`<a href="${box3}" target="_blank">3box</a> `)
		   
		   var etherscan=`https://rinkeby.etherscan.io/token/${nft_address}?a=${owneraddress}`
		   show(`<a href="${etherscan}" target="_blank">etherscan</a>`)
		   
		   show(`<br>`)
		   show(`address:${owneraddress}<br>`)
		   
	   }   
		   
    } 
	
	
	
}	


//&nft_jsonurl=https://gpersoon.com/koios/lib/smartcontracts/build/contracts/KOIOSNFT.json
async function init() {	 
    LinkVisible("ov_join",Joincourse)    
	LinkVisible("ov_badge",OvBadgeMadeVisible)        
	console.log("Init in badges");
	console.log(getElement("joincourse"))	
    let nft_jsonurl_parameter= GetURLParam("nft_jsonurl"); 
    
    var nft_jsonurl="https://koiosonline.github.io/lib/smartcontracts/build/contracts/KOIOSNFT.json"
    if (nft_jsonurl_parameter)
        nft_jsonurl=nft_jsonurl_parameter;
    nft_jsonobject=await GetJson(nft_jsonurl)    
	
    console.log(nft_jsonobject);
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
async function NextStep() {
    console.log("In NextStep");
    web3=getWeb3()
    var nid=(await web3.eth.net.getId());
    if (nid !=4) {
      DisplayMessage(`Make sure you are on the Rinkeby network (currently ${nid})`);   
    }    
    accounts = await web3.eth.getAccounts();
    nft_address=nft_jsonobject.networks[nid].address		
    var nft_code=await web3.eth.getCode(nft_address)
    //console.log(code);
    
    if (nft_code.length <=2) {       
        console.error("No contract code");        
    } else {
		nft_contract = await new web3.eth.Contract(nft_jsonobject.abi, nft_jsonobject.networks[nid].address);
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
