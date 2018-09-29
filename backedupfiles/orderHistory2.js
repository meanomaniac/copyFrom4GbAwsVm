var request =require('request'), fs = require('fs'), createDataObjects = require('./createDataObjects.js');

function getOrderHistory (exchange, tradePairArrStr, iterator) {
  // logic to convert the '/' to a '_' for cryptopia only
  iterator++;
  var tradePairArr = JSON.parse(tradePairArrStr);
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
  request(openOrdersUrl, function (error, response, body) {
    var responseIsValid = true;
    try {
      JSON.parse(body);
    } catch (e) {
      responseIsValid = false;
      //console.log ('invalid orderHistory response received from '+exchange);
    }
      if (responseIsValid && !error && response.statusCode == 200 && JSON.parse(body)) {
          var returnObj3 = (JSON.parse(body));
          var buyArray = [], sellArray = [], totalBuyAmount = 0, totalSellAmount = 0, buyLoopVar = null, buyCondition, sellCondition, orderType;
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
        returnObj3 = buyArray = sellArray = buyLoopVar = buyCondition = sellCondition = orderType = null;
      }
      error = response = body = tradePairArr = null;
    });
    if (iterator<(((JSON.parse(tradePairArrStr)).length)-1)) {
        setTimeout(function () {
          getOrderHistory (exchange, tradePairArrStr, iterator);
        }, 200);
      }
  }

    module.exports = {getOrderHistory};
