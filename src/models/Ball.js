export default class Ball {
  constructor (attrs) {
    Object.assign(this, {
      weight: 1,
      size: 8,
      x: 100,
      y: 100,
      v: 0,
      vx: 0,
      vy: 0,
      color: '#fff'
    }, attrs)
    // prepare, shoot, move, reset
    this.status = 'prepare'
    this.reset = {
      points: [],
      index: 0
    }
  }

  setPosition (x, y) {
    this.x = x
    this.y = y
  }

  setSize (value) {
    this.size = value
  }
}