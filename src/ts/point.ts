
export class Point {
  constructor(public x: number, public y: number) { }

  static lerp(a: Point, b: Point, amount: number): Point {
    const x = a.x + (b.x - a.x) * amount;
    const y = a.y + (b.y - a.y) * amount;
    return new Point(x, y);
  }
}
