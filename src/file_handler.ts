import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { open, save } from "@tauri-apps/plugin-dialog";
import { Canvas } from "fabric";

/**
 * If find error about writing --- find [default.json](src-tauri/capabilities/default.json)
 * @param canvas --- where you are currently painting
 */
async function save_file(canvas: Canvas) { 
  try {
    const json_string = JSON.stringify(canvas.toJSON(), null, 2)

    const file_path = await save({
      title: 'Save Canvas',
      filters: [{
        name: 'JSON Files',
        extensions: ['json']
      }]
    })

    if (file_path) {
      await writeTextFile(file_path, json_string)
      // console.log --- optional
    } else {
      console.log('Cancelled')
    }
  } catch (err) {
    // a dialog maybe better
    console.error(err)
  }
}

/**
 * 
 * @param canvas --- the main canvas
 */
async function open_file(canvas: Canvas) {
  try {
    const selected_path = await open({
      title: "Reading the Canvas",
      multiple: false,
      filters: [{
        name: 'JSON File',
        extensions: ['json']
      }]
    })

    if (selected_path && typeof selected_path === 'string') {
      const json_string = await readTextFile(selected_path)

      canvas.loadFromJSON(json_string, () => {
        canvas.renderAll()
        // console.log --- optional
      })
    } else {
      console.log('cancelled')
    }
  } catch (err) {
    console.error(err)
  }
}

export {
  open_file,
  save_file
}
