const fetch = require('node-fetch');
const fs = require('fs'); 
const IpfsHttpClient = require('ipfs-http-client')

	
var dir="extra"



async function init() {
	var options= {withFileTypes:false }
	var filenames = fs.readdirSync(dir,options); 
	console.log(filenames);
	
	var list=[]	
	var staticfile=undefined
	try {staticfile = fs.readFileSync("static.json") } catch (error) {console.log(error) }
	if (staticfile) {
		var list2=JSON.parse(staticfile)
		if (list2)
			for (var i=0;i<list2.length;i++)
				list.push(list2[i])
	}
	
	console.log(list)
	
	
	var ipfs = await IpfsHttpClient( 'https://ipfs.infura.io:5001'); //for infura node
	console.log(await ipfs.version())
	
	for (var i=0;i<filenames.length;i++) {
		var item={};
		var fn=filenames[i];
		const file = fs.readFileSync(`${dir}\\${fn}`)
		//console.log(file);
		
		var FileObject={ "path": fn,"content": file }
		for await (const result of ipfs.add(FileObject ,{wrapWithDirectory:true} )) {
            var cid=result.cid.toString();
			console.log(cid)
		}
		console.log(`${fn} ${cid}`);
		item.data=cid
		item.url="https://nbviewer.jupyter.org/urls/ipfs.io/ipfs/"+cid+"/"+fn
		item.fullname=cid+"\/"+fn
		item.chapter=fn.split(" ")[0]
		item.title=fn
		list.push(item)
	}
	
	
	
	
	staticfile=undefined
	try { staticfile = fs.readFileSync("allslides.json") } catch (error) {console.log(error) }
	if (staticfile){
		var list3=JSON.parse(staticfile)
		if (list3)
			for (var i=0;i<list3.length;i++)
				list.push(list3[i])
	}
	
	var listjson=JSON.stringify(list)
	 for await (const result of ipfs.add(listjson)) 
            var cid=result.path;
	
console.log(listjson);
console.log(cid)
fs.appendFileSync("ipfs.json","\n"+cid)



}

init();
