export class Point {
  constructor(public x: number, public y: number) {}

  static lerp(a: Point, b: Point, amount: number): Point {
    const x = a.x + (b.x - a.x) * amount;
    const y = a.y + (b.y - a.y) * amount;
    return new Point(x, y);
  }

  copy(): Point {
    return new Point(this.x, this.y);
  }
}

export class Rect {
  x: number;
  y: number;
  width: number;
  height: number;

  constructor(properties: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) {
    this.x = properties.x;
    this.y = properties.y;
    this.width = properties.width;
    this.height = properties.height;
  }

  get left() {
    return this.x;
  }

  get right() {
    return this.x + this.width;
  }

  get top() {
    return this.y;
  }

  get bottom() {
    return this.y + this.height;
  }
}

export class Line {
  top: number;
  bottom: number;

  constructor(properties: { top: number; height: number }) {
    this.top = properties.top;
    this.bottom = properties.top + properties.height;
  }

  get height() {
    return this.bottom - this.top;
  }
}
