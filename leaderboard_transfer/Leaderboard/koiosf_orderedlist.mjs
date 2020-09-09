import {DomList, getElement, subscribe, setElementVal, LinkClickButton, getElementVal, GetJson} from '../../lib/koiosf_util.mjs';

let numbers = [1, 3, 7, 2, 9];
let text =["ASDF", "FDSA", "QWER", "REWQ", "ZXCV"];

var OrderedList = new DomList("orderedlistentry");

window.addEventListener('DOMContentLoaded', onLoad)

async function onLoad() {
    ShowList(numbers, text);
    LinkClickButton("orderlistbutton",OrderList)
}

async function ShowList(numbers, text) {
    for (var i=0;i<numbers.length;i++) {
            var target = OrderedList.AddListItem();
            setElementVal("textvaluetext",text[i],target)
            setElementVal("numericalvaluetext",numbers[i],target)
    }
}

async function OrderList() {
    OrderedList.OrderBy();
}