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
      size: 26,
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

  set weight (value) {
    this._weight = value
    this.generateColor()
  }

  get weight () {
    return this._weight
  }

  breaking (fn) {
    cancelAnimationFrame(this.shakingTimer)
    this.status = 'breaking'
    const nums = 15
    const pieces = []
    const min = -30
    const max = 30
    const minSize = 3
    const maxSize = 8

    for (let i = 0; i < nums; i++) {
      const r = Math.floor(Math.random() * (maxSize - minSize) + minSize)
      const x = Math.random() * (max - min) + min + this.x
      const y = Math.random() * (max - min) + min + this.y

      pieces.push(new Brick({
        sides: this.sides,
        weight: '',
        size: r,
        x: x,
        y: y,
        rotate: Math.random() * 2 * Math.PI,
        scale: 1,
        alpha: 0.8
      }))
    }

    this.pieces = pieces


    let times = 300
    let timer = null
    const doing = () => {
      for (let i = 0; i < pieces.length; i++) {
        pieces[i].y += 1
        pieces[i].rotate += 5 * Math.PI / 180
        pieces[i].scale -= 1 / times
        pieces[i].alpha -= 0.8 / times
      }

      times--

      timer = requestAnimationFrame(() => {
        doing()
      })

      if (!times) {
        cancelAnimationFrame(timer)
        fn()
        this.status = 'none'
      }
    }

    doing()

  }

  shaking () {
    if (this.status === 'shaking') {
      return
    }
    this.status = 'shaking'
    // const points = [this.x, this.y]
    let times = 6

    this.shakingTimer = null

    const doing = () => {

      const isOdd = times % 2 === 0

      if (isOdd) {
        this.x -= 2
        this.y -= 2
      } else {
        this.x += 2
        this.y += 2
      }

      this.shakingTimer = requestAnimationFrame(() => {
        doing()
      })

      times--
      if (!times) {
        cancelAnimationFrame(this.shakingTimer)
        this.status = 'none'
      }
    }

    doing()
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

    let index = 0
    let ratio = 0

    if (weight > 30) {
      index = 5
      ratio = 2
    } else {
      index = Math.floor(weight / 6) + 1 || 1
      ratio = weight % 6 * 0.3
    }


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