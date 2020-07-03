import {
  GetYouTubePlayListItems
} from '../upload/koios_youtube.mjs';
import {
  loadScriptAsync
} from '../lib/koios_util.mjs';

include('KoiosDB.js');

export async function test() {
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
                        Lesson_Title: "Introduction to the Blockchain Course!",
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

var json1 = {energie: 7, voedingswaren:"35", prijs: 710};

await TEST._init();
await TEST._createDBInstance();
await TEST.addJson("test", json);
//await TEST.addJson("test1", json1);

//await TEST.getJsonById('test1');
//console.log(await GetYouTubePlayListItems());
}
