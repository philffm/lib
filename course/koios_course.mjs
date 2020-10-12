import {loadScriptAsync,DomList,LinkToggleButton,subscribe} from '../lib/koios_util.mjs';

async function MergeLevels(fInIframe,parenturl) {  
    function FindCourse(course_id) {
        var course_items=document.getElementsByClassName("course-id");     
        for (var i=0; i< course_items.length; i++) {
            if ( course_items[i].getAttribute("course")  == course_id) {
                return course_items[i];
            }
        }   
        return undefined;
    }   
    
    function ProcessCourseLevel(course_level_id_domid) {
        var course_id=course_level_id_domid.getAttribute("course");     
        var course_domid=FindCourse(course_id);
        
        if (course_domid) {
            var container=course_domid.parentNode.parentNode.parentNode.getElementsByClassName("course-level-block");
            container[0].appendChild(course_level_id_domid.parentNode.parentNode);             
        }
        
    }     
    
    function FindAllLinks(target,fInIframe,parenturl,courselevel) {
        var links=target.getElementsByTagName("a");
        for (var i=0;i<links.length;i++) {          
            links[i].target="_top"; // change the "top" page when clicking a link       
            if (links[i].href.toLowerCase().includes("koios")) {                     
                    var urlhref = new URL(links[i].href)
                    console.log(urlhref);
                    console.log(links[i].href)
                if (fInIframe) 
                        links[i].href = links[i].href.replace("/viewer", parenturl.pathname);
                    links[i].href = links[i].href.replace(urlhref.host, parenturl.host); // also change the prefix
                    console.log(links[i].href)
                StoreSelection(links[i])
            }
        }        
        function StoreSelection(target) { // seperate function to store state
            target.addEventListener("click",  SaveToLocalStorage);
             function SaveToLocalStorage() {              
                 localStorage.setItem("CourseLevel", courselevel);  // this is how the player knows what is selected
             }    
        }
    }   
 
    var course_level_items=document.getElementsByClassName("course-level-id"); 
    var CatList = new DomList("categories")  
    var data=[]

    for (var i=0;i<course_level_items.length;i++) {        
        var target=course_level_items[i]
        var save={}
        save.course=target.getAttribute("course");
        save.courselevel=target.getAttribute("courselevel");
        save.level=target.getAttribute("level");        
        save.contributer=target.getAttribute("contributer");        
        save.url=target.getAttribute("url");
        data.push(save)
        FindAllLinks(target.parentNode.parentNode,fInIframe,parenturl,save.courselevel); 
    }

    var configuration= {
      sortings: {
        courselevel: {
          field: 'courselevel',
          order: 'asc'
        }
      },
      aggregations: {
        level: {
          title: 'level',
          size: 10
        },
        courselevel: {
          title: 'courselevel',
          size: 10
        },
        course: {
          title: 'course',
          size: 10
        },
        contributer: {
          title: 'contributer',
          size: 10
        }        
        
      },
      searchableFields: ['courselevel']
    };

    itemsjs = itemsjs(data, configuration);
    itemsjs.search()

    var movies = itemsjs.search({
      per_page: 1,
      sort: 'courselevel',
      filters: {
        level: ['introduction']
      }
    })
    
MakeSelection(CatList,"course")      
        
function MakeSelection(domid,catid) {
    var level = domid.AddListItem() 
    level.getElementsByClassName("cat-descript")[0].innerHTML=catid
    var LevelList = new DomList("select-item",level)       
    var top_level = itemsjs.aggregation({
      name: catid,
      per_page: 10
    })
   // console.log(JSON.stringify(top_level, null, 2));
    
            
    for (var i=0;i<top_level.data.buckets.length;i++) {
        var name=top_level.data.buckets[i].key
        
        if (catid == "course" && !name.toLowerCase().includes("blockchain") ){
            
            SelectItems("course-level-id",catid,name,false)
            continue; // skip all tests
        }

        var levelitem = LevelList.AddListItem() 
        levelitem.getElementsByClassName("select-txt")[0].innerHTML=name

        var select_btn=levelitem.getElementsByClassName("select-button")[0]
        SetButton("course-level-id",select_btn,catid,i,name,true);    // course-level-id is located in html-embed
        
        var info_btn=levelitem.getElementsByClassName("info-button")[0]
        switch (catid) {
           case "level":      // SetButton("levels",info_btn,catid,i,name,false);    break;
                            info_btn.style.display="none";break;
           case "course":      SetButton("course-id",info_btn,catid,i,name,false);    break;
           case "contributer": SetButton("contributers",info_btn,catid,i,name,false);  break;
        }
    }
}

    function SetButton(listid,domid,cat,index,name,fInitial) { // to remember state
        var id=`${listid}${cat}item${index}`
        domid.id=id
        LinkToggleButton(id,fInitial);subscribe(`${id}on`,x=>SelectItems(listid,cat,name,true));subscribe(`${id}off`,x=>SelectItems(listid,cat,name,false));
    }    

    function SelectItems(listid,cat,item,fOn) {
       var list_items=document.getElementsByClassName(listid); 
      
       for (var i=0;i<list_items.length;i++) {        
           var target=list_items[i]
           if (target.getAttribute(cat)==item) {
               target.parentNode.parentNode.style.display=fOn?"block":"none"
           }
       }  
    }
}

async function asyncloaded() {    
    console.log(`In asyncloaded of script: ${import.meta.url}`);
    await loadScriptAsync("https://unpkg.com/itemsjs@latest/dist/itemsjs.min.js")
    var fInIframe =  ( window.location !== window.parent.location );
    
    var url = new URL(window.parent.parent.location);         // 2x parent in case in double iframe
    
    MergeLevels(fInIframe,url); 

    if (fInIframe) {
        var domid=document.getElementById("koiosheader");
        domid.style.display="none"
    }
}

window.addEventListener('DOMContentLoaded', asyncloaded);  // load  