
import * as util from './util'
import stage from './stage'

function collisionSegment (ball, p1, p2) {
  // 球运动直线k,b
  const k1 = ball.vy / ball.vx
  let b1 = ball.y - k1 * ball.x

  if (k1 === Infinity) {
    b1 = ball.x
  }

  const collision = []
  const exp = util.getExpression(p1, p2)
  const d = util.getPointLineDistance([ball.x, ball.y], ...exp)

  if (d < ball.size) {
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

  return collision
}

function collisionBall (ball, balls) {
  return balls.filter((oball) => {
    if (oball === ball) {
      return false
    }
    const d = util.getPointsDistance([ball.x, ball.y], [oball.x, oball.y])

    if (d < ball.size + oball.size) {
      return true
    }

    return false
  })
}
