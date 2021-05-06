export function mapValue(
  value: number,
  in_min: number,
  in_max: number,
  out_min: number,
  out_max: number
) {
  return ((value - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
}

export function minMax(array: number[]) {
  let min = Infinity;
  let max = 0;
  for (const n of array) {
    min = Math.min(n, min);
    max = Math.max(n, max);
  }
  return { min, max };
}

export function createDiv(className = '') {
  const div = document.createElement('div');
  div.className = className;
  return div;
}
