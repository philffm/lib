import {DomList,getElement,FitOneLine} from '../lib/koiosf_util.mjs';

let useraddresses;
let tokenamount;
var AddressList = new DomList("transfertokensentry");

await onLoad();

async function onLoad() {
    var addresslist=getElement("transferuseraddresstext")    
    addresslist.contentEditable="true"; // make div editable
    addresslist.style.whiteSpace ="pre"; 
    if(addresslist.innerHTML == "Insert here...")
        addresslist.addEventListener("click", addresslist.innerHTML(""));

    var tokenamountlist=getElement("transfertokencounttext")    
    tokenamountlist.contentEditable="true"; // make div editable
    tokenamountlist.style.whiteSpace ="pre"; 
    if(tokenamountlist.innerHTML == "Insert here...")
        tokenamountlist.addEventListener("click", tokenamountlist.innerHTML(""));

}