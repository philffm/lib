import {loadScriptAsync,getElement} from '../lib/koiosf_util.mjs';
// https://developers.soundcloud.com/docs/api/html5-widget

  // scrolling="no" frameborder="no" 
  //color=ff5500&amp;
  //auto_play=false&amp;
  //hide_related=false&amp;
  //show_comments=true&amp;
  //show_user=true&amp;
  //show_reposts=false
  // show_teaser=true
    /*
    &amp;download=false
    &amp;sharing=false
    &amp;buying=false
    &amp;show_playcount=false
    &amp;show_user=false
    &amp;show_artwork=false`
    */
  

// subscribe("playerloading",  InitMusic); ff uitgezet

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
    console.log("SoundCloudLoaded")
    var domid= getElement("music");
	}   
}