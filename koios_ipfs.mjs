//console.log(`In ${window.location.href} starting script: ${import.meta.url}`);
import {
  forIPFSexport
} from './koios_youtube.mjs';
import {
  loadScriptAsync
} from './koios_util.mjs';


export async function setupIPFS()
{
  console.log("In SetupIPFS");
  await Promise.all([ // see https://www.npmjs.com/package/ipfs
    loadScriptAsync("https://unpkg.com/ipfs/dist/index.js"),
  ]);
  console.log("Ipfs libraries loaded");
  var ipfs = await window.Ipfs.create(); //await??
  return ipfs;
}

export async function setupBuffer()
{
  console.log("Setup buffer");
  await Promise.all([
    loadScriptAsync("https://packd.now.sh/buffer")
  ]);
  console.log("buffer libraries loaded");
}

export async function uploadYtDataToIpfs()
{
  var ipfs = await setupIPFS();
  var hash; //IPFS hash
  for await (const result of ipfs.add(JSON.stringify(await includeSubtitlesforIpfsExport())))
  {
    console.log(result);
    hash = result.path;
  }
  return hash;
}

export async function getYtInfoIpfs(hash)
{
  await setupBuffer();
  var Buf = window.buffer.Buffer;
  var ipfs = await setupIPFS();
  var videoAndPlaylistInfo;
  var chunks = [];
  for await (const chunk of ipfs.cat(hash))
  {
    chunks.push(chunk);
  }
  videoAndPlaylistInfo = JSON.parse(Buf.concat(chunks).toString());
  console.log(videoAndPlaylistInfo);
  return videoAndPlaylistInfo;
}

export async function includeSubtitlesforIpfsExport()
{
  var info = await forIPFSexport();
  for(var i = 0; i<info.length;i++)
  {
    for(var x = 0; x<info[i].videos.length;x++)
    {
      info[i].videos[x].subtitles = await getSubTitles(info[i].videos[x].videoid);
    }
  }
  return info;
}

export async function test()
{
  var testje = JSON.stringify(await includeSubtitlesforIpfsExport());
  console.log(JSON.parse(testje.toString('utf8')));
}





var parser = new DOMParser();

export async function getYouTubeSubTitle(language, videoId)
{
  var array = [];
  var subtitleUrl = `https://video.google.com/timedtext?v=${videoId}&lang=${language}`;
  var data = await fetch(subtitleUrl).catch(console.log);
  var t = await data.text();
  var captions = parser.parseFromString(t, "text/html").getElementsByTagName('text');
  for (var i = 0; i < captions.length; i++)
  {
    var s = captions[i].innerHTML;
    s = s.replace(/&amp;/g, "&");
    s = s.replace(/&quot;/g, "'");
    s = s.replace(/&#39;/g, "'");
    array.push({
      start: captions[i].getAttribute('start'),
      dur: captions[i].getAttribute('dur'),
      text: s
    });
  }
  return array;
}


export async function getSubtitleList(videoId)
{
  var subtitleUrl = `https://video.google.com/timedtext?type=list&v=${videoId}`;
  var data = await fetch(subtitleUrl).catch(console.log);
  var t = await data.text();
  var subtitleList = parser.parseFromString(t, "text/xml").getElementsByTagName('track');
  console.log(subtitleList);
  return subtitleList;
}


export async function getSubTitles(videoId)
{
  var captions = await getSubtitleList(videoId);
  var allVidSubs = [];
  for (var i=0; i<captions.length; i++){
    var language = captions[i].getAttribute('lang_code');
    console.log(`Found language: ${language}`);
    allVidSubs.push({
      lang: language,
      subtitle: await getYouTubeSubTitle(language, videoId)
    });
    /*if (language != "vor")
    { // reserved for slide info
      var arraypromise = getYouTubeSubTitle();
    }
    */
  }
  console.log(allVidSubs);
  return allVidSubs;
}
