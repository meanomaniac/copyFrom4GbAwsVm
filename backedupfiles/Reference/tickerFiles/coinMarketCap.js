//Coin Market Cap
var request =require('request');
var fs = require('fs');
module.exports = {
    ticker : function () {
    request('https://api.coinmarketcap.com/v1/ticker/', function (error, response, body) {
      if (!error && response.statusCode == 200) {
           returnObj = JSON.parse(body);
          var timeNow = new Date();
          for (var i in returnObj) {
           fs.appendFile("/Users/akhilkamma/Desktop/DEV/newProjectTicB/CMC.txt", "USD-"+returnObj[i].symbol+": "+returnObj[i].price_usd+", BTC-"+returnObj[i].symbol+": "+returnObj[i].price_btc+", time: "+timeNow+", trackingStatus: \n", function(err) {
              if(err) { return console.log(err); }
          });
        }
      }
    });
  }
}
