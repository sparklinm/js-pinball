import { getXY, getDirection } from '../util'

export default class Render {
  constructor (canvas) {
    this.canvas = canvas
    this.ctx = this.canvas.getContext('2d')
    this.width = canvas.width
    this.height = canvas.height
    this.background()
  }

  background () {
    this.ctx.fillStyle = '#000'
    this.ctx.fillRect(0, 0, this.width, this.height)
  }

  enclosure (enclosure) {
    this.enclosure = enclosure
    const { points: leftPoints } = enclosure.left
    const { points: rightPoints } = enclosure.right

    this.ctx.lineWidth = 4
    this.ctx.strokeStyle = '#565656'
    this.ctx.beginPath()
    this.lines(this.ctx, leftPoints)
    this.ctx.stroke()
    this.ctx.beginPath()
    this.lines(this.ctx, rightPoints)
    this.ctx.stroke()
  }

  landslide (landslide) {
    this.landslide = landslide
    const { begin, cp1, cp2, end } = landslide

    this.ctx.lineWidth = 4
    this.ctx.fillStyle = landslide.fillColor
    this.ctx.beginPath()
    this.ctx.moveTo(...begin)
    this.ctx.bezierCurveTo(...cp1, ...cp2, ...end)
    this.ctx.stroke()

    this.ctx.strokeStyle = '#565656'
    this.ctx.lineTo(this.width, this.height)
    this.ctx.lineTo(0, this.height)
    this.ctx.fill()
  }

  brick (attrs) {
    this.polygon(this.ctx, {
      x: attrs.x,
      y: attrs.y,
      r: attrs.size,
      num: attrs.sides,
      fillStyle: attrs.color
    })
    this.ctx.font = '600 16px -apple-system, BlinkMacSystemFont, "Roboto", "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"'
    this.ctx.fillStyle = '#000'
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'middle'
    this.ctx.fillText(attrs.weight, attrs.x, attrs.y)
  }

  ball (attrs) {
    this.arc(this.ctx, {
      x: attrs.x,
      y: attrs.y,
      r: attrs.size,
      startAngle: 0,
      endAngle: 360,
      color: attrs.color
    })
  }

  aimLine (mouse) {
    const startX = this.width / 2
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

    const drawArrow = () => {
      const arrowH = 25
      const arrowGap = 15
      const ds1 = direction ? (arrowH + arrowGap) : -(arrowH + arrowGap)
      const point1 = getXY([startX, startY], k1, ds1)
      const ds2 = direction ? arrowGap : -arrowGap
      const bottomCenter = getXY([startX, startY], k1, ds2)
      const k2 = -1 / k1
      const baseSideW = 12
      const point2 = getXY(bottomCenter, k2, baseSideW / 2)
      const point3 = getXY(bottomCenter, k2, -baseSideW / 2)

      this.triangle(this.ctx, {
        point1,
        point2,
        point3
      })
    }

    drawArrow()

    for (let i = 0; i < nums; i++) {
      const ds = direction ? gapCenter * (i + 1) : -gapCenter * (i + 1)
      const point = getXY([startX, startY], k1, ds)

      this.arc(this.ctx, {
        x: point[0],
        y: point[1],
        r: r,
        startAngle: 0,
        endAngle: 360
      })
    }

    return {
      direction: getDirection(endX - startX, endY - startY),
      angle: Math.atan(Math.abs(k1))
    }
  }

  lines (ctx, points) {
    points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(...point)
      } else {
        this.ctx.lineTo(...point)
      }
    })
  }

  triangle (ctx, { point1, point2, point3, color = '#fff', type = 'fill' })
  {
    ctx.beginPath()
    ctx.moveTo(...point1)
    ctx.lineTo(...point2)
    ctx.lineTo(...point3)
    ctx[type + 'Style'] = color
    ctx.closePath()
    ctx[type]()
  }

  arc (ctx, { x, y, r, startAngle, endAngle, color = '#fff', type = 'fill' }) {
    const unit = Math.PI / 180

    ctx.beginPath()
    ctx.arc(x, y, r, startAngle * unit, endAngle * unit)
    ctx[type + 'Style'] = color
    ctx.closePath()
    ctx[type]()
  }

  polygon (ctx, conf) {
    const x = (conf && conf.x) || 0 // 中心点x坐标
    const y = (conf && conf.y) || 0 // 中心点y坐标
    const num = (conf && conf.num) || 3 // 图形边的个数
    const r = (conf && conf.r) || 100 // 图形的半径
    const width = (conf && conf.width) || 5
    const strokeStyle = conf && conf.strokeStyle
    const fillStyle = conf && conf.fillStyle
    const points = [[]]

    // 开始路径
    ctx.beginPath()
    const startX = x + r * Math.cos((2 * Math.PI * 0) / num)
    const startY = y + r * Math.sin((2 * Math.PI * 0) / num)

    points[0][0] = startX
    points[0][1] = startY

    ctx.moveTo(startX, startY)
    for (let i = 1; i <= num; i++) {
      const newX = x + r * Math.cos((2 * Math.PI * i) / num)
      const newY = y + r * Math.sin((2 * Math.PI * i) / num)

      points[i] = []
      points[i][0] = newX
      points[i][1] = newY
      ctx.lineTo(newX, newY)
    }
    ctx.closePath()
    // 路径闭合
    if (strokeStyle) {
      ctx.strokeStyle = strokeStyle
      ctx.lineWidth = width
      ctx.lineJoin = 'round'
      ctx.stroke()
    }
    if (fillStyle) {
      ctx.fillStyle = fillStyle
      ctx.fill()
    }

    return points
  }
}
