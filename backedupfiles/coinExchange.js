var fs = require('fs'), createDataObjects = require('./createDataObjects.js'), qualifyData = require('./qualifyData.js');
var rp = require('request-promise');

function coinExchangeTicker(coinExchangeMarketMapStr, oldFullTickerObj) {
  // console.log('ticker iteration begins for coinExchange');
  var options = {
    method: 'GET',
    uri: 'https://www.coinexchange.io/api/v1/getmarketsummaries',
    headers: { 'User-Agent': 'test' },
    json: true
  }

  rp(options)
    .then(body => {
         var timeNow = new Date(), newTickerObj = {}, coinExchangeMarketMap = JSON.parse(coinExchangeMarketMapStr);
         if (body.result) {
           var returnObj = body.result;
         }
         for (var arrayIndex in returnObj) {
         if (returnObj[arrayIndex]) {
           if ((Object.keys((oldFullTickerObj['coinExchange']))).length == 0) {
             var oldTrackingStatus = 0;
           }
           else {
             var oldTrackingStatus = ((oldFullTickerObj['coinExchange'])[(Object.keys((oldFullTickerObj['coinExchange'])))[0]]).trackingStatus;
           }
           newTickerObj = JSON.parse(createDataObjects.createTickerObj('coinExchange', newTickerObj, (coinExchangeMarketMap[returnObj[arrayIndex].MarketID]+'::'+returnObj[arrayIndex].MarketID), returnObj[arrayIndex].AskPrice, timeNow, oldTrackingStatus));

         }
       }
       newTickerObj = JSON.parse(createDataObjects.returnCompleteTickerObj(newTickerObj, (oldFullTickerObj['coinExchange']), timeNow));
       qualifyData('coinExchange', (oldFullTickerObj['coinExchange']), newTickerObj);
       var newTickerObjString = JSON.stringify(newTickerObj);
       oldFullTickerObj['coinExchange'] = JSON.parse(newTickerObjString);
       timeNow = newTickerObj = newTickerObjString = coinExchangeMarketMapStr = options = returnObj = oldTrackingStatus = oldFullTickerObj  = body = null;
    })
    .catch(e => {
      coinExchangeMarketMapStr = options = e = oldFullTickerObj = null;
    })

}

function coinExchangeMarkets (currentMarkets) {
  var options = {
    method: 'GET',
    uri: 'https://www.coinexchange.io/api/v1/getmarkets',
    headers: { 'User-Agent': 'test' },
    json: true
  }
  rp(options)
    .then(body => {
         var timeNow = new Date(), coinExchangeMarketMap = {};
         if (body.result) {
          var returnObj = body.result;
          }
         for (var arrayIndex in returnObj) {
          if (returnObj[arrayIndex]) {

             if (returnObj[arrayIndex].BaseCurrencyCode == 'BTC') {
         coinExchangeMarketMap[returnObj[arrayIndex].MarketID] = returnObj[arrayIndex].MarketAssetCode+"-"+returnObj[arrayIndex].BaseCurrencyCode;
        }
       }
     }
     currentMarkets['coinExchangeMarkets'] = coinExchangeMarketMap;
     timeNow = returnObj  = body = coinExchangeMarketMap = currentMarkets = null;
    })
    .catch(e => {
      timeNow = returnObj = e = null;
    })
    options = newTickerObj = null;
}

function getOpenOrders (tradePairArrStr, iterator) {
  iterator++;
  var tradePairArr = JSON.parse(tradePairArrStr);
  var tradePair = tradePairArr[iterator];
  tradePair = (tradePair.split("::"))[1];
  var options = {
    method: 'GET',
    uri: 'https://www.coinexchange.io/api/v1/getorderbook?market_id='+tradePair,
    headers: { 'User-Agent': 'test' },
    json: true
  }

  rp(options)
    .then(body => {
        var returnObj2 = body;
        var buyLoopVar = returnObj2.result.BuyOrders; var sellLoopVar = returnObj2.result.SellOrders;
        var buyArray = [], sellArray = [], totalBuyAmount = 0, totalSellAmount = 0;
          for (var i in buyLoopVar) {
          var buyObj = Number(returnObj2.result.BuyOrders[i].Quantity)*Number(returnObj2.result.BuyOrders[i].Price);
           buyArray.push(+buyObj);
           totalBuyAmount+=buyObj;
        }
        for (var i in sellLoopVar) {
        var sellObj = Number(returnObj2.result.SellOrders[i].Quantity)*Number(returnObj2.result.SellOrders[i].Price);
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
      createDataObjects.returnopenOrdersObj('coinExchange', tradePair, Math.max.apply(Math, buyArray), Math.min.apply(Math, buyArray),
                                      buyLoopVar.length, totalBuyAmount, Math.max.apply(Math, sellArray),
                                      Math.min.apply(Math, sellArray), sellLoopVar.length, totalSellAmount, timeNow);
      if (iterator<tradePairArr.length-1) {
        setTimeout(function () {getOpenOrders (tradePairArrStr, iterator);}, 200);
      }
      tradePairArr = options = returnObj2 = buyLoopVar = sellLoopVar = buyArray = sellArray = totalBuyAmount  = body = totalSellAmount = null;
  })
  .catch(e => {
    tradePairArr = options = e = null;
  })
}


function getOrderHistory (tradePairArrStr, iterator) {
  iterator++;
  var tradePairArr = JSON.parse(tradePairArrStr);
  var tradePair = tradePairArr[iterator];
  tradePair = (tradePair.split("::"))[1];
  var options = {
    method: 'GET',
    uri: 'https://www.coinexchange.io/api/v1/getmarketsummary?market_id='+tradePair,
    headers: { 'User-Agent': 'test' },
    json: true
  }

  rp(options)
    .then(body => {
          var returnObj3 = body;
          var timeNow = new Date();
          createDataObjects.returnHistoryObj('coinExchange', tradePair, 0, 0,
                                        returnObj3.result.BuyOrderCount, returnObj3.result.BTCVolume, 0,
                                        0, returnObj3.result.SellOrderCount, 0, timeNow);
        if (iterator<tradePairArr.length-1) {
            setTimeout(function () {getOrderHistory (tradePairArrStr, iterator);}, 200);
          }
      tradePairArr = options = returnObj3 = timeNow = body = null;
  })
  .catch(e => {
    tradePairArr = options = e = null;
  })
}


module.exports = {coinExchangeMarkets, getOpenOrders, getOrderHistory, coinExchangeTicker};
