// hitBTC
var request =require('request');
var fs = require('fs');

function hitBTCTicker () {
  request('https://api.hitbtc.com/api/1/public/ticker', function (error, response, body) {
    if (!error && response.statusCode == 200) {
        var returnObj = JSON.parse(body);
        var timeNow = new Date();
          for (var i in returnObj) {
          if (returnObj[i] != null && i.indexOf("BTC") !== -1) {
         fs.appendFile("/Users/akhilkamma/Desktop/DEV/newProjectTicB/hitBTCticker.txt", "symbol: "+i+", SP: "+returnObj[i].bid+", time: "+timeNow+", trackingStatus: \n", function(err) {
            if(err) { return console.log(err); }
        });
      }
      }
    }
  });
}

module.exports = hitBTCTicker;

/*
current orders
https://api.hitbtc.com/api/1/public/BCNBTC/orderbook

order history
https://api.hitbtc.com/api/1/public/BTCUSD/trades?from=1499305319489&by=ts
from value in the above url is UTC in ms, first get the currrent UTC in ms using
https://api.hitbtc.com//api/1/public/time
and then subtract 3600000 from it to get an hour earliers time in UTC ms
*/
