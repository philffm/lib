import {DomList,getElement,FitOneLine} from '../lib/koiosf_util.mjs';

let useraddresses;
let tokenamount;
var AddressList = new DomList("transfertokensentry");

await onLoad();

async function onLoad() {
    var addresslist=getElement("transferuseraddresstext")    
    addresslist.contentEditable="true"; // make div editable
    addresslist.style.whiteSpace ="pre"; 

    var tokenamountlist=getElement("transfertokencounttext")    
    tokenamountlist.contentEditable="true"; // make div editable
    tokenamountlist.style.whiteSpace ="pre"; 
}