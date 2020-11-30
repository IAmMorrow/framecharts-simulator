import { assign, Machine, spawn, send } from 'xstate';
import { renderer } from './services/renderer';
import { ticker } from './services/ticker';
import { ohlcv } from './services/ohlcv';

export const mainMachine = new Machine({
  id: "main",
  initial: "started",
  context: {
    screen: {
      width: 84 * 2,
      height: 84 * 1,
    },
    base: "BTC",
    quote: "USD",
    timeframe: "1d",
    ohlcv: null,
},
  states: {
    started: {
      invoke: [
        {
          id: "ticker",
          src: ticker,
        },
        {
          id: "ohlcv",
          src: ohlcv,
        },
        {
          id: "renderer",
          src: renderer,
        }
      ],
      on: {
        SET_CONFIG: {
          actions: assign((context, { type, ...config }) => ({
            ...config
          })),
          target: "started",
        },
        TICKER_UPDATE: {
          actions: send((context, { data }) => ({ type: "TICKER_UPDATE", data }), { to: "renderer" })
        },
        OHLCV_UPDATE: {
          actions: send((context, { data }) => ({ type: "OHLCV_UPDATE", data }), { to: "renderer" })
        },
        RENDER_FRAME: {
          actions: "renderFrame"
        }
      }
    }
  }
});
