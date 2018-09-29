// Livecoin -
var fs = require('fs');
var request =require('request');

function livecoinTicker () {
  request('https://api.livecoin.net/exchange/ticker', function (error, response, body) {
    if (!error && response.statusCode == 200) {
        var returnObj = JSON.parse(body);
        var timeNow = new Date();
        for (var i in returnObj) {
          if (returnObj[i].symbol.indexOf('/BTC') !== -1 || returnObj[i].symbol.indexOf('BTC/USD') !== -1 ) {
           fs.appendFile("/Users/akhilkamma/Desktop/DEV/newProjectTicB/Livecoin.txt", "symbol: "+returnObj[i].symbol+", SP: "+returnObj[i].best_ask+", time: "+timeNow+", trackingStatus: \n", function(err) {
              if(err) { return console.log(err); }
          });
        }
      }
    }
  });
}

module.exports = livecoinTicker;

/*
current orders
https://api.livecoin.net/exchange/order_book?currencyPair=BTC/USD

min, max
https://api.livecoin.net/exchange/maxbid_minask?currencyPair=BTC/USD

order history
https://api.livecoin.net/exchange/last_trades?currencyPair=BTC/USD&minutesOrHour=false
change minutesOrHour to true for last minute

https://api.livecoin.net/exchange/last_trades?currencyPair=BTC/USD&minutesOrHour=false&type=BUY
https://api.livecoin.net/exchange/last_trades?currencyPair=BTC/USD&minutesOrHour=false&type=sell
*/
