import { Canvas, Rect, InteractiveFabricObject, Circle, Line, FabricObject } from 'fabric'
import { save_file, open_file } from './file_handler'

type PaintTool = 'rect' | 'circ' | 'line' | null

const canvasE1 = document.getElementById('canvas') as HTMLCanvasElement
const canvas = new Canvas(canvasE1, {
  perPixelTargetFind: true
})

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

// const text = new FabricText('JS')
// const rect = new Rect({ width: 100, height: 100, fill: 'green' })

// canvas.add(text, rect)
// canvas.centerObject(text)
// canvas.setActiveObject(text)

let current_tool: PaintTool = null
let is_drawing = false
let start_x = 0
let start_y = 0
let current_shape: FabricObject | null = null

// get html elements
const save_btn = document.getElementById('save-btn') as HTMLButtonElement
const load_btn = document.getElementById('load-btn') as HTMLButtonElement
const remove_btn = document.getElementById('remove-btn') as HTMLButtonElement
const color_btn = document.getElementById('color-btn') as HTMLButtonElement
const color_picker = document.getElementById('color-picker') as HTMLInputElement

// painter tools
let rect_btn = document.getElementById('draw-rect-btn') as HTMLButtonElement
let circ_btn = document.getElementById('draw-circ-btn') as HTMLButtonElement
let line_btn = document.getElementById('draw-line-btn') as HTMLButtonElement

function set_drawing_tool(tool: PaintTool) {
  current_tool = tool
  if (tool) {
    canvas.selection = false
    canvas.defaultCursor = 'crosshair'
  } else {
    canvas.selection = true
    canvas.defaultCursor = 'default'
  }
}

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

rect_btn.addEventListener('click', () => set_drawing_tool('rect'))
circ_btn.addEventListener('click', () => set_drawing_tool('circ'))
line_btn.addEventListener('click', () => set_drawing_tool('line'))

canvas.on('mouse:down', (options) => {
  if (!current_tool) return
  
  is_drawing = true
  const pointer = canvas.getPointer(options.e)
  start_x = pointer.x
  start_y = pointer.y

  // create shapes
  switch (current_tool) {
    case 'rect':
      current_shape = new Rect({
        left: start_x,
        top: start_y,
        width: 0,
        height: 0,
        fill: 'transparent',
        stroke: '#333',
        strokeWidth: 2,
      })
      break
    case 'circ':
      current_shape = new Circle({
        left: start_x,
        top: start_y,
        radius: 0,
        fill: 'transparent',
        stroke: '#333',
        strokeWidth: 2,
      })
      break
    case 'line':
      // start and end
      current_shape = new Line([start_x, start_y, start_x, start_y], {
        stroke: '#333',
        strokeWidth: 2,
      })
      break
  }
  
  if (current_shape) {
    canvas.add(current_shape)
  }
})

// movement of mouse
canvas.on('mouse:move', (options) => {
  if (!is_drawing || !current_shape) return
  
  const pointer = canvas.getPointer(options.e)
  const endX = pointer.x
  const endY = pointer.y

  switch (current_tool) {
    case 'rect':
      const rect = current_shape as Rect
      const left = Math.min(start_x, endX)
      const top = Math.min(start_y, endY)
      const width = Math.abs(start_x - endX)
      const height = Math.abs(start_y - endY)
      rect.set({ left, top, width, height })
      break
    
    case 'circ':
      const circle = current_shape as Circle
      const radius = Math.sqrt(Math.pow(endX - start_x, 2) + Math.pow(endY - start_y, 2)) / 2
      
      const circleLeft = (start_x + endX) / 2
      const circleTop = (start_y + endY) / 2
      circle.set({ left: circleLeft, top: circleTop, radius: radius, originX: 'center', originY: 'center' })
      break
      
    case 'line':
      const line = current_shape as Line
      line.set({ x2: endX, y2: endY })
      break
  }
  
  canvas.renderAll()
})

// end of mouse event
canvas.on('mouse:up', () => {
  if (!is_drawing) return
  
  if (current_shape) {
    current_shape.set({
      fill: 'rgba(100, 200, 255, 0.7)', 
      stroke: 'blue',
    })
    if (
        (current_shape.type === 'rect' && (current_shape.width < 5 || current_shape.height < 5)) ||
        (current_shape.type === 'circle' && (current_shape as Circle).radius < 3)
    ) {
        canvas.remove(current_shape)
    }
  }

  is_drawing = false
  current_shape = null

  set_drawing_tool(null)
  
  canvas.renderAll()
})

save_btn.addEventListener('click', () => save_file(canvas))
load_btn.addEventListener('click', () => open_file(canvas))