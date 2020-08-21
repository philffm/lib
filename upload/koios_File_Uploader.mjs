import {upload} from '../upload/koios_ipfs.mjs';

export function uploadEvents() {

}

export function selectFiles() {

}

export function getFilesFromForm() {

}

export function format() {

}

export async function uploadFilesIntoPlatform(files) {
  for(var i=0; i<files.length;i++)
  {
    var fileobj = {
      path: files[i].name,
      content: files[i]
    };
    console.log(await upload(fileobj));
  //create new video and add CID to database
  }
}

export function setTextCID() {

}
