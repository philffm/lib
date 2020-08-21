import {getElement,DomList,LinkClickButton,subscribe, FitOneLine} from '../lib/koiosf_util.mjs';
import {LessonFormat} from '../upload/koios_ipfs.mjs';
import {uploadFilesIntoPlatform} from '../upload/koios_File_Uploader.mjs'




  var ParagraphboxList = new DomList("paragraphbox");
  //var StructureboxList = new DomList("editstructurebox");


   //ParagraphboxList.EmptyList()

   var rownum=1;

  var temp;

    //INPUT FIELDS
    var target=getElement("input");
    target.contentEditable="true"; // make div editable
    target.style.whiteSpace = "pre"; //werkt goed in combi met innerText

    var ytlinkinput = getElement("input1");
    ytlinkinput.contentEditable="true";
    ytlinkinput.style.whiteSpace = "pre";

    var lessontitleinput = getElement("input2");
    lessontitleinput.contentEditable="true";
    lessontitleinput.style.whiteSpace = "pre";

    var lessondescriptioninput = getElement("input3");
    lessondescriptioninput.contentEditable="true";
    lessondescriptioninput.style.whiteSpace = "pre";

    console.log("link");
    getElement("addbutton").addEventListener('animatedclick',onInput);
    FitOneLine(getElement("input"));
    uploadEvents();


    async function onInput() {          //for test try PL_tbH3aD86KtN40_30P9S_rPryycQPr9k
      temp = await LessonFormat(getInput());
      console.log(temp);
      plotParagraphs(temp);
    }

    function getInput() {
        var target=getElement("input");
        var inputVal = target.innerHTML;
        console.log(inputVal);
        return inputVal;
    }

    function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    function ShowBlock(x,y,txt) {
        var pb = ParagraphboxList.AddListItem();
        //console.log(pb);
        //console.log(pb.getOwnPropertyNames());
        var but = getElement("editstructure",pb);
        but.addEventListener("click", clicky);
        pb.style.left= `${x*25}px`;
        getElement("paragraph",pb).innerHTML=txt;


        async function clicky(){
          console.log("Clickyclack!");
          await sleep(500);
          console.log("After sleep");
          var delBut = getElement("deleteButton");
          delBut.addEventListener("click", deleteLesson);
        }

        function deleteLesson() {
          console.log("deleted!!!!");
          pb.parentNode.removeChild(pb);
        }

    }

    function uploadEvents() {
      var fileElement = document.createElement("input");
      fileElement.id = "file-input";
      fileElement.type = "file";
      fileElement.name= "files[]";
      fileElement.multiple = 1;
      fileElement.style = "display: none;";
      var upOpBut = getElement("openuploader");
      upOpBut.addEventListener("click", upEvent);

      async function upEvent() {
        await sleep(500);
        var selectFilesBut = getElement("filesButton");
        selectFilesBut.addEventListener("click", selectFiles);
        function selectFiles() {
          fileElement.click();
        }
        var uploadBut = getElement("uploadButton");
        uploadBut.addEventListener("click", uploadFiles);

        async function uploadFiles(){
          console.log("uploading!");
          const files = fileElement.files;
          uploadFilesIntoPlatform(files);

        }
      }

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
