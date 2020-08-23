import './resources'

import Render from './views/Render'
import Bricks from './Bricks'
import Balls from './Balls'
import CanvasEvent from './CanvasEvent'
import matter from './matter'
import stage from './stage'

const restartBtn = document.getElementById('restart')


function init () {
  const canvas = document.getElementById('canvas')
  const ctx = canvas.getContext('2d')
  const canvasEvent = new CanvasEvent(canvas)
  // PREPARE
  // RUN
  let GAME_STATUS = 'PREPARE'
  let timeStamp = 0
  let duration = 0
  let score = 0
  const bricks = new Bricks({
    added: (y) => {
      if (y < stage.deadLine[0][1]) {
        GAME_STATUS = 'END'
        restartBtn.style.display = 'block'
      }

    }
  })
  const balls = new Balls({
    moveend: () => {
      bricks.removeBreaked()
      GAME_STATUS = 'PREPARE'
      bricks.add()
      bricks.animate()
      if (bricks.level % 5 === 0) {
        balls.add(1)
      }
    },
    collided: () => {
      score++
    }
  })
  let aimLine = null


  bricks.add()
  balls.add(5)
  console.log(bricks.data)
  console.log(stage)


  canvasEvent.aim((position) => {
    if (GAME_STATUS === 'PREPARE') {
      matter.stop()
      balls.setPostion(balls.data[0])
      const obj = stage.computeAimLine(position)

      aimLine = obj.aimLine

      if (obj) {
        Object.assign(balls.start, obj)
      }
    }
  })

  canvasEvent.shoot(() => {
    if (GAME_STATUS === 'PREPARE' && aimLine) {
      balls.init()
      GAME_STATUS = 'RUN'
      aimLine = null
    }
  })

  canvas.addEventListener('click', (e) => {
    const x = e.offsetX
    const y = e.offsetY

    stage.items.forEach(item => {
      if (x >= item.x && x <= item.x + item.width && y >= item.y && y <= item.y + item.height) {
        if (item.name === 'remove_one_line' && GAME_STATUS === 'PREPARE') {
          if (item.nums <= 0) {
            return
          }
          item.nums--
          bricks.removeOneLine()
        }
      }
    })
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
    render.deadLine(stage.deadLine)
    render.items(stage.items)


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
    switch (GAME_STATUS) {
      case 'PREPARE':
        render.aimLine(aimLine)
        break
      case 'RUN':
        balls.move(duration)
        break
      case 'END':
        render.gameOver(score)
        return
      default:
        break
    }
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
}

restartBtn.addEventListener('click', (e) => {
  e.target.style.display = 'none'
  init()
})

init()
