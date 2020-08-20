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


// 点是否在线段上
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
  if (
    (k1 === Infinity || k1 === -Infinity) &&
    k2 !== Infinity &&
    k2 !== -Infinity
  ) {
    return Math.abs(Math.abs(Math.atan(k2)) - Math.PI / 2)
  }

  if (
    (k2 === Infinity || k2 === -Infinity) &&
    k1 !== Infinity &&
    k1 !== -Infinity
  ) {
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

// 在指定条直线上获取相距 某点 一定距离 的 另一点
export function getXY (startPoint, k, ds) {
  const angle = Math.atan(k)

  return [
    startPoint[0] + Math.cos(angle) * ds,
    startPoint[1] + Math.sin(angle) * ds
  ]
}

// 直线斜率k
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

// 根据两点获得直线斜截式
export function getExpression (point1, point2) {
  const k = getK(point1, point2)

  if (k === Infinity) {
    return [k, point1[0]]
  }

  return [k, point1[1] - k * point1[0]]
}

//
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

