function load (resource) {
  promises.push(
    new Promise((resolve) => {
      resource.onload = () => {
        resolve()
      }
    })
  )
}

const promises = []
const magic_wand = new Image()
const bigger_ball = new Image()

magic_wand.src = '/img/magic_wand.svg'
bigger_ball.src = '/img/bigger_ball.png'
load(magic_wand)
load(bigger_ball)

Promise.all(promises).then(() => {
  document.querySelector('.cm-enter-loading').style.display = 'none'
})

export default {
  magic_wand,
  bigger_ball
}
