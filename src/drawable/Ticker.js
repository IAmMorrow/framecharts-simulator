import { Drawable } from './Drawable'
import { Color, OrgDot, TomThumb } from 'matrix-display-store'

export class Ticker extends Drawable {
  value = null;
  opacity = 1;

  setTickerValue(data) {
    const {
      last
    } = data;

    if (last !== this.value) {
      this.value = last;
      this.opacity = 0;
    }
  }

  shouldRender () {
    return this.value !== null && this.opacity <= 1;
  }

  update () {
    super.update();
    if (this.opacity <= 1) {
      this.opacity += 0.1;
    }
  }

  render (store) {
    if (this.value === null) return;

    super.render()
    store.write(0, 7, `${this.value} $`, TomThumb, 1, {
      r: 255,
      g: 255,
      b: 255,
      a: this.opacity,
    });
  }
}