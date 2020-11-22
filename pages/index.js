import Head from 'next/head';
import axios from "axios";

import React, { useRef, useEffect, useState } from "react";
import { createStore, TomThumb, Color, OrgDot } from 'matrix-display-store';
import { LedMatrix } from "led-matrix"
import styled from "styled-components";

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
  SC: {
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
}, {})

const WIDTH = 84 * 2;
const HEIGHT = 84 * 1;

const quote = "USD";

export default function Home() {
  const matrixRef = useRef(null);
  const [base, setBase] = useState("BTC");
  const [timeframe, setTimeframe] = useState("1d");

  const matrix = useRef(null);
  const store = useRef(null);

  useEffect(() => {
    store.current = createStore(WIDTH, HEIGHT);
    matrix.current = new LedMatrix(matrixRef.current, {
      x: WIDTH,
      y: HEIGHT,
      glow: true,
      pixelWidth: 10 * (128 / WIDTH),
      pixelHeight: 10 * (128 / WIDTH),
      margin: 4 * (128 / WIDTH),
    });

  }, [])

  useEffect(() => {
    axios.get(`/api/market/${base}/${quote}?timeframe=${timeframe}`).then(({ data }) => {
      const candles = data.slice(-WIDTH);
      const { min, max, last } = getInfos(candles);
      store.current.fillScreen(null);
      let before = null;

      candles.forEach((candle, index) => {
        const value = Math.round((HEIGHT - 1) - ((candle[4] - min) / (max - min) * (HEIGHT - 1)));
        if (before !== null) {
          store.current.drawLine(index - 1, before, index, value, marketColors[base]);
        }
        before = value;
      });

      store.current.fillRect(0, 0, 40, 15, Black);
      store.current.write(0, 7, `${last} $`, TomThumb, 1, White);
      store.current.write(0, 0, `${base}/${quote}`, OrgDot, 1, marketColors[base]);

      matrix.current.setData(store.current.matrix);
      matrix.current.render();
    })

    matrix.current.setData(store.current.matrix);
    matrix.current.render();
  }, [base]);

  return (
    <Page>
      <Frame>
        <Matrix ref={matrixRef} />
      </Frame>
      <Menu>
        <MarketButton bg={marketColors["BTC"]} onClick={() => setBase("BTC")}>
          BTC/USD
        </MarketButton>
        <MarketButton bg={marketColors["ETH"]} onClick={() => setBase("ETH")}>
          ETH/USD
        </MarketButton>
        <MarketButton bg={marketColors["ATOM"]} onClick={() => setBase("ATOM")}>
          ATOM/USD
        </MarketButton>
        <MarketButton bg={marketColors["SC"]} onClick={() => setBase("SC")}>
          SC/USD
        </MarketButton>
      </Menu>
    </Page>
  )
}
