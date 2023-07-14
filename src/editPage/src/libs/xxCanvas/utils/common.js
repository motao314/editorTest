export function addImageProcess(src) {
  return new Promise((resolve, reject) => {
    // console.log(src);
    const img = new Image();
    img.crossOrigin = 'Anonymous'; // to avoid CORS if used with Canvas
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}
