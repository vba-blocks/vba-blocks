extern crate dirs;
extern crate itertools;
extern crate symlink;
extern crate winapi;
extern crate winreg;

mod registry;

use std::path::Path;
use std::fs::{remove_file, read_link};
use std::env;
use symlink::symlink_file;

fn main() {
    let args: Vec<String> = env::args().collect();
    let addins_dir = Path::new(&dirs::home_dir().expect("Couldn't find homedir"))
        .join("AppData").join("Roaming").join("Microsoft").join("Addins");

    if args[1] == "--install" {
        let install_dir = Path::new(&args[2]);

        // Excel
        ensure_file_symlink(
            install_dir.join("addins").join("vba-blocks.xlam").as_path(),
            addins_dir.join("vba-blocks.xlam").as_path()
        );
        registry::add_to_open("Excel", "vba-blocks.xlam");
        registry::enable_vbom("Excel");
    } else {
        registry::remove_from_open("Excel", "vba-blocks.xlam");
        remove_symlink(addins_dir.join("vba-blocks.xlam").as_path());
    }
}

fn ensure_file_symlink(target: &Path, path: &Path) {
    remove_symlink(path);
    symlink_file(target, path).expect("Failed to create symlink to add-in");
}

fn remove_symlink(path: &Path) {
    println!("Path exists? {:?} {}", path, path.exists());
    if path.exists() || symlink_exists(path) {
        remove_file(path).expect("Failed to remove symlink to add-in");
    }
}

fn symlink_exists(path: &Path) -> bool {
    match read_link(path) {
        Ok(_) => true,
        Err(_) => false
    }
}
