import tinycolor from 'tinycolor2';
const double = (number) => {
  return Math.round(number * 100) / 100;
};
export class Color {
  alphaValue = 0;

  // RGB
  redValue = 0;
  greenValue = 0;
  blueValue = 0;

  // HSV
  hueValue = 0;
  saturationValue = 0;
  brightnessValue = 0;

  // HSL
  hslSaturationValue = 0;
  lightnessValue = 0;
  constructor(input) {
    this.instance = tinycolor(input);
    this.initRgb();
    this.initHsb();
    this.initLightness();
    this.initAlpha();
  }

  initAlpha = () => {
    const initAlpha = this.instance.getAlpha();
    this.alphaValue = Math.min(1, initAlpha) * 100;
  };

  initLightness = () => {
    const { s, l } = this.instance.toHsl();
    this.hslSaturationValue = double(s);
    this.lightnessValue = double(l);
  };

  initRgb = () => {
    const { r, g, b } = this.instance.toRgb();

    this.redValue = double(r);
    this.greenValue = double(g);
    this.blueValue = double(b);
  };

  initHsb = () => {
    const { h, s, v } = this.instance.toHsv();

    this.hueValue = Math.min(360, Math.ceil(h));
    this.saturationValue = double(s);
    this.brightnessValue = double(v);
  };

  toHexString = () => {
    return this.instance.toHexString();
  };

  toRgbString = () => {
    return this.instance.toRgbString();
  };

  toString(format) {
    return this.instance.toString(format);
  }

  get hex() {
    return this.instance.toHex();
  }

  set hex(hexString) {
    this.instance = tinycolor(hexString);
    this.initHsb();
    this.initRgb();
    this.initAlpha();
    this.initLightness();
  }

  // 色调
  set hue(value) {
    if (this.saturation === 0 && this.brightness === 0) {
      this.saturationValue = 1;
      this.brightnessValue = 1;
    }

    this.instance = tinycolor({
      h: double(value),
      s: this.saturation,
      v: this.brightness,
      a: this.alphaValue / 100,
    });
    this.initRgb();
    this.initLightness();
    this.hueValue = double(value);
  }

  get hue() {
    return this.hueValue;
  }

  // 饱和度
  set saturation(value) {
    this.instance = tinycolor({
      h: this.hue,
      s: double(value),
      v: this.brightness,
      a: this.alphaValue / 100,
    });
    this.initRgb();
    this.initLightness();
    this.saturationValue = double(value);
  }

  get saturation() {
    return this.saturationValue;
  }

  // 明度
  set brightness(value) {
    this.instance = tinycolor({
      h: this.hue,
      s: this.saturation,
      v: double(value),
      a: this.alphaValue / 100,
    });
    this.initRgb();
    this.initLightness();
    this.brightnessValue = double(value);
  }

  get brightness() {
    return this.brightnessValue;
  }

  // 亮度
  set lightness(value) {
    this.instance = tinycolor({
      h: this.hue,
      s: this.hslSaturationValue,
      l: double(value),
      a: this.alphaValue / 100,
    });
    this.initRgb();
    this.initHsb();
    this.lightnessValue = double(value);
  }

  get lightness() {
    return this.lightnessValue;
  }
  // red

  set red(value) {
    const rgb = this.instance.toRgb();
    this.instance = tinycolor({
      ...rgb,
      r: double(value),
      a: this.alphaValue / 100,
    });
    this.initHsb();
    this.initLightness();
    this.redValue = double(value);
  }

  get red() {
    return this.redValue;
  }

  // green
  set green(value) {
    const rgb = this.instance.toRgb();
    this.instance = tinycolor({
      ...rgb,
      g: double(value),
      a: this.alphaValue / 100,
    });
    this.initHsb();
    this.initLightness();
    this.greenValue = double(value);
  }

  get green() {
    return this.greenValue;
  }

  // blue
  set blue(value) {
    const rgb = this.instance.toRgb();
    this.instance = tinycolor({
      ...rgb,
      b: double(value),
      a: this.alphaValue / 100,
    });
    this.initHsb();
    this.initLightness();
    this.blueValue = double(value);
  }

  get blue() {
    return this.blueValue;
  }

  // alpha
  set alpha(value) {
    this.instance.setAlpha(value / 100);
    this.alphaValue = value;
  }

  get alpha() {
    return this.alphaValue;
  }

  get RGB() {
    return [this.red, this.green, this.blue, this.alpha / 100];
  }

  get HSB() {
    return [this.hue, this.saturation, this.brightness, this.alpha / 100];
  }

  get HSL() {
    return [this.hue, this.hslSaturationValue, this.lightness, this.alpha / 100];
  }
}
export function rgbaColor(r, g, b, a) {
  return `rgba(${[r, g, b, a / 100].join(',')})`;
}
// 根据最大值，最小值，限制当前值不超出
export const clamp = (value, min, max) => {
  return min < max ? (value < min ? min : value > max ? max : value) : value < max ? max : value > min ? min : value;
};
export const HistoryColorKey = 'color-history';
export const MAX_STORAGE_LENGTH = 8;
