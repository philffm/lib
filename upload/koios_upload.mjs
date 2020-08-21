

import {uploadYtDataToIpfs,getYtInfoIpfs,includeSubtitlesforIpfsExport} from './koios_ipfs.mjs';
import {LinkClickButton,subscribe} from '../lib/koios_util.mjs';
<<<<<<< HEAD
import {SetupLogWindow,log} from '../lib/koios_log.mjs';
import {GetYouTubePlaylists, LoadGapi} from './koios_youtube.mjs';

=======
import {SetupLogWindow,log} from '../lib/koios_log.mjs'; 

 
>>>>>>> 7a24c489e6f002545947860c6ef51b2b098dd0d0



console.log("Hello koios_upload");
    
  SetupLogWindow(false)
    LinkClickButton("startprocess");subscribe("startprocessclick",startprocess);
    log("checklist")
    log("-video's are uploaded to koios channel")
    log("-playlist is made in koios channel");
    log("-highres thumbnail is added (select random picture, save, select preferred picture, save");
    log("-add translated subtitles")
    log("-for automatically created subtitles (word based): export and import")
<<<<<<< HEAD


async function selectVideoSel() {

  console.log(document.getElementById("courseSelect").selectedIndex);
  fillVid(document.getElementById("courseSelect").selectedIndex);
}

async function display()
{
  var uploadForm = document.createElement("form");
  uploadForm.enctype = "multipart/form-data";

  var courseSelect = document.createElement("select");
  courseSelect.id = "courseSelect";
  //courseSelect.setAttribute("onchange", x=>selectVideoSel(this.selectedIndex));
  //courseSelect.onchange = "if (this.selectedIndex) selectVideoSel();";
  //courseSelect.onchange = function(){console.log(hoi);};
  courseSelect.style.margin = "8px";

  var videoSelect = document.createElement("select");
  videoSelect.id = "videoSelect";
  videoSelect.style.margin = "8px";

  var files = document.createElement("input");
  files.id = "file-input";
  files.type = "file";
  files.name= "files[]";
  files.multiple = 1;
  files.style = "display: none;";

  var submit = document.createElement("input");
  submit.id = "upload-submit";
  submit.type = "submit";
  submit.value = "Upload File(s)";
  submit.name = "submit";

  uploadForm.appendChild(document.createElement("br"));
  uploadForm.appendChild(document.createElement("br"));
  uploadForm.appendChild(document.createElement("br"));
  uploadForm.appendChild(courseSelect);
  uploadForm.appendChild(videoSelect);
  uploadForm.appendChild(files);
  uploadForm.appendChild(submit);
  uploadForm.style.margin = "20px";

  var position=document.getElementById("log");
  position.appendChild(uploadForm);
}

display();
var courseNames;
var playlist;
var videoNames;

async function fill()
{
  var select = document.getElementById("courseSelect");
  playlist = await GetYouTubePlaylists();
  console.log(playlist);
  courseNames = [];
  playlist.forEach(element => {
    courseNames.push(element.title);
  });

    for(var i = 0; i < courseNames.length; i++)
    {
       var option = document.createElement("OPTION"),
        txt = document.createTextNode(courseNames[i]);
       option.appendChild(txt);
       option.setAttribute("value",courseNames[i]);
       select.insertBefore(option,select.lastChild);
    }
}

async function fillVid(index)
{
  var videoSelect = document.getElementById("videoSelect");

  var videos = await getYtInfoIpfs(playlist[index]);
  console.log(videos);
  videoNames = [];
  videos.forEach(element => {
    videoNames.push(element.title);
  });

    for(var i = 0; i < videoNames.length; i++)
    {
       var option = document.createElement("OPTION"),
        txt = document.createTextNode(videoNames[i]);
       option.appendChild(txt);
       option.setAttribute("value",videoNames[i]);
       videoSelect.insertBefore(option,videoSelect.lastChild);
    }
}

//fill()
//EVENTLISTNER WANNEER COURSESELECT WORDT VERANDERD
//OP BASIS VAN VERANDERING getYtInfoIpfs(bijbehorende hash)
//VIDEOTITELS IN VIDEOSELECT


=======
    
    
>>>>>>> 7a24c489e6f002545947860c6ef51b2b098dd0d0
async function startprocess() {
    log("startprocess");   
   // log(uploadYtDataToIpfs())   
    
    //var x=await getYtInfoIpfs("QmWRpcQt5wn49rAKrBE1NBEqEvoEd7c7XTALrDryJKwUqA");
    
    var x=await uploadYtDataToIpfs();
    for (var i=0;i<x.res.length;i++) {
        log(x.res[i]);
        
    }    
   var str = DisplayInfo(x.list)
   
   var pre=document.createElement("pre"); // already create to be able to log
    pre.style.width = "100%";
    pre.style.height = "100%";   
    pre.style.fontSize="10px"
    pre.style.lineHeight="10px";
   var position=document.getElementById("log"); 
    position.appendChild(pre);   
    pre.innerHTML=str;
    //log(includeSubtitlesforIpfsExport() )
}

function DisplayInfo(list) {
    var str=""
    for (var z=0;z<list.length;z++) {
        var pl=list[z];
        str +=pl.title+"\n";
        
          for (var i=0;i< pl.videos.length ;i++) {  
            //console.log(`${pl.videos[i].title} with id ${pl.videos[i].id} and thumb ${pl.videos[i].thumbnail}`);
            var id=pl.videos[i].videoid;
            var title=pl.videos[i].title;

            if (pl.videos[i].chapter) 
                str +=title;
            else {
                var subs=pl.videos[i].subtitles;
                var vorfound=-1;
                for (var k=0;k<subs.length;k++)
                    if (subs[k].lang == "vor")
                        vorfound=k;
                console.log(`vorfound=${vorfound}`);
                var subtxt="";
                
                if (vorfound >=0) {
                    var slides=pl.videos[i].subtitles[vorfound].subtitle;
                    for (var j=0;j< slides.length;j++) {
                        console.log(`Start: ${slides[j].start} Duration ${slides[j].dur} Text ${slides[j].text}`);
                        subtxt += slides[j].text +" ";            
                    }
                    console.log(`#vor subs: ${slides.length} subs: ${subtxt}`);
                }    
                //console.log(`Id ${id} Title ${title.padEnd(60, ' ')}`  );
             
                str +=`<a href=https://studio.youtube.com/video/${id}/edit>edit</a>  `;
                str +=`<a href=https://studio.youtube.com/video/${id}/translations>menu</a>  `;
                str +=`<a href=https://www.youtube.com/timedtext_video?v=${id}&lang=vor&action_choose_add_method=1&nv=1>add vor</a>  `;
                str +=`<a href=https://www.youtube.com/timedtext_editor?v=${id}&lang=vor&contributor_id=0&nv=1>edit vor</a>  `;
                str +=`<a href=https://video.google.com/timedtext?v=${id}&lang=vor>vor txt</a>  `;                        
                str +=`<a href=https://i.ytimg.com/vi_webp/${id}/maxresdefault.webp>maxres webp</a>  `;
                str +=`<a href=https://i.ytimg.com/vi/${id}/maxresdefault.jpg>maxres jpg</a>  `;
                str +=`<a href=https://i.ytimg.com/vi/${id}/hqdefault.jpg>hq jpg</a>  `;                      
                str +=`${title.padEnd(80, '_')}`;                        
                str +=` #vor: ${subs.length}  `;        
                str += subtxt;
            }            
            str +=`\n`        
       }   
       //console.log(str);
    }
   return str;
}

