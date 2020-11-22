import ccxt from "ccxt";

export default async (req, res) => {
  const {
    base,
    quote,
    timeframe,
  } = req.query;

  res.statusCode = 200
  const exchange = new ccxt.kraken();
  // const markets = await exchange.load_markets();
  const data = await exchange.fetchOHLCV(`${base}/${quote}`, timeframe || "1d");
  res.json(data);
}
