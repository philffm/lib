import { } from "../../lib/3box.js"; // from "https://unpkg.com/3box/dist/3box.js"; // prevent rate errors
import {DomList, getElement, subscribe, setElementVal, LinkClickButton, getElementVal, GetJson, GetImageIPFS, FitOneLine} from '../../lib/koiosf_util.mjs';
import {DisplayMessage} from '../../viewer_figma/koiosf_messages.mjs';
import {getUserAddress,getWeb3} from '../../viewer_figma/koiosf_login.mjs'

var GlobalLeaderboardList = new DomList("leaderboardentry");

/*var nogoaddresses = ["0x4373294DD0f98eC2783f759Ae546A55E527487e7",
                 "0x336101f6685906fFe861ac519A98A6736d2D5b37",
                 "0x8e2A89fF2F45ed7f8C8506f846200D671e2f176f",
                 "0xC3036b696Ea52F6846F3F22E2EB709C595F0e09A",
                 "0x4Ad2eaE4137e11EB3834840f1DC38F5f0fa181c3",
                 "0x118DF8e8557eB3DEd10Eb6Fde3EF183ca8106d56",
                 "0xEA9a7c7cD8d4Dc3acc6f0AaEc1506C8D6041a1c5",
                 "0xD4402f6AC4BdBdc3d966D1ACAB0c1c104bA7d89f",
                 "0xbca3533d21a4538C43A4CC2A6f5c6D38271351C3",
                 "0xe88cAc4e10C4D316E0d52B82dd54f26ade3f0Bb2",
                 "0xB268B478F4B9e501dafFCe74dA60CAb8b7449871",
                 "0x3d07b3629a319aabb2311c3f1f2ff048b1550bea",
                 "0x5c84209877934c61047100121c70a4cf68ec270e",
                 "0x0000000000000000000000000000000000000000",
                 "0x59cDECe70FDd85E37546d9BE808Ae64892f1aD47",
                 "0xC1b80113902f9cA05F159DAd4dDCD330E9d0F061"
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
                var decimals = await contracttoken.methods.decimals().call();
                var nrOwners=await contracttoken.methods.nrOwners().call();
                for (var i=16;i<nrOwners;i++) {
                    addresses[i-16] = await contracttoken.methods.GetOwner(i).call();
                    tokencount[i-16] = Math.round((await contracttoken.methods.balanceOf(addresses[i-16]).call())/(10**decimals));
                    ranking[i-16] = [addresses[i-16], tokencount[i-16]];
                }
            }
    }
    console.log(addresses);
    console.log(ranking);
}

async function ShowLeaderboard() {
    await getTitanTokenCount();
    ranking.sort(function(a, b){return b[1]-a[1]});
    console.log(ranking);
    for (var i=0;i<ranking.length;i++) {
        if ((ranking[i][1] != 0)) {
            var target = GlobalLeaderboardList.AddListItem();
            setElementVal("leaderboardtokencounttext",ranking[i][1],target);
            FindProfile(target.getElementsByClassName("leaderboardusertext")[0],ranking[i][0],target.getElementsByClassName("userphoto")[0]);
            FitOneLine(target.getElementsByClassName("leaderboardusertext")[0])
            setElementVal("leaderboardpositiontext",parseInt(i+1),target)
        }
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