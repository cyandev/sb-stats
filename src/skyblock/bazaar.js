var initd = false;
var bazaarData;
var reqScheduler;
module.exports = ((reqSchedulerNew) => {
    async function getBazaarData() {
        return (await reqScheduler.get(`https://api.hypixel.net/skyblock/bazaar?key=${process.env.API_KEY}`)).data.products
    }
    if (!initd && reqSchedulerNew) {
        reqScheduler = reqSchedulerNew;
        (async () => {bazaarData = await getBazaarData()});
        setInterval(async () => bazaarData = await getBazaarData(), 1000 * 60 * 60);
    }

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