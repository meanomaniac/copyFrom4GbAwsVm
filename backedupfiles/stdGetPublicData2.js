var request =require('request'), fs = require('fs'), createDataObjects = require('./createDataObjects.js'),
qualifyData = require('./qualifyData.js');

function getMarketPrices (exchange, market, oldFullTickerObj) {
  var tickerUrl;
  if (market) {
    if ((market.toUpperCase().indexOf('BTC') !== -1) && (market.toUpperCase().indexOf('USDE') == -1) && ((market.toUpperCase().indexOf('USD') !== -1) || (market.toUpperCase().indexOf('USA') !== -1))) {
      var label = 'USD_BTC';
    }
    else {
      var label = market;
    }
  }
  else {
    return;
  }
  switch (exchange) {
    case 'bittrex':
      tickerUrl = 'https://bittrex.com/api/v1.1/public/getticker?market=';
      break;
    case 'yoBit':
      tickerUrl = 'https://yobit.net/api/3/ticker/';
      break;
    default:
      break;
  }
  request(tickerUrl+market, function (error, response, body) {
      // The following try/catch is needed as for some exchanges an incomplete object is being received (that was syntactically wrong)
      var responseIsValid = true;
      try {
        JSON.parse(body);
      } catch (e) {
        responseIsValid = false;
      }

    if (responseIsValid && !error && response.statusCode == 200 && JSON.parse(body)) {
      var data= JSON.parse(body), tickerConditionalObj1, tickerConditionalObj2, btcPriceObj = null, newTickerObj = {};
      switch (exchange) {
        case 'bittrex':
          if (data.result) {
            tickerConditionalObj1 = data; tickerConditionalObj2 = data.result;
            btcPriceObj = data.result.Ask; break;
          }
        case 'yoBit':
          if (data[Object.keys(data)[0]]) {
            tickerConditionalObj1 = data[Object.keys(data)[0]]; tickerConditionalObj2 = data[Object.keys(data)[0]];
            btcPriceObj = data[Object.keys(data)[0]].buy; break;
          }
        default:
          break;
      }
      if (btcPriceObj && tickerConditionalObj1 && tickerConditionalObj2) {
        if (((Object.keys((oldFullTickerObj[exchange]))).length == 0) || (((oldFullTickerObj[exchange])[(Object.keys((oldFullTickerObj[exchange])))[0]]).trackingStatus == -1)){
          var oldTrackingStatus = 0;
        }
        else {
          var oldTrackingStatus = ((oldFullTickerObj[exchange])[(Object.keys((oldFullTickerObj[exchange])))[0]]).trackingStatus;
        }
        var timeNow = new Date();
        newTickerObj = JSON.parse(createDataObjects.createTickerObj(exchange, newTickerObj, market, btcPriceObj, timeNow, oldTrackingStatus, (oldFullTickerObj[exchange]).USD_BTC));
        qualifyData(exchange, (oldFullTickerObj[exchange]), newTickerObj);
        var newTickerObjStr = JSON.stringify(newTickerObj[label]);
        (oldFullTickerObj[exchange])[label] = JSON.parse(newTickerObjStr);
      }
      else if (btcPriceObj != 0) {
        newTickerObj[label] = {};
      }
      data = tickerConditionalObj1 = tickerConditionalObj2 = btcPriceObj = oldTrackingStatus = newTickerObj = null;
    }
    // moved the recursive call for yoBit and Bittrex (to continue the ticker) outside as for some reason its not getting called on
    // some occasions (with no error).
    tickerUrl = label = timeNow = responseIsValid = exchange = error = response = body = oldFullTickerObj = null;
  }, true);

}

function getAllMarkets (exchange, currentMarkets) {
  var marketUrl;
  switch (exchange) {
    case 'bittrex':
      marketUrl = 'https://bittrex.com/api/v1.1/public/getmarkets'; break;
    case 'yoBit':
      marketUrl = 'https://yobit.net/api/3/info'; break;
    default:
      break;
  }
  request(marketUrl, function (error, response, body) {
    var responseIsValid = true;
    try {
      JSON.parse(body);
    } catch (e) {
      responseIsValid = false;
      //console.log ('invalid ticker response received from '+exchange);
    }

    if (responseIsValid && !error && response.statusCode == 200) {
      var count = 0, marketLoopArr, btcStr, btcUsdStr, marketObj, newMarkets = [], marketObjParam;
      var data= JSON.parse(body);
      switch (exchange) {
        case 'bittrex':
          marketLoopArr = data.result; btcStr = 'BTC-'; btcUsdStr = 'USDT-BTC', marketObjParam = 'bittrexMarkets'; break;
        case 'yoBit':
          marketLoopArr = data.pairs; btcStr = '_btc'; btcUsdStr = 'btc_usd', marketObjParam = 'yoBitMarkets'; break;
        default:
          break;
      }
      for (var i in marketLoopArr) {
        switch (exchange) {
          case 'bittrex':
            marketObj = data.result[i].MarketName; break;
          case 'yoBit':
            marketObj = i; break;
          default:
            break;
        }
        if (marketObj.indexOf(btcStr) !== -1 || marketObj == btcUsdStr ) {
          newMarkets.push(marketObj);
          count++;
        }
      }
      currentMarkets[marketObjParam] = JSON.parse(JSON.stringify(newMarkets));
      count = marketLoopArr = btcStr = btcUsdStr = marketObj = data = newMarkets = currentMarkets = null;
    }
    error = response = body = marketUrl = responseIsValid = exchange = null;
  }, true);
}


module.exports = {getAllMarkets, getMarketPrices};
