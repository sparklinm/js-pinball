import Ball from './models/Ball'
import physical from './physical'
import matter from './matter'
import stage from './stage'
import * as util from './util'

export default class Balls {
  constructor (event) {
    this.start = {
      time: 0,
      v: 600,
      x: stage.canvasWidth / 2,
      y: stage.enclosure.left.points[stage.enclosure.left.points.length - 1][1] +
      20
    }
    this.event = event
    this.data = []
    this.movedNums = 0
  }

  add (num = 1) {
    for (let i = 0; i < num; i++) {
      this.data.push(
        new Ball({
          x: this.start.x,
          y: this.start.y,
          v: 600,
          status: 'prepare'
        })
      )
    }
  }

  modify (attrs) {
    this.data.forEach((ball) => {
      Object.assign(ball, attrs)
    })
  }
  // 初始化发射速度
  init () {
    const [vx, vy] = util.getVxy(
      this.start.v,
      this.start.angle,
      this.start.direction
    )

    this.data.forEach((ball) => {
      ball.vx = vx
      ball.vy = vy
      ball.v = this.start.v
      ball.status = 'shoot'
    })
  }

  setPostion (ball) {
    ball.x = this.start.x
    ball.y = this.start.y
  }

  move (duration) {
    return new Promise((resolve) => {
      // console.time('start')
      // 换成秒
      const dtime = duration / 1000
      const g = physical.g

      this.data.forEach((ball, index) => {
        setTimeout(() => {
          if (ball.status === 'reset') {
            if (ball.reset.index >= ball.reset.points.length) {
              matter.addBalls(ball, (mball) => {
                ball.x = mball.position.x
                ball.y = mball.position.y
              })
              ball.status = 'prepare'
              ball.color = '#fff'

              this.movedNums++
              if (this.movedNums === this.data.length) {
                this.movedNums = 0
                this.event.moveend && this.event.moveend()
              }
              return
            }

            ball.x = ball.reset.points[ball.reset.index][0]
            ball.y = ball.reset.points[ball.reset.index][1]
            if (dtime > 10 / 1000) {
              ball.reset.index += 2
            } else {
              ball.reset.index++
            }
            return
          }

          if (ball.status === 'prepare') {

            return
          }

          if (ball.status === 'shoot') {
            if (ball.y < stage.enclosure.left.points[2][1]) {
              this.setPostion(ball)
            }
            ball.x += ball.vx * dtime
            ball.y += ball.vy * dtime
          }

          if (ball.status === 'move') {
            ball.x += ball.vx * dtime
            ball.y += physical.computeDistacneByA(ball.vy, g, dtime)
            ball.vy = physical.computeV(ball.vy, g, dtime)
          }

          this.collision(ball)
        }, index * 100)
      })
    // console.timeEnd('start')
    })
  }

  collision (ball) {
    const { enclosure, landslide, bricks, canvasWidth } = stage

    // 球运动直线k,b
    const k1 = ball.vy / ball.vx
    let b1 = ball.y - k1 * ball.x

    if (k1 === Infinity) {
      b1 = ball.x
    }

    const res = collisionEnclosure(ball, enclosure)

    if (res.length) {
      res.forEach((c) => {
        [ball.x, ball.y] = c.point
        const [newVx, newVy] = util.reflexV(ball.vx, ball.vy, c.exp)

        ball.vx = newVx
        ball.vy = newVy
      })
    }

    landslide.points.forEach((point, index, arr) => {
      const d = util.getPointsDistance([ball.x, ball.y], point)

      if (d < ball.size && ball.status !== 'reset') {
        ball.status = 'reset'
        ball.reset = {
          points: [],
          index: 0
        }
        const x = point[0]
        const w = landslide.end[0] - landslide.begin[0]

        // 沿着底部贝塞尔曲线移动
        if (x < w / 2) {
          ball.reset.points = arr.slice(0, index + 1).reverse()
          ball.reset.points[ball.reset.points.length - 1] = ball.reset.points[
            ball.reset.points.length - 1
          ].concat()
          ball.reset.points[ball.reset.points.length - 1][0] += ball.size + 5
        } else {
          ball.reset.points = arr.slice(index - 1)
          ball.reset.points[ball.reset.points.length - 1] = ball.reset.points[
            ball.reset.points.length - 1
          ].concat()
          ball.reset.points[ball.reset.points.length - 1][0] -= ball.size + 5
        }
        ball.reset.points = ball.reset.points.map((p) => {
          return [p[0], p[1] - ball.size - 10]
        })

        resetPoints(ball, enclosure, canvasWidth)
      }
    })

    // 超出边界
    if (
      ball.y > enclosure.left.points[0][1] &&
      (ball.x < 0 || ball.x > canvasWidth)
    ) {
      ball.status = 'reset'
      ball.reset = {
        points: [],
        index: 0
      }

      if (ball.x < 0) {
        const p = landslide.points[0].concat()

        p[0] += ball.size + 5
        ball.reset.points = util.generatePoints(10, [ball.x, ball.y], p)
      } else {
        const p = landslide.points[landslide.points.length - 1].concat()

        p[0] -= ball.size + 5
        ball.reset.points = util.generatePoints(10, [ball.x, ball.y], p)
      }

      resetPoints(ball, enclosure, canvasWidth)
    }

    bricks.forEach((brick, bindex) => {
      if (brick.status === 'breaking') {
        return
      }
      brick.expression.some((exp, index) => {
        const d = util.getPointLineDistance([ball.x, ball.y], ...exp)
        const p1 = brick.points[index]
        const p2 =
          brick.points[index + 1] === undefined
            ? brick.points[0]
            : brick.points[index + 1]

        const res = util.vectorPosition(
          [ball.vx, ball.vy],
          [p2[0] - p1[0], p2[1] - p1[1]]
        )


        if (
          res < 0 &&
          d < ball.size &&
          util.intersectionOnLineSegment(k1, b1, ...exp, p1, p2)
        ) {
          if (util.projectionOnLineSegment([ball.x, ball.y], p1, p2)) {
            // 碰撞的是边
            const cPoints = util.findLinePointDistanceTo(ball.size, k1, b1, ...exp)
            let isEdge = false
            let dot1 = []
            let reflexK = exp[0]

            if (ball.vx > 0) {
              dot1 = cPoints[0]
            } else {
              dot1 = cPoints[1]
            }

            if (util.projectionOnLineSegment(dot1, p1, p2)) {
              [ball.x, ball.y] = dot1
              isEdge = true
            }

            // 碰撞的是顶点
            if (!isEdge) {
              const pc1 = util.getPointLineDistance(p1, k1, b1)
              const pc2 = util.getPointLineDistance(p2, k1, b1)
              const pc = pc1 < pc2 ? p1 : p2
              // 交点
              let dot2 = util.intersectionLineCircle(k1, b1, pc, ball.size)

              if (dot2.length && dot2.length === 2) {
                const x1 = dot2[0][0]
                const y1 = dot2[0][1]
                const x2 = dot2[1][0]
                const y2 = dot2[1][1]

                if (ball.vx > 0) {
                  dot2 = x1 < x2 ? dot2[0] : dot2[1]
                } else if (ball.vx < 0) {
                  dot2 = x1 < x2 ? dot2[1] : dot2[0]
                } else {
                  if (ball.vy > 0) {
                    dot2 = y1 < y2 ? dot2[0] : dot2[1]
                  } else {
                    dot2 = y1 < y2 ? dot2[1] : dot2[0]
                  }
                }
              }

              const [k] = util.getExpression(pc, dot2)
              const NK = -1 / k

              reflexK = NK;
              [ball.x, ball.y] = dot2
            }


            ball.status = 'move'

            const [newVx, newVy] = util.reflexV(ball.vx, ball.vy, reflexK)

            ball.vx = newVx
            ball.vy = newVy
            brick.setWeight(brick.weight - 1)
            brick.shaking()
            this.event.collided && this.event.collided()
            if (brick.weight < 1) {
              brick.breaking(() => {
                bricks.splice(bindex, 1)
              })
            }
            return true
          }
        }
      })
    })
  }
}


function collisionEnclosure (ball, enclosure) {
  // 球运动直线k,b
  const k1 = ball.vy / ball.vx
  let b1 = ball.y - k1 * ball.x

  if (k1 === Infinity) {
    b1 = ball.x
  }

  const collision = []

  enclosure.left.expression.forEach((exp, index) => {
    const d = util.getPointLineDistance([ball.x, ball.y], ...exp)

    if (d < ball.size) {
      const p1 = enclosure.left.points[index]
      const p2 = enclosure.left.points[index + 1]

      if (util.projectionOnLineSegment([ball.x, ball.y], p1, p2)) {
        const cPoints = util.findLinePointDistanceTo(ball.size, k1, b1, ...exp)
        let point = []

        if (ball.vx > 0) {
          point = cPoints[0]
        } else {
          point = cPoints[1]
        }

        collision.push({
          point: point,
          exp: exp[0]
        })
      }
    }
  })

  enclosure.right.expression.forEach((exp, index) => {
    const d = util.getPointLineDistance([ball.x, ball.y], ...exp)

    if (d < ball.size) {
      const p1 = enclosure.right.points[index]
      const p2 = enclosure.right.points[index + 1]

      if (util.projectionOnLineSegment([ball.x, ball.y], p1, p2)) {
        const cPoints = util.findLinePointDistanceTo(ball.size, k1, b1, ...exp)
        let point = []

        if (ball.vx > 0) {
          point = cPoints[0]
        } else {
          point = cPoints[1]
        }

        collision.push({
          point: point,
          exp: exp[0]
        })
      }
    }
  })

  return collision
}


// https://www.ibm.com/developerworks/cn/web/wa-html5-game8/index.html#artrelatedtopics

function resetPoints (ball, enclosure, canvasWidth) {
  // 垂直向上移动
  const topPoint = [
    ball.reset.points[ball.reset.points.length - 1][0],
    enclosure.left.points[1][1] - 10
  ]

  ball.reset.points = ball.reset.points.concat(
    util.generatePoints(
      100,
      ball.reset.points[ball.reset.points.length - 1],
      topPoint
    )
  )

  // // 顶部贝塞尔曲线作类抛出运动
  const begin = ball.reset.points[ball.reset.points.length - 1]
  // const end = [[], begin[1] + 10]

  // 给一个初速度沿着滑坡运动
  const angle = Math.PI / 6
  const v = 600

  if (begin[0] < canvasWidth / 2) {
    ball.vx = Math.cos(angle) * v
    ball.vy = -Math.sin(angle) * v
    ball.v = v
  } else {
    ball.vx = -Math.cos(angle) * v
    ball.vy = -Math.sin(angle) * v
    ball.v = v
  }

  ball.color = '#FED701'
}
