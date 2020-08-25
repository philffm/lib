import { } from "../lib/3box.js"; // from "https://unpkg.com/3box/dist/3box.js"; // prevent rate errors

import { getUserAddress, getWeb3Provider,authorize } from "../viewer_figma/koiosf_login.mjs";
import {DomList,getElement,FitOneLine,LinkVisible,subscribe,GetImageIPFS} from '../lib/koiosf_util.mjs';

var GlobalLeaderboardList = new DomList("leaderboardentry");

async function ShowLeaderboard(participants) {
    /*
    for all participants:
        if not yet in the list:
            target = DomList of entries
            leaderboardpositiontext = place in domlist
            picture/name = FindProfile
            tokencount = getTitanTokenCount(user address)

        Order DomList by TitanTokenCount
    */
}

/*
getParticipants() {
    Some way of getting data of participants
    return that data
}
*/

async function FindProfile (target,did,profilepicture) {
    var profile = await Box.getProfile(did);
    target.innerHTML = profile.name ? profile.name : did
    if (profile.image) {
        var imagecid=profile.image[0].contentUrl
        imagecid=imagecid[`\/`]
        console.log(imagecid);
        profilepicture.src=await GetImageIPFS(imagecid)
    }           
}