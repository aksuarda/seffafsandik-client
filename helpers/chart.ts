export function getMinMax(data: any, keys: string[], isSymmetric = false) {
  let min = Infinity;
  let max = -Infinity;

  for (const child of data) {
    for (const data of child.data) {
      for (const key of keys) {
        if (data[key] || data[key] === 0) {
          min = Math.min(min, data[key]);
          max = Math.max(max, data[key]);
        }
      }
    }
  }

  if (min === Infinity) {
    min = 0;
    max = 1;
  } else if (min === max && !min) {
    min = 0; //-1 ?
    max = 1;
  } else if (min === max) {
    min = min * 0.9;
    max = max * 1.1;
  } else {
    max += (max - min) / 98;
    min -= (max - min) / 98;
  }

  if (isSymmetric) {
    max = Math.max(Math.abs(max), Math.abs(min));
    min = -max;
  }

  return { min, max };
}
