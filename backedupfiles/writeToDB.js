var mysql = require('mysql'),
con = mysql.createConnection({
  host: "pocu4.ceixhvsknluf.us-east-2.rds.amazonaws.com",
  post: "3306",
  user: "SYSTEM",
  password: "mysqlmysql",
  database : 'pocu4'
}),
tables = {
  tickerDBColumns : ['exchangeName', 'tradePair', 'askPriceUSD', 'askPriceBTC', 'recordTime', 'trackingStatus', 'priceChange'],
  openOrdersDBColumns : ['exchangeName', 'tradePair', 'maxBuy', 'minBuy', 'totalBuys', 'totalBuyAmount', 'maxSell', 'minSell', 'totalSells', 'totalSellAmount', 'recordTime'],
  orderHistoryDBColumns : ['exchangeName', 'tradePair', 'maxBuy', 'minBuy', 'totalBuys', 'totalBuyAmount', 'maxSell', 'minSell', 'totalSells', 'totalSellAmount', 'recordTime']
}
;

function writeToDB(table, exchange, objArr) {
    var columnsType;
    var queryParameters = [];
    if (table == 'cTicker') {
    //if (table == 'cTickerTest')
      for (var iterator = 0; iterator < objArr.length; iterator++) {
          var dbtradePair = objArr[iterator].tradePair || "null", dbaskPriceUSD = objArr[iterator].SPUSD || -1,
          dbaskPriceBTC = objArr[iterator].SPBTC || -1, dbrecordTime = objArr[iterator].time || "null",
          dbtrackingStatus = objArr[iterator].trackingStatus || -1, dbpriceChange = objArr[iterator].priceChange;
          queryParameters.push([exchange, dbtradePair,dbaskPriceUSD,dbaskPriceBTC,dbrecordTime,dbtrackingStatus,dbpriceChange]);
        }
      columnsType = 'tickerDBColumns';
    }
    else if (table == 'openOrders' || table == 'orderHistory') {
    //else if (table == 'openOrdersTest' || table == 'orderHistoryTest')
      for (var iterator = 0; iterator < objArr.length; iterator++) {
          var dbtradePair = objArr[iterator].tradePair || "null", dbmaxBuy = objArr[iterator].maxBuy || -1,
          dbminBuy = objArr[iterator].minBuy || -1, dbtotalBuys = objArr[iterator].totalBuys || -1,
          dbtotalBuyAmount = objArr[iterator].totalBuyAmount || -1, dbmaxSell = objArr[iterator].maxSell || -1,
          dbminSell = objArr[iterator].minSell || -1, dbtotalSells = objArr[iterator].totalSells || -1,
          dbtotalSellAmount = objArr[iterator].totalSellAmount || -1, dbrecordTime = objArr[iterator].recordTime || "null";
          queryParameters.push([exchange, dbtradePair, dbmaxBuy, dbminBuy, dbtotalBuys, dbtotalBuyAmount, dbmaxSell, dbminSell,
                              dbtotalSells, dbtotalSellAmount, dbrecordTime]);
      }
      columnsType = 'openOrdersDBColumns';
    }
    var query1 = "INSERT INTO "+ table +" (";
    for (var i=0; i<(tables[columnsType]).length; i++) {
      query1+= (tables[columnsType])[i];
      if (i<(tables[columnsType]).length-1) {
        query1+=',';
      }
    }
    var query =query1+") VALUES ?;";
    objArr = null;
    //console.log(query);
    con.query(query, [queryParameters], function (err, result) {
    if (err) {
      // var errTime = new Date();
      // console.log("query: "+query);
      // console.log("queryParameters: "+queryParameters);
      // //console.log("dbError at "+errTime+": "+err);
    }
    queryParameters = result = err = null;
  });
}

module.exports = writeToDB;
