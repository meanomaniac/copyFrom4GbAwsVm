// Bittrex
var request =require('request');
var fs = require('fs');
var BittrexMarkets = ['USDT-BTC', 'USDT-ETH'];

function getBittrexMarketPrices (counter) {
  var arrayIndex = counter + 1;
  var timeNow = new Date();
    request('https://bittrex.com/api/v1.1/public/getticker?market='+BittrexMarkets[arrayIndex], function (error, response, body) {
      if (!error && response.statusCode == 200) {
        data= JSON.parse(body);

      if (data!=null && data.result!=null) {
        fs.appendFile("/Users/akhilkamma/Desktop/DEV/newProjectTicB/bittrexSampleTickerAsk2.txt", BittrexMarkets[arrayIndex]+": "+JSON.stringify(data.result.Ask)+", "+timeNow+"\n", function(err) {
            if(err) { return console.log(err); }
        });
      }
      else {
        console.log(BittrexMarkets[arrayIndex] + " at index: " + arrayIndex+" not found");
      }
    }
  }, true);

  if (arrayIndex<BittrexMarkets.length-1) {
    getBittrexMarketPrices (arrayIndex);
  }
  else {
    // console.log('ticker complete');
    return;
  }
}

function getAllBittrexMarkets () {
  newBittrexMarkets = ['USDT-BTC', 'USDT-ETH'];
  request('https://bittrex.com/api/v1.1/public/getmarkets', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var count = 2;
      var data= JSON.parse(body);
      for (var i in data.result) {
        // Also add logic to delete the corresponding db table and copy these new markets instead
        if (data.result[i].MarketName.substring(0,4) == 'BTC-' || data.result[i].MarketName == 'USDT-BTC' ) {
          newBittrexMarkets.push(data.result[i].MarketName);
          fs.appendFile("/Users/akhilkamma/Desktop/DEV/newProjectTicB/bittrexBTCMarkets.txt", data.result[i].MarketName+"\n", function(err) {
              if(err) { return console.log(err); }
          });
          count++;
        }
      }
    }
    BittrexMarkets = newBittrexMarkets;
    // console.log("total markets count: "+count);
    // console.log("markets array: "+markets);
    getBittrexMarketPrices (-1);
  }, true);
}

/*
module.exports = {
  ticker: getAllBittrexMarkets
}
*/
module.exports = getAllBittrexMarkets;


/*
order book
https://bittrex.com/api/v1.1/public/getorderbook?market=BTC-LTC&type=both
https://bittrex.com/api/v1.1/public/getorderbook?market=BTC-LTC&type=both&depth=50

order history - last 200
https://bittrex.com/api/v1.1/public/getmarkethistory?market=BTC-DOGE

last 24 hr summary
https://bittrex.com/api/v1.1/public/getmarketsummary?market=btc-ltc

*/
