export default class CanvasEvent {
  constructor (el) {
    this.el = el
    this.el.addEventListener('mousedown', this._mousedown.bind(this))
    this.el.addEventListener('mousemove', this._mousemove.bind(this))
    this.el.addEventListener('mouseup', this._mouseup.bind(this))
    this.el.addEventListener('click', this._mouseup.bind(this))
    const rect = this.el.getBoundingClientRect()

    this.x = rect.left
    this.y = rect.top
  }

  aim (cb) {
    this.mousemoveCB = cb
  }

  shoot (cb) {
    this.mouseupCB = cb
  }

  _mousedown () {
    this.down = true
  }

  _mousemove (e) {
    if (this.down) {
      this.move = true
      const positions = {
        x: e.offsetX,
        y: e.offsetY
      }

      this.mousemoveCB(positions)
    }
  }

  _mouseup (e) {
    this.down = false
    if (this.move) {
      const positions = {
        x: e.offsetX,
        y: e.offsetY
      }

      this.mouseupCB(positions)
    }
    this.move = false
  }
}