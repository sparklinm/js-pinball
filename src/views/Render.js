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

    this.lines(this.ctx, leftPoints, {
      lineWidth: 4,
      strokeStyle: '#565656'
    })
    this.lines(this.ctx, rightPoints, {
      lineWidth: 4,
      strokeStyle: '#565656'
    })
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
    if (attrs.type === 'bigger_ball') {
      this.ctx.save()

      const angle = attrs.rotate * Math.PI / 180

      this.ctx.translate(attrs.x, attrs.y)
      this.ctx.rotate(angle)
      this.ctx.scale(attrs.scale, attrs.scale)
      this.ctx.globalAlpha = attrs.alpha
      this.ctx.drawImage(
        attrs.img,
        - attrs.width / 2,
        - attrs.height / 2,
        attrs.width,
        attrs.height
      )

      this.ctx.restore()
      return
    }
    this.polygon(this.ctx, {
      x: attrs.x,
      y: attrs.y,
      r: attrs.size,
      num: attrs.sides,
      fillStyle: attrs.color,
      rotate: attrs.rotate,
      scale: attrs.scale,
      alpha: attrs.alpha
    })
    this.ctx.font =
      '600 16px -apple-system, BlinkMacSystemFont, "Roboto", "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"'
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

  aimLine (obj) {
    if (!obj) {
      return
    }
    this.triangle(this.ctx, {
      point1: obj.arrow[0],
      point2: obj.arrow[1],
      point3: obj.arrow[2]
    })

    for (let i = 0; i < obj.circles.length; i++) {
      this.arc(this.ctx, {
        ...obj.circles[i]
      })
    }
  }

  deadLine (deadLine) {
    this.ctx.save()
    this.ctx.setLineDash([5, 5])
    this.lines(this.ctx, deadLine, {
      lineWidth: 1,
      strokeStyle: '#565656'
    })
    this.ctx.restore()
  }

  gameOver (score) {
    this.ctx.fillStyle = 'RGBA(0, 0, 0, 0.8)'
    this.ctx.fillRect(0, 0, this.width, this.height)
    this.text('本次得分', {
      x: this.width / 2,
      y: 100,
      fontSize: '16px'
    })
    this.text(score, {
      x: this.width / 2,
      y: 150,
      fontSize: '40px',
      fontWeight: 600
    })
  }

  items (items) {
    items.forEach((item) => {
      this.ctx.drawImage(item.img, item.x, item.y, item.width, item.height)
      this.text(item.text, {
        x: item.x + item.width / 2,
        y: item.y + item.height + 15,
        color: '#ffff00',
        strokeStyle: '#B46E1C',
        fontSize: '18px'
      })

      const circle = {
        startAngle: 0,
        endAngle: 360,
        color: '#F04028',
        x: item.x + item.width,
        y: item.y + 10,
        radiusX: 14,
        radiusY: 14,
        rotation: 0
      }

      this.ellipse(this.ctx, circle)
      this.text(item.nums, {
        x: circle.x,
        y: circle.y,
        color: '#fff',
        fontSize: '16px'
      })
    })
  }

  text (text, conf = {}) {
    this.ctx.save()
    this.ctx.font = `${conf.fontWeight || '500'} ${
      conf.fontSize || '16px'
    } -apple-system, BlinkMacSystemFont, "Roboto", "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'middle'
    this.ctx.lineWidth = 4
    if (conf.strokeStyle) {
      this.ctx.strokeStyle = conf.strokeStyle
      this.ctx.strokeText(text, conf.x, conf.y)
    }
    this.ctx.fillStyle = conf.color || '#fff'
    this.ctx.fillText(text, conf.x, conf.y)
    this.ctx.restore()
    // 登录状态下不会出现这行文字，点击页面右上角一键登录()
  }

  lines (ctx, points, conf = {}) {
    Object.assign(ctx, conf)
    ctx.beginPath()
    points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(...point)
      } else {
        ctx.lineTo(...point)
      }
    })
    ctx.stroke()
  }

  triangle (ctx, { point1, point2, point3, color = '#fff', type = 'fill' }) {
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

  ellipse (ctx, options = {}) {
    const unit = Math.PI / 180

    const conf = Object.assign(
      {
        color: '#fff',
        type: 'fill'
      },
      options
    )

    ctx.beginPath()
    ctx.ellipse(
      conf.x,
      conf.y,
      conf.radiusX,
      conf.radiusY,
      conf.rotation * unit,
      conf.startAngle * unit,
      conf.endAngle * unit
    )
    ctx[conf.type + 'Style'] = conf.color
    ctx.closePath()
    ctx[conf.type]()
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

    ctx.save()
    ctx.translate(x, y)
    if (conf.rotate) {
      ctx.rotate(conf.rotate)
    }
    if (conf.alpha !== undefined) {
      ctx.globalAlpha = conf.alpha
    }
    if (conf.scale) {
      ctx.scale(conf.scale, conf.scale)
    }

    // 开始路径
    ctx.beginPath()
    const startX = r * Math.cos((2 * Math.PI * 0) / num)
    const startY = r * Math.sin((2 * Math.PI * 0) / num)

    points[0][0] = startX
    points[0][1] = startY

    ctx.moveTo(startX, startY)
    for (let i = 1; i <= num; i++) {
      const newX = r * Math.cos((2 * Math.PI * i) / num)
      const newY = r * Math.sin((2 * Math.PI * i) / num)

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

    ctx.restore()

    return points
  }
}
