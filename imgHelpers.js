import { createCanvas, Image } from "canvas"

export function createImage(absPath, callback) {
  const img = new Image()
  img.onload = () => {
    callback(img)
    img.src = null
  }
  img.src = absPath
}

export function getImageData(img) {
  const { width, height } = img
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext("2d")
  ctx.drawImage(img, 0, 0)
  return ctx.getImageData(0, 0, width, height)
}

export function concatSVG(img, paths) {
  const { width, height } = img
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -0.5 ${width} ${height}" shape-rendering="crispEdges">${paths}</svg>`
}
