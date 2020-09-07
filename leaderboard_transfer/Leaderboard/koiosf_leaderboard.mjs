import { } from "../../lib/3box.js"; // from "https://unpkg.com/3box/dist/3box.js"; // prevent rate errors
import {DomList, getElement, subscribe, setElementVal, LinkClickButton, getElementVal, GetJson, GetImageIPFS, FitOneLine} from '../../lib/koiosf_util.mjs';
import {DisplayMessage} from '../../viewer_figma/koiosf_messages.mjs';
import {getUserAddress,getWeb3} from '../../viewer_figma/koiosf_login.mjs'

var GlobalLeaderboardList = new DomList("leaderboardentry");
/*var addresses = ["0x4373294dd0f98ec2783f759ae546a55e527487e7",
                 "0x336101f6685906ffe861ac519a98a6736d2d5b37",
                 "0x8e2a89ff2f45ed7f8c8506f846200d671e2f176f",
                 "0xc3036b696ea52f6846f3f22e2eb709c595f0e09a",
                 "0x4ad2eae4137e11eb3834840f1dc38f5f0fa181c3",
                 "0x118df8e8557eb3ded10eb6fde3ef183ca8106d56",
                 "0xea9a7c7cd8d4dc3acc6f0aaec1506c8d6041a1c5",
                 "0xd4402f6ac4bdbdc3d966d1acab0c1c104ba7d89f",
                 "0xbca3533d21a4538c43a4cc2a6f5c6d38271351c3",
                 "0xe88cac4e10c4d316e0d52b82dd54f26ade3f0bb2",
                 "0xb268b478f4b9e501daffce74da60cab8b7449871",
                 "0x3d07b3629a319aabb2311c3f1f2ff048b1550bea",
                 "0x5c84209877934c61047100121c70a4cf68ec270e"
]*/

var globalaccounts;
var tokenfactoryJson;
var tokenJson;
var contracttokenfactory;
var tokencount = new Array;
var addresses = new Array;
var ranking = new Array;

window.addEventListener('DOMContentLoaded', onLoad)

async function onLoad() {
    await initContractInformation();
}

async function initContractInformation() {
    subscribe("web3providerfound",NextStep)   
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
    globalaccounts = await web3.eth.getAccounts();
	  	  
    var tokenfactorycode=await web3.eth.getCode(tokenfactoryJson.networks[nid].address)
    
    if (tokenfactorycode.length <=2) {       
        console.error("No contract code");        
    } else {
        contracttokenfactory = await new web3.eth.Contract(tokenfactoryJson.abi, tokenfactoryJson.networks[nid].address);
        console.log(contracttokenfactory);
    }

    await ShowLeaderboard();
}

async function getTitanTokenCount() {
    var totalTokens = await contracttokenfactory.methods.NrTokens().call();
    for (var i=0;i<totalTokens;i++) {
        var address=await contracttokenfactory.methods.tokens(i).call();
        var contracttoken = await new web3.eth.Contract(tokenJson.abi, address);
        var name = await contracttoken.methods.name().call();
        if (name == "Titan") {
            var nrOwners=await contracttoken.methods.nrOwners().call();
            for (var j=0;j<nrOwners;j++) {
                addresses[j] = await contracttoken.methods.GetOwner(j).call();
            }
            var decimals = await contracttoken.methods.decimals().call();
            for (var i=0;i<addresses.length;i++) {      
                tokencount[i] = Math.round((await contracttoken.methods.balanceOf(addresses[i]).call())/(10**decimals));
            }
        }
    }
    for (var i=0;i<addresses.length;i++) {
        ranking[i] = [addresses[i], tokencount[i]];
    }
    console.log(ranking);
}

async function ShowLeaderboard() {
    await getTitanTokenCount();
    ranking.sort(function(a, b){return b[1]-a[1]});
    console.log(ranking);
    for (var i=0;i<ranking.length;i++) {
        var target = GlobalLeaderboardList.AddListItem();
        setElementVal("leaderboardtokencounttext",ranking[i][1],target);
        FindProfile(target.getElementsByClassName("leaderboardusertext")[0],ranking[i][0],target.getElementsByClassName("userphoto")[0]);
        FitOneLine(target.getElementsByClassName("leaderboardusertext")[0])
        setElementVal("leaderboardpositiontext",parseInt(i+1),target)
    }
}

/*
getParticipants() {
    Some way of getting data of participants
    return that data
}
*/

async function FindProfile (target,did,profilepicture) {
    var profile = await Box.getProfile(did);
    target.innerHTML = profile.name ? profile.name : did
    if (profile.image) {
        var imagecid=profile.image[0].contentUrl
        imagecid=imagecid[`\/`]
        console.log(imagecid);
        profilepicture.src=await GetImageIPFS(imagecid)
    }           
}