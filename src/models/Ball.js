export default class Ball {
  constructor (attrs) {
    Object.assign(this, {
      weight: 5,
      size: 8,
      x: 100,
      y: 100,
      v: 0,
      vx: 0,
      vy: 0,
      color: '#fff'
    }, attrs)
  }

  setPosition (x, y) {
    this.x = x
    this.y = y
  }
}