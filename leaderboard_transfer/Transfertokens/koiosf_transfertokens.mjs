import {DomList,getElement,FitOneLine} from '../../lib/koiosf_util.mjs';

let useraddresses;
let tokenamount;
let usernames;
var GlobalAddressList = new DomList("transfertokensentry");

onLoad();

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

    getElement("confirmbutton").addEventListener('animatedclick',AddElementsToList)   
    getElement("emptylistbutton").addEventListener('animatedclick',EmptyList)   
    getElement("showdomlist").addEventListener('animatedclick',ConsoleLogDomList)   
}

async function AddElementsToList() {
    var nameslist=getElement("namestextboxtext").innerHTML; 
    usernames = nameslist.split(',');
    var addresslist=getElement("addresstextboxtext").innerHTML; 
    useraddresses = addresslist.split(',');
    var tokenlist=getElement("tokenamounttextboxtext").innerHTML; 
    tokenamount = tokenlist.split(',');
    ShowAddresses(usernames,useraddresses,tokenamount);
}

async function ShowAddresses(nameslist,addresses,tokenamount) {
    for (var i=0;i<addresses.length;i++) {
        var target = GlobalAddressList.AddListItem();
        target.getElementsByClassName("transferusernametext")[0].innerHTML = nameslist[i];
        target.getElementsByClassName("transferuseraddresstext")[0].innerHTML = addresses[i];
        target.getElementsByClassName("transfertokencounttext")[0].innerHTML = tokenamount[i];
        var tokenamountlist=getElement("transfertokencounttext",target);    
        tokenamountlist.contentEditable="true"; // make div editable
        tokenamountlist.style.whiteSpace ="pre";
    }
}

async function EmptyList() {
    GlobalAddressList.EmptyList();
}

async function ConsoleLogDomList() {
    console.log(GlobalAddressList);
}