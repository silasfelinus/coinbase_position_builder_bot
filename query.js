/**
 * playing with the coinbase api to get a handle on supply and demand
 *
 */
const request = require('./coinbase/cb.request');
const { add, multiply } = require('mathjs');
const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const reduceAltBTC = orders => orders
  .map(a => multiply(Number(a[0]), Number(a[1])))
  .reduce((sum, o) => {
    return add(sum, o)
  }, 0);

const reduceFiatBTC = orders => orders
  .reduce((sum, o) => {
    return add(sum, Number(o[1]))
  }, 0);

const alts = ['ETH', 'XRP', 'LTC', 'BCH', 'EOS', 'DASH', 'MKR', 'XLM', 'ATOM', 'XTZ', 'ETC', 'OMG', 'ZEC', 'REP', 'ZRX', 'KNC', 'COMP', 'BAND', 'NMR', 'CGLD', 'UMA', 'REN', 'WBTC', 'BAL'];
const fiat = ['USD', 'USDC', 'GBP', 'EUR'];

(async () => {

  let supply = 0;
  let demand = 0;
  let log = '';

  for (let i = 0; i < fiat.length; i++) {
    const f = fiat[i];
    const orders = await request({
      requestPath: `/products/BTC-${f}/book?level=3`,
      method: 'GET'
    });
    const btcdemand = reduceFiatBTC(orders.bids);
    const btcsupply = reduceFiatBTC(orders.asks);
    supply = add(supply, btcsupply);
    demand = add(demand, btcdemand);
    log += `\n${f}\t${btcsupply.toFixed(0)}\t${btcdemand.toFixed(0)}`;
    await sleep(1000);
  }
  for (let i = 0; i < alts.length; i++) {
    const alt = alts[i];
    const orders = await request({
      requestPath: `/products/${alt}-BTC/book?level=3`,
      method: 'GET'
    });
    const btcdemand = reduceAltBTC(orders.asks);
    const btcsupply = reduceAltBTC(orders.bids);
    // if (alt === 'XLM') console.log({ btcdemand, btcsupply }, orders.asks[0], orders.bids[0])
    supply = add(supply, btcsupply);
    demand = add(demand, btcdemand);
    log += `\n${alt}\t${btcsupply.toFixed(0)}\t${btcdemand.toFixed(0)}`;
    await sleep(1000);
  }

  console.log(`Currency\tBTC Supply\tBTC Demand\n\t${supply.toFixed(0)}\t${demand.toFixed(0)}${log}`);

})()
