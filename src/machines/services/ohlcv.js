import axios from 'axios'

const TICKER_TIME = 60 * 60 * 1000;

export const ohlcv = (context, event) => (sendEvent, onEvent) => {
  const {
    base,
    quote,
    timeframe,
  } = context;

  let timeout = null;
  let running = true;

  const getTick = () => {
    let time = performance.now();
    axios.get(`/api/market/${base}/${quote}/ohlcv?timeframe=${timeframe}`).then(({ data }) => {
      sendEvent({
        type: "OHLCV_UPDATE",
        data,
      });
      if (running) {
        timeout = setTimeout(getTick, TICKER_TIME - (performance.now() - time));
      }
    });
  }
  getTick();

  onEvent(event => {

  })

  return () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
      running = false;
    }
  }
}
