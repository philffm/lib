import { } from "../lib/3box.js"; // from "https://unpkg.com/3box/dist/3box.js"; // prevent rate errors
import { getUserAddress,authorize, getBox,getProfileForDid} from "./koiosf_login.mjs";
import {DomList,getElement,FitOneLine,LinkVisible,subscribe,GetImageIPFS} from '../lib/koiosf_util.mjs';
import {log} from '../lib/koiosf_log.mjs'; 

let space=undefined;
let currentThread;
var GlobalCommentList = new DomList("commententry");
const FirstModerator="0x88E5d3CCdA6b8C8dE104E2bfA138AaB34D49c48c"; //For making the initial thread 
const KoiosSpace = "koiostestspace2";

window.onerror = async function(message, source, lineno, colno, error) {   // especially for ios
    var str=`Error: ${message} ${source}, ${lineno}, ${colno}  `;
    if (error && error.stack) str = str.concat('\n').concat(error.stack);
    log(str);    
} 

window.addEventListener('DOMContentLoaded', asyncloaded);

async function asyncloaded() {  
    LinkVisible("scr_comment" ,ScrCommentMadeVisible)   
    getElement("posttext").addEventListener('animatedclick',PostComment)    
    var target=getElement("commenttext")    
    target.contentEditable="true"; // make div editable
    target.style.whiteSpace ="pre";  
}

async function ScrCommentMadeVisible() {  
    space=await getSpace();
   
    if (space) { // else no connection to 3box
        WriteThread(currentvideo)       
    }
}    

async function getSpace() {
    await authorize()
    var box=await getBox()
    
    space = await box.openSpace(KoiosSpace);
    return space
}

subscribe("loadvideo",NewVideo) 
var currentvideo;

async function NewVideo(vidinfo) {
    if (!vidinfo) return;        
    currentvideo=vidinfo
    if (!space) return; //  no connection to 3box yet; fixed elsewhere
    WriteThread(currentvideo)
}

async function WriteThread(vidinfo) {
    getElement("titletext").innerHTML=vidinfo.txt
    
    // remove previous onUpdate & onNewCapabilities ??   
    currentThread = await space.joinThread(vidinfo.videoid, {
        firstModerator: FirstModerator
    });
    
    currentThread.onUpdate(async () => {
        var uposts = await currentThread.getPosts()
        await ShowPosts(uposts);
    })
    currentThread.onNewCapabilities((event, did) => console.log(did, event, ' the chat'))
    const posts = await currentThread.getPosts()
    await ShowPosts(posts);
}

/*
 * Show the posts in the interface
 */
async function ShowPosts(posts) {

    for (var i=0;i<posts.length;i++) {        
        if (!document.getElementById(posts[i].postId) ){ // check if post is already shown
            var did=posts[i].author;           
            
            var target = GlobalCommentList.AddListItem() // make new entry
            target.getElementsByClassName("commentmessagetext")[0].innerHTML = posts[i].message            
            target.getElementsByClassName("commenttimetext")[0].innerHTML = await SetTime(posts[i].timestamp * 1000);
            
            target.id = posts[i].postId                                        // remember which postId's we've shown
            FindSender (target.getElementsByClassName("commentsendertext")[0],did,target.getElementsByClassName("userphoto")[0]);  // show then profilename (asynchronous)  
            FitOneLine(target.getElementsByClassName("commentsendertext")[0])
            var deletebutton=target.getElementsByClassName("commentdelete")[0]
            SetDeleteButton(deletebutton,posts[i].postId)
            var votecounter=target.getElementsByClassName("commentupvotecountertext")[0]    
            votecounter.innerHTML = await space.public.get(posts[i].postId)
            if (votecounter.innerHTML === 'undefined') {
                await space.public.set(posts[i].postId, 0)
                votecounter.innerHTML = 0
            }  
            var upvotebutton=target.getElementsByClassName("commentupvote")[0]
            SetUpVoteButton(upvotebutton,posts[i],votecounter.innerHTML);
            var downvotebutton=target.getElementsByClassName("commentdownvote")[0]
            SetDownVoteButton(downvotebutton,posts[i],votecounter.innerHTML);
        }
    }
    
    var postdomids=document.getElementsByClassName("commententry");
    for (var i=0;i<postdomids.length;i++) {
        var checkpostid=postdomids[i].id;
        var found=false;
        
        if (posts.postId == checkpostid) {
            postdomids[i].getElementsByClassName("commentupvotecountertext")[0].innerHTML = await space.public.get(posts.postId);
        }

        for (var j=0;j<posts.length;j++) {
            if (posts[j].postId == checkpostid) 
            {
                found=true;break; 
            }
        }

        if (!found)
            postdomids[i].style.textDecoration="line-through";   
    }   
}

async function SetDeleteButton(domid,postid) { 
    domid.addEventListener('animatedclick',DeleteForumEntry)
    
    async function DeleteForumEntry() {
        try {
            await currentThread.deletePost(postid);
        } catch (error) {
            console.log(error);
        }
    }
}

async function FindSender (target,did,profilepicture) {
    var profile = await getProfileForDid(did);
    target.innerHTML = profile.name ? profile.name : did
    if (profile.image) {
        var imagecid=profile.image[0].contentUrl
        imagecid=imagecid[`\/`]
        profilepicture.src=await GetImageIPFS(imagecid)
    }           
}

async function PostComment() {
    var target=getElement("commenttext")    
    try {
        if (currentThread)
            await currentThread.post(target.innerHTML); 
      } catch (error) {
        console.log(error);
      }
}  

async function SetUpVoteButton(domid,post,votecounter) { 
    domid.addEventListener('animatedclick',UpVoteMessage)
    async function UpVoteMessage() {
        try {
            if (await space.public.get(`${getUserAddress()}+${post.postId}`) == "upvoted") {
                votecounter = parseInt(votecounter) - 1
                await space.public.set(post.postId, votecounter)
                await space.public.set(`${getUserAddress()}+${post.postId}`, "notVoted")
                ShowPosts(post)
            }
            else if (await space.public.get(`${getUserAddress()}+${post.postId}`) == "downvoted") {
                votecounter = await space.public.get(post.postId)
                votecounter = parseInt(votecounter) + 2
                await space.public.set(post.postId, votecounter)
                await space.public.set(`${getUserAddress()}+${post.postId}`, "upvoted")
                ShowPosts(post)
            }
            else {
                votecounter = parseInt(votecounter) + 1
                await space.public.set(post.postId, votecounter)
                await space.public.set(`${getUserAddress()}+${post.postId}`, "upvoted")
                ShowPosts(post)
            }
        } catch (error) {
            console.log(error);
        }
    }
}

async function SetDownVoteButton(domid,post,votecounter) { 
    domid.addEventListener('animatedclick',DownVoteMessage)
    async function DownVoteMessage() {
        try {
            if (await space.public.get(`${getUserAddress()}+${post.postId}`) == "downvoted") {
                votecounter = parseInt(votecounter) + 1
                await space.public.set(post.postId, votecounter)
                await space.public.set(`${getUserAddress()}+${post.postId}`, "notVoted")
                ShowPosts(post)
            }
            else if (await space.public.get(`${getUserAddress()}+${post.postId}`) == "upvoted") {
                votecounter = await space.public.get(post.postId)
                votecounter = parseInt(votecounter) - 2
                await space.public.set(post.postId, votecounter)
                await space.public.set(`${getUserAddress()}+${post.postId}`, "downvoted")
                ShowPosts(post)
            }
            else {
                votecounter = parseInt(votecounter) - 1
                await space.public.set(post.postId, votecounter)
                await space.public.set(`${getUserAddress()}+${post.postId}`, "downvoted")
                ShowPosts(post)
            } 
        } catch (error) {
            console.log(error);
        }
    }
}

async function SetTime(timesettings) {
    var dateobject = new Date(timesettings);
    var hours = dateobject.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit'});
    var day = dateobject.toLocaleDateString('en-GB');
    return hours.concat('\n', day);
}