export const createDiv = (className = "", parent?: Element) => {
  const div = document.createElement("div");
  if (className) {
    div.className = className;
  }
  parent?.appendChild(div);
  return div;
};

export const parseDiv = (html: string): HTMLDivElement => {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = html;
  if (wrapper.childElementCount == 1) {
    return wrapper.children[0] as HTMLDivElement;
  } else {
    return wrapper;
  }
};

export const randomString = (length: number): string => {
  const result = Array.from({ length });
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    const index = Math.floor(Math.random() * charactersLength);
    result.push(characters.charAt(index));
  }
  return result.join("");
};

// Taken from : https://jsfiddle.net/rudiedirkx/p0ckdcnv/
export const debounce = (ms: number, fn: Function) => {
  let timer: NodeJS.Timeout;
  return function () {
    clearTimeout(timer);
    const args = Array.prototype.slice.call(arguments);
    args.unshift(this);
    timer = setTimeout(fn.bind.apply(fn, args), ms);
  };
};

export const partition = <T>(
  array: T[],
  ...predicates: ((elt: T) => boolean)[]
): T[][] => {
  const result: T[][] = Array.from({ length: predicates.length + 1 }).map(
    () => []
  );

  for (const element of array) {
    let matched = false;
    for (let i = 0; i < predicates.length; i++) {
      if (predicates[i](element)) {
        result[i].push(element);
        matched = true;
        break;
      }
    }
    if (!matched) {
      result[result.length - 1].push(element);
    }
  }

  return result;
};

export const iterateInterlaced = function* <T>(array: T[]) {
  for (let i = 0; i < array.length; i += 2) {
    yield array[i];
  }
  for (let i = 1; i < array.length; i += 2) {
    yield array[i];
  }
};

/**
 * Simple object check.
 */
function isObject(item: any): boolean {
  return item && typeof item === "object" && !Array.isArray(item);
}

/**
 * Deep merge two objects.
 * Taken from https://stackoverflow.com/a/34749873
 */
export function deepMerge<T>(target: T, source: Partial<T>) {
  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        deepMerge(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }
  return target;
}
