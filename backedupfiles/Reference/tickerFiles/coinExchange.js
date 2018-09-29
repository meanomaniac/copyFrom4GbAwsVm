//CoinExchange - change marketIDs to currencies

var fs = require('fs');
var rp = require('request-promise'), createDataObjects = require('./createDataObjects.js');;
var coinExchangeMarketMap = {};

function coinExchangeTicker() {
  var options = {
    method: 'GET',
    uri: 'https://www.coinexchange.io/api/v1/getmarketsummaries',
    headers: { 'User-Agent': 'test' },
    json: true
  }

  rp(options)
    .then(body => {
         var timeNow = new Date();
         if (body.result !=null && body.result !=undefined) {
           var returnObj = body.result;
         }
         for (var i=0; i<Object.keys(returnObj).length; i++) {
         if (returnObj[Object.keys(returnObj)[i]] != null) {
        fs.appendFile("/Users/akhilkamma/Desktop/DEV/newProjectTicB/CoinExchange.txt", "MarketID: "+returnObj[Object.keys(returnObj)[i]].MarketID+", symbol: "+coinExchangeMarketMap[returnObj[Object.keys(returnObj)[i]].MarketID]+", SP: "+returnObj[Object.keys(returnObj)[i]].AskPrice+", time: "+timeNow+", trackingStatus: \n", function(err) {
           if(err) { return console.log(err); }
       });
     }
     }
    })
    .catch(e => {
      // handle error
    })
}

function coinExchangeMarkets () {
  var options = {
    method: 'GET',
    uri: 'https://www.coinexchange.io/api/v1/getmarkets',
    headers: { 'User-Agent': 'test' },
    json: true
  }

  rp(options)
    .then(body => {
         var timeNow = new Date();
         if (body.result !=null && body.result !=undefined) {
          var returnObj = body.result;
          }
         for (var i=0; i<Object.keys(returnObj).length; i++) {
          if (returnObj[Object.keys(returnObj)[i]] != null ) {

             if (returnObj[Object.keys(returnObj)[i]].BaseCurrencyCode == 'BTC') {
         coinExchangeMarketMap[returnObj[Object.keys(returnObj)[i]].MarketID] = returnObj[Object.keys(returnObj)[i]].MarketAssetCode+"-"+returnObj[Object.keys(returnObj)[i]].BaseCurrencyCode;
        }
       }
     }
     coinExchangeTicker ();
    })
    .catch(e => {
      // handle error
    })
}

//bid = buy; ask = sell;

function getOpenOrders (tradePairArr, iterator) {
  var options = {
    method: 'GET',
    uri: 'https://www.coinexchange.io/api/v1/getorderbook?market_id='+tradePairArr[iterator],
    headers: { 'User-Agent': 'test' },
    json: true
  }

  rp(options)
    .then(body => {
    iterator++;
      if (!error && response.statusCode == 200 && JSON.parse(body) != null) {
        var returnObj2 = (JSON.parse(body));
        var buyLoopVar = returnObj2.result.BuyOrders; var ellLoopVar = returnObj2.result.SellOrders;
        var buyArray = [], sellArray = [], totalBuyAmount = 0, totalSellAmount = 0;
          for (var i in buyLoopVar) {
          var buyObj = Number(returnObj2.result.BuyOrders[i].Quantity)*Number(returnObj2.result.BuyOrders[i].Price);
           buyArray.push(+buyObj);
           totalBuyAmount+=buyObj;
        }
        for (var i in sellLoopVar) {
        var sellObj = Number(returnObj2.result.SellOrders[i].Quantity)*Number(returnObj2.result.SellOrders[i].Price); break;
         sellArray.push(+sellObj);
         totalSellAmount+=sellObj;
      }
      if (buyArray.length == 0) {
        buyArray.push(0);
      }
      if (sellArray.length == 0) {
        sellArray.push(0);
      }
      var timeNow = new Date();
      createDataObjects.returnopenOrdersObj(exchange, tradePairArr[iterator], Math.max.apply(Math, buyArray), Math.min.apply(Math, buyArray),
                                      buyLoopVar.length, totalBuyAmount, Math.max.apply(Math, sellArray),
                                      Math.min.apply(Math, sellArray), sellLoopVar.length, totalSellAmount, timeNow);
      }
      else {
        console.log('get in openOrders for exchange: '+exchange+', failed: ');
        console.log(tradePairArr[iterator]);
        console.log(error);
      }
      if (iterator<tradePairArr.length-1) {
        openOrders (exchange, tradePairArr, iterator);
      }
  }
}

function getOrderHistory (tradePairArr, iterator) {
  var options = {
    method: 'GET',
    uri: 'https://www.coinexchange.io/api/v1/getorderbook?market_id='+tradePairArr[iterator],
    headers: { 'User-Agent': 'test' },
    json: true
  }

  rp(options)
    .then(body => {
    iterator++;
      if (!error && response.statusCode == 200 && JSON.parse(body) != null) {
        var returnObj2 = (JSON.parse(body));
        var buyLoopVar = returnObj2.result.BuyOrders; var ellLoopVar = returnObj2.result.SellOrders;
        var buyArray = [], sellArray = [], totalBuyAmount = 0, totalSellAmount = 0;
          for (var i in buyLoopVar) {
          var buyObj = Number(returnObj2.result.BuyOrders[i].Quantity)*Number(returnObj2.result.BuyOrders[i].Price);
           buyArray.push(+buyObj);
           totalBuyAmount+=buyObj;
        }
        for (var i in sellLoopVar) {
        var sellObj = Number(returnObj2.result.SellOrders[i].Quantity)*Number(returnObj2.result.SellOrders[i].Price); break;
         sellArray.push(+sellObj);
         totalSellAmount+=sellObj;
      }
      if (buyArray.length == 0) {
        buyArray.push(0);
      }
      if (sellArray.length == 0) {
        sellArray.push(0);
      }
      var timeNow = new Date();
      createDataObjects.returnopenOrdersObj(exchange, tradePairArr[iterator], Math.max.apply(Math, buyArray), Math.min.apply(Math, buyArray),
                                      buyLoopVar.length, totalBuyAmount, Math.max.apply(Math, sellArray),
                                      Math.min.apply(Math, sellArray), sellLoopVar.length, totalSellAmount, timeNow);
      }
      else {
        console.log('get in openOrders for exchange: '+exchange+', failed: ');
        console.log(tradePairArr[iterator]);
        console.log(error);
      }
      if (iterator<tradePairArr.length-1) {
        openOrders (exchange, tradePairArr, iterator);
      }
  }
}

module.exports = {coinExchangeMarkets, getOpenOrders, getOrderHistory};

/*
current orders:
https://www.coinexchange.io/api/v1/getorderbook?market_id=19

order history - not sure how far the result goes back
https://www.coinexchange.io/api/v1/getmarketsummary?market_id=19
*/
