// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// #[tauri::command]
// fn save_file(app: AppHandle) -> 

fn main() {
    graphic_lib::run();
}
