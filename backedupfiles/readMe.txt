This program records the ticker, history and open orders for all currency pairs in 9 different exchanges
(exception: no history or open orders data for coinMarketCap as it is not an exchange).
Currency pairs that do not involve BTC are not recorded.
So there are 3 tables in the db cTicker for ticker, orderHistoryTest for history and openOrdersTest for open orders.

app.js is is the main file that you need to run.
The prices are obtained every 30 seconds. In order to optimize the data that is recorded, it is ensured that changes over
a period of 30 seconds that are very miniscule are ignored. The thirtySecThreshold variable (currently 0.01%) is used as a change
threshold to determine whether the price of a currency pair needs to be recorded (it is recorded in the db if the price difference
between the current price and the one 30 seconds ago - is more than the 'thirtySecThreshold').
The ticker function is started for all 9 exchanges.
There are 3 modules for managing the 9 exchanges,
a. stdGetPublicData - for exchanges that have apis to return ticker info of all currency pairs in 1 call.
                    Has only one function. Used for all exchanges except bittrex, yoBit and coinExchange
b. stdGetPublicData2 - for exchanges that have apis to return ticker info for only one currency pair.
                    Has one function to first get all the currency pairs and then another function to iteratively call
                    the ticker api for each pair. Used for bittrex and yoBit
c.    coinExchange - coinExchange api doesn't seem to work with the 'request' package that is used for the other 8 exchanges.
                  so this module uses the 'request-promise' package instead.
                  coinExchange has an api to return ticker info of all currency pairs in 1 call, but it sends back the
                  'currency pair id' as opposed  to the currency pair name. So it has another function that first gets
                  all the currency pairs using another available api, and creates a map of the currency pair 'name' and 'id'.
                  This is then used to append to the currency pair name so you will notice in the db the name column for
                  coinExchange appear as currencyPairName::currencyPairId
                  This module also the coinExchange 'open Orders' and 'history' functions
Each of the above 3 modules is called from app.js and passed the:
a. 'exchange list' with all 9 exchanges - each module prunes out the exchanges that it doesn't use using a switch case
b. 'oldTickerObj' - contains the ticker info of all the currency pairs for a specific exchange.
                  It is used as a reference for price comparisons with data received in subsequent call (newTickerObj)
                  made 30 seconds later, to see if the change for a specific currency pair is significant enough for recording in DB.
                  It is empty initially but set to the current value in the latest call after the comparison is made so that
                  it is ready for the next call.
c. changeThreshold - thirtySecThreshold that was mentioned earlier.
d. tickerDBColumns - columns in the cTicker table.
e. timeGap - time between each successive ticker calls - 30 seconds currently.

You can ignore the cmcUSDBTC variable.

The createDataObjects module has 4 functions that organizes data received from the server into objects that can be used to access this
data in a easy manner, especially when comparing the oldTickerObj and newTickerObj. All data pertaining to a currency pair is saved as
the value of the property with the same name as the currency pair. So the newTickerObj/oldTickerObj both have properties equal to the
number of currency pairs in question for that exchange. For the ticker functions this is available in 2 steps
'createTickerObj' - which sets all values except the usdPrice, and
'returnCompleteTickerObj' - calculates & sets the usdPrice for each pair based on the last available price available for usd-btc price
So to make it easy to determine the btc_usd price, it is renamed to USD_BTC for all exchanges in the first function
Separate functions for orderHistoryObj and openOrdersObj also exist in the same module.

The qualifyData function/module is called after this in the ticker that
  a. compares the old and new ticker objects to decide whether to write to DB
  b. Write to DB if change for a specific pair is over threshold
  c. send to the history (in the orderHistory module) and openOrders functions if change for a specific pair is over threshold

The orderHistory function was changes to use the 'request-promise' package as it seems this works better than 'request'.
However, 'request-promise' doesn't seem to work with yoBit, which is why orderHistory2 exists with 'request' just for yoBit
I did not check 'request-promise' with openOrders.

After calling the qualifyData function, the oldTickerObj is set equal to newTickerObj in the ticker functions (after the newTickerObj
is updated with data from all currency pairs in  the stdGetPublicData function, and immediately after data for a pair is updated
in the stdGetPublicData2 function. It is debatable which of the 2 approaches is better - so I'm leaving as is for now)
making it ready for the next 30 s ticker api call.

For the stdGetPublicData2 function, I have to call the ticker api for each pair recursively which I do outside the 'request' method's
callback function to make it more time efficient.

Also outside the callback of the api call in all the ticker functions, the next successive ticker api request is called with the
timegap parameter (i.e. after 30 seconds currently using setTimeout).
