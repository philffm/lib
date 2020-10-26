var parser = new DOMParser(); 

export async function GetSubTitlesAndSheets(vidinfo,SubtitleCB,SheetsCB) {
    
    async function GetYouTubeSubTitle(language) {
        var array = [];
        var url=`https://video.google.com/timedtext?v=${vidinfo.videoid}&lang=${language}`;
        var data=await fetch(url).catch( console.log );
        var t=await data.text();   
        var captions  = parser.parseFromString(t, "text/html").getElementsByTagName('text');
        for (var i=0;i< captions.length;i++) {  
            var s= captions[i].innerHTML;
            var s = s.replace(/&amp;/g, "&");
            var s = s.replace(/&quot;/g, "'");
            var s = s.replace(/&#39;/g, "'");
            array.push({ 
                start:        captions[i].getAttribute('start'),
                dur:          captions[i].getAttribute('dur'),
                text:         s
            });
        }
        return array;
    }

    var url=`https://video.google.com/timedtext?type=list&v=${vidinfo.videoid}`;
    var data=await fetch(url).catch(console.log);
    var t=await data.text(); 
    var captions  = parser.parseFromString(t, "text/xml").getElementsByTagName('track');
    
    for (var i=0;i< captions.length;i++) {
        var language = captions[i].getAttribute('lang_code')
        
        if (language != "vor") { // resetved for slide info
            var arraypromise = GetYouTubeSubTitle();
            SubtitleCB(arraypromise,language);       
        } 
    }

    var array = await GetYouTubeSubTitle("vor")  // try to get the slide info
    SheetsCB(array,vidinfo);  // array could be undefined if nothing found
}

// *** get subtiles from IPFS / check    
    
async function SetupSubtitles(windowid,surl,lang) {
    getElement("subtitle-collection").hidden=true;      
    var data=await fetch(surl);
    var t=await data.text();
    subtitles=JSON.parse(t);  
    SetupSubtitlesStruct(windowid,subtitles,lang);
}