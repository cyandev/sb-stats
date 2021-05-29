var initd = false;
var auctionData;
var reqScheduler;
module.exports = ((reqSchedulerNew) => {
    async function getAuctionData() {
        let items = [];
        console.log("loading BIN auctions...");
        let firstReq = (await reqScheduler.get(`https://api.hypixel.net/skyblock/auctions?key=${process.env.API_KEY}`,1)).data;
        let totalPages = firstReq.totalPages;
        for (let i = 0; i <= totalPages; i++) { //the real number of pages is totalPages+1, totalPages is just the highest index
          let page = (await reqScheduler.get(`https://api.hypixel.net/skyblock/auctions?key=${process.env.API_KEY}&page=${i}`,1)).data.auctions;
          page = page.filter(x => x.bin); //only care about BIN auctions
          items = items.concat(page);
          console.log(`fetched BIN auctions ${i+1} / ${totalPages + 1}`);
        }
        let priceMap = {};
        for (let item of items) {
          if (priceMap[item.item_name]) {
            if (priceMap[item.item_name] > item.starting_bid) priceMap[item.item_name] = item.starting_bid
          } else {
            priceMap[item.item_name] = item.starting_bid
          }
        }
        return priceMap;
    }

    if (!initd) {
        reqScheduler = reqSchedulerNew;
        (async () => {auctionData = await getAuctionData()});
        setInterval(async () => auctionData = await getAuctionData(), 1000 * 60 * 60);
    }

    return {
        async data() {
            if (auctionData) {
                return auctionData;
            } else {
                auctionData = await getAuctionData();
                return auctionData;
            }
        }
    }

})