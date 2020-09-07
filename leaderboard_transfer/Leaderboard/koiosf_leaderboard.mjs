import { } from "../../lib/3box.js"; // from "https://unpkg.com/3box/dist/3box.js"; // prevent rate errors
import {DomList, getElement, subscribe, setElementVal, LinkClickButton, getElementVal, GetJson, GetImageIPFS, FitOneLine} from '../../lib/koiosf_util.mjs';
import {DisplayMessage} from '../../viewer_figma/koiosf_messages.mjs';
import {getUserAddress,getWeb3} from '../../viewer_figma/koiosf_login.mjs'

var GlobalLeaderboardList = new DomList("leaderboardentry");

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
            var decimals = await contracttoken.methods.decimals().call();
            var nrOwners=await contracttoken.methods.nrOwners().call();
            for (var i=0;i<nrOwners;i++) {
                addresses[i] = await contracttoken.methods.GetOwner(i).call();
                tokencount[i] = Math.round((await contracttoken.methods.balanceOf(addresses[i]).call())/(10**decimals));
                ranking[i] = [addresses[i], tokencount[i]];
            }
        }
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