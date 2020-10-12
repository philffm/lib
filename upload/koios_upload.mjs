

import {uploadYtDataToIpfs,getYtInfoIpfs,includeSubtitlesforIpfsExport} from './koios_ipfs.mjs';
import {LinkClickButton,subscribe} from '../lib/koios_util.mjs';
import {SetupLogWindow,log} from '../lib/koios_log.mjs'; 

 



console.log("Hello koios_upload");
    
  SetupLogWindow(false)
    //LinkClickButton("startprocess");subscribe("startprocessclick",startprocess);
    log("checklist")
    log("-video's are uploaded to koios channel")
    log("-playlist is made in koios channel");
    log("-highres thumbnail is added (select random picture, save, select preferred picture, save");
    log("-add translated subtitles")
    log("-for automatically created subtitles (word based): export and import")
    


function MakeUrl(url) {
    return `<a href="${url}" target="_blank"> ${url}` + " in new page</a><br>"
}


    
async function startprocess() {
    log("startprocess");   
   // log(uploadYtDataToIpfs())   
    
    //var x=await getYtInfoIpfs("QmWRpcQt5wn49rAKrBE1NBEqEvoEd7c7XTALrDryJKwUqA");
    
    var x=await uploadYtDataToIpfs();
  
   await DisplayInfo(x)
   /*
   var pre=document.createElement("pre"); // already create to be able to log
    pre.style.width = "100%";
    pre.style.height = "100%";   
    pre.style.fontSize="10px"
    pre.style.lineHeight="10px";
   var position=document.getElementById("log"); 
    position.appendChild(pre);   
    pre.innerHTML=str;
	*/
//    log(await includeSubtitlesforIpfsExport() )
	
	
}

async function DisplayInfo(result) {

	var list=result.list
    for (var z=0;z<list.length;z++) {
        var pl=list[z];
        log(`Playlist ${pl.title} ${pl.id} duration: ${pl.duration}`);
		log("Copy paste:")
		log( `     "videoinfo": "${result.res[z].hash}",`)
		log( `     "duration": "${pl.duration}",`)
		log("")
		
		log(MakeUrl(`https://koios.online/newviewer?videoinfo=${result.res[z].hash}`))
          for (var i=0;i< pl.videos.length ;i++) {  
            //console.log(`${pl.videos[i].title} with id ${pl.videos[i].id} and thumb ${pl.videos[i].thumbnail}`);
            var id=pl.videos[i].videoid;
            var title=pl.videos[i].title;
			var duration=pl.videos[i].duration;

            if (pl.videos[i].chapter)  {
				console.log(pl.videos[i]);
                log(`Chapter ${title} duration:${duration}`);
			}
            else {
                var subs=pl.videos[i].subtitles;
                var vorfound=-1;
                for (var k=0;k<subs.length;k++)
                    if (subs[k].lang == "vor")
                        vorfound=k;
                console.log(`vorfound=${vorfound}`);
                var subtxt="";
                
                subtxt +=`<a target="_blank" href=https://studio.youtube.com/video/${id}/edit>edit</a>  `;
                subtxt +=`<a target="_blank" href=https://studio.youtube.com/video/${id}/translations>menu</a>  `;
                subtxt +=`<a target="_blank" href=https://www.youtube.com/timedtext_video?v=${id}&lang=vor&action_choose_add_method=1&nv=1>add vor</a>  `;
                subtxt +=`<a target="_blank" href=https://www.youtube.com/timedtext_editor?v=${id}&lang=vor&contributor_id=0&nv=1>edit vor</a>  `;
                subtxt +=`<a target="_blank" href=https://video.google.com/timedtext?v=${id}&lang=vor>vor txt</a>  `;                        
                subtxt +=`<a target="_blank" href=https://i.ytimg.com/vi_webp/${id}/maxresdefault.webp>maxres webp</a>  `;
                subtxt +=`<a target="_blank" href=https://i.ytimg.com/vi/${id}/maxresdefault.jpg>maxres jpg</a>  `;
                subtxt +=`<a target="_blank" href=https://i.ytimg.com/vi/${id}/hqdefault.jpg>hq jpg</a>  `;                      
                subtxt +=`${title.padEnd(80, '_')}`;                        
                subtxt +=` #vor: ${subs.length}  `;    
                
                
                
				if (vorfound >=0) {
                    var slides=pl.videos[i].subtitles[vorfound].subtitle;
                    for (var j=0;j< slides.length;j++) {
                        console.log(`Start: ${slides[j].start} Duration ${slides[j].dur} Text ${slides[j].text}`);
                        subtxt += slides[j].text +" ";            
                    }
                    console.log(`#vor subs: ${slides.length} subs: ${subtxt}`);
                }    
                
                
                
                log(subtxt)
                
            }            
       }          
    }
   
}

startprocess();
