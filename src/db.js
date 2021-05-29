module.exports = (() => {
  const { MongoClient } = require('mongodb');

  //old db uri: mongodb+srv://admin:${process.env.MONGO_PASSWORD}@cluster0.bjpjk.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority
  const uri = `mongodb+srv://admin:${process.env.MONGO_PASSWORD}@cluster0.bjpjk.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
  const client = new MongoClient(uri, {useNewUrlParser: true});

  /* Database Connection */

  var playersCollection;
  var guildsCollection;
  var dbLoaded = new Promise(async (res,rej) => { // eslint-disable-line -- needs to be async and call the async method, the errors from awaited code are logged
    await client.connect().catch((err) => console.log(err));

    playersCollection = client.db(process.env.DB_NAME).collection("Players");
    guildsCollection = client.db(process.env.DB_NAME).collection("Guilds");

    prunePlayers();

    res(true);
  });

  /* Database Management */

  async function prunePlayers() { //delete users who's profiles havent been queried by either an internal system or a user in 14 days
    await playersCollection.deleteMany({
      lastRequested: {
        $lt: Date.now() - 1000 * 60 * 60 * 24 * 14
      }
    });
  }

  setInterval(prunePlayers, 1000 * 60 * 60) //prune players every hour

  return {
    async getGuilds() {
      if (await dbLoaded) return guildsCollection;
    },
    async getPlayers() {
      if (await dbLoaded) return playersCollection;
    }
  }
})