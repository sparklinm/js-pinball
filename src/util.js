// https://github.com/alexbol99/flatten-js
import { Point, Line, Circle } from '@flatten-js/core'

// 联立直线解析式求交点
export function linesIntersect (k1, b1, k2, b2) {
  if (k1 === Infinity) {
    return [b1, k2 * b1 + b2]
  }

  if (k2 === Infinity) {
    return [b2, k1 * b2 + b1]
  }
  return [(b2 - b1) / (k1 - k2), (k1 * (b1 + b2) - b1 * (k1 + k2)) / (k1 - k2)]
}

// 两点间距离
export function getPointsDistance (point1, point2) {
  return Math.sqrt(
    Math.pow(point2[1] - point1[1], 2) + Math.pow(point2[0] - point1[0], 2)
  )
}

// 点到直线距离
// https://www.zhihu.com/question/386584367
export function getPointLineDistance (point, k, b) {
  const x = point[0]
  const y = point[1]

  if (k === Infinity) {
    return Math.abs(x - b)
  }

  return Math.abs(-k * x + y - b) / Math.sqrt(Math.pow(-k, 2) + 1)
}

// 两个向量的位置关系
// 向量叉乘判断
// https://www.jianshu.com/p/86296b876573
// 大于0 v1 向量方向在 v2 向量顺时针旋转180度之间
// 等于 0 重合
export function vectorPosition (v1, v2) {
  const res = v1[0] * v2[1] - v1[1] * v2[0]

  return res > 0 ? 1 : res < 0 ? -1 : 0
}

export function pointOnLineSegment (p, p1, p2, include = true) {
  // p 在p1、p2的直线上
  // 向量叉乘为0，向量 p1 p x 向量 p2 p = 0
  // https://www.cnblogs.com/zzdyyy/p/7643267.html
  // 这里存在精度问题
  if (
    (p1[0] - p[0]) * (p2[1] - p[1]) - (p2[0] - p[0]) * (p1[1] - p[1]) >=
    0.0001
  ) {
    return false
  }

  if (include) {
    // p点在p1 p2中间
    return (
      !((p[0] > p1[0] && p[0] > p2[0]) || (p[0] < p1[0] && p[0] < p2[0])) &&
      !((p[1] > p1[1] && p[1] > p2[1]) || (p[1] < p1[1] && p[1] < p2[1]))
    )
  }
  // p点在p1 p2中间
  return (
    !((p[0] >= p1[0] && p[0] >= p2[0]) || (p[0] <= p1[0] && p[0] <= p2[0])) ||
    !((p[1] >= p1[1] && p[1] >= p2[1]) || (p[1] <= p1[1] && p[1] <= p2[1]))
  )
}

// 判断两条直线交点是否在某条线段上
export function intersectionOnLineSegment (k1, b1, k2, b2, p1, p2) {
  const dot = linesIntersect(k1, b1, k2, b2)

  return pointOnLineSegment(dot, p1, p2)
}

// 点到直线的投影点是否在线段上
export function projectionOnLineSegment (p, a, b, include = true) {
  const projection = projectionFromPointToLine(p, a, b)

  return pointOnLineSegment([projection.x, projection.y], a, b, include)
}

// 点到指定直线投影
// p到直线ab投影点
// https://blog.csdn.net/lnxyangruosong/article/details/74205300?utm_medium=distribute.pc_relevant.none-task-blog-BlogCommendFromMachineLearnPai2-5.channel_param&depth_1-utm_source=distribute.pc_relevant.none-task-blog-BlogCommendFromMachineLearnPai2-5.channel_param
// 这里使用了 flatten.js 库
export function projectionFromPointToLine (p, a, b) {
  const A = new Point(...a)
  const B = new Point(...b)
  const P = new Point(...p)
  const lineAB = new Line(A, B)

  return P.projectionOn(lineAB)
}

// 两条直线夹角
// 平行时返回 0
// https://blog.csdn.net/sinat_29890433/article/details/88946060
export function innerAngle (k1, k2) {
  // 其中一条垂直
  if (k1 === Infinity && k2 !== Infinity) {
    return Math.abs(Math.abs(Math.atan(k2)) - Math.PI / 2)
  }

  if (k2 === Infinity && k1 !== Infinity) {
    return Math.abs(Math.abs(Math.atan(k1)) - Math.PI / 2)
  }

  return Math.atan(Math.abs((k2 - k1) / (1 + k1 * k2)))
}

// 计算速度关于任意直线反弹后

export function reflexV (
  vx,
  vy,
  linek,
  v = Math.sqrt(Math.pow(vx, 2) + Math.pow(vy, 2))
) {
  if (vy === vx && vx === 0) {
    return [vx, vy]
  }
  const vk = vy / vx
  // 垂直于vk的法线
  const vkN = -1 / vk
  const angle = innerAngle(vk, linek)
  const originV = Math.sqrt(Math.pow(vx, 2) + Math.pow(vy, 2))
  let vAngle = Math.acos(vx / originV)

  if (vy < 0) {
    vAngle = -vAngle
  }
  // console.log((angle * 180) / Math.PI)
  // console.log((vAngle * 180) / Math.PI)
  // console.log((newVAngle * 180) / Math.PI)

  // 垂直于x轴，无斜率
  if (linek === Infinity) {
    return [-Math.cos(vAngle) * v, Math.sin(vAngle) * v]
  }

  let newVAngle = 0

  // linek相对于vkNs顺时针旋转
  // vAngle逆时针旋转，相减
  if (linek > vkN || linek < vk) {
    newVAngle = vAngle - 2 * angle
  } else {
    newVAngle = vAngle + 2 * angle
  }

  return [Math.cos(newVAngle) * v, Math.sin(newVAngle) * v]
}

export function getXY (startPoint, k, ds) {
  const angle = Math.atan(k)

  return [
    startPoint[0] + Math.cos(angle) * ds,
    startPoint[1] + Math.sin(angle) * ds
  ]
}

export function getK (startPoint, endPoint) {
  if (endPoint[0] - startPoint[0] === 0) {
    return Infinity
  }
  return (endPoint[1] - startPoint[1]) / (endPoint[0] - startPoint[0])
}

export function getDirection (dx, dy) {
  function doing (d) {
    if (d > 0) {
      return 1
    }
    if (d === 0) {
      return 0
    }
    return -1
  }

  return {
    x: doing(dx),
    y: doing(dy)
  }
}

// 根据两点获得解析式
export function getExpression (point1, point2) {
  const k = getK(point1, point2)

  if (k === Infinity) {
    return [k, point1[0]]
  }

  return [k, point1[1] - k * point1[0]]
}

export function getPointsExpression (points, close = false) {
  const res = []

  points.forEach((point, index, arr) => {
    let nextPoint = arr[index + 1]

    if (close) {
      if (index === arr.length - 1) {
        nextPoint = arr[0]
      }
    } else {
      if (index === arr.length - 1) {
        return
      }
    }

    res.push(getExpression(point, nextPoint))
  })
  return res
}

export function getVxy (v, angle, direction) {
  return [v * Math.cos(angle) * direction.x, v * Math.sin(angle) * direction.y]
}

// k1 k2 关于 k3 对称，求k1
// 到角公式
export function getSymmetryK (k2, k3) {
  return (
    (2 * k3 + k2 * Math.pow(k3, 2) - k2) / (2 * k2 * k3 - Math.pow(k3, 2) + 1)
  )
}

// 三次贝塞尔曲线获取坐标点
// https://blog.csdn.net/cfan927/article/details/104649623/
export function calculatePointsForBezierCurve (nums, begin, cp1, cp2, end) {
  const points = []
  const piece = 1 / nums
  let t = 0

  for (let i = 0; i <= nums; i++) {
    points[i] = []
    points[i][0] =
      begin.x * Math.pow(1 - t, 3) +
      3 * cp1.x * t * Math.pow(1 - t, 2) +
      3 * cp2.x * Math.pow(t, 2) * (1 - t) +
      end.x * Math.pow(t, 3)
    points[i][1] =
      begin.y * Math.pow(1 - t, 3) +
      3 * cp1.y * t * Math.pow(1 - t, 2) +
      3 * cp2.y * Math.pow(t, 2) * (1 - t) +
      end.y * Math.pow(t, 3)

    if (i === nums.length - 1) {
      t = 1
    } else {
      t += piece
    }
  }

  return points
}

// 在两点间生成 n 个点
export function generatePoints (nums, p1, p2) {
  const exp = getExpression(p1, p2)
  const k = exp[0]

  let pieceX = 0
  let pieceY = 0
  const points = []

  if (k === Infinity) {
    const length = p2[1] - p1[1]

    pieceY = length / nums
  } else {
    const lengthX = p2[0] - p1[0]
    const lengthY = p2[1] - p1[1]

    pieceX = lengthX / nums
    pieceY = lengthY / nums
  }

  for (let i = 0; i < nums; i++) {
    points.push([p1[0] + pieceX * (i + 1), p1[1] + pieceY * (i + 1)])
  }

  return points
}

// 截距式转一般式
export function generalTypeLine (k, b) {
  if (k === Infinity) {
    // a, b, c
    return [1, 0, -b]
  }

  return [k, -1, b]
}

// 平行线之间距离
// http://www.gaosan.com/gaokao/264778.html
export function parallelDistance (k1, b1, k2, b2) {
  if (k1 !== k2) {
    throw new Error('argument(s) error')
  }
  const l1 = generalTypeLine(k1, b1)
  const l2 = generalTypeLine(k2, b2)

  return (
    Math.abs(l1[2] - l2[2]) / Math.sqrt(Math.pow(l1[0], 2) + Math.pow(l1[1], 2))
  )
}

// 找到直线(k1)上一点
// 该点到另一条直线(k2)的距离为一个定值
export function findLinePointDistanceTo (d, k1, b1, k2, b2) {
  if (k1 === k2) {
    throw new Error('Lines parallel')
  }
  const intersection = linesIntersect(k1, b1, k2, b2)
  const ds = d / Math.sin(innerAngle(k1, k2))
  const angle = Math.atan(Math.abs(k1))
  const dx = Math.cos(angle) * ds
  const dy = Math.sin(angle) * ds

  if (dx > 20 || dy > 20) {
    // debugger
  }

  if (k1 >= 0) {
    return [
      [intersection[0] - dx, intersection[1] - dy],
      [intersection[0] + dx, intersection[1] + dy]
    ]
  }
  return [
    [intersection[0] - dx, intersection[1] + dy],
    [intersection[0] + dx, intersection[1] - dy]
  ]
}

// 直线和圆的交点
export function intersectionLineCircle (k1, b1, p3, r) {
  let p1 = []
  let p2 = []

  if (k1 === Infinity) {
    p1 = [b1, 0]
    p2 = [b1, 1]
  } else {
    p1 = [0, b1]
    p2 = [1, k1 + b1]
  }
  const line = new Line(new Point(...p1), new Point(...p2))
  const circle = new Circle(new Point(...p3), r)

  const intersection = circle.intersect(line)

  if (!intersection.length) {
    return []
  }

  if (intersection.length === 1) {
    [[intersection[0].x, intersection[0].y]]
  }

  return [
    [intersection[0].x, intersection[0].y],
    [intersection[1].x, intersection[1].y]
  ]
}

// 圆心在定直线上运动
// 圆恰好与另一条直线相切时，圆心坐标
// 纠正圆与直线相撞时，圆心移动过多造成的不准确
export function circleCenter (r, d, point, vx, vy, k2) {
  const vk = vy / vx
  const angle = innerAngle(vk, k2)
  const ds = (r - d) / Math.sin(angle)
  const vAngle = Math.atan(Math.abs(vk))
  const dx = Math.cos(vAngle) * ds
  const dy = Math.sin(vAngle) * ds

  if (dx > 10 || dy > 10) {
    debugger
  }
  let newX = 0
  let newY = 0

  if (vx > 0) {
    newX = point[0] - dx
  } else {
    newX = point[0] + dx
  }

  if (vy > 0) {
    newY = point[1] - dy
  } else {
    newY = point[1] + dy
  }

  return [newX, newY]
}


export function collisionSegment (ball, p1, p2) {
  // 球运动直线k,b
  const k1 = ball.vy / ball.vx
  let b1 = ball.y - k1 * ball.x

  if (k1 === Infinity) {
    b1 = ball.x
  }

  const collision = []
  const exp = getExpression(p1, p2)
  const d = getPointLineDistance([ball.x, ball.y], ...exp)

  if (d < ball.size) {
    if (projectionOnLineSegment([ball.x, ball.y], p1, p2)) {
      const cPoints = findLinePointDistanceTo(ball.size, k1, b1, ...exp)
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

export function collisionBall (ball, balls) {
  return balls.filter((oball) => {
    if (oball === ball) {
      return false
    }
    const d = getPointsDistance([ball.x, ball.y], [oball.x, oball.y])

    if (d < ball.size + oball.size) {
      return true
    }

    return false
  })
}

// https://www.ibm.com/developerworks/cn/web/wa-html5-game8/index.html#artrelatedtopics

function resetPoints (ball, enclosure, canvasWidth) {
  // 垂直向上移动
  const topPoint = [
    ball.reset.points[ball.reset.points.length - 1][0],
    enclosure.left.points[1][1] - 10
  ]

  ball.reset.points = ball.reset.points.concat(
    generatePoints(
      100,
      ball.reset.points[ball.reset.points.length - 1],
      topPoint
    )
  )

  // // 顶部贝塞尔曲线作类抛出运动
  const begin = ball.reset.points[ball.reset.points.length - 1]
  // const end = [[], begin[1] + 10]

  // // 左边
  // if (begin[0] < canvasWidth / 2) {
  //   end[0] = enclosure.right.points[1][0] - 50
  // } else {
  //   end[0] = enclosure.left.points[1][0] + 50
  // }

  // const cp1 = [begin[0] + (end[0] - begin[0]) / 3, 10]
  // const cp2 = [begin[0] + ((end[0] - begin[0]) / 3) * 2, 10]

  // ball.reset.points = ball.reset.points.concat(
  //   calculatePointsForBezierCurve(
  //     50,
  //     {
  //       x: begin[0],
  //       y: begin[1]
  //     },
  //     {
  //       x: cp1[0],
  //       y: cp1[1]
  //     },
  //     {
  //       x: cp2[0],
  //       y: cp2[1]
  //     },
  //     {
  //       x: end[0],
  //       y: end[1]
  //     }
  //   )
  // )

  // 给一个初速度沿着滑坡运动
  const angle = Math.PI / 6
  const v = 600

  if (begin[0] < canvasWidth / 2) {

    ball.reset.vx = Math.cos(angle) * v
    ball.reset.vy = -Math.sin(angle) * v
    ball.reset.v = v
  } else {

    ball.reset.vx = -Math.cos(angle) * v
    ball.reset.vy = -Math.sin(angle) * v
    ball.reset.v = v
  }

  ball.color = '#FED701'
}

export function collisionEnclosure (ball, enclosure) {
  // 球运动直线k,b
  const k1 = ball.vy / ball.vx
  let b1 = ball.y - k1 * ball.x

  if (k1 === Infinity) {
    b1 = ball.x
  }

  const collision = []

  enclosure.left.expression.forEach((exp, index) => {
    const d = getPointLineDistance([ball.x, ball.y], ...exp)


    if (d < ball.size) {
      const p1 = enclosure.left.points[index]
      const p2 = enclosure.left.points[index + 1]

      if (projectionOnLineSegment([ball.x, ball.y], p1, p2)) {
        const cPoints = findLinePointDistanceTo(ball.size, k1, b1, ...exp)
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
    const d = getPointLineDistance([ball.x, ball.y], ...exp)


    if (d < ball.size + 0.1) {
      const p1 = enclosure.right.points[index]
      const p2 = enclosure.right.points[index + 1]

      if (projectionOnLineSegment([ball.x, ball.y], p1, p2)) {
        const cPoints = findLinePointDistanceTo(ball.size, k1, b1, ...exp)
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

export function collision (ball, obj) {
  const { enclosure, landslide, bricks, canvasWidth } = obj

  // 球运动直线k,b
  const k1 = ball.vy / ball.vx
  let b1 = ball.y - k1 * ball.x

  if (k1 === Infinity) {
    b1 = ball.x
  }

  const res = collisionEnclosure(ball, enclosure)

  if (res.length) {
    res.forEach(c => {
      [ball.x, ball.y] = c.point
      const [newVx, newVy] = reflexV(ball.vx, ball.vy, c.exp)

      ball.vx = newVx
      ball.vy = newVy
    })
  }

  landslide.points.forEach((point, index, arr) => {
    const d = getPointsDistance([ball.x, ball.y], point)

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
      ball.reset.points = generatePoints(10, [ball.x, ball.y], p)
    } else {
      const p = landslide.points[landslide.points.length - 1].concat()

      p[0] -= ball.size + 5
      ball.reset.points = generatePoints(10, [ball.x, ball.y], p)
    }

    resetPoints(ball, enclosure, canvasWidth)
  }

  bricks.forEach((brick, bindex) => {
    if (brick.status === 'breaking') {
      return
    }
    brick.expression.some((exp, index) => {
      const d = getPointLineDistance([ball.x, ball.y], ...exp)
      const p1 = brick.points[index]
      const p2 =
        brick.points[index + 1] === undefined
          ? brick.points[0]
          : brick.points[index + 1]

      const res = vectorPosition(
        [ball.vx, ball.vy],
        [p2[0] - p1[0], p2[1] - p1[1]]
      )

      if (
        res < 0 &&
        d < ball.size &&
        intersectionOnLineSegment(k1, b1, ...exp, p1, p2)
      ) {
        if (projectionOnLineSegment([ball.x, ball.y], p1, p2)) {

          // 碰撞的是边
          const cPoints = findLinePointDistanceTo(ball.size, k1, b1, ...exp)
          let isEdge = false
          let dot1 = []
          let reflexK = exp[0]

          if (ball.vx > 0) {
            dot1 = cPoints[0]
          } else {
            dot1 = cPoints[1]
          }

          if (projectionOnLineSegment(dot1, p1, p2)) {
            [ball.x, ball.y] = dot1
            isEdge = true
          }

          // 碰撞的是顶点
          if (!isEdge) {
            const pc1 = getPointLineDistance(p1, k1, b1)
            const pc2 = getPointLineDistance(p2, k1, b1)
            const pc = pc1 < pc2 ? p1 : p2
            // 交点
            let dot2 = intersectionLineCircle(k1, b1, pc, ball.size)

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

            if (!dot2.length) {
              debugger
            }

            const [k] = getExpression(pc, dot2)
            const NK = -1 / k

            reflexK = NK;
            [ball.x, ball.y] = dot2
          }




          // [ball.x, ball.y] = circleCenter(
          //   ball.size,
          //   d,
          //   [ball.x, ball.y],
          //   ball.vx,
          //   ball.vy,
          //   exp[0]
          // )

          ball.status = 'moving'

          const [newVx, newVy] = reflexV(ball.vx, ball.vy, reflexK)

          ball.vx = newVx
          ball.vy = newVy
          brick.setWeight(brick.weight - 1)
          brick.shaking()
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

const arr = []
