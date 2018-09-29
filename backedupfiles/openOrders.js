//bid = buy; ask = sell;

var request =require('request'), fs = require('fs'), createDataObjects = require('./createDataObjects.js');

function getOpenOrders (exchange, tradePairArrStr, iterator) {
    iterator++;
    var tradePairArr = JSON.parse(tradePairArrStr);
    var openOrdersUrl;
    if (exchange == 'cryptopia') {
      if (tradePairArr[iterator].includes('/')) {
        var tradePairSplitArr = tradePairArr[iterator].split('/');
        tradePairArr[iterator] = tradePairSplitArr[0]+'_'+tradePairSplitArr[1];
      }
    }
    switch (exchange) {
      case 'cryptopia':
          openOrdersUrl = 'https://www.cryptopia.co.nz/api/GetMarketOrders/'+tradePairArr[iterator]+'/10000'; break;
      case 'bittrex':
          openOrdersUrl = 'https://bittrex.com/api/v1.1/public/getorderbook?market='+tradePairArr[iterator]+'&type=both'; break;
      case 'hitBTC':
          openOrdersUrl = 'https://api.hitbtc.com/api/1/public/'+tradePairArr[iterator]+'/orderbook'; break;
      case 'livecoin':
          openOrdersUrl = 'https://api.livecoin.net/exchange/order_book?currencyPair='+tradePairArr[iterator]; break;
      case 'poloniex':
          openOrdersUrl = 'https://poloniex.com/public?command=returnOrderBook&currencyPair='+tradePairArr[iterator]; break;
      case 'yoBit':
          openOrdersUrl = 'https://yobit.net/api/3/depth/'+tradePairArr[iterator]; break;
      case 'novaexchange':
          openOrdersUrl = 'https://novaexchange.com/remote/v2/market/openorders/'+tradePairArr[iterator]+'/BOTH/'; break;
      default: break;
    }

    request(openOrdersUrl, function (error, response, body) {
      var responseIsValid = true;
      try {
        JSON.parse(body);
      } catch (e) {
        responseIsValid = false;
        //console.log ('invalid openOrders response received from '+exchange);
      }
        if (responseIsValid && !error && response.statusCode == 200 && JSON.parse(body)) {
        var returnObj2 = (JSON.parse(body));
        var buyArray = [], sellArray = [], totalBuyAmount = 0, totalSellAmount = 0, buyLoopVar = null, sellLoopVar = null, buyObj, sellObj ;
        switch (exchange) {
          case 'cryptopia':
            if (returnObj2.Data) {
              buyLoopVar = returnObj2.Data.Buy; sellLoopVar = returnObj2.Data.Sell; break;
            }
          case 'bittrex':
          if (returnObj2.result) {
              buyLoopVar = returnObj2.result.buy; sellLoopVar = returnObj2.result.sell; break;
            }
          case 'poloniex':
          case 'livecoin':
          case 'hitBTC':
              buyLoopVar = returnObj2.bids; sellLoopVar = returnObj2.asks; break;
          case 'novaexchange':
              buyLoopVar = returnObj2.buyorders; sellLoopVar = returnObj2.sellorders; break;
          case 'yoBit':
            if (returnObj2[tradePairArr[iterator]]) {
              buyLoopVar = (returnObj2[tradePairArr[iterator]]).bids; sellLoopVar = (returnObj2[tradePairArr[iterator]]).asks; break;
            }
          default: break;
        }
        if (buyLoopVar && sellLoopVar) {
          //console.log(typeof(buyLoopVar) + tradePairArr[iterator]);
            for (var i in buyLoopVar) {
             switch (exchange) {
               case 'cryptopia':
                   buyObj = returnObj2.Data.Buy[i].Total; break;
               case 'bittrex':
                   buyObj = Number(returnObj2.result.buy[i].Quantity)*Number(returnObj2.result.buy[i].Rate); break;
               case 'poloniex':
               case 'livecoin':
               case 'hitBTC':
                   buyObj = Number((returnObj2.bids[i])['0'])*Number((returnObj2.bids[i])['1']); break;
               case 'novaexchange':
                   buyObj = returnObj2.buyorders[i].baseamount; break;
               case 'yoBit':
                   buyObj = Number((returnObj2[tradePairArr[iterator]].bids[i])[0])*Number((returnObj2[tradePairArr[iterator]].bids[i])[1]); break;
               default: break;
             }
             buyArray.push(+buyObj);
             totalBuyAmount+=buyObj;
          }
          for (var i in sellLoopVar) {
           switch (exchange) {
             case 'cryptopia':
                 sellObj = returnObj2.Data.Sell[i].Total; break;
             case 'bittrex':
                 sellObj = Number(returnObj2.result.sell[i].Quantity)*Number(returnObj2.result.sell[i].Rate); break;
             case 'poloniex':
             case 'livecoin':
             case 'hitBTC':
                 sellObj = Number((returnObj2.asks[i])['0'])*Number((returnObj2.asks[i])['1']); break;
             case 'novaexchange':
                 sellObj = returnObj2.sellorders[i].baseamount; break;
             case 'yoBit':
                 sellObj = Number((returnObj2[tradePairArr[iterator]].asks[i])[0])*Number((returnObj2[tradePairArr[iterator]].asks[i])[1]); break;
             default: break;
           }
           sellArray.push(+sellObj);
           totalSellAmount+=sellObj;
        }
        if (buyArray.length == 0) {
          buyArray.push(0);
        }
        if (sellArray.length == 0) {
          sellArray.push(0);
        }
        if (!buyLoopVar) {
          buyLoopVar = [];
        }
        if (!sellLoopVar) {
          sellLoopVar = [];
        }
        var timeNow = new Date();
        createDataObjects.returnopenOrdersObj(exchange, tradePairArr[iterator], Math.max.apply(Math, buyArray), Math.min.apply(Math, buyArray),
                                        buyLoopVar.length, totalBuyAmount, Math.max.apply(Math, sellArray),
                                        Math.min.apply(Math, sellArray), sellLoopVar.length, totalSellAmount, timeNow);
        }
        returnObj2 = buyArray = sellArray = totalBuyAmount = totalSellAmount = buyLoopVar = sellLoopVar = buyObj = sellObj = null;
      }
      else {
        // if (exchange != 'livecoin' && exchange != 'bittrex' && exchange != 'hitBTC' && exchange != 'yoBit' && exchange != 'cryptopia' && exchange != 'poloniex') {
        //   var errTime = new Date();
        //   console.log('get in openOrders for exchange '+exchange+' failed at '+errTime);
        //   console.log(tradePairArr[iterator]);
        //   //console.log(error);
        // }
      }
      error = response = body = tradePairArr = null;
    });
    if (iterator<(((JSON.parse(tradePairArrStr)).length)-1)) {
      setTimeout(function () {
        getOpenOrders (exchange, tradePairArrStr, iterator);
      }, 200);
    }
}

module.exports = {getOpenOrders};
