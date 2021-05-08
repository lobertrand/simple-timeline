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

export function createDiv(className = "", parent?: Element) {
  const div = document.createElement("div");
  if (className) {
    div.className = className;
  }
  parent?.appendChild(div);
  return div;
}

export function parseDiv(html: string): HTMLDivElement {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  if (wrapper.childElementCount == 1) {
    return wrapper.children[0] as HTMLDivElement;
  } else {
    return wrapper;
  }
}