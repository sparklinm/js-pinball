import Render from './views/Render'
import Bricks from './models/Bricks'
import Ball from './models/Ball'
import CanvasEvent from './CanvasEvent'
import { getS } from './physical'
// import global from './global'
import * as util from './util'


const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
const render = new Render(canvas)
const enclosure = render.enclosurePos
const bottomBoundary = render.bottomBoundaryPos
let status = 'prepare'
let timeStamp = 0
const bricks = new Bricks({
  left: enclosure.left[0][0],
  right: enclosure.right[0][0],
  bottom: enclosure.left[0][1]
})

const balls = {
  start: {
    time: 0,
    direction: 0
  },
  timeStamp: 0,
  data: [],
  add (num = 1) {
    for (let i = 0; i < num; i++) {
      this.data.push(new Ball({
        x: render.width / 2,
        y: render.enclosurePos.left[render.enclosurePos.left.length - 1][1] - 20
      }))
    }
  },
  modifyBalls (attrs) {
    this.data.forEach(ball => {
      Object.assign(ball, attrs)
    })
  },
  move () {
    const s = getS(this.timeStamp - this.start.time, 400 / 1000)

    this.start.time = this.timeStamp

    this.data.forEach((ball, index) => {
      setTimeout(() => {
        const point = util.getXY([ball.x, ball.y], this.start.direction, s)

        ball.x = point[0]
        ball.y = point[1]
        util.collision(ball, {
          enclosure,
          bottomBoundary,
          bricks: bricks.data
        })
      }, index * 100)
    })
  }
}

bricks.add()
balls.add(10)


let mouse = {
  x: 0,
  y: 0
}

function main () {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const render = new Render(canvas)

  render.enclosure()
  render.bottomBoundary()


  switch (status) {
    case 'prepare':
      balls.start.direction = render.aimLine(mouse)
      break
    case 'runing':
      balls.timeStamp = timeStamp
      balls.move()
      break
    default:
      break
  }



  bricks.data.forEach(brick => {
    render.brick(brick)
  })

  balls.data.forEach(ball => {
    render.ball(ball)
  })





  // ctx.clearRect(0, 0, canvas.width, canvas.height)


  // render.brick(brick.attrs)
}


main()


const canvasEvent = new CanvasEvent(canvas)

canvasEvent.aim((position) => {
  if (status === 'prepare') {
    mouse = position
  }
})

canvasEvent.shot(() => {
  if (status === 'prepare') {
    mouse = {}
    balls.start.time = new Date().getTime()
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

