import Render from './views/Render'
import Bricks from './Bricks'
import Balls from './Balls'
import CanvasEvent from './CanvasEvent'
import matter from './matter'
import stage from './stage'

const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
const canvasEvent = new CanvasEvent(canvas)
// PREPARE
// RUN
let GAME_STATUS = 'PREPARE'
let timeStamp = 0
let duration = 0
let score = 0
const bricks = new Bricks()
const balls = new Balls({
  moveend: () => {
    GAME_STATUS = 'PREPARE'
    bricks.add()
    bricks.animate()
  },
  collided: () => {
    score++
  }

})
let mouse = {
  x: 0,
  y: 0
}

bricks.add()
balls.add(10)
console.log(bricks.data)
console.log(stage)


canvasEvent.aim((position) => {
  if (GAME_STATUS === 'PREPARE') {
    matter.stop()
    balls.setPostion(balls.data[0])
    mouse = position
  }
})

canvasEvent.shoot(() => {
  if (GAME_STATUS === 'PREPARE') {
    mouse = {}
    balls.start.time = new Date().getTime()
    balls.init()
    GAME_STATUS = 'RUN'
  }
})

function main () {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  const render = new Render(canvas)

  render.enclosure(stage.enclosure)
  render.landslide(stage.landslide)
  render.text(score, {
    x: stage.enclosure.right.points[2][0] + 120,
    y: stage.enclosure.right.points[2][1] - 10,
    fontSize: '22px'
  })

  switch (GAME_STATUS) {
    case 'PREPARE':
      const obj = render.aimLine(mouse)

      if (obj) {
        Object.assign(balls.start, obj)
      }
      break
    case 'RUN':
      balls.move(duration)
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

    if (brick.status === 'shaking') {
      render.brick({
        ...brick,
        x: brick.shakingX,
        y: brick.shakingY
      })
      return
    }
    render.brick(brick)
  })

  balls.data.forEach((ball) => {
    render.ball(ball)
  })

}


function animation () {
  const time = new Date().getTime()

  duration = time - timeStamp
  timeStamp = time
  main()
  requestAnimationFrame(() => {
    animation()
  })
}

animation()
