import { getPointsExpression,
         calculatePointsForBezierCurve,
         getXY,
         getDirection } from './util'

const canvasWidth = 450
const canvasHeight = 800

// 左右围栏
const enclosure = (() => {
  const left = 30
  const top = 60
  const bottom = canvasHeight - 150
  const middle = canvasWidth / 2
  const right = canvasWidth - left
  const width = 4
  const leftPoints = [
    [left, bottom],
    [left, top],
    [middle - 20, 120]
  ]
  const rightPoints = [
    [right, bottom],
    [right, top],
    [middle + 20, 120]
  ]

  return {
    left: {
      points: leftPoints,
      expression: getPointsExpression(leftPoints),
      width
    },
    right: {
      points: rightPoints,
      expression: getPointsExpression(rightPoints),
      width
    }
  }
})()

// 下方滑坡
const landslide = (() => {
  const bottom = canvasHeight - 100
  const controlPotiontY = bottom + 40
  const middle = canvasWidth / 2
  const controlPotiontOffsetX = 80

  const begin = [0, bottom]
  const cp1 = [middle - controlPotiontOffsetX, controlPotiontY]
  const cp2 = [middle + controlPotiontOffsetX, controlPotiontY]
  const end = [canvasWidth, bottom]

  return {
    begin,
    cp1,
    cp2,
    end,
    width: 4,
    fillColor: '#272727',
    points: calculatePointsForBezierCurve(
      100,
      {
        x: begin[0],
        y: begin[1]
      },
      {
        x: cp1[0],
        y: cp1[1]
      },
      {
        x: cp2[0],
        y: cp2[1]
      },
      {
        x: end[0],
        y: end[1]
      }
    )
  }
})()

// 瞄准
function computeAimLine (mouse) {
  const startX = this.canvasWidth / 2
  const startY =
    this.enclosure.left.points[this.enclosure.left.points.length - 1][1] + 20

  if (mouse.y < startY) {
    return
  }

  const endX = mouse.x
  const endY = mouse.y
  const k1 = (endY - startY) / (endX - startX)
  const angle = Math.atan(k1)

  // 带正负符号
  // 90度，cos 为 0 的情况用 sin 计算
  const distance =
    (endX - startX) / Math.cos(angle) || (endY - startY) / Math.sin(angle)

  // 方向
  // 1 代表沿直线x增大的方向，0 相反
  const direction = distance >= 0 ? 1 : 0

  const gap = 40
  const r = 4
  const gapCenter = gap + 2 * r
  const nums = Math.floor(Math.abs(distance) / gapCenter)
  const obj = {}

  const drawArrow = () => {
    const arrowH = 25
    const arrowGap = 15
    const ds1 = direction ? arrowH + arrowGap : -(arrowH + arrowGap)
    const point1 = getXY([startX, startY], k1, ds1)
    const ds2 = direction ? arrowGap : -arrowGap
    const bottomCenter = getXY([startX, startY], k1, ds2)
    const k2 = -1 / k1
    const baseSideW = 12
    const point2 = getXY(bottomCenter, k2, baseSideW / 2)
    const point3 = getXY(bottomCenter, k2, -baseSideW / 2)

    obj.arrow = [point1, point2, point3]
  }

  drawArrow()

  obj.circles = []

  for (let i = 0; i < nums; i++) {
    const ds = direction ? gapCenter * (i + 1) : -gapCenter * (i + 1)
    const point = getXY([startX, startY], k1, ds)

    obj.circles[i] = {
      x: point[0],
      y: point[1],
      r: r,
      startAngle: 0,
      endAngle: 360
    }
  }

  return {
    aimLine: obj,
    direction: getDirection(endX - startX, endY - startY),
    angle: Math.atan(Math.abs(k1))
  }
}
// 死亡线
function deadLine () {
  const points = []

  points[0] = [enclosure.left.points[1][0], enclosure.left.points[2][1] + 5]

  points[1] = [enclosure.right.points[1][0], enclosure.left.points[2][1] + 8]

  return points
}

function items () {
  const magic_wand = new Image()

  magic_wand.src = '/public/img/magic_wand.png'
  const x = 20
  const y = landslide.begin[1] - 20
  const items = []

  magic_wand.onload = () => {
    items[0] = {
      name: 'remove_one_line',
      text: '消一行',
      img: magic_wand,
      x: x,
      y: y,
      rotate: 90,
      width: 60,
      height: 60,
      nums: 3
    }
  }

  return items
}

const stage = {
  enclosure,
  landslide,
  canvasWidth,
  canvasHeight,
  deadLine: deadLine(),
  items: items(),
  computeAimLine,
  add (name, obj) {
    this[name] = obj
  }
}

export default stage
