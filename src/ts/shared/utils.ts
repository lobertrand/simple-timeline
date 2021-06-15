export const createDiv = function (className = "", parent?: Element) {
  const div = document.createElement("div");
  if (className) {
    div.className = className;
  }
  parent?.appendChild(div);
  return div;
};

export const parseDiv = function (html: string): HTMLDivElement {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = html;
  if (wrapper.childElementCount == 1) {
    return wrapper.children[0] as HTMLDivElement;
  } else {
    return wrapper;
  }
};

export const randomString = function (length: number): string {
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
export const debounce = function (ms: number, fn: Function) {
  let timer: NodeJS.Timeout;
  return function () {
    clearTimeout(timer);
    const args = Array.prototype.slice.call(arguments);
    args.unshift(this);
    timer = setTimeout(fn.bind.apply(fn, args), ms);
  };
};

// Taken from : https://medium.com/@fsufitch/is-javascript-array-sort-stable-46b90822543f
interface Comparator<T> {
  (a: T, b: T): number;
}
const defaultComparator: Comparator<any> = (a, b) => {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
};
export const stableSort = function <T>(
  array: T[],
  comparator: Comparator<T> = defaultComparator
) {
  const stabilized = array.map((el, index) => <[T, number]>[el, index]);
  const stableCmp: Comparator<[T, number]> = (a, b) => {
    const order = comparator(a[0], b[0]);
    if (order != 0) return order;
    return a[1] - b[1];
  };
  stabilized.sort(stableCmp);
  for (let i = 0; i < array.length; i++) {
    array[i] = stabilized[i][0];
  }
};

export const partition = function <T>(
  array: T[],
  ...predicates: ((elt: T) => boolean)[]
) {
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
