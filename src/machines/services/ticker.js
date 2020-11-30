import axios from 'axios'

const TICKER_TIME = 10000;

export const ticker = (context, event) => (sendEvent, onEvent) => {
  const {
    base,
    quote
  } = context;

  let timeout = null;
  let running = true;

  const getTick = () => {
    let time = performance.now();
    axios.get(`/api/market/${base}/${quote}/ticker`).then(({ data }) => {
      sendEvent({
        type: "TICKER_UPDATE",
        data
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
