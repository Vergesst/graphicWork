import { FabricText, Canvas, Rect, InteractiveFabricObject } from 'fabric'
const canvasE1 = document.getElementById('canvas') as HTMLCanvasElement
const canvas = new Canvas(canvasE1)

InteractiveFabricObject.ownDefaults = {
    ...InteractiveFabricObject.ownDefaults,
    cornerStrokeColor: 'blue',
    cornerColor: 'lightblue',
    cornerStyle: 'circle',
    padding: 10,
    transparentCorners: false,
    cornerDashArray: [2, 2],
    borderColor: 'orange',
    borderDashArray: [3, 1, 3],
    borderScaleFactor: 2,
}

const text = new FabricText('Fabric.JS')
const rect = new Rect({ width: 100, height: 100, fill: 'green' })

canvas.add(text, rect)
canvas.centerObject(text)
canvas.setActiveObject(text)

// get html elements
const remove_btn = document.getElementById('remove-btn') as HTMLButtonElement
const color_btn = document.getElementById('color-btn') as HTMLButtonElement
const color_picker = document.getElementById('color-picker') as HTMLInputElement

remove_btn.addEventListener('click', () => {
  // process all selected objects
  const active_objects = canvas.getActiveObjects()

  if (!active_objects || active_objects.length === 0) {
    alert('nothing to remove')
    return
  }

  active_objects.forEach(it => {
    canvas.remove(it)
  })
  canvas.discardActiveObject()

  canvas.renderAll()
})

color_btn.addEventListener('click', () => {
  color_picker.click()
})

color_picker.addEventListener('input', (e) => {
  const new_color = (e.target as HTMLInputElement).value

  const active_objects = canvas.getActiveObjects()
  if (active_objects.length > 0) {
    active_objects.forEach(it => {
      it.set('fill', new_color)
    })
    canvas.renderAll()
  }
})
