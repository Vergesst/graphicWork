// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{ipc::Response, AppHandle};
use tauri_plugin_dialog::DialogExt;

#[tauri::command]
fn choose_and_read_file(app: AppHandle) -> Response {
    let file_path = app.dialog().file().blocking_pick_file().unwrap();
    let path_buf = file_path.as_path().unwrap().to_path_buf();
    let data = std::fs::read(path_buf).unwrap();
    tauri::ipc::Response::new(data)
}

// #[tauri::command]
// fn save_file(app: AppHandle) -> 

fn main() {
    graphic_lib::run();
}
