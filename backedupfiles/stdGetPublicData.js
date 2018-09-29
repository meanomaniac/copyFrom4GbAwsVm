var request =require('request'), fs = require('fs'), createDataObjects = require('./createDataObjects.js'),
qualifyData = require('./qualifyData.js');

function ticker (exchange, oldFullTickerObj) {
  //console.log('ticker iteration begins for '+exchange);
  var tickerUrl;
    switch (exchange) {
      case 'cryptopia':
        tickerUrl = 'https://www.cryptopia.co.nz/api/GetMarkets'; break;
      case 'hitBTC':
        tickerUrl = 'https://api.hitbtc.com/api/1/public/ticker'; break;
      case 'livecoin':
        tickerUrl = 'https://api.livecoin.net/exchange/ticker'; break;
      case 'novaexchange':
        tickerUrl = 'https://novaexchange.com/remote/v2/markets/'; break;
      case 'poloniex':
        tickerUrl = 'https://poloniex.com/public?command=returnTicker'; break;
      case 'coinMarketCap':
        tickerUrl = 'https://api.coinmarketcap.com/v1/ticker/'; break;
      default:
        break;
    }
  request(tickerUrl, function (error, response, body) {
    // The following try/catch is needed as for some exchanges an incomplete object is being received (that was syntactically wrong)
    var responseIsValid = true;
    try {
      JSON.parse(body);
    } catch (e) {
      responseIsValid = false;
    }
    if (responseIsValid && !error && response.statusCode == 200 && JSON.parse(body)) {
        var returnObj = JSON.parse(body), tickerLoopArr, btcStr, btcUsdStr,
        newTickerObj = {};
        switch (exchange) {
          case 'cryptopia':
            tickerLoopArr = returnObj.Data; btcStr = '/BTC'; btcUsdStr = 'BTC/USDT'; break;
          case 'hitBTC':
            tickerLoopArr = returnObj; btcStr = 'BTC'; btcUsdStr = 'BTCUSD'; break;
          case 'livecoin':
            tickerLoopArr = returnObj; btcStr = '/BTC'; btcUsdStr = 'BTC/USD'; break;
          case 'novaexchange':
            tickerLoopArr = returnObj.markets; btcStr = 'BTC_'; btcUsdStr = 'BTC_'; break;
          case 'poloniex':
            tickerLoopArr = returnObj; btcStr = 'BTC_'; btcUsdStr = 'USDT_BTC'; break;
          case 'coinMarketCap':
            tickerLoopArr = returnObj; btcStr = ''; btcUsdStr = ''; break;
          default:
            break;
        }
        var timeNow = new Date(), labelObj, btcPriceObj;
        for (var i in tickerLoopArr) {
            switch (exchange) {
              case 'cryptopia':
                labelObj = returnObj.Data[i].Label; btcPriceObj = returnObj.Data[i].AskPrice; break;
              case 'hitBTC':
                labelObj = i; btcPriceObj = returnObj[i].bid; break;
              case 'livecoin':
                labelObj = returnObj[i].symbol; btcPriceObj = returnObj[i].best_ask; break;
              case 'novaexchange':
                labelObj = returnObj.markets[i].marketname; btcPriceObj = returnObj.markets[i].ask; break;
              case 'poloniex':
                labelObj = i; btcPriceObj = returnObj[i].lowestAsk; break;
              case 'coinMarketCap':
                labelObj = returnObj[i].symbol; btcPriceObj = returnObj[i].price_btc; break;
              default:
                break;
            }

            if (tickerLoopArr[i] && (labelObj.indexOf(btcStr) !== -1 || labelObj.indexOf(btcUsdStr) !== -1 )) {
              var marketLabel = labelObj;
              if (((Object.keys((oldFullTickerObj[exchange]))).length == 0) || (((oldFullTickerObj[exchange])[(Object.keys((oldFullTickerObj[exchange])))[0]]).trackingStatus == -1)) {
                var oldTrackingStatus = 0;
              }
              else {
                var oldTrackingStatus = ((oldFullTickerObj[exchange])[(Object.keys((oldFullTickerObj[exchange])))[0]]).trackingStatus;
              }
              newTickerObj = JSON.parse(createDataObjects.createTickerObj(exchange, newTickerObj, labelObj, btcPriceObj, timeNow, oldTrackingStatus, null));
              if (exchange == 'coinMarketCap') {
                newTickerObj[labelObj].SPUSD = returnObj[i].price_usd;
              }
            // save all the markets into an object which will contain properties with the same name as the exchange tradePairs and values being another object with each of the values saved using the file command above
          }
      }
      if (exchange != 'coinMarketCap') {
        newTickerObj = JSON.parse(createDataObjects.returnCompleteTickerObj(newTickerObj, (oldFullTickerObj[exchange]), timeNow));
      }
      qualifyData(exchange, (oldFullTickerObj[exchange]), newTickerObj);
      var newTickerObjString = JSON.stringify(newTickerObj);
      oldFullTickerObj[exchange] =  JSON.parse(newTickerObjString);
      returnObj = tickerLoopArr = btcStr = btcUsdStr = responseIsValid = timeNow = labelObj = btcPriceObj = marketLabel = oldTrackingStatus = newTickerObj = null;
    }
    error = response = body = tickerUrl = exchange = oldFullTickerObj = null;
  });
}

module.exports = {ticker};
