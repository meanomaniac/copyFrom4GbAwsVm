var fs = require('fs'), createDataObjects = require('./createDataObjects.js'), qualifyData = require('./qualifyData.js');
var rp = require('request-promise'), request =require('request');

function getMarketPrices (counter, exchange, oldTickerObj, changeThreshold, tickerDBColumns, timeGap, markets, newTickerObj) {
  var tickerUrl;
  var arrayIndex = counter + 1;
  switch (exchange) {
    case 'bittrex':
      tickerUrl = 'https://bittrex.com/api/v1.1/public/getticker?market='+markets[arrayIndex]; break;
    default:
      break;
  }
  var timeNow = new Date();
  var options = {
    method: 'GET',
    uri: tickerUrl,
    headers: { 'User-Agent': 'test' },
    json: true
  }

  rp(options)
    .then(body => {
        var data= body, tickerConditionalObj1, tickerConditionalObj2;
        switch (exchange) {
          case 'bittrex':
          if (data.result) {
            tickerConditionalObj1 = data; tickerConditionalObj2 = data.result;
            btcPriceObj = data.result.Ask; break;
          }
          else {
            console.log('bittrex getticker failed at '+timeNow);
            return;
          }
          default:
            break;
        }
      if (tickerConditionalObj1 != null && tickerConditionalObj2 != null) {
        if ((Object.keys(oldTickerObj)).length == 0) {
          var oldTrackingStatus = 0;
        }
        else {
          var oldTrackingStatus = (oldTickerObj[(Object.keys(oldTickerObj))[0]]).trackingStatus;
        }
        newTickerObj = createDataObjects.createTickerObj(exchange, newTickerObj, markets[arrayIndex], btcPriceObj, timeNow, oldTrackingStatus);
      }
      else {
        console.log(markets[arrayIndex] + " at index: " + arrayIndex+" not found");
      }
    if ((Object.keys(newTickerObj).length)>=(markets.length)) {
      //console.log('all markets covered for '+exchange+' for a total of '+markets.length+' markets');
      newTickerObj = createDataObjects.returnCompleteTickerObj(newTickerObj, oldTickerObj, timeNow);
      qualifyData(exchange, oldTickerObj, newTickerObj, changeThreshold, tickerDBColumns);
      oldTickerObj = newTickerObj;
      setTimeout(function() {
        getAllMarkets (exchange, oldTickerObj, changeThreshold, tickerDBColumns, timeGap);
      }, timeGap);
      //return newTickerObj;
    }

    if (arrayIndex<markets.length-1) {
      getMarketPrices (arrayIndex, exchange, oldTickerObj, changeThreshold, tickerDBColumns, timeGap, markets, newTickerObj);
    }
  })
  .catch(e => {
    var label = markets[arrayIndex];
    newTickerObj[label] = {};
      var errTime = new Date();
      console.log('ticker for exchange '+exchange+' failed at '+errTime);
      //console.log(error);
  })
}


function getAllMarkets (exchange, oldTickerObj, changeThreshold, tickerDBColumns, timeGap) {
  var markets = [], newTickerObj = {};
  switch (exchange) {
    case 'bittrex':
      marketUrl = 'https://bittrex.com/api/v1.1/public/getmarkets'; break;
    default:
      break;
  }
  var newMarkets = [];
  request(marketUrl, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var count = 0, marketLoopArr, btcStr, btcUsdStr, marketObj;
      var data= JSON.parse(body);
      switch (exchange) {
        case 'bittrex':
          marketLoopArr = data.result; btcStr = 'BTC-'; btcUsdStr = 'USDT-BTC'; break;
        default:
          break;
      }
      for (var i in marketLoopArr) {
        switch (exchange) {
          case 'bittrex':
            marketObj = data.result[i].MarketName; break;
          default:
            break;
        }
        if (marketObj.indexOf(btcStr) !== -1 || marketObj == btcUsdStr ) {
          newMarkets.push(marketObj);
          count++;
        }
      }
    }
    else {
        var errTime = new Date();
        console.log('getMarketList for exchange '+exchange+' failed at '+errTime);
        //console.log(error);
    }
    markets = newMarkets;
    getMarketPrices (-1, exchange, oldTickerObj, changeThreshold, tickerDBColumns, timeGap, markets, newTickerObj);
  }, true);
}


module.exports = {getAllMarkets};
