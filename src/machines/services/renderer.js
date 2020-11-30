import { Chart } from '../../drawable/Chart'
import { Ticker } from '../../drawable/Ticker'
import { createStore } from 'matrix-display-store'
import { Header } from '../../drawable/Header'

const FRAME_RATE = 60;
const FRAME_LENGTH = 1000 / FRAME_RATE
const SCREEN_WIDTH = 84 * 2;
const SCREEN_HEIGHT = 84 * 1;

export const renderer = (context, event) => (sendEvent, onEvent) => {
  const {
    screen: {
      width,
      height
    }
  } = context;

  const store = createStore(width, height);

  let running = true;
  let timeout = null;
  const chart = new Chart(context);
  const ticker = new Ticker(context);
  const header = new Header(context);

  const drawables = [
    chart,
    header,
    ticker,
  ]

  const drawFrame = () => {
    let time = performance.now();
    let shouldRender = false;

    drawables.forEach(drawable => {
      drawable.update();
      if (drawable.shouldRender()) {
        shouldRender = true;
      }
    })

    if (shouldRender === true) {
      store.fillScreen(null);
      drawables.forEach(drawable => {
        drawable.render(store);
      })

      sendEvent({
        type: "RENDER_FRAME",
        store,
      })
    }

    if (running) {
      timeout = setTimeout(drawFrame, FRAME_LENGTH - (performance.now() - time));
    }
  }

  drawFrame();

  onEvent(event => {
    if (event.type === "TICKER_UPDATE") {
      console.log(event);
      ticker.setTickerValue(event.data);
    }

    if (event.type === "OHLCV_UPDATE") {
      console.log(event);
      chart.setOHLCVData(event.data);
    }
  })

  return () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  }
}
