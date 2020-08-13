export function collision (ball, obj) {
  const { enclosure, bottomBoundary, bricks } = obj

  enclosure.left.forEach()
}

export function getXY (startPoint, k, ds) {
  if (k >= 0) {
    ds = ds >= 0 ? ds : -ds
  } else {
    ds = ds >= 0 ? -ds : ds
  }
  const angle = Math.atan(k)

  return [
    startPoint[0] + Math.cos(angle) * ds,
    startPoint[1] + Math.sin(angle) * ds
  ]
}

export function getK (startPoint, endPoint) {
  return (endPoint[1] - startPoint[1]) / (endPoint[0] - startPoint[0])
}


// k1 k2 关于 k3 对称，求k1
// 到角公式
export function getSymmetryK (k2, k3) {
  return (2 * k3 + k2 * Math.pow(k3, 2) - k2) / (2 * k2 * k3 - Math.pow(k3, 2) + 1)

}