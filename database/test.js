const TEST = require('./KoiosDB.js');
/*import {
  GetYouTubePlayListItems
} from './koios_youtube.mjs';
*/


var json = {_id: 1,
Course_Name: "Blockchain and Cryptocurrencies 1",
Chapter: [
    {
        Chapter_Id: 1,
        Chapter_Name: "BC-1.1",
        Paragraph: [
            {
                Paragraph_Id: 1,
                Paragraph_Name: ".1",
                Lesson: [
                    {
                        Lesson_Id: 1,
                        Lesson_Name: "Introduction to the Blockchain Course!",
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

(async () => {
await TEST._init();
await TEST._createDBInstance();
await TEST.addJson("test", json);
//await TEST.addJson("test1", json1);

//await TEST.getJsonById('test1');
//console.log(await GetYouTubePlayListItems());
})();
