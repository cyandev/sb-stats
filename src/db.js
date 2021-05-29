module.exports = ((reqScheduler) => {
  const { MongoClient } = require('mongodb');

  //old db uri: mongodb+srv://admin:${process.env.MONGO_PASSWORD}@cluster0.bjpjk.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority
  const uri = `mongodb+srv://admin:${process.env.MONGO_PASSWORD}@cluster0.bjpjk.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
  const client = new MongoClient(uri, {useNewUrlParser: true});

  /* Database Connection */

  var playersCollection;
  var guildsCollection;
  var dbLoaded = new Promise((res,rej) => {
    await client.connect();

    playersCollection = client.db(process.env.DB_NAME).collection("Players");
    guildsCollection = client.db(process.env.DB_NAME).collection("Guilds");

    prunePlayers();
    refreshOldestPlayers();

    res(true);
  });

  /* Database Management */

  async function prunePlayers() { //delete users who's profiles havent been queried by either an internal system or a user in 14 days
    let deleted = await playersCollection.deleteMany({
      lastRequested: {
        $lt: Date.now() - 1000 * 60 * 60 * 24 * 14
      }
    })
  }

  setInterval(prunePlayers, 1000 * 60 * 60) //prune players every hour

  async function refreshOldestPlayers(limit=10) {
    let oldestArr = await playersCollection.find({lastUpdated: {$lt: Date.now() - 1000 * 60 * 10}}).sort({lastUpdated: 1}).limit(limit).toArray();
    for (let oldest of oldestArr) {
      await getPlayerData(oldest.name, false, 2, oldest.uuid, false);
      await new Promise(res => setTimeout(res, 500));
    }
    setTimeout(refreshOldestPlayers, 5000); //pause then do it again
  }

  return {
    async getGuilds() {
      if (await dbLoaded) return guildsCollection;
    },
    async getPlayers() {
      if (await dbLoaded) return playersCollection;
    }
  }
})