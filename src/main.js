import Render from './views/Render'
import Bricks from './models/Bricks'
import Ball from './models/Ball'
import CanvasEvent from './CanvasEvent'
// import global from './global'
import * as util from './util'
import physical from './physical'

import stage from './stage'
console.log(stage)

const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
const render = new Render(canvas)

let status = 'prepare'
let timeStamp = 0

const bricks = new Bricks({
  left: stage.enclosure.left.points[0][0],
  right: stage.enclosure.right.points[0][0],
  bottom: stage.enclosure.left.points[0][1]
})

const balls = {
  start: {
    time: 0,
    v: 600,
    x: render.width / 2,
    y:
      stage.enclosure.left.points[
        stage.enclosure.left.points.length - 1
      ][1] + 20
  },
  timeStamp: 0,
  data: [],
  add (num = 1) {
    for (let i = 0; i < num; i++) {
      this.data.push(
        new Ball({
          x: render.width / 2,
          y:
            stage.enclosure.left.points[
              stage.enclosure.left.points.length - 1
            ][1] + 20,
          v: 600,
          status: 'prepare'
        })
      )
    }
  },
  modify (attrs) {
    this.data.forEach((ball) => {
      Object.assign(ball, attrs)
    })
  },
  // 初始化发射速度
  initV () {
    const [vx, vy] = util.getVxy(
      this.start.v,
      this.start.angle,
      this.start.direction
    )

    this.data.forEach((ball) => {
      ball.vx = vx
      ball.vy = vy
      ball.v = this.start.v
      ball.status = 'start'
    })
  },

  initPostion (ball) {
    ball.x = this.start.x
    ball.y = this.start.y
  },

  move () {
    // console.time('start')
    const dtime = this.timeStamp - this.start.time

    this.data.forEach((ball, index) => {
      setTimeout(() => {
        if (ball.status === 'reset') {
          if (ball.reset.index >= ball.reset.points.length) {
            ball.x += (ball.reset.vx / 1000) * dtime
            ball.y += (ball.reset.vy / 1000) * dtime

            util.collisionBall(ball, this.data)

            if (
              (ball.x > stage.enclosure.left.points[2][0] &&
                ball.reset.vx > 0) ||
              (ball.x < stage.enclosure.right.points[2][0] && ball.reset.vx < 0)
            ) {
              this.modify({
                color: '#fff'
              })
              ball.status = 'prepare'
              status = 'prepare'
              bricks.add()
              bricks.animate()
            }

            return
          }

          ball.x = ball.reset.points[ball.reset.index][0]
          ball.y = ball.reset.points[ball.reset.index][1]
          if (dtime > 10) {
            ball.reset.index += 2
          } else {
            ball.reset.index++
          }
          return
        }

        if (ball.status === 'prepare') {
          return
        }

        if (ball.status === 'start') {
          this.initPostion(ball)
          ball.status = 'shoot'
        }

        ball.x += (ball.vx / 1000) * dtime
        if (ball.status === 'moving') {
          ball.vy += physical.g * dtime
          ball.y += (ball.vy / 1000) * dtime
        } else {
          ball.y += (ball.vy / 1000) * dtime
        }
        util.collision(ball, {
          enclosure: stage.enclosure,
          landslide: stage.landslide,
          canvasWidth: stage.canvasWidth,
          bricks: bricks.data
        })
      }, index * 100)
    })
    this.start.time = this.timeStamp
    // console.timeEnd('start')
  }
}

bricks.add()
balls.add(4)
console.log(bricks.data)

let mouse = {
  x: 0,
  y: 0
}

function main () {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const render = new Render(canvas)

  render.enclosure(stage.enclosure)
  render.landslide(stage.landslide)

  switch (status) {
    case 'prepare':
      const obj = render.aimLine(mouse)

      if (obj) {
        Object.assign(balls.start, obj)
      }
      break
    case 'runing':
      balls.timeStamp = timeStamp
      balls.move()
      break
    default:
      break
  }

  bricks.data.forEach((brick) => {
    if (brick.pieces && brick.pieces.length) {
      for (let i = 0; i < brick.pieces.length; i++) {
        render.brick(brick.pieces[i])
      }
      return
    }
    render.brick(brick)
  })

  balls.data.forEach((ball) => {
    render.ball(ball)
  })

  // ctx.clearRect(0, 0, canvas.width, canvas.height)

  // render.brick(brick.attrs)
}

main()

const canvasEvent = new CanvasEvent(canvas)

canvasEvent.aim((position) => {
  if (status === 'prepare') {
    balls.initPostion(balls.data[0])
    mouse = position
  }
})

canvasEvent.shot(() => {
  if (status === 'prepare') {
    mouse = {}
    balls.start.time = new Date().getTime()
    balls.initV()
    status = 'runing'
  }
})

// console.log(render.aimLine({
//   x: 200,
//   y: 600
// }))

function animation () {
  timeStamp = new Date().getTime()
  main()
  requestAnimationFrame(() => {
    animation()
  })
}

animation()
