export function mapValue(
  value: number,
  in_min: number,
  in_max: number,
  out_min: number,
  out_max: number
) {
  return ((value - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
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
  const wrapper = document.createElement("div");
  wrapper.innerHTML = html;
  if (wrapper.childElementCount == 1) {
    return wrapper.children[0] as HTMLDivElement;
  } else {
    return wrapper;
  }
}

export function randomString(length: number): string {
  const result = Array.from({ length });
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    const index = Math.floor(Math.random() * charactersLength);
    result.push(characters.charAt(index));
  }
  return result.join("");
}
