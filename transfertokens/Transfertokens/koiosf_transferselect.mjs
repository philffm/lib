import {LinkClickButton, LinkVisible} from '../../lib/koiosf_util.mjs';
import {updateDisplayedToken} from '../Transfertokens/koiosf_transfertokens.mjs';

export var SelectedToken;

window.addEventListener('DOMContentLoaded', asyncloaded);

async function asyncloaded() {
    LinkVisible("scr_select"  ,ScrSelectMadeVisible);
    LinkClickButton("TitanToken",setClassicTitan);
    LinkClickButton("TitanPD20B", setTitanPD20B);
    LinkClickButton("TitanL320B", setTitanL320B);
}

async function ScrSelectMadeVisible() {
    console.log("Opened selection screen");
}

export function setClassicTitan(){
	SelectedToken="Titan";
    localStorage.setItem("SelectedToken", SelectedToken);
    updateDisplayedToken();
}

export function setTitanPD20B(){
	SelectedToken="TitanPD20B";
    localStorage.setItem("SelectedToken", SelectedToken);
    updateDisplayedToken();
}

export function setTitanL320B(){
	SelectedToken="TitanL320B";
    localStorage.setItem("SelectedToken", SelectedToken);
    updateDisplayedToken();
}