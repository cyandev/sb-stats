module.exports = ((reqScheduler) => {
    var bazaarData;
    (async () => {bazaarData = await getBazaarData()});

    async function getBazaarData() {
        return (await reqScheduler.get(`https://api.hypixel.net/skyblock/bazaar?key=${process.env.API_KEY}`)).data.products
    }
    setInterval(async () => bazaarData = await getBazaarData(), 1000 * 60 * 60);

    return {
        async data() {
            if (bazaarData) {
                return bazaarData;
            } else {
                bazaarData = await getBazaarData();
                return bazaarData;
            }
        }
    }

})