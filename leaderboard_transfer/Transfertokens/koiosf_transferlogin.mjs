import {loadScriptAsync,getElement,GetImageIPFS,publish,setElementVal} from '../../lib/koiosf_util.mjs';
import { } from "../../lib/3box.js"; // from "https://unpkg.com/3box/dist/3box.js"; // prevent rate errors

let web3Modal     // Web3modal instance
var  provider;  // Chosen wallet provider given by the dialog window
let selectedAccount;     // Address of the selected account
var web3;

var initpromise=init();

async function init() {
     await Promise.all(
        [
        await loadScriptAsync("https://unpkg.com/web3@latest/dist/web3.min.js"),
        await loadScriptAsync("https://unpkg.com/web3modal"),        
        await loadScriptAsync("https://unpkg.com/evm-chains/lib/index.js"),        
        await loadScriptAsync("https://unpkg.com/@walletconnect/web3-provider@latest/dist/umd/index.min.js"),
        await loadScriptAsync("https://cdn.jsdelivr.net/npm/fortmatic@latest/dist/fortmatic.js"),        // https://unpkg.com/fortmatic@2.0.6/dist/fortmatic.js
        ])
    console.log("After promise all");	
}    

if (window.ethereum)
    window.ethereum.autoRefreshOnNetworkChange=false; // prevent autoreload
    else
        window.ethereum=1; // so at least a box is shown

window.addEventListener('DOMContentLoaded', asyncloaded);  // load  
 
function ClearCachedProvider() {
    web3Modal.clearCachedProvider();
}

async function asyncloaded() {  
console.log("asyncloaded login")
//console.log(getElement("login"))
//console.log(getElement("login_comment"))   

    console.log("login");
    await initpromise;
   

    const Web3Modal = window.Web3Modal.default;
    const WalletConnectProvider = window.WalletConnectProvider.default;
    const EvmChains = window.EvmChains;
    const Fortmatic = window.Fortmatic;



    console.log("Initializing example");
    console.log("WalletConnectProvider is", WalletConnectProvider);
    console.log("Fortmatic is", Fortmatic);

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
      
      
console.log("web3Modal");      

      web3Modal = new Web3Modal({
        cacheProvider: true, // remember previousely selected
        providerOptions, // required
      });


console.log(web3Modal);

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

export async function Login() {
    await onConnect();    
}

export async function authorize() {
    await onConnect();
}    

/**
 * Connect wallet button pressed.
 */
 
var fOnlyOnce=false;
async function onConnect() {
    console.log("Opening a dialog", web3Modal);
  
    if (fOnlyOnce) return;
    fOnlyOnce=true;
  
    try {
        provider = await web3Modal.connect();
    } catch(e) {
        console.log("Could not get a wallet connection", e);
        if (web3Modal)
            web3Modal.clearCachedProvider(); // clear cached because this didn't work (try again later)
        return;
    }
  
  // Subscribe to accounts change
  
    try {
        provider.on("accountsChanged", (accounts) => {
            fetchAccountData();
            publish("ethereumchanged")
        });

        // Subscribe to chainId change
        provider.on("chainChanged", (chainId) => {
            fetchAccountData();
            publish("ethereumchanged")
        });

        // Subscribe to networkId change
        provider.on("networkChanged", (networkId) => {
            fetchAccountData();
            publish("ethereumchanged")
        });
    } catch(e) {
        console.log("provider on error", e);
        return;
    }
  
    web3 = new Web3(provider);

    console.log("Web3 instance is", web3);

  
    await refreshAccountData();
    console.log("web3providerfound");
    publish("web3providerfound")

    console.log(provider);
}
