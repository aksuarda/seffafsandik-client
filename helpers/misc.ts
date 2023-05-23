export function makeid(length: number, numbersOnly = true, includeDate = false) {
  let result = includeDate ? Date.now().toString() : "";
  const characters = numbersOnly ? "0123456789" : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
    counter += 1;
  }
  return result;
}

export function getPath(
  city: string | undefined,
  district: string | undefined,
  neighborhood: string | undefined,
  box: string | undefined
) {
  return (
    `results/Türkiye` +
    (city ? `/cities/${city}` : "") +
    (district ? `/districts/${district}` : "") +
    (neighborhood ? `/neighborhoods/${neighborhood}` : "") +
    (box ? `/boxes/${box}` : "")
  );
}

export function getPercent(data: any, source: string, candidate: string) {
  let sum = 0;
  for (const candidate of ["rte", "mi", "kk", "so"]) {
    sum += data[source][candidate] || 0;
  }
  return ((sum ? data[source][candidate] / sum : 0) * 100).toFixed(2);
}

export function pause(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms || 0);
  });
}

export function sortTR(a: string, b: string) {
  const map = "AaBbCcÇçDdEeFfGgĞğHhIıİiJjKkLlMmNnOoÖöPpQqRrSsŞşTtUuÜüVvWwXxYyZz0123456789";
  if (a.length === 0 || b.length === 0) {
    return a.length - b.length;
  }
  for (let i = 0; i < a.length && i < b.length; i++) {
    let ai = map.indexOf(a[i]);
    let bi = map.indexOf(b[i]);
    if (ai !== bi) {
      return ai - bi;
    }
  }
  return 0;
}
