import {getElement,DomList,LinkClickButton,subscribe, FitOneLine} from '../lib/koios_util.mjs';
import {LessonFormat} from '../upload/koios_ipfs.mjs';



  var ParagraphboxList = new DomList("paragraphbox");
  var StructureboxList = new DomList("editstructurebox");


   //ParagraphboxList.EmptyList()

   var rownum=1;


    var target=getElement("input");
    target.contentEditable="true"; // make div editable
    target.style.whiteSpace = "pre"; //werkt goed in combi met innerText

    console.log("link");
    LinkClickButton("addbutton");
    subscribe("addbuttonclick",onInput);
    FitOneLine(getElement("input"));


    async function onInput() {          //for test try PL_tbH3aD86KtN40_30P9S_rPryycQPr9k
      var temp = await LessonFormat(getInput());
      console.log(temp);
      plotParagraphs(temp);
    }

    function getInput() {
        var target=getElement("input");
        var inputVal = target.innerHTML;
        console.log(inputVal);
        return inputVal;
    }

    function ShowBlock(x,y,txt) {
        var pb = ParagraphboxList.AddListItem();
        //console.log(pb);
        //console.log(pb.getOwnPropertyNames());
        var but = getElement("editstructure",pb);
        but.addEventListener("click", clicky);
        pb.style.left= `${x*25}px`;
        getElement("paragraph",pb).innerHTML=txt;
        function clicky(){console.log("Clickyclack!");}

    }

    function toggleStructureMenu() {

    }

    function plotParagraphs(info) {
      console.log("in plot");
      console.log(info.Chapter);
      console.log(info.Chapter.length);

      //show playlist name
      for (var i=0;i<info.Chapter.length;i++) {
          ShowBlock(1,rownum++,`Chapter ${info.Chapter[i].Chapter_Id} - ${info.Chapter[i].Chapter_Title}`);
          for (var j=0;j<info.Chapter[i].Paragraph.length;j++) {
             ShowBlock(2,rownum++,`Paragraph ${info.Chapter[i].Paragraph[j].Paragraph_Id} - ${info.Chapter[i].Paragraph[j].Paragraph_Title}`);
             for (var k=0;k<info.Chapter[i].Paragraph[j].Lesson.length;k++) {
                 ShowBlock(3,rownum++,`Lesson ${info.Chapter[i].Paragraph[j].Lesson[k].Title}`); //${info.Chapter[i].Paragraph[j].Lesson[k].Lesson_Id}
             }
          }
      }
    }
