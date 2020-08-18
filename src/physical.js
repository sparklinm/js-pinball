const g = 1000

// 摩擦力 等于 摩擦系数 乘以 垂直于轨道的力
function friction (u, Fn) {
  return u * Fn
}

// 动能 等于 减少的重力势能 减去 摩擦力做的功
function kineticEnergy (m, dh, Wf) {
  return m * g * dh - Wf
}

function kineticEnergyV (m, dh, fs) {
  return Math.sqrt((2 * kineticEnergy(m, dh, fs)) / m)
}

// 斜坡上物体运动动能
function rampsKineticEnergy (m, h1, h2, angle, u) {
  const Fn = m * g * Math.cos(angle)
  // 摩擦力
  const f = friction(u, Fn)
  const dh = h1 - h2
  const s = Math.abs(dh) / Math.sin(angle)

  return kineticEnergy(m, dh, f * s)
}

function rampsV (v, m, h1, h2, angle, u) {
  const Ek = rampsKineticEnergy(m, h1, h2, angle, u)

  const nowEk = (1 / 2) * m * Math.pow(v) + Ek

  if (nowEk <= 0) {
    return 0
  }

  return Math.sqrt((2 * nowEk) / m)
}

function momentum (m1, v1, m2, v2) {
  return [
    ((m1 - m2) / (m1 + m2)) * v1 + ((2 * m2) / (m1 + m2)) * v2,
    ((m2 - m1) / (m2 + m1)) * v2 + ((2 * m1) / (m2 + m1)) * v1
  ]
}

function computeA (F, m) {
  return F / m
}


function computeV (v, a, t) {
  return v + a * t
}

function computeDistacneByA (v, a, t) {
  return v * t + 1 / 2 * a * Math.pow(t, 2)
}

function computeRampsA (m, angle, u) {
  const G = m * g
  const Fn = G * Math.cos(angle)
  // 摩擦力
  const f = friction(u, Fn)

  return computeA(G * Math.sin(angle) - f, m)
}


export default {
  g,
  rampsV,
  momentum,
  computeRampsA,
  computeV,
  computeDistacneByA
}
