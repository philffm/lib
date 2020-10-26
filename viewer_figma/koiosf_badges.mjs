import {GetJson,subscribe,DomList,setElementVal,GetJsonIPFS,GetImageIPFS,GetURLParam,GetResolvableIPFS,getElement,LinkClickButton,LinkVisible,FindDomidWithId,appendElementVal,sleep} from '../lib/koiosf_util.mjs';
import {DisplayMessage} from './koiosf_messages.mjs'
import {getWeb3,getWeb3Provider} from './koiosf_login.mjs'
import {GlobalCourseList} from './koiosf_course.mjs'
 
var globalaccounts, web3, isCreator;
var GlobalBadgeList;
var GlobalTokenList;
var nft_jsonobject
var nft_address
var nft_contract
var tokenfactoryJson
var tokenJson
var contracttokenfactory;

/////////////////// NFT //////////////////////////////////////////////////////////////////////////////

async function getBadges() {
    GlobalBadgeList.EmptyList()    
    var totalBadges = await nft_contract.methods.balanceOf(globalaccounts[0]).call();

    for (var i = 0; i < totalBadges; i++) {
        var urltarget = GlobalBadgeList.AddListItem() 
        globalbadgeinfo[i] = await GetBadgeDetails(urltarget,i)
    }
}

function StudentBadgeName() {
	var currentcourse = GlobalCourseList.GetCurrentCourse()
	return "Student-"+currentcourse
}

var globallisttemplates=[]
var fglobalTemplatesLoaded=false;

// images are loaded from https://cloudflare-ipfs.com/ipfs/..  (svg doesn't allways work)
async function GetTemplates() {	
	globallisttemplates=[]	
	var nrTemplates = await nft_contract.methods.nrTemplates().call()
	//var currentcourse=GlobalCourseList.GetCurrentCourse() - Unused
    
    for (var i=0;i<nrTemplates;i++) {
        var info=await nft_contract.methods.GetTemplateInfo(i).call()		
		globallisttemplates.push(info)
	}
	fglobalTemplatesLoaded=true;
}	

function FindBadge(wantedname) {
	if (!fglobalTemplatesLoaded) return undefined;
	
	for (var i=0;i<globallisttemplates.length;i++) {
	    var name=globallisttemplates[i].name
        if (name==wantedname) return i;	 
	}
	return -1;
}

function HasBadge(wantedname) {
	for (var i=0;i<globalbadgeinfo.length;i++) {
		if (!globalbadgeinfo[i]) continue;
		if (!globalbadgeinfo[i].templateinfo) continue;
	    var name=globalbadgeinfo[i].templateinfo.name
        if (name==wantedname) return true;	 
	}
	return false;
}	

function GetBadgeInfo(wantedid) {
	for (var i=0;i<globalbadgeinfo.length;i++) {
		console.log(i);
		console.log(globalbadgeinfo[i])
		if (!globalbadgeinfo[i]) continue;
		if (globalbadgeinfo[i].tokenid != wantedid) continue;
		return globalbadgeinfo[i]
	}
	return undefined;
}	

var globalbadgeinfo=[]

async function GetBadgeDetails(urltarget,i) { // put in function to be able to run in parallel
	var tokenid = await nft_contract.methods.tokenOfOwnerByIndex(globalaccounts[0],i).call(); // ownedTokens
	var tostore={}	  
	urltarget.id=tokenid;
	var template = await nft_contract.methods.GetTemplateId(tokenid).call();			
	var templateinfo = await nft_contract.methods.GetTemplateInfo(template).call();

	tostore.tokenid=tokenid
	tostore.template=template
	tostore.templateinfo=templateinfo
		
    var uri = await nft_contract.methods.tokenURI(tokenid).call();
    tostore.uri=uri;
	
	var badgecontent=await GetJsonIPFS(uri)	
	tostore.badgecontent=badgecontent;
	
	if (badgecontent) {
		if (badgecontent.image) {
			var imageobject=await GetImageIPFS(badgecontent.image)
			setElementVal("__icon",imageobject,urltarget)
		}        
		setElementVal("__label",badgecontent.name+" "+badgecontent.description,urltarget)
	}
	return tostore		
}        

/// FT /////////////////////////////////////////////////////////

async function getTokens() {
	GlobalTokenList.EmptyList()    
	var totalTokens =   await contracttokenfactory.methods.NrTokens().call();
	for (var i=0;i<totalTokens;i++) {
		var address=await contracttokenfactory.methods.tokens(i).call();
		var tokencode=await web3.eth.getCode(address)
		
		if (tokencode.length <=2) {       
			console.error("No contract code");   
		    continue;
		} 
		 
		var contracttoken = await new web3.eth.Contract(tokenJson.abi, address);
		//var name=await contracttoken.methods.name().call(); - Not used
		var symbol=await contracttoken.methods.symbol().call();
		var decimals=await contracttoken.methods.decimals().call();
		var balance=await contracttoken.methods.balanceOf(globalaccounts[0]).call();
		
		balance = (balance / (10 ** decimals)).toFixed(0)
		if (balance > 0) {
			var urltarget = GlobalTokenList.AddListItem() 	
			var tokenImage=await GetTokenDetails(urltarget,contracttoken,balance)
			tokenImage=GetResolvableIPFS(tokenImage);
			SetLinkMetamask(urltarget,address,symbol,decimals,tokenImage)
		}
	}
}

function SetLinkMetamask(urltarget,address,symbol,decimals,tokenImage) { // seperate function to remember state
	if (!tokenImage) return;
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
   	var tokencontent=await GetJsonIPFS(uri)
    if (!tokencontent) return undefined;		
	
	setElementVal("__label",tokencontent.name+"<br>"+balance,urltarget)
	if (!tokencontent.image) return undefined
		
	var imageobject=await GetImageIPFS(tokencontent.image)
	setElementVal("__icon",imageobject,urltarget)
	return tokencontent.image; 
}   
  
async function Joincourse() {
	function show(str) { appendElementVal("jointext",str+"<br>","ov_join")	}	
	setElementVal("jointext","","ov_join") // clean the text
	var sbn=StudentBadgeName()
	
	show(`Looking for badge ${sbn}`)
	if (!web3) {
		show("Login first to join the course");
		return;
	}
	
	if (!fglobalTemplatesLoaded) {
		show("List of course badges is not loaded yet, wait a while and retry");
		return;
	}
			
	if (HasBadge(sbn)) {
		show(`You already have badge ${sbn}`);
		return;
	}

	var wantedid=FindBadge(sbn)
	if (wantedid < 0) {
		show(`No badges are present for course ${sbn} ${wantedid}`);
		return;
	}
		
	var mybalance=await web3.eth.getBalance(globalaccounts[0]);
	show(`Trying to get badgetemplate ${wantedid}`)
	show(`mybalance ${web3.utils.fromWei(mybalance, 'ether')} ether`)
	show("Wait 20 seconds to get some ETH")
	
	const privateKey= '0x0da19552d21de3da01e4a5ff72f6722b9a86c78ee6c6a46e5cdcf0fb5a936110'; // note very insecure, but for test ETH this is usable   
	var addressFaucet = web3.eth.accounts.privateKeyToAccount(privateKey).address; 
	web3.eth.accounts.wallet.add(privateKey);
	var value=web3.utils.toWei('10', 'milli');
	
	result = await  web3.eth.sendTransaction({from: addressFaucet,to: globalaccounts[0],gas: 200000,value: value}).catch(x => show(`Error: ${x.code} ${x.message}`));    
	
	var etherscan=`https://rinkeby.etherscan.io/tx/${result.transactionHash}`
	show(`<a href="${etherscan}" target="_blank">etherscan</a>`)

	mybalance=await web3.eth.getBalance(globalaccounts[0]);
	show(`mybalance ${web3.utils.fromWei(mybalance, 'ether')} ether`)
	show("Joining course, getting badge")
	show(`Getting badge now`) 
    show("Confirm metamask popup and wait 20 seconds");
	var result=await nft_contract.methods.createToken(globalaccounts[0],wantedid).send({from: globalaccounts[0]})
	
	var etherscan=`https://rinkeby.etherscan.io/tx/${result.blockHash}`
	show(`<a href="${etherscan}" target="_blank">etherscan</a>`)
	show("Badge received")
	getBadges() // run asynchronous
	await sleep(10000)
	ShowJoinButtons()     
}

async function OvBadgeMadeVisible(event) {
	function show(str) {		
		appendElementVal("badgetext",str,"ov_badge")	
	}
  
	setElementVal("badgetext","","ov_badge")	 // empty first
    if (!event) return; // triggered via another then via click (back event)

    var target=FindDomidWithId(event);
	if (!target) return;
	var id=target.id
	var info=GetBadgeInfo(id)
	
	var templateid=info.template
	var manager=info.templateinfo.managedBy;
	
    show(`Details about this badge...<br>`)
	show(`id:${id}<br>`)
	var opensea=`https://rinkeby.opensea.io/assets/${nft_address}/${target.id}`
	show(`<a href="${opensea}" target="_blank">opensea</a><br>`)
	show(`name:${info.templateinfo.name}<br>`)
	show(`this badge templateid:${templateid}<br>`)
	show(`manager templateid:${manager}<br>`)

	//var managerinfo=globallisttemplates[manager] - Unused

	var studentbadge=undefined;
	for (var k=0;k<globallisttemplates.length;k++) {
		if (globallisttemplates[k].managedBy == templateid)  {
			show(`I manage: ${globallisttemplates[k].name} badgeid:${k}<br>`)
			if (globallisttemplates[k].name.includes("Student-")) studentbadge=k;
		}
	}
	
	if (studentbadge) {
	   	show(`Also check everyone with badge with the same template as:${studentbadge}<br>`)  
	   	var nr = await nft_contract.methods.tokensOfType(studentbadge).call();
	   	show(`With number of them: ${nr}<br>`)
	   	for (var i=0;i<nr;i++) {
		   	var studenttokenid = await nft_contract.methods.tokenOfTypeByIndex(studentbadge,i).call();
		   	await ShowGetBadgeInfo(studenttokenid,show)
	   	}      
    } 	
}	

async function ShowGetBadgeInfo(tokenid,show) {
	show(`Badge with id=${tokenid}`)
	var owneraddress = await nft_contract.methods.ownerOf(tokenid).call();		   		   
	var opensea=`https://rinkeby.opensea.io/assets/${nft_address}/${tokenid}`		   

	show(`<a href="${opensea}" target="_blank">opensea</a> `)
	var box3=`https://3box.io/${owneraddress}`;
	show(`<a href="${box3}" target="_blank">3box</a> `)

	var etherscan=`https://rinkeby.etherscan.io/token/${nft_address}?a=${owneraddress}`
	show(`<a href="${etherscan}" target="_blank">etherscan</a>`)
	show(`<br>`)
	show(`address:${owneraddress}<br>`)
}	


async function init() {	 
    LinkVisible("ov_join",Joincourse,"scr_profile")    
	LinkVisible("ov_join",Joincourse,"scr_added_course" )    
	LinkVisible("ov_badge",OvBadgeMadeVisible)        
	ShowJoinButtons()
	
	subscribe("setcurrentcourse",NewCourseSelected)	
    let nft_jsonurl_parameter= GetURLParam("nft_jsonurl"); 
    
    var nft_jsonurl="https://koiosonline.github.io/lib/smartcontracts/build/contracts/KOIOSNFT.json"
    if (nft_jsonurl_parameter)
        nft_jsonurl=nft_jsonurl_parameter;
    nft_jsonobject=await GetJson(nft_jsonurl)    

    subscribe("web3providerfound",NextStep)    
    GlobalBadgeList = new DomList("badge")
	GlobalTokenList = new DomList("token")    	
	var tokenfactoryinfo="https://koiosonline.github.io/lib/koiosft/build/contracts/ERC20TokenFactory.json"
	tokenfactoryJson=await GetJson(tokenfactoryinfo)

	var tokensinfo="https://koiosonline.github.io/lib/koiosft/build/contracts/ERC20Token.json"
	tokenJson=await GetJson(tokensinfo)
}

async function NextStep() {
    web3=getWeb3()
    var nid=(await web3.eth.net.getId());
    if (nid !=4) {
      	DisplayMessage(`Make sure you are on the Rinkeby network (currently ${nid})`);   
    }    
    globalaccounts = await web3.eth.getAccounts();
	
    nft_address=nft_jsonobject.networks[nid].address		
    var nft_code=await web3.eth.getCode(nft_address)
    
    if (nft_code.length <=2) {       
        console.error("No contract code");        
    } else {
		nft_contract = await new web3.eth.Contract(nft_jsonobject.abi, nft_jsonobject.networks[nid].address);
		await GetTemplates(); 
		await getBadges(); 
		ShowJoinButtons()
	}
        
    var tokenfactorycode=await web3.eth.getCode(tokenfactoryJson.networks[nid].address)
	if (tokenfactorycode.length <=2) {       
        console.error("No contract code");        
    } else {
		contracttokenfactory = await new web3.eth.Contract(tokenfactoryJson.abi, tokenfactoryJson.networks[nid].address);
		getTokens();
	}
}    

subscribe("ethereumchanged",EthereumChanged)

function NewCourseSelected() {
	ShowJoinButtons()
}	

function ShowJoinButtons() {
	var sbn=StudentBadgeName()
	var showjoin=(fglobalTemplatesLoaded && (!HasBadge(sbn)) && (FindBadge(sbn) >=0))
	getElement("joincourse","scr_profile").dispatchEvent(new CustomEvent(showjoin?"show":"hide")); 
	getElement("joincourse","scr_added_course").dispatchEvent(new CustomEvent(showjoin?"show":"hide")); 
}

async function EthereumChanged() {
	globalaccounts = await web3.eth.getAccounts();	
	getBadges(); 
	getTokens(); // note parallel
	ShowJoinButtons()
}	

document.addEventListener('DOMContentLoaded', init)