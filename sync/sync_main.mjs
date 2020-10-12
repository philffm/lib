 
 import {getElement,loadScriptAsync,ForAllElements,setElementVal,getElementVal,DomList} from '../lib/koiosf_util.mjs';
 import {carrouselwait} from './sync_swipe.mjs';
 import {SwitchPage} from '../genhtml/startgen.mjs'
 import {Login,getUserAddress,getProfileName,getProfileImage,getProfile} from '../viewer_figma/koiosf_login.mjs';
 
 
function log(logstr) {   
    getElement("logboxcontent").innerHTML +=logstr+"\n";
}

console.error=log;


var globaldb;
var globalipfs;
const globalserverid='QmaXQNNLvMo6vNYuwxD86AxNx757FoUJ3qaDoQ58PY2bxz'

async function GetChoiceItems(source) {            
    var f=await fetch(source)
    var Items=await f.json();            
    //console.log(JSON.stringify(Items))
    return Items;    
}            


var descriptions=new DomList('descriptioncontainer','scr_offerings');     

function Select(e) {
    var ds=e.target.parentNode.dataset
    
    console.log(ds)
    var fselected=!(ds.selected=="false")
    console.log(fselected);
    ds.selected=!fselected
    descriptions.FilterDataset(ds.type,ds.name,!fselected,true)         //toggle
    console.log(ds)
}    

async function SetupFields() {
    
     
    
    SetupField("name")               

    var beroepsproducten=await GetChoiceItems("https://gpersoon.com/koios/lib/sync/beroepsproducten.json");
    console.log(beroepsproducten);
    var types=["type","outcome"]; // "description"
    
    var buttonlists=new DomList('buttonlist','scr_offerings');
    
 
    var overview={}
    for (var i=0;i<beroepsproducten.length;i++) {        
        var description=descriptions.AddListItem()
        var str=beroepsproducten[i].description
        for (var j=0;j<types.length;j++) {
            var currenttype=types[j]
            var val=beroepsproducten[i][currenttype]
            if (!overview[types[j]]) overview[currenttype]={};
            overview[currenttype][val]=true;            // build a list of the different types used
            description.dataset[currenttype] = val
            str += " ("+val+") "
        }
        
        getElement("description",description).innerHTML=str
        
    }   
    var buttonlist={}
    for (var j=0;j<types.length;j++) {
        var thisbuttonlist=buttonlists.AddListItem()
        buttonlist[types[j]]=new DomList("button",thisbuttonlist);
        for (var k in overview[types[j]]) {    // create the buttons
            var button=buttonlist[types[j]].AddListItem()
            setElementVal("text",k,button);
            button.addEventListener("click", Select);
            button.dataset.name=k
            button.dataset.type=types[j]
        }        
   }
     
    
    
    //descriptions.HideAll()
    
        


        setElementVal("offering-type",`
            <select id="idoffering-type" multiple size = "2" onchange="getMultipleSelected(this.id)">
                    <option value="none">--select--</option> 
                    <option value="Advies">Advies</option>
                    <option value="Handeling">Handeling</option>
                    <option value="Onderzoek">Onderzoek</option>
                    <option value="Ontwerp">Ontwerp</option>   
                    </select>
            `)

        setElementVal("offering-product",`
        <select id="idoffering-product" multiple>
                    <option value="none">--select--</option> 
                    <option value="Bedrijfswaardering">Bedrijfswaardering</option>
                    <option value="Adviesgesprek">Adviesgesprek</option>
                    <option value="Benchmarkonderzoek">Benchmarkonderzoek</option>
                    <option value="Dashboard">Dashboard</option>   
                    </select>
        `)


        setElementVal("search-type",`
        <select id="idsearch-type" multiple>
                    <option value="none">--select--</option> 
                    <option value="Advies">Advies</option>
                    <option value="Handeling">Handeling</option>
                    <option value="Onderzoek">Onderzoek</option>
                    <option value="Ontwerp">Ontwerp</option>   
                    </select>
        `)

        setElementVal("search-product",`
        <select id="idsearch-product" multiple>
                    <option value="none">--select--</option> 
                    <option value="Bedrijfswaardering">Bedrijfswaardering</option>
                    <option value="Adviesgesprek">Adviesgesprek</option>
                    <option value="Benchmarkonderzoek">Benchmarkonderzoek</option>
                    <option value="Dashboard">Dashboard</option>   
                    </select>
        `)

 getElement("offeringfreetext").contentEditable="true"; // make div editable
 getElement("searchfreetext").contentEditable="true"; // make div editable

    
}    
        
function SetupButtons() {
    getElement("SEND").addEventListener("click", Send);
    getElement("SEARCH").addEventListener("click", ShowRecords);
    getElement("SWIPE").addEventListener("click", Swipe);
    getElement("DELETE").addEventListener("click", Delete);
    getElement("PEERS").addEventListener("click", Peers);
    getElement("CONNECT").addEventListener("click", Connect);
    getElement("DISCONNECT").addEventListener("click", Disconnect);
    getElement("INFO").addEventListener("click", Pubsubinfo);
    getElement("CLEAR").addEventListener("click", Clear);
}

async function SetupOrbitdb() {
    //window.LOG='Verbose' // 'debug'
    var IPFS=Ipfs; // for the browser version    
    globalipfs = await IPFS.create() //{EXPERIMENTAL: { pubsub: true } } ???
    const orbitdb = await OrbitDB.createInstance(globalipfs,{ directory: './access_db_httpclient_diskstation' })   
    var accessController = { write: ["*"] }  

    globaldb = await orbitdb.docs('koiostest',{
        accessController:accessController,   
        meta: { name: 'test koios via diskstation' }// results in a different orbit database address
    })    
    const address = globaldb.address;    
    await globaldb.load();
    ShowRecords()
    var dbeventsonreplicated=false;
    globaldb.events.on('replicate.progress', (address, hash, entry, progress, have) => {
        console.log(progress, have)
          getElement("loaded").innerHTML=`loaded: ${(parseFloat(progress) /  parseFloat(have) * 100).toFixed(0)}%`;
        if (progress >= have) { // then we have the initial batch
             if (!dbeventsonreplicated) {
                dbeventsonreplicated=true;
        globaldb.events.on('replicated', ShowRecords)
               }
        }
    } )
    globaldb.events.on('replicated', ShowRecords)            
    globaldb.events.on('write', (address, entry, heads) => {
        console.log('write', address, entry, heads);
        ShowRecords()
    } )
    Connect();
}    

async function SetupMetamask() {
    /*
    console.log(window.ethereum);    
    if (window.ethereum) {
        var accounts=await ethereum.request({ method: 'eth_requestAccounts' })
        console.log(accounts);
        

        var encryptionPublicKey=await ethereum.request({
            method: 'eth_getEncryptionPublicKey',
            params: [accounts[0]], // you must have access to the specified account
        })
        console.log(encryptionPublicKey);    
    }
    */
}    


function ShowMyDetails() {
    var profile=getProfile()
    console.log(profile);
    if (profile) {
        setElementVal("myname",     profile.name,"scr_mydetails")
        setElementVal("employer",   profile.employer,"scr_mydetails")
        setElementVal("location",   profile.location,"scr_mydetails")
        setElementVal("school",     profile.school,"scr_mydetails")
        setElementVal("website",    profile.website,"scr_mydetails")
        setElementVal("job",        profile.job,"scr_mydetails")
    }    
    
    
    
  /*
    proof_did: "eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJpYXQiOjE1OTgwMTY2MjYsImlzcyI6ImRpZDozOmJhZnlyZWliYWZlbmZwMmR2bWFwb3Z3ZjZ1aXJ1ZndrcWZtamZqeHJmdm5hc3VlaGM0M3kycXY3YzJ1In0.lfUy5R00G0V9TcmRAkVpHSUMoQlvFs7YHSf2Bx_jVxiSveWWxkPiSVySX55ksT9_gK0IPtblH6pvawQN9SDy3g"
    proof_github: "https://gist.githubusercontent.com/gpersoon/6dc26e70cfe3976e00a6e95e3ac6f9ac/raw/15412530c27fa0c43493a95290a572f95331f4f9/3box"
    proof_twitter: "eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJpYXQiOjE2MDIwNjIxNTMsInN1YiI6ImRpZDozOmJhZnlyZWliYWZlbmZwMmR2bWFwb3Z3ZjZ1aXJ1ZndrcWZtamZqeHJmdm5hc3VlaGM0M3kycXY3YzJ1IiwiY2xhaW0iOnsidHdpdHRlcl9oYW5kbGUiOiJncGVyc29vbiIsInR3aXR0ZXJfcHJvb2YiOiJodHRwczovL3R3aXR0ZXIuY29tL2dwZXJzb29uL3N0YXR1cy8xMzEzNzY5OTY0MTg5NDk1Mjk2In0sImlzcyI6ImRpZDpodHRwczp2ZXJpZmljYXRpb25zLjNib3guaW8ifQ.5jf0to4pGS10JkCEeyRJpJ969TI6gSHVSl-fDZjC6rPMFn1XRWXbfi6-zoj9QpNYL-DJwGNOmgqTc0heH6oEPg"
    */
}

        
async function main() {
    console.log("Main");           
    await loadScriptAsync("https://gpersoon.com/koios/lib/lib/ipfs0.46.1.min.js")     // https://unpkg.com/ipfs@0.46.0/dist/index.min.js
    await loadScriptAsync("https://gpersoon.com/koios/lib/lib/orbitdb0.24.1.min.js"); // https://www.unpkg.com/orbit-db@0.24.1/dist/orbitdb.min.js
    //     await loadScriptAsync("https://gpersoon.com/koios/lib/lib/orbitdb26.min.js")    // clone from github & npm run build:dist
    
    SetupMetamask() // runs in parallel
    await SetupFields()
    SetupButtons() 
    await SetupOrbitdb()
    
    await Login() // should be suffiently initiated
    
    ShowMyDetails()
 
    
}
        
var globalavailableofferings=[];     
var globalmyofferings=0   
        
async function ShowRecords() {
   //     console.log("In ShowRecords");
        globalavailableofferings=[];     
        globalmyofferings=0
        var name=getElementVal("name")        
        var allofferings=""
        var myofferings=""
        var mymatches=""        
        var searchfreetext=getElementVal("searchfreetext")
       // console.log(searchfreetext);
        const result = await globaldb.query(() => true); // get all records
        console.log(result);        
        
        //log(`Number of entries: ${result.length}`)   
       // str=JSON.stringify(result)
        
        for (var i=0;i<result.length;i++) {
            var line=""
            ForAllElements(result[i],undefined,(id,val)=>{ 
                if (id != "_id")
                    line +=`${id}: ${val} `
            } )
            line +="<br>"
            if (result[i].name==name) {
                myofferings+=line;
                globalmyofferings++;
                
            }
            allofferings+=line; 
          
            if (result[i].freetext && result[i].freetext.includes(searchfreetext) && (result[i].name!=name)) { // exclude my own offerings
                mymatches+=line;
                globalavailableofferings.push(result[i]);
            }
        }
        getElement("entries").innerHTML=`entries: ${globalavailableofferings.length}`;
        getElement("SUPPLIED JOBS").innerHTML=`SUPPLIED JOBS: ${globalmyofferings}`;
        setElementVal("allofferings",allofferings);
        setElementVal("myofferings",myofferings);
        setElementVal("mymatches",mymatches);
      //  console.log(globalavailableofferings)
        Liked()
}          
        
        
var cardlistswipe=new DomList('card','scr_swipe');    

var cardlistsync=new DomList('card','scr_sync');    
    
    
async function Clear() {
console.log("In Clear")
//console.log(localStorage);
var keys = Object.keys(localStorage);
        if (keys.length > 0) {
            for (var j=0;j< keys.length;j++) {
                var id=keys[j]
                 if (id.includes("sync")) {
                    console.log(id)
                    localStorage.removeItem(id);
                 }   
            }
        } 
    Liked()
}  
    
    
function callbackselected(fselected,domid) {
    console.log(`Selected: ${fselected}`);
    console.log(domid.id)
    localStorage.setItem(`sync-${domid.id}`, fselected?"Y":"N")
    if (fselected) {
        globalliked++
        ShowGlobalLiked()
    }
    globaltoswipe--;
}    
        
async function Swipe() {
    console.log("In function Swipe");
    
    cardlistswipe.EmptyList()    
    console.log("domlist")
    for (var i=0;i<globalavailableofferings.length;i++) {        
        var item=globalavailableofferings[i]    
        var idstatus=localStorage.getItem(`sync-${item._id}`)
        if (idstatus) // already swiped before
            continue;
    
        var card=cardlistswipe.AddListItem()
        
        setElementVal("Cardheader",`Card #${i+1}`,card)        
        setElementVal("field1",item.name,card)
        setElementVal("field2",item.freetext,card)
        setElementVal("field3",item.productsearch,card)
        setElementVal("field4",item.typesearch,card)
        getElement("thumbsup",card).style.display="none"
        card.id=item._id;
    }
   await carrouselwait(getElement('cardcontainer'),"card",callbackselected)
   console.log("Ready swiping");
   SwitchPage("close");//close the popup
   Liked()
}
    
var globalliked=0;
var globaltoswipe=0;
    
async function Liked() {
    console.log("In function Liked");
    
    cardlistsync.EmptyList()    
    console.log("domlist")
    globalliked=0
    globaltoswipe=0
    for (var i=0;i<globalavailableofferings.length;i++) {        
        var item=globalavailableofferings[i]    
        var idstatus=localStorage.getItem(`sync-${item._id}`)
        
        switch (idstatus) {
            case "Y":
                    var card=cardlistsync.AddListItem()        
                    setElementVal("Cardheader",`Card #${i+1}`,card)        
                    setElementVal("field1",item.name,card)
                    setElementVal("field2",item.freetext,card)
                    setElementVal("field3",item.productsearch,card)
                    setElementVal("field4",item.typesearch,card)
                    card.id=item._id;
                    globalliked++
                    break;
            case "N": break;
            default: globaltoswipe++
        }    
    }  
    ShowGlobalLiked()
    
}

function ShowGlobalLiked() {
    getElement("liked").innerHTML=`liked: ${globalliked}`;  
    getElement("SWIPE").innerHTML=`SWIPE: ${globaltoswipe}`;  
}



     
async function Send() {
    console.log("In function Send()");
    var name=getElementVal("name")
    
    
    
    var e1 = getElement("idoffering-type")
    console.log(e1)
    console.log(e1.selectedIndex)
    console.log(e1.options)
    var typesearch = e1.options[e1.selectedIndex].value;
    console.log(typesearch);
    
    
    var e2 = getElement("idoffering-product");
    console.log(e2.selectedIndex)
    console.log(e2.options)
    var productsearch = e2.options[e2.selectedIndex].value;
    console.log(productsearch);
    
    var offeringfreetext=getElementVal("offeringfreetext");
        
    var h1=await globaldb.put({ _id: new Date().getTime(), name:name, typesearch:typesearch, productsearch:productsearch,freetext:offeringfreetext })   
    
}        
        
async function Delete() {
    const result = await globaldb.query(() => true); // get all records
    for (var i=0;i<result.length;i++)
           await globaldb.del(result[i]._id)
    //ShowRecords();       
}        

async function Peers() {
    var peers=await globalipfs.swarm.peers()
   console.log()
   var fconnectedtoserver=false;
   for (var i=0;i<peers.length;i++) {        
        var adr=peers[i].addr.toString();
        console.log(adr);
        if (adr.includes(globalserverid)) fconnectedtoserver=true;
   } 
   console.log(`Connected to server: ${fconnectedtoserver}`);
    getElement("connected").innerHTML=fconnectedtoserver;
   
}

async function Connect() {
    const con='/dns4/gpersoon.com/tcp/4004/wss/p2p/'+globalserverid;
    log(`Connect ${con}`)
    await globalipfs.swarm.connect(con).catch(console.log); // put the address of the create_db.js here
    //await Peers();
}

async function Disconnect() {
    const con='/dns4/gpersoon.com/tcp/4004/wss/p2p/'+globalserverid;
    log(`Disconnect ${con}`)
    await globalipfs.swarm.disconnect(con,{timeout:5000}).catch(console.log); // put the address of the create_db.js here
    await Peers();
}

async function Pubsubinfo() {
    log(`ipfs id=${(await globalipfs.id()).id}`);
    var res=await globalipfs.pubsub.ls()
    console.log(res);
    for (var i=0;i<res.length;i++) {        
        var adr=res[i].toString();
        log(adr);
    }

}


function SetupField(id) {
    let params = (new URL(document.location)).searchParams;
    let idvalue= params.get(id); 
    var target=getElement(id)    
    target.contentEditable="true"; // make div editable
    target.style.whiteSpace = "pre"; //werkt goed in combi met innerText
    
    if (!idvalue)
        idvalue=localStorage.getItem(id); 
    if (!idvalue) 
            idvalue = target.innerHTML   
    target.innerHTML=idvalue    
    target.addEventListener('input',SaveTxt , true); // save the notes    
    
    function SaveTxt(txt) { 
        localStorage.setItem(id, txt.target.innerText);
        console.log("input");
        console.log(txt.target.innerText); 
    }
}
        
        
window.onload=main()        
   //document.addEventListener("DOMContentLoaded", main)


