import Brick from './models/Brick'
import stage from './stage'

export default class Bricks {
  constructor (event = {}) {
    this.edge = {
      left: stage.enclosure.left.points[0][0],
      right: stage.enclosure.right.points[0][0],
      bottom: stage.enclosure.left.points[0][1]
    }
    this.r = 26
    this.data = []
    this.lineHeight = this.r * 2 + 10
    this.level = 0
    this.event = event
  }
  add () {
    this.level++
    const data = this.generate(this.edge)

    this.data.forEach(brick => {
      brick.y -= this.lineHeight
    })
    this.data = this.data.concat(data)

    stage.add('bricks', this.data)

    const y = this.data[0].y

    this.event.added && this.event.added(y)
  }
  remove (index, nums = 1) {
    this.data.splice(index, nums)
  }
  removeOneLine (index = 1) {
    let start = 0

    for (let index = this.data.length - 1; index >= 0; index--) {
      const cur = this.data[index]
      const pre = this.data[index - 1]

      if (pre && cur.y !== pre.y) {
        start = index
        break
      }

    }
    this.data.splice(start, 100)
    this.data.forEach(brick => {
      brick.y += this.lineHeight
    })
    this.animate(1)
  }
  animate (direction = -1) {
    const points = []
    let start = new Date().getTime()
    let timer = null

    this.data.forEach(brick => {
      points.push([brick.x, brick.y])
      if (direction === -1) {
        brick.y += this.lineHeight
      } else {
        brick.y -= this.lineHeight
      }
    })

    const doing = () => {

      const end = new Date().getTime()
      const dtime = end - start
      let flag = false

      start = end

      this.data.forEach((brick, index) => {
        if (direction === -1) {
          brick.y -= dtime * 300 / 1000
          if (brick.y <= points[index][1]) {
            brick.y = points[index][1]
            flag = true
          }
        } else {
          brick.y += dtime * 300 / 1000
          if (brick.y >= points[index][1]) {
            brick.y = points[index][1]
            flag = true
          }
        }
      })
      timer = requestAnimationFrame(() => {
        doing()
      })
      if (flag) {

        cancelAnimationFrame(timer)
      }
    }

    doing()
  }
  __generateWeight () {
    const i = Math.floor(this.level / 3) + 1
    // const min = i
    // const max = Math.floor(this.level * 1.2 + 5)
    const min = 10
    const max = 20

    return Math.floor(Math.random() * (max - min + 1) + min)
  }
  generate () {
    // 3~5
    const nums = Math.floor(Math.random() * 4) + 2


    // const nums = 3
    const bricks = []
    const width = this.edge.right - this.edge.left
    const bricksWidth = this.r * 2 * nums
    let remainWidth = width - bricksWidth
    const minGap = 10
    let gapNums = nums + 1


    for (let i = 0; i < nums; i++) {
      const max = remainWidth - (gapNums - 1) * minGap
      const gap = Math.floor(Math.random() * (max - minGap + 1)) + minGap
      let x = 0

      if (i === 0) {
        x = this.edge.left + gap + this.r
      } else {
        x = bricks[i - 1].x + gap + 2 * this.r
      }

      const brick = new Brick({
        size: this.r,
        x: x,
        y: this.edge.bottom,
        weight: this.__generateWeight()
      })

      bricks.push(brick)
      gapNums--
      remainWidth -= gap
    }
    // bricks.push(new Brick({
    //   size: 26,
    //   x: 225,
    //   y: 400,
    //   weight: 20,
    //   sides: 4
    // }))
    return bricks
  }
}