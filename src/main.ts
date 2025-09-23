import { FabricText, StaticCanvas } from 'fabric'

FabricText.ownDefaults.fontFamily = 'Lobster'

let otherFonts = new FabricText('Another text', { fontFamily: 'Arial' })

const canvas = new StaticCanvas('canvas')

canvas.add(otherFonts)
canvas.renderAll()
