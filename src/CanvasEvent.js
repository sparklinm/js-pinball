export default class CanvasEvent {
  constructor (el) {
    this.el = el
    this.el.addEventListener('mousedown', this._mousedown.bind(this))
    this.el.addEventListener('mousemove', this._mousemove.bind(this))
    this.el.addEventListener('mouseup', this._mouseup.bind(this))
    const rect = this.el.getBoundingClientRect()

    this.x = rect.left
    this.y = rect.top
  }

  aim (cb) {
    this.mousemoveCB = cb
  }

  shot (cb) {
    this.mouseupCB = cb
  }

  _mousedown () {
    this.down = true
  }

  _mousemove (e) {
    if (this.down) {
      const positions = {
        x: e.offsetX,
        y: e.offsetY
      }

      this.mousemoveCB(positions)
    }
  }

  _mouseup (e) {
    this.down = false
    const positions = {
      x: e.offsetX,
      y: e.offsetY
    }

    this.mouseupCB(positions)
  }
}