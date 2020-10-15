 
 import {getElement,loadScriptAsync,ForAllElements,setElementVal,getElementVal,DomList,LinkVisible,subscribe} from '../lib/koiosf_util.mjs';
 import {carrouselwait} from './sync_swipe.mjs';
 import {SwitchPage} from '../genhtml/startgen.mjs'
 import {Login,getUserAddress,getProfileName,getProfileImage,getProfile} from '../viewer_figma/koiosf_login.mjs';


var globaldb;
var globalipfs;
var globaladr="unknown"
const globalserverid='QmaXQNNLvMo6vNYuwxD86AxNx757FoUJ3qaDoQ58PY2bxz' 
var descriptions=new DomList('descriptioncontainer','scr_offerings');     
var alloptionsset={}
var selectlist1=new DomList('selectblock',"selectlist1",'scr_addjob');
var selectlist2=new DomList('selectblock',"selectlist2",'scr_addjob');
var globalavailableofferings=[];     
var globalmyofferings=0   
var globalsend=0;
var globalliked=0;
var globaltoswipe=0;
var globaldisliked=0;
var cardlistswipe=new DomList('card','scr_swipe');    

//var cardlistsync=new DomList('card','scr_sync');    
 
function log(logstr) {   
    getElement("logboxcontent").innerHTML +=logstr+"\n";
}

//console.error=log;

async function GetChoiceItems(source) {            
    var f=await fetch(source)
    var Items=await f.json().catch(( e) => console.error(e));            
    //console.log(JSON.stringify(Items))
    return Items;    
}            

function Select(e) {
    var ds=e.target.parentNode.dataset
    
    console.log(ds)
    var fselected=!(ds.selected=="false")
    console.log(fselected);
    ds.selected=!fselected
    descriptions.FilterDataset(ds.type,ds.name,!fselected,true)         //toggle
    console.log(ds)
}    
   
function CreateDropdown(location,list,listname) {    
    console.log("In CreateDropdown");
    var select = document.createElement("select");
    select.size=3
    select.multiple=true;
    for (var i=0;i<list.length;i++) {        
        var option = document.createElement("option");        
        option.innerHTML=option.value=list[i]
        select.appendChild(option);     
    }
    var domidloc=getElement(location)
    domidloc.appendChild(select);
    console.log(domidloc);
    select.addEventListener("change", function() {   
        console.log('You selected: ', this.value,listname);
        console.log(this.options);
        if (!alloptionsset[listname]) alloptionsset[listname]={}
        for (i=0;i<this.options.length;i++) {            
           // console.log(`${listname} ${this.options[i].value} ${this.options[i].selected}`)
            alloptionsset[listname][this.options[i].value]=this.options[i].selected
        }
        
       //  if (value) 
         //   alloptionsset[listname]=value
        //else
          //  delete alloptionsset[listname]
        
        if (listname=="area") {
            SetupFields(this.value,selectlist2)
        }       
  
        ShowProfile(getProfileInfo(),"line1","card","scr_addjob")
        ShowSettingsInCard(alloptionsset,"scr_addjob")
    });
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function ShowProfile(profile,screenlocation1,screenlocation2,screenlocation3) {    
    var str1=""    
    for (var i in profile) {
        switch (i) {
            case "employer":
            case "location":
            case "name":
            case "website":
                str1 += `<b>${capitalizeFirstLetter(i)}:</b> ${profile[i]}<br>`
                break;
        }
    }
    setElementVal(getElement(screenlocation1,screenlocation2,screenlocation3),str1)
}

function ShowSettingsInCard(options,screenlocation1) {    

 for (var i=1;i<=17;i++)
        getElement(`sdg${i}`,"sdg_palette",screenlocation1).style.display="none"


    var str2=""
    for (var i in options) {    
        switch (i) {
            case "sdg": 
                for (var j in options[i]) { 
                    var goal=j.split(":")[0];
                    var domid=getElement(goal,"sdg_palette",screenlocation)
                    domid.style.display=options[i][j]?"block":"none"
                }
                break;                
            default:
                var sep="";str2 += `<b>${capitalizeFirstLetter(i)}:</b> `
                for (var j in options[i]) { 
                    if (options[i][j]) {
                        str2 +=`${sep}${j}`;
                        sep =", ";
                    }
                }
                str2 += "<br>"
        }
    }                    
    setElementVal("line2",str2,"card",screenlocation1);
}   

function ScrAddJobMadeVisible() {
    
    ShowProfile(getProfileInfo(),"line1","card","scr_addjob")
    ShowSettingsInCard(alloptionsset,"scr_addjob")
 
}    

function ScrApplyJobMadeVisible() {
    ShowProfile(getProfileInfo(),"line1","myinfo","scr_applyjob")
    var show=0
      for (var i=0;i<globalavailableofferings.length;i++) {
          if (globalavailableofferings[i].status !="Y") continue; // only show the swiped ones
        
              ShowProfile(globalavailableofferings[i].profile,"line1","card","scr_applyjob")
              ShowSettingsInCard(globalavailableofferings[i].options,"scr_applyjob")
              
              SetupField(getElement("line2","motivation","scr_applyjob"))
    
          show++
          break; // only show 1
        
        }
        if (!show) {
           console.log("Ready applying");
           SwitchPage("close");//close the popup
        }
    
   
}    
 
 
function SetupField(id) {
    let params = (new URL(document.location)).searchParams;
    let idvalue= params.get(id); 
    var target=getElement(id)    
    target.contentEditable="true"; // make div editable
    //target.style.whiteSpace = "pre"; //werkt goed in combi met innerText
    
    target.style.whiteSpace = "pre-line"; //werkt goed in combi met innerText
    target.style.wordWrap = "break-word";  
    
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
        
 
 
 
 
async function SetupFields(filename,selectlist) {
    SetupField("name")               
    selectlist.EmptyList()

    var jobinfo=await GetChoiceItems(`https://gpersoon.com/koios/lib/sync/${filename}.json`);
    console.log(jobinfo);
    
    for (var i in jobinfo) {
        console.log(i);
        var selectblock=selectlist.AddListItem()
        setElementVal("selectname",i,selectblock)
        var selectvalues=getElement("selectvalues",selectblock)
        CreateDropdown(selectvalues,jobinfo[i],i);
    }    
}    
        
function SetupButtons() {
    getElement("SENDBUTTON").addEventListener("click", Send);
    getElement("SEARCH").addEventListener("click", UpdateRecordList);
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
    globalipfs = await IPFS.create(
    
    { preload: { enabled: false} } // otherwise keeps on loading lots of data from node*.preload.ipfs.io // see https://discuss.ipfs.io/t/how-do-i-host-my-own-preload-nodes/8583
    
    ) //{EXPERIMENTAL: { pubsub: true } }, only for ipfs < 0.38 ???
    const orbitdb = await OrbitDB.createInstance(globalipfs,{ directory: './access_db_httpclient_diskstation' })   
    var accessController = { write: ["*"] }  

    globaldb = await orbitdb.docs('koiostest',{
        accessController:accessController,   
        meta: { name: 'test koios via diskstation' }// results in a different orbit database address
    })    
    const address = globaldb.address;    
    await globaldb.load();
    UpdateRecordList()
    var dbeventsonreplicated=false;
    globaldb.events.on('replicate.progress', (address, hash, entry, progress, have) => {
        console.log(progress, have)
          getElement("loaded").innerHTML=`loaded: ${(parseFloat(progress) /  parseFloat(have) * 100).toFixed(0)}%`;
        if (progress >= have) { // then we have the initial batch
             if (!dbeventsonreplicated) {
                dbeventsonreplicated=true;
        globaldb.events.on('replicated', UpdateRecordList)
               }
        }
    } )
    globaldb.events.on('replicated', UpdateRecordList)            
    globaldb.events.on('write', (address, entry, heads) => {
        console.log('write', address, entry, heads);
        UpdateRecordList()
    } )
    Connect();
}    

 


function getProfileInfo() {
    var profile=getProfile()
    if (!profile) {
        profile={}
        profile.name="Fill in via 3box"
        profile.employer="Fill in via 3box"
        profile.location="Fill in via 3box"
        profile.school="Fill in via 3box"
        profile.website="Fill in via 3box"
        profile.job="Fill in via 3box"
    }
    return profile
}    

function ShowMyDetails() {
    var profile=getProfileInfo()
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

function EthereumChanged() {
    console.log("EthereumChanged")
    globaladr=getUserAddress() 
    if (!globaladr) globaladr="unknown" 
    UpdateRecordList()
}
        
async function main() {
    console.log("Main");           
   // await loadScriptAsync("https://gpersoon.com/koios/lib/lib/ipfs0.46.1.min.js")     // https://unpkg.com/ipfs@0.46.0/dist/index.min.js
   
    await loadScriptAsync("https://gpersoon.com/koios/lib/lib/ipfs0.50.2min.js")     // https://unpkg.com/ipfs@0.50.2/dist/index.min.js
   
    //await loadScriptAsync("https://gpersoon.com/koios/lib/lib/orbitdb0.24.1.min.js"); // https://www.unpkg.com/orbit-db@0.24.1/dist/orbitdb.min.js
         await loadScriptAsync("https://gpersoon.com/koios/lib/lib/orbitdb26.min.js")    // clone from github & npm run build:dist

    subscribe("ethereumchanged",EthereumChanged)

    LinkVisible("scr_addjob"  ,ScrAddJobMadeVisible)    
    LinkVisible("scr_applyjob"  ,ScrApplyJobMadeVisible)    
    
    
    await SetupFields("jobinfo",selectlist1)
    await SetupFields("financial",selectlist2)
    SetupButtons() 
    await SetupOrbitdb()
    
    await Login() // should be suffiently initiated
    globaladr=getUserAddress()         
    
    if (!globaladr) globaladr="unknown" 
    ShowMyDetails()

    
}
        


/*
function ConvertToText() {
     var line=""
            for (var j in result[i]) {
                if (j=="_id") continue; // ignore
                if (typeof(result[i][j])=="object") {// has subcategories
                    line +=`<br>${j}: `;
                    for (var k in result[i][j]) {                        
                        if (typeof(result[i][j][k])=="object") {// has subcategories
                            line +=`<br>${k}: `;
                            for (var l in result[i][j][k]) {
                                line +=`${l}, `
                            }
                            line +="<br>";
                        }
                        else                  
                            line +=`${k}: ${result[i][j][k]} <br>`
                    }
                    line +="<br>";
                }
                else                  
                    line +=`${j}: ${result[i][j]} <br>`
            }            
            line +="<br>"
            
}
*/

        
async function UpdateRecordList() {
    console.log(`In UpdateRecordList globaladr=${globaladr}`)
    globalavailableofferings=[];             
    globalliked=0
    globaldisliked=0
    globaltoswipe=0
    globalsend=0
    globalmyofferings=0        
    
    globalavailableofferings = await globaldb.query(() => true); // get all records
    console.log(globalavailableofferings);                
    for (var i=0;i<globalavailableofferings.length;i++) {     
        var key=`sync-${globaladr}-${globalavailableofferings[i]._id}`    
        var status=localStorage.getItem(key) // remember status per ethereum user

    console.log(`UpdateRecordList i=${i} key=${key} status=${status}`);

        if ((globalavailableofferings[i]._id).includes(globaladr)) 
            status="M"                            
        switch (status) {
               case "Y": globalliked++  ; break
               case "N": globaldisliked++;break;
               case "S": globalsend++;break
               case "M": globalmyofferings++;break
               default:
                    globaltoswipe++; break
        }
        
        globalavailableofferings[i].status=status
        console.log(globalavailableofferings[i]);
        
    }
    UpdateStatusFields() 
    
}          
      
function UpdateStatusFields() {
    getElement("entries").innerHTML=`entries: ${globalavailableofferings.length}`;        
    getElement("APPLY_JOB").innerHTML=`APPLY JOB: ${globalliked}`;
    getElement("SWIPE").innerHTML=`SWIPE: ${globaltoswipe}`;  
    getElement("sendstatus").innerHTML=`send: ${globalsend}`;      
    getElement("SUPPLIED_JOBS").innerHTML=`SUPPLIED JOBS: ${globalmyofferings}`;    
    getElement("disliked").innerHTML=`disliked: ${globaldisliked}`;      
}    
      
        

    
    
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
    UpdateRecordList()
}  
    
    
function callbackselected(fselected,domid) {
    console.log(`Selected: ${fselected}`);
    console.log(domid.id)
    localStorage.setItem(`sync-${globaladr}-${domid.id}`, fselected?"Y":"N")
    if (fselected) {
        globalliked++
          UpdateStatusFields() 
    }
    globaltoswipe--;
}    
        
async function Swipe() {
    console.log("In function Swipe");
    
    cardlistswipe.EmptyList()    
    console.log("domlist")
    for (var i=0;i<globalavailableofferings.length;i++) {        
    
        switch (globalavailableofferings[i].status) {
            case "Y": continue;
            case "N": continue;
        }
    
        var card=cardlistswipe.AddListItem()        
        setElementVal("Cardheader",`Card #${i+1}`,card)        
  
        
        ShowProfile(globalavailableofferings[i].profile,"line1",card)
        ShowSettingsInCard(globalavailableofferings[i].options,card)
        
        getElement("thumbsup",card).style.display="none"        
        card.id=globalavailableofferings[i]._id;
    }
   await carrouselwait(getElement('cardcontainer'),"card",callbackselected)
   console.log("Ready swiping");
   SwitchPage("close");//close the popup
   UpdateRecordList()
}
    
    

     
async function Send() {
    console.log("In function Send()");
    
    
    var sendprofile={}
    var profile=getProfileInfo()        
    for (var i in profile) {
        switch (i) {
            case "employer": 
            case "location":
            case "name":
            case "website":
                sendprofile[i]=profile[i];break;
                break;
        }
    }


    var sendoptions={}
    for (var i in alloptionsset) {            
        sendoptions[i]=alloptionsset[i];
        for (var j in sendoptions[i]) 
            if (!sendoptions[i][j]) 
                delete sendoptions[i][j] // save space
        if (sendoptions[i]=={})
            delete sendoptions[i]
    }
    
    var tosend={}
    tosend._id=`${globaladr}-${new Date().getTime()}`
    tosend.profile=sendprofile
    tosend.options=sendoptions
    console.log("tosend")
    console.log(tosend)
    var h1=await globaldb.put(tosend)   
    UpdateRecordList()
}        
        
async function Delete() {
    const result = await globaldb.query(() => true); // get all records
    for (var i=0;i<result.length;i++)
           await globaldb.del(result[i]._id)
    //UpdateRecordList();       
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


        
window.onload=main()        
   //document.addEventListener("DOMContentLoaded", main)


