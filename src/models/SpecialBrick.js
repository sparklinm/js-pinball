import resources from '../resources'


export default class SpecialBrick {
  constructor (config) {
    Object.assign(this, config)

    if (this.type === 'bigger_ball') {
      this.biggerBall()
    }

    // none breaking breaked
    this.status = 'none'
  }

  biggerBall () {
    this.img = resources.bigger_ball
    this.rotate = 0
    this.scale = 1
    this.alpha = 1
    this.width = this.r * 2
    this.height = this.r * 2
    this._scaleDirection = 1
    this.biggerBallAni()
  }

  biggerBallAni () {
    const timer = setInterval(() => {
      this.rotate += 3

      if (this.scale >= 1.1) {
        this._scaleDirection = -1
      } else if (this.scale <= 1) {
        this._scaleDirection = 1
      }

      if (this._scaleDirection === 1) {
        this.scale += 0.002
      } else {
        this.scale -= 0.002
      }
    }, 16)
  }

  breaking () {
    return new Promise(resolve => {
      this.status = 'breaking'
      const durtion = 500
      const piece = 16 / durtion * 1
      const timer = setInterval(() => {
        this.alpha -= piece

        if (this.alpha <= 0) {
          clearInterval(timer)
          this.status = 'breaked'
          resolve()
        }
      }, 16)
    })

  }
}