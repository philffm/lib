 
 import {getElement,loadScriptAsync,ForAllElements,setElementVal,getElementVal,DomList,LinkVisible,subscribe} from '../lib/koiosf_util.mjs';
 import {carrouselwait} from './sync_swipe.mjs';
 import {SwitchPage} from '../genhtml/startgen.mjs'
 import {Login,getUserAddress,getProfileName,getProfileImage,getProfile,getBox} from '../viewer_figma/koiosf_login.mjs';

var globalbox;
var globaldb;
var globalipfs;
var globaladr="unknown"
const globalserverid='QmaXQNNLvMo6vNYuwxD86AxNx757FoUJ3qaDoQ58PY2bxz' 
var descriptions=new DomList('descriptioncontainer','scr_offerings');     
var alloptionsset={}
var selectlist1=new DomList('selectblock',"selectlist1",'scr_addjob');
var selectlist2=new DomList('selectblock',"selectlist2",'scr_addjob');
var globalavailableofferings=[];     
var globalsupplied=0   

var globalliked=0;
var globaltoswipe=0;
var globaldisliked=0;
var cardlistswipe=new DomList('card','scr_swipe');    
const CRLF="%0D%0A"
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
    //console.log("In CreateDropdown");
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
    //console.log(domidloc);
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
    var strnohtml=""
    for (var i in profile) {
        str1 += `<b>${capitalizeFirstLetter(i)}:</b> ${profile[i]}<br>`  
        strnohtml +=`${capitalizeFirstLetter(i)}: ${profile[i]}`
        strnohtml +=CRLF
    }
    if (screenlocation1)
        setElementVal(getElement(screenlocation1,screenlocation2,screenlocation3),str1)
    return strnohtml;
}

function ShowSettingsInCard(options,screenlocation1) {    
    var sep=""
    var str2=""
   var strnohtml=""
    for (var i=1;i<=17;i++) {
          if (screenlocation1)
                getElement(`sdg${i}`,"sdg_palette",screenlocation1).style.display="none"
    }
    var sdg=options["sdg"]
    console.log(sdg)
    if (sdg)
        for (var j in sdg) { 
            var goal=j.split(":")[0];
            var domid=getElement(goal,"sdg_palette",screenlocation1)
            domid.style.display=sdg[j]?"block":"none"
        }
    
    for (var i in options) {
        sep="";
        str2 += `<b>${capitalizeFirstLetter(i)}:</b> `
        strnohtml += `${capitalizeFirstLetter(i)}: `
        
        for (var j in options[i]) { 
            if (options[i][j]) {
                str2      +=`${sep}${j}`;
                strnohtml +=`${sep}${j}`;
                sep =", ";
            }
        }
        str2 += "<br>"
        strnohtml +=CRLF
    }

    if (screenlocation1)              
        setElementVal("line2",str2,screenlocation1);
    return strnohtml;
}   

function ScrAddJobMadeVisible() {
    
    ShowProfile(getProfileInfo(),"line1","card","scr_addjob")
    ShowSettingsInCard(alloptionsset,"scr_addjob")
 
}    


function ScrBrowseCardsMadeVisible() {
    ShowProfile(getProfileInfo(),"line1","myinfo","scr_browsecards")
    
    SetupEditField(`sync-${globaladr}-motivation`,"line3","motivation","scr_browsecards")
    getElement("left","scr_browsecards").addEventListener('click',CardLeft)  
    getElement("right","scr_browsecards").addEventListener('click',CardRight)        
    globalcurrentcard=0
    ShowCard()
    UpdateButtons()
}    

function ShowCard() {
    console.log(`In ShowCard ${globalavailableofferings.length} ${globalcurrentcard}`)
    console.log(globalavailableofferings[globalcurrentcard]);
    if (globalavailableofferings.length >0 && globalavailableofferings[globalcurrentcard]) {
        console.log(`In ShowCard ${globalcurrentcard}`)
        ShowProfile(globalavailableofferings[globalcurrentcard].profile,"line1","card","scr_browsecards")
        ShowSettingsInCard(globalavailableofferings[globalcurrentcard].options,"scr_browsecards")
    } else {
        console.log("No cards left")
        SwitchPage("close");//close the popup
    }
}

var globalcurrentcard=0
 function MoveCard(fForward) {
        if (fForward) { globalcurrentcard++;if (globalcurrentcard >=globalavailableofferings.length) globalcurrentcard =globalavailableofferings.length-1;}
        else          { globalcurrentcard--;if (globalcurrentcard <0) globalcurrentcard =0;}
        
    }
   
function isFirst() { return globalcurrentcard<=0 }
function isLast()  { return globalcurrentcard>=globalavailableofferings.length-1 }

function UpdateButtons() {
	getElement("left","scr_browsecards").style.display=isFirst()?"none":"block";
	getElement("right","scr_browsecards").style.display=isLast()?"none":"block";
    
    
        var statustext=""    
        if (globalavailableofferings.length >0) {
            switch (globalavailableofferings[globalcurrentcard].status) {
                   case "Y": statustext="Liked"; break
                   case "N": statustext="Disliked";break;
                   case "S": statustext="Supplied";break
                   case "A": statustext="Applied";break
                   case "O": statustext="Out of scope";break
                   default:
                        statustext="To swipe"; break
            }    
            setElementVal("card_header",`Card #${globalcurrentcard+1} Status: ${statustext}`)
            
            
            var status=globalavailableofferings[globalcurrentcard].status
            getElement("DELETEBUTTON").style.display=status=="S"?"block":"none" // can only delete if owner
            getElement("APPLYBUTTON").style.display=(status=="S" || status=="A")?"none":"block" // cannot apply when owner, and also not when already applied
        }
    
}	


function CardLeft() {  
    MoveCard(false);
    ShowCard()
	UpdateButtons()
}

function CardRight() {
    MoveCard(true);
    ShowCard()
	UpdateButtons()
}    
    
    
function UpdateStatusFields() {
    setElementVal("SWIPE",         `START SWIPING: ${globaltoswipe}`);
    setElementVal("to_swipe",       `to swipe: ${globaltoswipe}`);
    setElementVal("to_apply",       `to apply: ${globalliked}`);    
    setElementVal("applied_for",     `applied for: ${globalapplied}`);
    setElementVal("supplied",       `supplied: ${globalsupplied}`);
    setElementVal("disliked",       `disliked: ${globaldisliked}`);    
    setElementVal("out_of_scope",   `out of scope: ${globaloutofscope}`);
    setElementVal("total_cards",    `total cards: ${globalavailableofferings.length}`);         
}    
      


async function DeleteCurrentCard() {
    console.log("In DeleteCurrentCard")
    if (globalavailableofferings[globalcurrentcard].status=="S") {// only if I supplied the card
        await Delete(globalavailableofferings[globalcurrentcard]._id)
        console.log("Deleted")         
        CardLeft()
        UpdateRecordList()
    }

}

       
function MailApplication() {
    console.log("MailApplication");
    console.log(globalavailableofferings[globalcurrentcard])

    var str=""
    var motivation=getElementVal("motivation")
    
 motivation=motivation.replace(/\n\r/g, CRLF)
 motivation=motivation.replace(/\r\n/g, CRLF)
 motivation=motivation.replace(/\r/g, CRLF)
 motivation=motivation.replace(/\n/g, CRLF)
    
    str +="I want to apply for the function:"+CRLF
    str +=ShowSettingsInCard(globalavailableofferings[globalcurrentcard].options)
    str +="_________________________________________________________________"+CRLF
    str +="Registered by:"+CRLF
    str +=ShowProfile(globalavailableofferings[globalcurrentcard].profile)
    str +="_________________________________________________________________"+CRLF    
    str +="My motivation is:"+CRLF
    str +=motivation+CRLF
    str +="_________________________________________________________________"+CRLF    
    str +="My details:"+CRLF
    str +=ShowProfile(getProfileInfo())
    str +="_________________________________________________________________"+CRLF    
    str +="Hoping for a quick answer"+CRLF    
    console.log(str)
     var href = "mailto:";
     href +=globalavailableofferings[globalcurrentcard].profile.mail    
     href += "?SUBJECT=Job application";
     href += "&BODY="+str
     console.log(href);
    window.open(href,"_blank"); 
    
    console.log(globalavailableofferings[globalcurrentcard].status)
    switch (globalavailableofferings[globalcurrentcard].status) {
        case "Y":globalliked--;break;
        case null: globaltoswipe--;break;
    }
    
    CurrentCardSetStatus("A");
    globalapplied++
    ShowCard()
	UpdateButtons()
    UpdateStatusFields()       
}


function CurrentCardSetStatus(status) {
    globalavailableofferings[globalcurrentcard].status=status  
    SetStatus(globalavailableofferings[globalcurrentcard]._id,status)
}
  

 
 
 async function ScrMyDetailsMadeVisible() {    
    var profileimage=getProfileImage()
    var domid=getElement("profileimage","scr_mydetails"); if (domid && profileimage) domid.src=profileimage
 
    var profile=getProfileInfo()
    console.log(profile);
    if (profile) {
        setElementVal("text",    profile.name,      "myname",   "scr_mydetails")
        setElementVal("text",    profile.employer,  "employer", "scr_mydetails")
        setElementVal("text",    profile.location,  "location", "scr_mydetails")
        setElementVal("text",    profile.school,    "school",   "scr_mydetails")
        setElementVal("text",    profile.website,   "website",  "scr_mydetails")
        setElementVal("text",    profile.job,       "job",      "scr_mydetails")
    }    
 
    //var lal=await globalbox.listAddressLinks()
    //console.log(lal)   
    
    
    //const spaceData = await globalbox.public.all()
    //console.log(spaceData);
    
  /*
    proof_did: "eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJpYXQiOjE1OTgwMTY2MjYsImlzcyI6ImRpZDozOmJhZnlyZWliYWZlbmZwMmR2bWFwb3Z3ZjZ1aXJ1ZndrcWZtamZqeHJmdm5hc3VlaGM0M3kycXY3YzJ1In0.lfUy5R00G0V9TcmRAkVpHSUMoQlvFs7YHSf2Bx_jVxiSveWWxkPiSVySX55ksT9_gK0IPtblH6pvawQN9SDy3g"
    proof_github: "https://gist.githubusercontent.com/gpersoon/6dc26e70cfe3976e00a6e95e3ac6f9ac/raw/15412530c27fa0c43493a95290a572f95331f4f9/3box"
    proof_twitter: "eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJpYXQiOjE2MDIwNjIxNTMsInN1YiI6ImRpZDozOmJhZnlyZWliYWZlbmZwMmR2bWFwb3Z3ZjZ1aXJ1ZndrcWZtamZqeHJmdm5hc3VlaGM0M3kycXY3YzJ1IiwiY2xhaW0iOnsidHdpdHRlcl9oYW5kbGUiOiJncGVyc29vbiIsInR3aXR0ZXJfcHJvb2YiOiJodHRwczovL3R3aXR0ZXIuY29tL2dwZXJzb29uL3N0YXR1cy8xMzEzNzY5OTY0MTg5NDk1Mjk2In0sImlzcyI6ImRpZDpodHRwczp2ZXJpZmljYXRpb25zLjNib3guaW8ifQ.5jf0to4pGS10JkCEeyRJpJ969TI6gSHVSl-fDZjC6rPMFn1XRWXbfi6-zoj9QpNYL-DJwGNOmgqTc0heH6oEPg"
    */
  
 SetupEditField(`sync-${globaladr}-mail`,"text","mail","scr_mydetails")
 SetupEditField(`sync-${globaladr}-phone`,"text","phone","scr_mydetails")
}   
 
 
function SetupEditField(key,id,loc1,loc2) {
    let params = (new URL(document.location)).searchParams;
    let idvalue= params.get(id); 
    var target=getElement(id,loc1,loc2)    
    target.contentEditable="true"; // make div editable
    //target.style.whiteSpace = "pre"; //werkt goed in combi met innerText
    
    target.style.whiteSpace = "pre-line"; //werkt goed in combi met innerText
    target.style.wordWrap = "break-word";  
    
    
    target.style.outline="gray solid 1px"
    //target.style.outlineOffset="2px"
    
    
    
    if (!idvalue)
        idvalue=localStorage.getItem(key); 
    if (!idvalue) 
            idvalue = target.innerHTML   
    target.innerHTML=idvalue    
    target.addEventListener('input',SaveTxt , true); // save the notes    
    
    function SaveTxt(txt) { 
        localStorage.setItem(key, txt.target.innerText);
        console.log("input");
        console.log(txt.target.innerText); 
    }
}
        
 
 
 
 
async function SetupFields(filename,selectlist) {
    
    selectlist.EmptyList()

    var jobinfo=await GetChoiceItems(`https://gpersoon.com/koios/lib/sync/${filename}.json`);
    console.log(jobinfo);
    
    for (var i in jobinfo) {
        //console.log(i);
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
    getElement("DELETEALL").addEventListener("click", DeleteAll);
    getElement("DBDELETE").addEventListener("click", DbDelete);
    getElement("PEERS").addEventListener("click", Peers);
    getElement("CONNECT").addEventListener("click", Connect);
    getElement("DISCONNECT").addEventListener("click", Disconnect);
    getElement("INFO").addEventListener("click", Pubsubinfo);
    getElement("CLEAR").addEventListener("click", Clear);
    
    getElement("APPLYBUTTON").addEventListener("click", MailApplication);
    getElement("DELETEBUTTON").addEventListener("click", DeleteCurrentCard);
    
    
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

    
    profile.mail=localStorage.getItem(`sync-${globaladr}-mail`)
    console.log(profile.mail);
    if (!profile.mail) profile.mail="Fill in via my details"
    profile.phone=localStorage.getItem(`sync-${globaladr}-phone`)
    if (!profile.phone) profile.phone="Fill in via my details"
     
   // const email = await globalbox.private.get('email') // doesn't work

    for (var i in profile) {
        switch (i) {
            case "name":
            case "employer": 
            case "location":
            case "school":
            case "website":
            case "job":
            case "mail":
            case "phone":
                break;
            default: delete profile[i] // delete all unwanted
        }
    }
    console.log(profile)
    return profile
}    


function EthereumChanged() {
    console.log("EthereumChanged")
    globaladr=getUserAddress() 
    if (!globaladr) globaladr="unknown" 
    UpdateRecordList()
    SwitchPage("scr_sync");//close the popup
}
        
async function main() {
    console.log("Main");           
   // await loadScriptAsync("https://gpersoon.com/koios/lib/lib/ipfs0.46.1.min.js")     // https://unpkg.com/ipfs@0.46.0/dist/index.min.js
   
    await loadScriptAsync("https://gpersoon.com/koios/lib/lib/ipfs0.50.2min.js")     // https://unpkg.com/ipfs@0.50.2/dist/index.min.js
   
    //await loadScriptAsync("https://gpersoon.com/koios/lib/lib/orbitdb0.24.1.min.js"); // https://www.unpkg.com/orbit-db@0.24.1/dist/orbitdb.min.js
         await loadScriptAsync("https://gpersoon.com/koios/lib/lib/orbitdb26.min.js")    // clone from github & npm run build:dist

    subscribe("ethereumchanged",EthereumChanged)
    subscribe("web3providerfound",EthereumChanged) // update the records once address is known

    LinkVisible("scr_addjob"  ,ScrAddJobMadeVisible)    
    LinkVisible("scr_browsecards"  ,ScrBrowseCardsMadeVisible)    
    LinkVisible("scr_mydetails", ScrMyDetailsMadeVisible)
    
    
    await SetupFields("jobinfo",selectlist1)
    await SetupFields("financial",selectlist2)
    SetupButtons() 
    await SetupOrbitdb()
    
    await Login() // should be suffiently initiated
    globaladr=getUserAddress()         
    
    if (!globaladr) globaladr="unknown" 
    

    globalbox = await getBox()
    console.log(globalbox)
    if (globalbox)
        await globalbox.syncDone

    //const profile = await globalbox.public.all()
//console.log(profile)
//const secretProfile = await globalbox.private.all()
//console.log(secretProfile);

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

var globalapplied=0
var globaloutofscope=0
        
        
function MyOwn(id) {
    if (!id) return false;
    return id.includes(globaladr)
}    
        
async function UpdateRecordList() {
    console.log(`In UpdateRecordList globaladr=${globaladr}`)
    globalavailableofferings=[];             
    globalliked=0
    globaldisliked=0
    globaltoswipe=0
    
    globalsupplied=0  
    globalapplied=0
    globaloutofscope=0
    
    globalavailableofferings = await globaldb.query(() => true); // get all records
    console.log(globalavailableofferings);                
    for (var i=0;i<globalavailableofferings.length;i++) {     
        var status=GetStatus(globalavailableofferings[i]._id)

        console.log(`UpdateRecordList i=${i} status=${status}`);
        if (MyOwn(globalavailableofferings[i]._id) )        
            status="S"    
        console.log(status)
        switch (status) {
               case "Y": globalliked++  ; break
               case "N": globaldisliked++;break;
               case "S": globalsupplied++;break
               case "A": globalapplied++;break
               case "O": globaloutofscope++;break
               default:
                    globaltoswipe++; break
        }
        
        globalavailableofferings[i].status=status
        console.log(globalavailableofferings[i]);
        
    }
    UpdateStatusFields() 
    console.log(globalavailableofferings)
}          
  
  

  
function SetStatus(id,status) {         // remember status per ethereum user
    localStorage.setItem(`sync-${globaladr}-${id}`, status)        
}    
function GetStatus(id) {        
    return localStorage.getItem(`sync-${globaladr}-${id}`, status)        
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
    if (MyOwn(domid.id)) {
        console.log("My own job, ignore swiping")
        return 
    }
    SetStatus(domid.id,fselected?"Y":"N")
    
    if (fselected) {
        globalliked++          
    } else
        globaldisliked++
    globaltoswipe--;
    UpdateStatusFields() 
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
        
        
        card.id=globalavailableofferings[i]._id;
    }
   await carrouselwait(getElement('cardcontainer'),"card",callbackselected)
   console.log("Ready swiping");
   SwitchPage("close");//close the popup
   UpdateRecordList()
}
    
    

     
async function Send() {
    console.log("In function Send()");
    
    
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
    tosend.profile=getProfileInfo()   
    tosend.options=sendoptions
    console.log("tosend")
    console.log(tosend)
    var h1=await globaldb.put(tosend)   
    UpdateRecordList()
    SwitchPage("close");//close the popup
    
}        
        
async function DbDelete() {     
        
    var dbs=await indexedDB.databases()
    console.log(dbs)        
    for (var i=0;i<dbs.length;i++) {
        console.log(dbs[i].name)
        if (dbs[i].name.includes("ipfs") || dbs[i].name.includes("orbit") || dbs[i].name.includes("level-js-access_db_httpclient")) {
            console.log(`Deleting ${dbs[i].name}`);
            indexedDB.deleteDatabase(dbs[i].name);       
        }
    }
}    

async function DeleteAll() {
    const result = await globaldb.query(() => true); // get all records
    for (var i=0;i<result.length;i++)
           await globaldb.del(result[i]._id)

    UpdateRecordList();       
}      
        
async function Delete(delete_id) {   
    await globaldb.del(delete_id)
    UpdateRecordList();       
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


