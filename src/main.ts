import { Canvas, Rect, InteractiveFabricObject, Circle, Line, FabricObject, FabricImage } from 'fabric'
import { save_file, open_file } from './file_handler'
import { FrameBuffer, drawLine, drawCircle, COLOR_RED, COLOR_BLUE } from './handmade_api'

type PaintTool = 'rect' | 'circ' | 'line' | 'rast-line' | 'rast-circ' |null

const canvasE1 = document.getElementById('canvas') as HTMLCanvasElement
const canvas = new Canvas(canvasE1, {
  perPixelTargetFind: true
})

// another canvas

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
let rast_line_btn = document.getElementById('rast-line-btn') as HTMLButtonElement
let rast_circ_btn = document.getElementById('rast-circ-btn') as HTMLButtonElement

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
rast_circ_btn.addEventListener('click', () => set_drawing_tool('rast-circ'))
rast_line_btn.addEventListener('click', () => set_drawing_tool('rast-line'))

canvas.on('mouse:down', (options) => {
  if (!current_tool) return
  
  is_drawing = true
  const pointer = canvas.getScenePoint(options.e)
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
    case 'rast-line':
      current_shape = new Line([start_x, start_y, start_x, start_y], {
        stroke: '#333',
        strokeWidth: 2,
        strokeDashArray: [5, 5]
      })
      break
    case 'rast-circ':
       current_shape = new Circle({
        left: start_x,
        top: start_y,
        radius: 0,
        fill: 'transparent',
        stroke: '#333', 
        strokeWidth: 2,
        strokeDashArray: [5, 5],
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
    case 'rast-circ':
      const circle = current_shape as Circle
      const radius = Math.sqrt(Math.pow(endX - start_x, 2) + Math.pow(endY - start_y, 2)) / 2
      
      const circleLeft = (start_x + endX) / 2
      const circleTop = (start_y + endY) / 2
      circle.set({ left: circleLeft, top: circleTop, radius: radius, originX: 'center', originY: 'center' })
      break
      
    case 'line':
    case 'rast-line':
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
    if (current_tool == 'rect' || current_tool == 'circ' || current_tool == 'line') {
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
    } else if (current_tool == 'rast-line' || current_tool == 'rast-circ') {
      const shape = current_shape
      shape.setCoords()

      

      const left = shape.left
      const top = shape.top
      const width = shape.width
      const height = shape.height

      const bufferWidth = Math.ceil(width) + 2
      const bufferHeight = Math.ceil(height) + 2
      const offscreenCanvas = document.createElement('canvas')
      offscreenCanvas.width = bufferWidth
      offscreenCanvas.height = bufferHeight
      const offscreenCtx = offscreenCanvas.getContext('2d')!
      const buffer = new FrameBuffer(offscreenCtx, bufferWidth, bufferHeight)
      
      if (current_tool === 'rast-line') {
        const line = shape as Line
        const x1_rel = (line.x1! - left) + 1
        const y1_rel = (line.y1! - top) + 1
        const x2_rel = (line.x2! - left) + 1
        const y2_rel = (line.y2! - top) + 1
        drawLine(buffer, x1_rel, y1_rel, x2_rel, y2_rel, COLOR_RED)
      } else if (current_tool === 'rast-circ') {
        const circle = shape as Circle
        const radius = circle.radius!
        const cx_rel = radius + 1
        const cy_rel = radius + 1
        drawCircle(buffer, cx_rel, cy_rel, radius, COLOR_BLUE)
      }

      canvas.remove(current_shape)
      
      offscreenCtx.putImageData(buffer.imageData, 0, 0)

      const fabricImageInstance = new FabricImage(offscreenCanvas, {
        left: left,
        top: top,
        width: width,
        height: height
      })

      canvas.add(fabricImageInstance)
      canvas.renderAll()
    }
  }

  is_drawing = false
  current_shape = null

  set_drawing_tool(null)
  
  canvas.renderAll()
})

save_btn.addEventListener('click', () => save_file(canvas))
load_btn.addEventListener('click', () => open_file(canvas))
