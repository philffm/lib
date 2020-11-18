import { } from "../lib/3box.js"; // from "https://unpkg.com/3box/dist/3box.js"; // prevent rate errors
import {DomList, subscribe, setElementVal, GetJson, GetImageIPFS, FitOneLine} from '../lib/koiosf_util.mjs';
import {DisplayMessage} from './koiosf_messages.mjs';
import {getWeb3} from './koiosf_login.mjs'
import {GetCourseInfo} from './koiosf_course.mjs';

var GlobalLeaderboardList = new DomList("leaderboardentry");

var globalaccounts;
var tokenfactoryJson;
var tokenJson;
var contracttokenfactory;
var nonStudentsJson;
var tokencount = new Array;
var addresses = new Array;
var ranking = new Array;
var nonStudentAddresses = new Array;

window.addEventListener('DOMContentLoaded', onLoad)

async function onLoad() {
    await initContractInformation();
}



async function initContractInformation() {
    subscribe("web3providerfound",NextStep)   
    

    var tokenfactoryinfo="https://koiosonline.github.io/lib/koiosft/build/contracts/ERC20TokenFactory.json"
	tokenfactoryJson=await GetJson(tokenfactoryinfo)
		
	var tokensinfo="https://koiosonline.github.io/lib/koiosft/build/contracts/ERC20Token.json"
	tokenJson=await GetJson(tokensinfo)
	
    var nonStudents="https://koiosonline.github.io/lib/koiosft/migrations/distribute.json"
    nonStudentsJson=await GetJson(nonStudents);
}

async function NextStep() {
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
    }

    //Place the non student addresses in an array
    for (var i=0; i<nonStudentsJson.length; i++) {
        nonStudentAddresses[i] = nonStudentsJson[i][0];
    }
    console.log("subscribe setcurrentcourse")
    subscribe("setcurrentcourse",ReloadTokens) // reload the titan count for the current course
    await ShowLeaderboard();
    
}

async function ReloadTokens() {
    console.log("ReloadTokens")
    GlobalLeaderboardList.EmptyList()    
    ranking=[]
    console.log("ShowLeaderboard");
    await ShowLeaderboard()
}    

async function getTitanTokenCount() {
    var tokenname=await GetCourseInfo("token")
    if (!tokenname) tokenname="Titan" // default token
    console.log(`Current token=${tokenname}`)
    var totalTokens = await contracttokenfactory.methods.NrTokens().call();
    var addresspromises = new Array;
    var tokencountpromises = new Array;
    for (var i=0;i<totalTokens;i++) {
        var address=await contracttokenfactory.methods.tokens(i).call();
        var contracttoken = await new web3.eth.Contract(tokenJson.abi, address);
        var name = await contracttoken.methods.name().call();
        if (name == tokenname) {
            var decimals = await contracttoken.methods.decimals().call();
            var nrOwners=await contracttoken.methods.nrOwners().call();
            for (var i=13;i<nrOwners;i++) {
                var promise = contracttoken.methods.GetOwner(i).call();
                addresspromises.push(promise);
            }
            await Promise.all(addresspromises).then((values) => addresses = values);
            
            for (var i=0;i<addresses.length;i++) {
                var promise = contracttoken.methods.balanceOf(addresses[i]).call();
                tokencountpromises.push(promise);
            }
            await Promise.all(tokencountpromises).then((values) => 
            {
                for(var i=0;i<values.length;i++) {
                    values[i] = Math.round(values[i]/(10**decimals))
                }
                tokencount = values;
            })

            for (var i=0;i<addresses.length;i++) {
                ranking[i] = [addresses[i], tokencount[i]];
            }

            //remove the non student addresses from the ranking
            for( var i = 0; i < ranking.length; i++) { 
                if ((nonStudentAddresses.includes(ranking[i][0])) || (ranking[i][1] == 0)) { 
                    ranking.splice(i, 1); i--; 
                }
            }
        }
    }
}




async function ShowLeaderboard() {
    await getTitanTokenCount();
    ranking.sort(function(a, b){return b[1]-a[1]});
    for (var i=0;i<Math.min(10,ranking.length);i++) {
        var target = GlobalLeaderboardList.AddListItem();
        setElementVal("leaderboardtokencounttext",ranking[i][1],target);
        FindProfile(target.getElementsByClassName("leaderboardusertext")[0],ranking[i][0],target.getElementsByClassName("userphoto")[0]);
        FitOneLine(target.getElementsByClassName("leaderboardusertext")[0])
        setElementVal("leaderboardpositiontext",parseInt(i+1),target)
    }
    var totalAmount = 0;
    for (var i=0;i<ranking.length;i++) {
        totalAmount += ranking[i][1]; 
    }
    var median = ranking[Math.round(ranking.length/2)][1];
    var averageAmount = Math.round(totalAmount / ranking.length);
    setElementVal("averagetokencounttext",averageAmount);
    setElementVal("mediantokencounttext",median);
}

async function FindProfile (target,did,profilepicture) {
    var profile = await Box.getProfile(did);
    target.innerHTML = profile.name ? profile.name : did
    if (profile.image) {
        var imagecid=profile.image[0].contentUrl
        imagecid=imagecid[`\/`]
        profilepicture.src=await GetImageIPFS(imagecid)
    }           
}