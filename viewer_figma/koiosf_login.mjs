
import {loadScriptAsync,getElement,GetImageIPFS,publish,setElementVal,subscribe} from '../lib/koiosf_util.mjs';
import { } from "../lib/3box.js"; // from "https://unpkg.com/3box/dist/3box.js"; // prevent rate errors

let web3Modal     // Web3modal instance
var  provider;  // Chosen wallet provider given by the dialog window
let selectedAccount;     // Address of the selected account
var web3;
var globalprofilename
var globalprofile
var globalprofileimage
var initpromise=init();

window.addEventListener('DOMContentLoaded', asyncloaded);  // load  

async function init() {
    await Promise.all(
        [
        await loadScriptAsync("https://unpkg.com/web3@latest/dist/web3.min.js"),
        await loadScriptAsync("https://unpkg.com/web3modal"),        
        await loadScriptAsync("https://unpkg.com/evm-chains@0.1.1/lib/index.js"), // note new version 2.00 exits, slightly differnt
        await loadScriptAsync("https://unpkg.com/@walletconnect/web3-provider@latest/dist/umd/index.min.js"),
        await loadScriptAsync("https://cdn.jsdelivr.net/npm/fortmatic@latest/dist/fortmatic.js"),        // https://unpkg.com/fortmatic@2.0.6/dist/fortmatic.js
        ])
}    

if (window.ethereum)
    window.ethereum.autoRefreshOnNetworkChange=false; // prevent autoreload
    else
        window.ethereum=1; // so at least a box is shown


 
export function ClearCachedProvider() {
    web3Modal.clearCachedProvider();
}

async function asyncloaded() {  
    var domid
    domid=getElement("login","scr_profile");if (domid) domid.addEventListener('animatedclick',Login)    
    domid=getElement("login","scr_comment");if (domid) domid.addEventListener('animatedclick',Login)    
    domid=getElement("clearcachedprovider");if (domid) domid.addEventListener('animatedclick',ClearCachedProvider)        
    domid=getElement("name")
    if (domid) {
        domid.href="http://3box.io/hub"
        domid.target="_blank"
    }

    await initpromise;
    const Web3Modal = window.Web3Modal.default;
    const WalletConnectProvider = window.WalletConnectProvider.default;
    const EvmChains = window.EvmChains;
    const Fortmatic = window.Fortmatic;

    // Tell Web3modal what providers we have available.
    // Built-in web browser provider (only one can exist as a time)
    // like MetaMask, Brave or Opera is added automatically by Web3modal
    const providerOptions = {
        walletconnect: {
          	package: WalletConnectProvider,
          	options: {
            	// Mikko's test key - don't copy as your mileage may vary
            	infuraId: "8043bb2cf99347b1bfadfb233c5325c0",
          	}
        },

        fortmatic: {
          	package: Fortmatic,
          	options: {            
            	key: "pk_test_C80030486E9F6B17"
          	}	
        }
    };   

    web3Modal = new Web3Modal({
        cacheProvider: true, // remember previousely selected
        providerOptions, // required
    });

    if (web3Modal.cachedProvider) { // continue directly to save time later
      	await onConnect();   
    }
}

export function getWeb3Provider() {
  	return provider;
}

export function getWeb3() {
  	return web3;
}


export function getUserAddress() {
 	return  selectedAccount;
}

export function getProfileName() {
 	return  globalprofilename;
}

export async function getProfileForDid(did) {        
    return  await Box.getProfile(did);
}

export function getProfile(did) {
    return  globalprofile;
}

export function getProfileImage() {
 	return  globalprofileimage;
}

export async function Login() {
    await onConnect();    
}

export async function authorize() {
    await onConnect();
}    

/**
 * Kick in the UI action after Web3modal dialog has chosen a provider
 */
async function fetchAccountData() {
	// Get a Web3 instance for the wallet
	// Get connected chain id from Ethereum node
	const chainId = await web3.eth.getChainId();
	// Load chain information over an HTTP API
	var chainData=`Chain: ${chainId}`
	try {
		chainData = (await EvmChains.getChain(chainId)).name;    
	} catch(err) { console.log(err); } // but still continue
	var domid=getElement("chain");if (domid) domid.textContent = chainData;
	
	// Get list of accounts of the connected wallet
	const accounts = await web3.eth.getAccounts();

	// MetaMask does not give you all accounts, only the selected account
	selectedAccount = accounts[0];

	var domid=getElement("account");if (domid) domid.textContent = selectedAccount;
	// Read profile data
	const profile = await Box.getProfile(selectedAccount)
	globalprofile=profile
	globalprofilename="No name defined yet on 3box"
	globalprofileimage=undefined;
	if (profile) {
		if (profile.name) globalprofilename=profile.name
		if (profile.emoji) globalprofilename+=" "+profile.emoji
		
		var domid=getElement("name"); if (domid) domid.textContent = globalprofilename
		if (profile.image) {
			var imagecid=profile.image[0].contentUrl
			imagecid=imagecid[`\/`]
			
            GetImageIPFS(imagecid).then(globalprofileimage=> {  // don't wait for this, could take a while
                var domid=getElement("userphoto"); 
                if (domid) domid.src=globalprofileimage
            })
		}
	}    

	// Get a handl
	//const template = document.querySelector("#template-balance");
	//const accountContainer = document.querySelector("#accounts");

	// Purge UI elements any previously loaded accounts
	//accountContainer.innerHTML = '';

	// Go through all accounts and get their ETH balance
	const rowResolvers = accounts.map(async (address) => {
		const balance = await web3.eth.getBalance(address);
		// ethBalance is a BigNumber instance
		// https://github.com/indutny/bn.js/
		const ethBalance = web3.utils.fromWei(balance, "ether");
		const humanFriendlyBalance = parseFloat(ethBalance).toFixed(4);
		// Fill in the templated row and put in the document
		//const clone = template.content.cloneNode(true);
		//clone.querySelector(".address").textContent = address;
		//clone.querySelector(".balance").textContent = humanFriendlyBalance;
		//accountContainer.appendChild(clone);
	});

	// Because rendering account does its own RPC commucation
	// with Ethereum node, we do not want to display any results
	// until data for all accounts is loaded
	await Promise.all(rowResolvers);

	// Display fully loaded UI for wallet data
	//document.querySelector("#prepare").style.display = "none";
	//document.querySelector("#connected").style.display = "block";
}

/**
 * Fetch account data for UI when
 * - User switches accounts in wallet
 * - User switches networks in wallet
 * - User connects wallet initially
 */
async function refreshAccountData() {
	// If any current data is displayed when
	// the user is switching acounts in the wallet
	// immediate hide this data
	//.document.querySelector("#connected").style.display = "none";
	//document.querySelector("#prepare").style.display = "block";

	// Disable button while UI is loading.
	// fetchAccountData() will take a while as it communicates
	// with Ethereum node via JSON-RPC and loads chain data
	// over an API call.
	// document.querySelector("#btn-connect").setAttribute("disabled", "disabled")
	await fetchAccountData(provider);
	//document.querySelector("#btn-connect").removeAttribute("disabled")
}

/**
 * Connect wallet button pressed.
 */
var fOnlyOnce=false;
async function onConnect() {
  	if (fOnlyOnce) return;
  	fOnlyOnce=true;
  
  	//getElement("WEB3_CONNECT_MODAL_ID").style.zIndex="20" // to make sure it's in front of everything
  
  	try {
    	provider = await web3Modal.connect();
    
  	} catch(e) {
		setElementVal("status1","Not connected","scr_comment")
		
		var domid;
		domid=getElement("login","scr_comment"); if (domid) domid.dispatchEvent(new CustomEvent("show"));
		domid=getElement("login","scr_profile"); if (domid) domid.dispatchEvent(new CustomEvent("show"));
		if (web3Modal)
			web3Modal.clearCachedProvider(); // clear cached because this didn't work (try again later)
		return;
	}
	  
	setElementVal("status1","Connected","scr_comment")
	domid=getElement("login","scr_comment"); if (domid) domid.dispatchEvent(new CustomEvent("hide"));
	domid=getElement("login","scr_profile"); if (domid) domid.dispatchEvent(new CustomEvent("hide"));
  	// Subscribe to accounts change 
  	try {
      	provider.on("accountsChanged", async (accounts) => {
			await fetchAccountData();
			publish("ethereumchanged")
    	});

		// Subscribe to chainId change
		provider.on("chainChanged", async (chainId) => {
				await fetchAccountData();
				publish("ethereumchanged")
		});

		// Subscribe to networkId change
		provider.on("networkChanged", async (networkId) => {
			await fetchAccountData();
			publish("ethereumchanged")
		});
	} catch(e) {
		console.log("provider on error", e);
		return;
	} 
 	web3 = new Web3(provider);
  	await refreshAccountData();
  	publish("web3providerfound")  
}

let box;
subscribe("web3providerfound",NextStep)
var init3boxpromise;

async function NextStep() {
   // init3boxpromise=Init3box();  // not done automatically (requires extra signing)
}     

async function Init3box() {
    var ga=getUserAddress()
    var pr=getWeb3Provider()
    box = await Box.openBox(ga,pr);    
}

export async function getBox() {
    if (!init3boxpromise) init3boxpromise=Init3box();
    await authorize()
    await init3boxpromise;
    //const verifiedAccounts = await Box.getVerifiedAccounts(getUserAddress()) - unused    
    return box;
}    

/**
 * Disconnect wallet button pressed.
 */
async function onDisconnect() {

  console.log("Killing the wallet connection", provider);


	// TODO: Which providers have close method?
	if(provider.close) {
		await provider.close();
		// If the cached provider is not cleared,
		// WalletConnect will default to the existing session
		// and does not allow to re-scan the QR code with a new wallet.
		// Depending on your use case you may want or want not his behavir.
		await web3Modal.clearCachedProvider();
		provider = null;
	}

	selectedAccount = null;
	// Set the UI back to the initial state
	// document.querySelector("#prepare").style.display = "block";
	//document.querySelector("#connected").style.display = "none";

}