const uuid = require('uuid')

// https://bgrins.github.io/TinyColor/
// https://github.com/gka/chroma.js/
const chroma = require ('chroma-js')

import { getPointsExpression } from '../util'


export default class Brick {
  constructor (attrs) {
    Object.assign(this, {
      sides: this._generateSides(),
      weight: this._generateWeight(),
      size: 40,
      y: 100,
      x: 100
    }, attrs)
    this.color = this.generateColor()
    this.id = uuid.v4()
  }

  set y (value) {
    this._y = value
    this._generatePoints(this.x, this.y, this.size, this.sides)
    this._lineExpression(this.points)
  }

  get y () {
    return this._y
  }

  _generateSides () {
    const min = 3
    const max = 6

    return Math.floor(Math.random() * (max - min + 1) + min)
  }

  _generateWeight (min = 1, max = 30) {

    return Math.floor(Math.random() * (max - min + 1) + min)
  }

  generateColor () {
    const weight = this.weight - 1
    const colors = {
      1: '#FCFF00',
      2: '#CCFF00',
      3: '#99ffff',
      4: '#ff6699',
      5: '#9966ff'
    }

    const index = Math.floor(weight / 6) + 1
    const ratio = weight % 6 * 0.3

    return chroma(colors[index]).brighten(1 - ratio)
  }

  _generatePoints (x, y, r, sides) {
    const points = [[]]
    const startX = x + r * Math.cos((2 * Math.PI * 0) / sides)
    const startY = y + r * Math.sin((2 * Math.PI * 0) / sides)

    points[0][0] = startX
    points[0][1] = startY
    for (let i = 1; i < sides; i++) {
      const newX = x + r * Math.cos((2 * Math.PI * i) / sides)
      const newY = y + r * Math.sin((2 * Math.PI * i) / sides)

      points[i] = []
      points[i][0] = newX
      points[i][1] = newY
    }

    this.points = points
  }

  _lineExpression (points) {
    this.expression = getPointsExpression(points, true)
  }

  updateXY (x, y) {
    this.x = x
    this.y = y
  }

}


// sides weight color