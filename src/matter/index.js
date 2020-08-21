import Matter from 'matter-js'
import stage from '../stage'
import { getPointsDistance } from '../util'
// module aliases
const Engine = Matter.Engine
const Render = Matter.Render
const World = Matter.World
const Bodies = Matter.Bodies
const Body = Matter.Body

// create an engine
const engine = Engine.create()

// create a renderer
const render = Render.create({
  element: document.body,
  engine: engine
})

// create two boxes and a ground

function creatBoxA () {
  const p1 = stage.enclosure.left.points[1]
  const p2 = stage.enclosure.left.points[2]
  const mid = [(p2[0] + p1[0]) / 2, (p2[1] + p1[1]) / 2]
  const width = getPointsDistance(p1, p2)
  const angle = Math.atan((p2[1] - p1[1]) / (p2[0] - p1[0]))
  const box = Bodies.rectangle(...mid, width, 4, {
    isStatic: true
  })

  Matter.Body.rotate(box, angle)

  return box
}

function creatBoxB () {
  const p1 = stage.enclosure.right.points[1]
  const p2 = stage.enclosure.right.points[2]
  const mid = [(p2[0] + p1[0]) / 2, (p2[1] + p1[1]) / 2]
  const width = getPointsDistance(p1, p2)
  const angle = Math.atan((p2[1] - p1[1]) / (p2[0] - p1[0]))
  const box = Bodies.rectangle(...mid, width, 4, {
    isStatic: true
  })

  Matter.Body.rotate(box, angle)

  return box
}

function createBoundary () {
  const b1 = Bodies.rectangle(stage.canvasWidth / 2, 2, stage.canvasWidth, 1, {
    isStatic: true
  })

  const b2 = Bodies.rectangle(
    stage.canvasWidth,
    stage.enclosure.right.points[1][1] / 2,
    1,
    stage.enclosure.right.points[1][1],
    {
      isStatic: true
    }
  )

  const b3 = Bodies.rectangle(
    (stage.canvasWidth + stage.enclosure.right.points[1][0]) / 2,
    stage.enclosure.right.points[1][1],
    stage.canvasWidth - stage.enclosure.right.points[1][0],
    1,
    {
      isStatic: true
    }
  )

  const b4 = Bodies.rectangle(
    stage.canvasWidth / 2,
    stage.enclosure.right.points[2][1],
    stage.enclosure.right.points[2][0] - stage.enclosure.left.points[2][0],
    1,
    {
      isStatic: true
    }
  )

  const b5 = Bodies.rectangle(
    stage.enclosure.left.points[1][0] / 2,
    stage.enclosure.left.points[1][1],
    stage.enclosure.left.points[1][0],
    1,
    {
      isStatic: true
    }
  )

  const b6 = Bodies.rectangle(
    1,
    stage.enclosure.left.points[1][1] / 2,
    1,
    stage.enclosure.left.points[1][1],
    {
      isStatic: true
    }
  )

  return [b1, b2, b3, b4, b5, b6]
}

const boxA = creatBoxA()
const boxB = creatBoxB()
const boundary = createBoundary()


// add all of the bodies to the world
World.add(engine.world, [boxA, boxB, ...boundary])

// run the engine
Engine.run(engine)

// run the renderer
// Render.run(render)

// const runner = Runner.create()

;(function run () {
  window.requestAnimationFrame(run)
  Engine.update(engine, 1000 / 60)
})()

let timer = null

function addBalls (ball, cb) {
  const mb = Matter.Bodies.circle(ball.x, ball.y, ball.size)

  if (ball.x > stage.canvasWidth / 2) {
    Body.setVelocity(mb, {
      x: -10,
      y: -5
    })
  } else {
    Body.setVelocity(mb, {
      x: 10,
      y: -5
    })
  }



  function run () {
    timer = requestAnimationFrame(() => {

      cb(mb)
      run()
    })
  }
  run()
  World.add(engine.world, mb)
}

function stop () {
  World.clear(engine.world, true)
  cancelAnimationFrame(timer)
}



export default {
  addBalls,
  stop
}
