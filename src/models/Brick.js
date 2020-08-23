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

    if (!this.color) {
      this.color = this._generateColor()
    }
    this.id = uuid.v4()

    // nonde, shaking, breaking, breaked
    this.status = 'none'
  }

  // 展开运算符无法获取到访问器属性
  set y (value) {
    this._y = value
    this._generatePoints(this.x, this.y, this.size, this.sides)
    this._lineExpression(this.points)
  }

  get y () {
    return this._y
  }

  setWeight (val) {
    this.weight = val
    this.color = this._generateColor()
  }

  breaking (fn) {
    clearInterval(this.shakingTimer)
    this.status = 'breaking'
    const nums = 30
    const pieces = []
    const min = -35
    const max = 35
    const minSize = 2
    const maxSize = 7

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
        xDirection: Math.random() > 0.5 ? 1 : -1,
        rotate: Math.random() * 2 * Math.PI,
        scale: 1,
        alpha: Math.random() * 0.5 + 0.3,
        color: this.color
      }))
    }

    this.pieces = pieces

    let duration = 400
    let timer = null
    let start = new Date().getTime()
    const pRotate = (45 * Math.PI / 180) / duration
    const pScale = 0.4 / duration
    const pAlpha = 0.3 / duration
    const doing = () => {
      const end = new Date().getTime()
      const dtime = end - start

      start = end
      duration -= dtime

      for (let i = 0; i < pieces.length; i++) {
        if (pieces[i].xDirection === 1) {
          pieces[i].x += 0.1
        } else {
          pieces[i].x -= 0.1
        }
        pieces[i].y += 0.3
        pieces[i].rotate += pRotate * dtime
        pieces[i].scale -= pScale * dtime
        if (duration < 0) {
          pieces[i].alpha = 0
        } else {
          pieces[i].alpha -= pAlpha * dtime
        }
      }


      timer = requestAnimationFrame(() => {
        doing()
      })


      if (duration < 0) {
        cancelAnimationFrame(timer)
        this.status = 'breaked'
        typeof fn === 'function' && fn()
      }
    }

    doing()

  }

  shaking () {
    if (this.status === 'shaking') {
      return
    }
    this.status = 'shaking'
    this.shakingX = this.x
    this.shakingY = this.y
    // const points = [this.x, this.y]
    let times = 6
    const color = this.color

    this.shakingTimer = null

    const doing = () => {
      this.shakingTimer = setInterval(() => {
        const isOdd = times % 2 === 0

        if (isOdd) {
          this.shakingX -= 1
          this.shakingY -= 1
          this.color = chroma(this.color).darken(1.5)
        } else {
          this.shakingX += 1
          this.shakingY += 1
          this.color = color
        }


        times--
        if (!times) {
          clearInterval(this.shakingTimer)
          this.status = 'none'
        }
      }, 16)
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

  _generateColor () {

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