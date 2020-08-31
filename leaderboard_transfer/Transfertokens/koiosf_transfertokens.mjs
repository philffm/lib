import {DomList,getElement,FitOneLine, setElementVal, LinkClickButton, getElementVal} from '../../lib/koiosf_util.mjs';

let useraddresses;
let tokenamount;
let usernames;
let sendlist = new Array;
var GlobalAddressList = new DomList("transfertokensentry");

window.addEventListener('DOMContentLoaded', onLoad)

async function onLoad() {
    var addresslist=getElement("addresstextboxtext");    
    addresslist.contentEditable="true"; // make div editable
    addresslist.style.whiteSpace ="pre"; 

    var tokenamountlist=getElement("tokenamounttextboxtext");    
    tokenamountlist.contentEditable="true"; // make div editable
    tokenamountlist.style.whiteSpace ="pre"; 
    
    var tokenamountlist=getElement("namestextboxtext");    
    tokenamountlist.contentEditable="true"; // make div editable
    tokenamountlist.style.whiteSpace ="pre"; 
 
    LinkClickButton("confirmbutton",AddElementsToList)
    LinkClickButton("emptylistbutton",EmptyList)  
    LinkClickButton("showdomlist",ConsoleLogDomList)
    LinkClickButton("sendbutton",SendTransaction)
}

async function AddElementsToList() {
    var nameslist=getElementVal("namestextboxtext")
    usernames = nameslist.split(',');
    var addresslist=getElementVal("addresstextboxtext")
    useraddresses = addresslist.split(',');
    var tokenlist=getElementVal("tokenamounttextboxtext")
    tokenamount = tokenlist.split(',');
    ShowAddresses(usernames,useraddresses,tokenamount);
}

async function ShowAddresses(nameslist,addresses,tokenamount) {
    if(nameslist.length == addresses.length == tokenamount.length) {    
        for (var i=0;i<addresses.length;i++) {
            var target = GlobalAddressList.AddListItem();
            setElementVal("transferusernametext",nameslist[i],target)
            setElementVal("transferuseraddresstext",addresses[i],target)
            setElementVal("transfertokencounttext",tokenamount[i],target)
            var tokenamountlist=getElement("transfertokencounttext",target);    
            tokenamountlist.contentEditable="true"; // make div editable
            tokenamountlist.style.whiteSpace ="pre";
        }
    }
    else {
        console.log("error, difference in listlength")
    }
}

async function EmptyList() {
    GlobalAddressList.EmptyList();
}

async function ConsoleLogDomList() {
    console.log(GlobalAddressList);
}

async function SendTransaction() {
    await GetAddressInformation();
    console.log(tokenamount);
    console.log(sendlist);
}

async function GetAddressInformation() {
    var entries=document.getElementsByClassName("transfertokensentry");
    for (var i=0;i<entries.length;i++) {
        tokenamount[i] = entries[i].children[2].innerText;
    }

    for (var j=0;j<useraddresses.length;j++) {
        sendlist[j] = new Array(useraddresses[j], tokenamount[j]);
    }
}