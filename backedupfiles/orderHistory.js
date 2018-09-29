var rp = require('request-promise'), fs = require('fs'), createDataObjects = require('./createDataObjects.js');

function getOrderHistory (exchange, tradePairArrStr, iterator) {
  iterator++;
  var tradePairArr = JSON.parse(tradePairArrStr);
  var openOrdersUrl;
  if (exchange == 'cryptopia') {
    if (tradePairArr[iterator].includes('/')) {
      var tradePairSplitArr = tradePairArr[iterator].split('/');
      tradePairArr[iterator] = tradePairSplitArr[0]+'_'+tradePairSplitArr[1];
    }
  }
  var dayOldUTCEpoch = parseInt(((new Date()).getTime()-(3600000*24))/1000);
  var nowUTCEpoch = parseInt(((new Date()).getTime())/1000);
  switch (exchange) {
    case 'cryptopia':
        openOrdersUrl = 'https://www.cryptopia.co.nz/api/GetMarketHistory/'+tradePairArr[iterator]+'/'; break;
    case 'bittrex':
        openOrdersUrl = 'https://bittrex.com/api/v1.1/public/getmarkethistory?market='+tradePairArr[iterator]; break;
    case 'hitBTC':
        openOrdersUrl = 'https://api.hitbtc.com/api/1/public/'+tradePairArr[iterator]+'/trades?from='+(dayOldUTCEpoch*1000)+'&by=ts'; break;
    case 'livecoin':
        openOrdersUrl = 'https://api.livecoin.net/exchange/last_trades?currencyPair='+tradePairArr[iterator]+'&minutesOrHour=false'; break;
    case 'poloniex':
        openOrdersUrl = 'https://poloniex.com/public?command=returnTradeHistory&currencyPair='+tradePairArr[iterator]+'&start='+dayOldUTCEpoch+'&end='+nowUTCEpoch; break;
    case 'yoBit':
        openOrdersUrl = 'https://yobit.net/api/3/trades/'+tradePairArr[iterator]; break;
    case 'novaexchange':
        openOrdersUrl = 'https://novaexchange.com/remote/v2/market/orderhistory/'+tradePairArr[iterator]+'/'; break;
    default: break;
  }
  var tradePair = tradePairArr[iterator];
  if (exchange == 'coinExchange') {
    tradePair = (tradePair.split("::"))[1];
  }
  var options = {
    method: 'GET',
    uri: openOrdersUrl,
    headers: { 'User-Agent': 'test' },
    json: true
  }

  rp(options)
    .then(body => {
      if (body) {
        var returnObj3 = body;
        var buyArray = [], sellArray = [], totalBuyAmount = 0, totalSellAmount = 0, buyLoopVar = null, buyCondition, sellCondition, buyObj, orderType;
        switch (exchange) {
          case 'cryptopia':
              buyLoopVar = returnObj3.Data; buyCondition = 'Buy';  sellCondition = 'Sell'; break;
          case 'bittrex':
              buyLoopVar = returnObj3.result; buyCondition = 'BUY';  sellCondition = 'SELL'; break;
          case 'poloniex':
              buyLoopVar = returnObj3; buyCondition = 'buy';  sellCondition = 'sell'; break;
          case 'livecoin':
              buyLoopVar = returnObj3; buyCondition = 'BUY';  sellCondition = 'SELL'; break;
          case 'hitBTC':
              buyLoopVar = returnObj3.trades; buyCondition = true;  sellCondition = false; break;
          case 'novaexchange':
              buyLoopVar = returnObj3.items; buyCondition = 'BUY';  sellCondition = 'SELL'; break;
          case 'yoBit':
              buyLoopVar = returnObj3[tradePairArr[iterator]]; buyCondition = 'bid';  sellCondition = 'ask'; break;
          default: break;
        }
        if (buyLoopVar) {
            for (var i in buyLoopVar) {
              switch (exchange) {
                case 'cryptopia':
                    buyObj = returnObj3.Data[i].Total; orderType = returnObj3.Data[i].Type; break;
                case 'bittrex':
                    buyObj = returnObj3.result[i].Total; orderType = returnObj3.result[i].OrderType; break;
                case 'poloniex':
                    buyObj = returnObj3[i].total; orderType = returnObj3[i].type; break;
                case 'livecoin':
                    buyObj = Number((returnObj3[i])['quantity'])*Number((returnObj3[i])['price']); orderType = (returnObj3[i])['type']; break;
                case 'hitBTC':
                    buyObj = Number(returnObj3.trades[i][1])*Number(returnObj3.trades[i][2]); orderType = true; break;
                case 'novaexchange':
                    buyObj = Number((returnObj3.items[i])['baseamount']); orderType = (returnObj3.items[i])['tradetype']; break;
                case 'yoBit':
                    buyObj = Number((returnObj3[tradePairArr[iterator]][i].price))*Number((returnObj3[tradePairArr[iterator]][i].amount)); orderType = returnObj3[tradePairArr[iterator]][i].type; break;
                default: break;
              }
             if (orderType == buyCondition && buyObj != 0) {
               buyArray.push(+buyObj);
               totalBuyAmount+=buyObj;
             }
             else if (orderType == sellCondition && buyObj != 0) {
               sellArray.push(+buyObj);
               totalSellAmount+=buyObj;
             }
          }
          if (buyArray.length == 0) {
            buyArray.push(0);
          }
          if (sellArray.length == 0) {
            sellArray.push(0);
          }
          if (!buyArray) {
            buyArray = [];
          }
          if (!sellArray) {
            sellArray = [];
          }
          var timeNow = new Date();
          createDataObjects.returnHistoryObj(exchange, tradePairArr[iterator], Math.max.apply(Math, buyArray), Math.min.apply(Math, buyArray),
                                        buyArray.length, totalBuyAmount, Math.max.apply(Math, sellArray),
                                        Math.min.apply(Math, sellArray), sellArray.length, totalSellAmount, timeNow);
        }
        options = tradePairArr = body = returnObj3 = sellArray = buyArray = buyLoopVar = buyObj = orderType = null;
      }
      if (iterator<(((JSON.parse(tradePairArrStr)).length)-1)) {
          setTimeout(function () {
            getOrderHistory (exchange, tradePairArrStr, iterator);
          }, 200);
        }

  })
  .catch(e => {
    // if (exchange != 'livecoin' && exchange != 'bittrex' && exchange != 'hitBTC' && exchange != 'yoBit' && exchange != 'cryptopia' && exchange != 'poloniex') {
    //   var errTime = new Date();
    //   console.log('get in orderHistory for exchange '+exchange+' failed at '+errTime);
    //   console.log(tradePairArr[iterator]);
    //   if (exchange != 'yoBit') {
    //     //console.log(e);
    //   }
    // }
    options = tradePairArr = e = null;
  })
}

module.exports = {getOrderHistory};
