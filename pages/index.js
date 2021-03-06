import axios from 'axios'
import { assign, createMachine } from 'xstate'
import { useMachine } from '@xstate/react'

import React, { useEffect, useRef } from 'react'
import { Color, createStore, OrgDot, TomThumb } from 'matrix-display-store'
import { LedMatrix } from 'led-matrix'
import styled from 'styled-components'
import Select from 'react-select'
import { mainMachine } from '../src/machines/main'

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

const Menu = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0px 12px;
`;

const MarketButton = styled.div`
  padding: 12px;
  margin: 3px;
  color: white;
  background-color: ${({ bg }) => `rgb(${bg.r}, ${bg.g}, ${bg.b})` };
  cursor: pointer;
  border-radius: 4px;
  user-select: none;
  text-align: center;
  display: flex;
  flex-direction: row;
  justify-content: center;
  
  
  &:hover {
    transform: scale(0.95);  
  }
  
  &:active {
    transform: scale(0.90);  
  }
`;

const Matrix = styled.canvas`
  display: flex;
`;

const Page = styled.div`
  display: flex;
  flex-direction: row;
  margin: 24px;
`

const Frame = styled.div`
  background-color: #2d3436;
  background-image: linear-gradient(315deg, #2d3436 0%, #000000 74%);

  border:solid 5vmin rgb(133,94,66);
  border-bottom-color: rgb(143,104,76);
  border-left-color:rgb(133,94,66);
  border-radius:2px;
  border-right-color:rgb(133,94,66);
  border-top-color:rgb(123,84,56);
  box-shadow:0 0 5px 0 rgba(0,0,0,.25) inset, 0 5px 10px 5px rgba(0,0,0,.25);
  box-sizing:border-box;
  display:inline-block;
  padding: 4vmin;
  position:relative;
  text-align:center;

  &:before {
    border-radius:2px;
    bottom:-2vmin;
    box-shadow:0 2px 5px 0 rgba(0,0,0,.25) inset;
    content:"";
    left:-2vmin;
    position:absolute;
    right:-2vmin;
    top:-2vmin;
  }

  &:after {
    border-radius:2px;
    bottom:-2.5vmin;
    box-shadow: 0 2px 5px 0 rgba(0,0,0,.25);
    content:"";
    left:-2.5vmin;
    position:absolute;
    right:-2.5vmin;
    top:-2.5vmin;
  }`;

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

const White = {
  r: 255,
  g: 255,
  b: 255,
  a: 1,
}

const Black = {
  r: 0,
  g: 0,
  b: 0,
  a: 1,
}

const timeframes = [
  { value: "1h", label: "1 hour" },
  { value: "4h", label: "4 hours" },
  { value: "1d", label: "1 day" },
  { value: "1w", label: "1 week" },
]


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

const WIDTH = 84 * 2;
const HEIGHT = 84 * 1;

export default function Home() {
  const matrixRef = useRef(null);

  const matrix = useRef(null);
  const store = useRef(null);

  const [state, sendEvent] = useMachine(mainMachine, {
    actions: {
      renderFrame: (context, event) => {
        console.log("event ", event)
        matrix.current.setData(event.store.matrix);
        matrix.current.render();
      }
    }
  });

  useEffect(() => {
    matrix.current = new LedMatrix(matrixRef.current, {
      x: WIDTH,
      y: HEIGHT,
      glow: true,
      pixelWidth: 10 * (128 / WIDTH),
      pixelHeight: 10 * (128 / WIDTH),
      margin: 4 * (128 / WIDTH),
    });

  }, [])

  return (
    <Page>
      <Frame>
        <Matrix ref={matrixRef} />
      </Frame>
      <Menu>
        <Select value={timeframes.find((tf) => tf.value === state.context.timeframe)} options={timeframes} onChange={({ value }) => {
          sendEvent("SET_CONFIG", { timeframe: value })
        }} />
        <MarketButton bg={marketColors["BTC"]} onClick={() => sendEvent("SET_CONFIG", { base: "BTC", quote: "USD" })}>
          BTC/USD
        </MarketButton>
        <MarketButton bg={marketColors["ETH"]} onClick={() => sendEvent("SET_CONFIG", { base: "ETH", quote: "USD" })}>
          ETH/USD
        </MarketButton>
        <MarketButton bg={marketColors["ATOM"]} onClick={() => sendEvent("SET_CONFIG", { base: "ATOM", quote: "USD" })}>
          ATOM/USD
        </MarketButton>
        <MarketButton bg={marketColors["SC"]} onClick={() => sendEvent("SET_CONFIG", { base: "SC", quote: "USD" })}>
          SC/USD
        </MarketButton>
        <MarketButton bg={marketColors["LTC"]} onClick={() => sendEvent("SET_CONFIG", { base: "LTC", quote: "USD" })}>
          LTC/USD
        </MarketButton>
      </Menu>
    </Page>
  )
}
