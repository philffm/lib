import {loadScriptAsync,getElement} from '../lib/koiosf_util.mjs';

//nothing seems to really be used here
async function InitMusic() {
    await loadScriptAsync("https://w.soundcloud.com/player/api.js");
    var url=`https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/222896338`

    var iframe=document.createElement("iframe");
    iframe.src=url;
    iframe.id="musicplayer"
    
    iframe.allow="autoplay"
   
    iframe.width="100%"
    iframe.height="100%"
    iframe.style.height="100%"
    iframe.style.width="100%"
    iframe.style.position="absolute";
    iframe.style.top="0";
    iframe.style.left="0";
    iframe.style.overflow="hidden";
    iframe.style.overflow="hidden";
    iframe.style.display="none";    
    document.body.appendChild(iframe);
                     
   	SC.Widget("musicplayer").bind(SC.Widget.Events.READY,SoundCloudLoaded);

   	SC.Widget("musicplayer").isPaused(console.log)
    window.addEventListener('load', console.log);  
    
    function SoundCloudLoaded() {
		var domid= getElement("music");
	} 
}
// Uncaught DOMException: Failed to execute 'createPattern' on 'CanvasRenderingContext2D': The image argument is a canvas element with a width or height of 0