import * as util from './util'

const canvasWidth = 450
const canvasHeight = 800



// 左右围栏
const enclosure = () => {
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
      expression: util.getPointsExpression(leftPoints),
      width,
      frictionFactor: 0.2
    },
    right: {
      points: rightPoints,
      expression: util.getPointsExpression(rightPoints),
      width,
      frictionFactor: 0.2
    }
  }
}

// 下方滑坡
const landslide = () => {
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
    points: util.calculatePointsForBezierCurve(
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
}

export default {
  enclosure: enclosure(),
  landslide: landslide(),
  canvasWidth,
  canvasHeight
}
