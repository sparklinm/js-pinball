import Brick from './Brick'

export default class Bricks {
  constructor (edge) {
    this.edge = edge
    this.r = 26
    this.data = []
  }
  add () {
    const data = this.generate(this.edge)

    this.data.forEach(brick => {
      brick.y -= 25 * 2 + 10
    })

    this.data = this.data.concat(data)
  }
  remove (index, nums = 1) {
    this.data.splice(index, nums)
  }
  generate () {
    // 3~5
    const nums = 3
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
        y: this.edge.bottom
      })

      bricks.push(brick)
      gapNums--
      remainWidth -= gap
    }
    return bricks
  }
}