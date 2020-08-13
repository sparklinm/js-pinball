const uuid = require('uuid')


export default class Brick {
  constructor (attrs) {

    Object.assign(this, {
      sides: this._generateSides(),
      weight: this._generateWeight(),
      size: 30,
      x: 100,
      y: 100
    }, attrs)
    this.color = this._generateColor()
    this.id = uuid.v4()
  }

  _generateSides () {
    const min = 3
    const max = 6

    return Math.floor(Math.random() * (max - min + 1) + min)
  }

  _generateWeight () {
    const min = 1
    const max = 100

    return Math.floor(Math.random() * (max - min + 1) + min)
  }

  _generateColor () {
    const weight = this.weight

    return '#456'
  }

  updateXY (x, y) {
    this.x = x
    this.y = y
  }

}


// sides weight color