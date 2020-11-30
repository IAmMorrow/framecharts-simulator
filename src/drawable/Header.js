import { Drawable } from './Drawable'
import { Color, OrgDot, TomThumb } from 'matrix-display-store'

export class Header extends Drawable {
  value = null;
  opacity = 0;

  constructor (context) {
    super();
    this.context = context;
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
    const {
      base,
      quote,
    } = this.context;

    super.render()
    store.write(0, 0, `${base}/${quote}`, OrgDot, 1, {
      r: 255,
      g: 255,
      b: 255,
      a: this.opacity,
    });
  }
}