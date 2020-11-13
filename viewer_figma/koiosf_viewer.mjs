// https://browserhow.com/how-to-clear-chrome-android-history-cookies-and-cache-data/
// imports
import {HideButton,DragItem,publish,subscribe,LinkClickButton,CanvasProgressInfoClass,getElement,LinkVisible,addStyle } from '../lib/koiosf_util.mjs';
import {SetupLogWindow} from '../lib/koiosf_log.mjs';



//Unused variables
/*import {} from './koiosf_playvideo.mjs';
var globalplayer=0;
export var currentvidinfo;
import {SelectNextLesson,GlobalLessonList } from './koiosf_lessons.mjs';
import {} from './koiosf_subtitles.mjs';
import {UpdateTranscript,SetVideoTranscriptCallbacks} from './koiosf_showtranscript.mjs';
import {UpdateSlide} from './koiosf_slides.mjs';
import {} from './koiosf_notes.mjs';
import {InitSpeak,StopSpeak,StartSpeak,EnableSpeech,IsSpeechOn} from './koiosf_speech.mjs';
import {} from './koiosf_popup.mjs';
import {} from './koiosf_messages.mjs';
import {} from './koiosf_music.mjs';
import {GetCourseInfo} from './koiosf_course.mjs';
import {} from './koiosf_login.mjs';
import {} from './koiosf_literature.mjs';
import {} from './koiosf_screenlayout.mjs';
import {} from './koiosf_comments.mjs';
import {} from './koiosf_quiz.mjs';
import {} from './koiosf_badges.mjs';
import {currentlang, setDarkmode} from './koiosf_settings.mjs';
import {} from './koiosf_leaderboard.mjs';
var position;
var logpos;
var logtext=0;
var logipfs;
var slide;
var SecondsToSubtitle=[];
var globalyoutubeid; // global for onYouTubeIframeAPIReady
var previous_colour=""
var previous_row=-1;
var table
var tablediv
var captionLanguageGlobal = "en";
var vidproginput=0;
var vidprogress=0;
var fSoundOn=true;
*/

// Global variables


async function asyncloaded() {
        
    addStyle(`
        [class*="Button"] {
            border-radius: 7px;
            
        }
    `);

}


SetupLogWindow();
var url = window.location.pathname;
var filename = url.substring(url.lastIndexOf('/')+1);
window.addEventListener('DOMContentLoaded', asyncloaded);  // load


  
  