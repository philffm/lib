//console.log(`In ${window.location.href} starting script: ${import.meta.url}`);
import {
  forIPFSexport, GetYouTubePlayListItems
} from './koios_youtube.mjs';
import {
  loadScriptAsync
} from '../lib/koiosf_util.mjs';
import {getSubtitles} from './koios_youtube.mjs';


export async function setupIPFS()
{
  console.log("In SetupIPFS");
  await Promise.all([ // see https://www.npmjs.com/package/ipfs
    loadScriptAsync("https://bundle.run/buffer"), // https://packd.now.sh/buffer
<<<<<<< HEAD
    //loadScriptAsync("https://unpkg.com/ipfs/dist/index.js"),
    loadScriptAsync("https://unpkg.com/ipfs-http-client/dist/index.min.js")
  ]);
  console.log("Ipfs & buffer libraries loaded");
  setupIPFS = async function (){
    return await window.IpfsHttpClient('https://ipfs.infura.io:5001'); //for infura node
  };
  return await window.IpfsHttpClient('https://ipfs.infura.io:5001');
  //var ipfs = await window.Ipfs.create(); //await?? //for node in browser
=======
    //loadScriptAsync("https://unpkg.com/ipfs/dist/index.min.js"),
      loadScriptAsync("https://unpkg.com/ipfs-http-client/dist/index.min.js")
  ]);
  console.log("Ipfs & buffer libraries loaded");
  //var ipfs = await window.Ipfs.create(); //await??
  
  
   var ipfs = await window.IpfsHttpClient('http://diskstation:5002'); // https://ipfs.infura.io:5001'); //for infura node
  console.log(ipfs);
  return ipfs;
>>>>>>> 7a24c489e6f002545947860c6ef51b2b098dd0d0
}

/*
export async function setupBuffer()
{
  console.log("Setup buffer");
  await Promise.all([
    
  ]);
  console.log("buffer libraries loaded");
}
*/
<<<<<<< HEAD
export async function uploadToDB() {

  await loadScriptAsync("https://unpkg.com/ipfs/dist/index.min.js"),
  await loadScriptAsync('https://www.unpkg.com/orbit-db@0.24.1/dist/orbitdb.min.js'),
  await loadScriptAsync('https://www.mgatsonides.online:5001/lib/database/KoiosDB.js')

  var koiosDB1 = window.TDB;
  await koiosDB1._init();
  await koiosDB1._createDBInstance();
  var list = await includeSubtitlesforIpfsExport();

}
=======
>>>>>>> 7a24c489e6f002545947860c6ef51b2b098dd0d0

export async function LessonFormat(_playid = "PL_tbH3aD86KvZcwoEAdFyMCWijbYGDBIo") {        //Needs to be placed somewhere else
  var list = await GetYouTubePlayListItems(_playid);
  console.log(list);
  console.log("This is list!!!!");
  var json = {_id: 1,
  Course_Title: "Blockchain and Cryptocurrencies 1",
  Chapter: [
      {
          Chapter_Id: 1,
          Chapter_Title: "BC-1.1",
          Paragraph: [
              {
                  Paragraph_Id: 1,
                  Paragraph_Title: ".1",
                  Lesson: [
                      {
                          Lesson_Id: 1,
                          Title: "Introduction to the Blockchain Course!",
                          Video: {
                              Video_Name: "Intro",
                              Description: "This is the description",
                              Youtube_Id: "",
                              Cid: "",
                              Subtitle: [
                                  {
                                  Language: "",
                                  Cid: ""
                                  }
                              ]
                          },
                      }
                  ]
              }
          ],
          Lesson: {}
      }
  ],
  ECTS: 15,
  Responsible: {}
  };
  for (var i=0;i<list.length;i++)
  {
    json.Chapter[0].Paragraph[0].Lesson.push(
    {Lesson_Id:i, Title:list[i].title, Video:{Description:list[i].description, Duration:list[i].duration, Thumbnail:list[i].thumbnail, Youtube_Id:list[i].videoid}});
  }
  return json;
}


export async function upload(file) {
  var hash;
  const ipfs = await setupIPFS();
  var response = await ipfs.add(file);
  hash = response.cid.string;
  return hash;
}

export async function uploadYtDataToIpfs()        //Puts the object on ipfs
//Split into uploadToIPFS and uploadYtData
{
    var ipfs = await setupIPFS();
    var list=await includeSubtitlesforIpfsExport()
    var res=[];

    for (var i=0;i<list.length;i++) { 
        console.log(`Storing ${list[i].id}`)
        var hash; //IPFS hash
        var tostore=JSON.stringify(list[i])
       // console.log(tostore);
        //console.log(ipfs.add);
        const result =  await ipfs.add(tostore)
        
            console.log(result);
            hash = result.path;
        
        res.push({playlist:list[i].id,title:list[i].title,hash:hash});
    }      
    return {res:res,list:list} // GP 28-4 also export list
}


<<<<<<< HEAD
export async function get(hash, ipfs) {
=======
//const file = e.srcElement.files[0];
//for await (const result of ipfs.add(file)) {
    //console.log(result);
//}




export async function getYtInfoIpfs(hash)           //Gets the json string from ipfs and parses it into an object /// not used, see ipfsgetjson
{
 // await setupBuffer();
  
  var ipfs = await setupIPFS();
>>>>>>> 7a24c489e6f002545947860c6ef51b2b098dd0d0
  var Buf = window.buffer.Buffer;
  var chunks = [];
  for await (const chunk of ipfs.cat(hash))
  {
    chunks.push(chunk);
  }
  return Buf.concat(chunks).toString();
}

export async function getYtInfoIpfs(hash)           //Gets the json string from ipfs and parses it into an object /// not used, see ipfsgetjson
//Split into GET and getYTinfo
{

  var ipfs = await setupIPFS();
  //var Buf = window.buffer.Buffer;
  var videoAndPlaylistInfo;
  //var chunks = [];
  //for await (const chunk of ipfs.cat(hash))
  //{
  //  chunks.push(chunk);
  //}
  videoAndPlaylistInfo = JSON.parse(await get(hash, ipfs));
  //console.log(videoAndPlaylistInfo);
  return videoAndPlaylistInfo;
}


export async function includeSubtitlesforIpfsExport()   //Adds the subtitle object to the specific video in the youtube info json file
{
  var data = await forIPFSexport();
  for(var i = 0; i<data.length;i++)
  { 
    console.log(`Playlist ${data[i].id}`);
    for(var x = 0; x<data[i].videos.length;x++)
<<<<<<< HEAD
    {
      data[i].videos[x].subtitles = await getSubtitles(data[i].videos[x].videoid);

=======
    { 
      data[i].videos[x].subtitles = await getSubTitles(data[i].videos[x].videoid);
      
>>>>>>> 7a24c489e6f002545947860c6ef51b2b098dd0d0
      var lan=data[i].videos[x].subtitles.length;
      var subs=lan?data[i].videos[x].subtitles[0].subtitle.length:0
    //console.log(`Video: ${data[i].videos[x].videoid} languages: ${lan} subtitles: ${subs} `);
    //console.log(data[i].videos[x].subtitles);
    }
  }
  //console.log(data);
  return data;
}
<<<<<<< HEAD
=======


var parser = new DOMParser();

export async function getYouTubeSubTitle(language, videoId)   //Gets one specific subtitle
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


export async function getSubtitleList(videoId)    //Gets a list of all subtitles languages available for a specific video(ID)
{
  var subtitleUrl = `https://video.google.com/timedtext?type=list&v=${videoId}`;
  var data = await fetch(subtitleUrl).catch(console.log);
  var t = await data.text();
  var subtitleList = parser.parseFromString(t, "text/xml").getElementsByTagName('track');
  //console.log(subtitleList);
  return subtitleList;
}


export async function getSubTitles(videoId)       //Gets all subtitles associated with one specific video(ID)
{
  var captions = await getSubtitleList(videoId);
  var allVidSubs = [];
  
  //console.log(`Video: ${videoId} #Captions: ${captions.length}`);
  
  for (var i=0; i<captions.length; i++){
      
    var language = captions[i].getAttribute('lang_code');
    //console.log(`Found language: ${language}`);
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
  //console.log(allVidSubs);
  return allVidSubs;
}
>>>>>>> 7a24c489e6f002545947860c6ef51b2b098dd0d0
