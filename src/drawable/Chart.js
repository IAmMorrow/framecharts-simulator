import { Drawable } from './Drawable'
import { Color } from 'matrix-display-store'

const marketColors = {
  BTC: {
    r: 247,
    g: 147,
    b: 26,
    a: 1,
  },
  ETH: {
    r: 86,
    g: 186,
    b: 202,
    a: 1,
  },
  ATOM: Color.hex("#46509f"),
  LTC: Color.hex("#46509f"),
  SC: {
    r: 92,
    g: 200,
    b: 163,
    a: 1,
  },
  NEO: {
    r: 92,
    g: 200,
    b: 163,
    a: 1,
  },
};

const getMarketColor = (base, index, opacity) => {
  const marketColor = marketColors[base];

  return {
    r: marketColor.r,
    g: marketColor.g,
    b: marketColor.b,
    a: opacity,
  }
}

const getInfos = candles => candles.reduce((acc, candle) => {
  const close = candle[4];

  if (!acc.min || close < acc.min) {
    acc.min = close;
  }

  if (!acc.max || close > acc.max) {
    acc.max = close;
  }

  acc.last = candle[4];

  return acc;
}, {});

const calcChartCoordinates = (screenHeight, screenWidth, ohlcv) => {
  const candles = ohlcv.slice(-screenWidth);
  const { min, max, last } = getInfos(candles);

  const points = candles.map((candle) => Math.round((screenHeight - 1) - ((candle[4] - min) / (max - min) * (screenHeight - 1))));


  return points.reduce((acc, point, index) => {
    if (index === 0) {
      return acc;
    }
    const previousPoint = points[index - 1];

    acc.push([
      {
        x: index - 1,
        y: previousPoint
      },
      {
        x: index,
        y: point
      },
    ])

    return acc;
  }, []);
}

export class Chart extends Drawable {
  data = null;
  dataPoints = null;
  opacity = 1;
  _shouldRender = false;

  constructor (context) {
    super();
    this.context = context;
  }

  shouldRender () {
    return this.dataPoints !== null && this._shouldRender;
  }

  setOHLCVData (data) {
    const {
      screen: {
        height,
        width,
      },
    } = this.context;

    this.dataPoints = calcChartCoordinates(height, width, data);
    this._shouldRender = true;
    this.opacity = 0;
  }

  update () {
    if (this.opacity < 1) {
      this.opacity += 0.1;
    }
  }

  render (store) {
    if (this.dataPoints === null) return;

    const {
      base,
    } = this.context;

    this.dataPoints.forEach((coord, index) => {
      store.drawLine(coord[0].x, coord[0].y, coord[1].x, coord[1].y, getMarketColor(base, index, this.opacity));
    });

    if (this.opacity >= 1) {
      this._shouldRender = false;
    }
  }
}