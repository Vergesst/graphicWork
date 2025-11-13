export type RGBAColor = {
  r: number,
  g: number,
  b: number, 
  a: number
}

export const COLOR_RED: RGBAColor = { r: 255, g: 0, b: 0, a: 255 }
export const COLOR_BLUE: RGBAColor = { r: 0, g: 0, b: 255, a: 255 }
export const COLOR_GREEN: RGBAColor = { r: 0, g: 255, b: 0, a: 255 }

export class FrameBuffer {
  public readonly width: number
  public readonly height: number
  private pixelData: Uint8ClampedArray
  public imageData: ImageData

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.width = width
    this.height = height
    this.imageData = ctx.createImageData(width, height)
    this.pixelData = this.imageData.data
  }

  public setPixel(x: number, y: number, color: RGBAColor): void {
        const ix = Math.round(x)
        const iy = Math.round(y)

        if (ix < 0 || ix >= this.width || iy < 0 || iy >= this.height) {
            return
        }

        const index = (iy * this.width + ix) * 4
        this.pixelData[index]     = color.r
        this.pixelData[index + 1] = color.g
        this.pixelData[index + 2] = color.b
        this.pixelData[index + 3] = color.a
    }

    public clear(): void {
        this.pixelData.fill(0)
    }
}

export function drawLine(
  buffer: FrameBuffer,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  color: RGBAColor
) {
  x0 = Math.round(x0)
  y0 = Math.round(y0)
  x1 = Math.round(x1)
  y1 = Math.round(y1)

  const dx = Math.abs(x1 - x0)
  const dy = Math.abs(y1 - y0)
  const sx = (x0 < x1) ? 1 : -1
  const sy = (y0 < y1) ? 1 : -1
  let err = dx - dy

  while (true) {
    buffer.setPixel(x0, y0, color)
    if (x0 === x1 && y0 === y1) break
    const e2 = 2 * err
    if (e2 > -dy) {
      err -= dy
      x0 += sx
    }
    if (e2 < dx) {
      err += dx
      y0 += sy
    }
  }
}

export function drawCircle(
    buffer: FrameBuffer, 
    centerX: number, centerY: number, 
    radius: number, 
    color: RGBAColor
) {
    let x = Math.round(radius)
    let y = 0
    let err = 0
    const cx = Math.round(centerX)
    const cy = Math.round(centerY)

    while (x >= y) {
        buffer.setPixel(cx + x, cy + y, color)
        buffer.setPixel(cx + y, cy + x, color)
        buffer.setPixel(cx - y, cy + x, color)
        buffer.setPixel(cx - x, cy + y, color)
        buffer.setPixel(cx - x, cy - y, color)
        buffer.setPixel(cx - y, cy - x, color)
        buffer.setPixel(cx + y, cy - x, color)
        buffer.setPixel(cx + x, cy - y, color)

        if (err <= 0) {
          y += 1
          err += 2 * y + 1
        }
        if (err > 0) {
          x -= 1
          err -= 2 * x + 1
        }
    }
}
