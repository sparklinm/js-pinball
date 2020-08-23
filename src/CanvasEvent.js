export default class CanvasEvent {
  constructor (el) {
    this.el = el
    this.el.addEventListener('mousedown', this._mousedown.bind(this))
    this.el.addEventListener('mousemove', this._mousemove.bind(this))
    this.el.addEventListener('mouseup', this._mouseup.bind(this))
    this.el.addEventListener('click', this._mouseup.bind(this))

  }

  aim (cb) {
    this.mousemoveCB = cb
  }

  shoot (cb) {
    this.mouseupCB = cb
  }

  _mousedown (e) {
    this.down = true
    this.start = {
      x: e.offsetX,
      y: e.offsetY
    }
  }

  _mousemove (e) {
    if (this.down) {
      const position = {
        x: e.offsetX,
        y: e.offsetY
      }

      const d = Math.abs(position.x - this.start.x) + Math.abs(position.y - this.start.y)

      if (d > 10) {
        this.mousemoveCB(position)
        this.move = true
      }
    }
  }

  _mouseup (e) {
    this.down = false
    if (this.move) {
      const position = {
        x: e.offsetX,
        y: e.offsetY
      }

      this.mouseupCB(position)
    }
    this.move = false
  }
}