/*
The setIntervalSynchronous function allows the execution of setInterval in a synchronous way (https://gist.github.com/AndersDJohnson/4385908)
*/
var fs = require('fs'), coinExchange = require('./coinExchange.js'), stdGetPublicData = require('./stdGetPublicData.js'),
stdGetPublicData2 = require('./stdGetPublicData2.js'),
//getBittrexPublicData = require('./getBittrexPublicData.js'),
exchangeList = ['coinMarketCap', 'bittrex', 'livecoin', 'cryptopia', 'novaexchange', 'hitBTC', 'yoBit', 'poloniex', 'coinExchange'],
exchangeObjs = {
                coinMarketCap: {},
                bittrex: {},
                livecoin: {},
                cryptopia: {},
                novaexchange: {},
                hitBTC: {},
                yoBit: {},
                poloniex: {},
                coinExchange: {}
},
//exchangeObjsString = JSON.stringify(exchangeObjs),
//exchangeList = ['novaexchange'],
cmcUSDBTC,
exchangeMarketObjs = {
  bittrexMarkets : [],
  yoBitMarkets : [],
  coinExchangeMarkets : {}
}
;

getAllMarketInfo(30000);
stdGetPublicData2.getAllMarkets('bittrex', exchangeMarketObjs);
stdGetPublicData2.getAllMarkets('yoBit', exchangeMarketObjs);
coinExchange.coinExchangeMarkets(exchangeMarketObjs);

setInterval ( () => {
  stdGetPublicData2.getAllMarkets('bittrex', exchangeMarketObjs);
}, 1800);

setInterval ( () => {
  stdGetPublicData2.getAllMarkets('yoBit', exchangeMarketObjs);
}, 1800);

setInterval ( () => {
  coinExchange.coinExchangeMarkets(exchangeMarketObjs);
}, 1800);

function getAllMarketInfo (timeGap) {
  for (var i=0; i<exchangeList.length; i++) {
    switch (exchangeList[i]) {
      case 'cryptopia':
      case 'hitBTC':
      case 'livecoin':
      case 'poloniex':
      case 'novaexchange':
      case 'coinMarketCap':
        (function(i) {
          setInterval ( () => {
            stdGetPublicData.ticker(exchangeList[i], exchangeObjs);
          }, timeGap, i);
        })(i);
        break;
      case 'yoBit':
        (function(i) {
          setInterval ( () => {
            for (var j=0; j<(exchangeMarketObjs.yoBitMarkets).length; j++) {
              (function(j) {
                stdGetPublicData2.getMarketPrices(exchangeList[i], exchangeMarketObjs.yoBitMarkets[j], exchangeObjs);
              })(j);
            }
          }, timeGap, i);
        })(i);
        break;
      case 'bittrex':
      (function(i) {
        setInterval ( () => {
          for (var j=0; j<(exchangeMarketObjs.bittrexMarkets).length; j++) {
            (function(j) {
              stdGetPublicData2.getMarketPrices(exchangeList[i], exchangeMarketObjs.bittrexMarkets[j], exchangeObjs);
            })(j);
          }
        }, timeGap, i);
      })(i);
        break;
      case 'coinExchange':
        (function(i) {
          setInterval ( () => {
            var coinExchangeMarketsStr = JSON.stringify(exchangeMarketObjs.coinExchangeMarkets);
            coinExchange.coinExchangeTicker(coinExchangeMarketsStr, exchangeObjs);
          }, timeGap, i);
        })(i);
        break;
      default:
        break;
    }
  }
 }
