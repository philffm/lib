class KoiosDB {
  constructor (Ipfs, OrbitDB) {
    this.OrbitDB = OrbitDB;
    this.Ipfs = Ipfs;
    this.onready = function() {
      console.log(`Everything is ready. DB id:${this.orbitdb.id} `);
    };

    this.defaultDbOptions = {
      accessController: { write: ["*"] },
      meta: { name: 'demonstration docs' },
      indexBy: 'doc'
    };
  }

  async _init() {
    this.node = await this.Ipfs.create({
      repo: './create-db-ipfs',
      config: {  Addresses: { Swarm: [
          "/ip4/0.0.0.0/tcp/4002",
          "/ip4/127.0.0.1/tcp/4003/ws" // to allow interaction with browser
      ] } }
    });
    //this.node.on('error', (e) => { throw (e); });
    //this.node.on('ready', this._init.bind(this));
    //TODO ADD ERROR HANDLING? HOW?

    this.orbitdb = await this.OrbitDB.createInstance(this.node, {
      directory: './create-db-orbitdb'});
    this.onready();
  }

  async _createDB() {
    this.db = await this.orbitdb.docs('jsondb', this.defaultDbOptions);
    await this.db.load();
    console.log("Database Loaded");
  }

  async _connectToDB(_dbid) {
    //this.db = await this.orbitdb.open(_dbid, this.defaultDbOptions);
    this.db = await this.orbitdb.docs(_dbid, this.defaultDbOptions);
    await this.db.load();
    console.log("Database Loaded");
  }

  async addJson(id, json) {
  // const existingPiece = this.getPieceByHash(hash)
  //if (existingPiece) {
   // await this.updatePieceByHash(hash, instrument)
   //return;
  //}
  //var putOBJ = { _id:`${id}`, doc:{json}};
  var jsonTest = { _id: 'testid', doc: {energie: 5, voedingswaren:"33", prijs: 700}};

  var cid = await this.db.put(jsonTest);
  return cid;
  }

  async getJsonById(id) {
    console.log(await this.db.query((e)=>e.doc));
    return await this.db.query((e)=>e.doc);
  }

  async events() {
    this.db.events.on('replicated', () => {  // When the second database replicated new heads, query the database
        const result = db.iterator({ limit: -1 }).collect().map(e => e.payload.value);
        console.log(`#records: ${result.length}`);
    })
  }

  async addTestWriter() {
    setInterval(async () => { // add a record every 10 seconds
        var h1=await db.add({ time: new Date().getTime() });
        const result = db.iterator({ limit: -1 }).collect().map(e => e.payload.value);
        console.log(`#records: ${result.length}`);
      }, 10000);
  }
}













//ISOMORPHIC
try {
  const Ipfs = require('ipfs');
  const OrbitDB = require('orbit-db');

  module.exports = exports = new KoiosDB(Ipfs, OrbitDB);

} catch (e){
  window.TDB = new KoiosDB(window.Ipfs, window.OrbitDB);
}
