export default class Ball {
  constructor (attrs) {
    Object.assign(this, {
      weight: 5,
      size: 10,
      x: 100,
      y: 100
    }, attrs)
  }

  setPosition (x, y) {
    this.x = x
    this.y = y
  }
}