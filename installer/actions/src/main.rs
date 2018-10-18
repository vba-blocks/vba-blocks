extern crate dirs;
extern crate itertools;
extern crate symlink;
extern crate winapi;
extern crate winreg;

mod registry;

use std::env;
use std::fs::{remove_file, read_link, OpenOptions};
use std::io::Write;
use std::panic;
use std::path::Path;
use symlink::symlink_file;

fn main() {
    let result = panic::catch_unwind(|| {
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
    });

    if let Err(cause) = result {
        let message = if let Some(e) = cause.downcast_ref::<&'static str>() {
            format!("Installation failed: {}", e)
        } else {
            "Installation failed with an unknown error".to_string()
        };
        eprintln!("{}", message);

        let mut path = env::temp_dir();
        path.push("vba-blocks.log");

        let mut log = OpenOptions::new()
            .create(true)
            .append(true)
            .open(&path);

        if let Err(e) = log {
            eprintln!("Log failed: {:?}", e);
            return;
        }

        if let Err(e) = writeln!(log.unwrap(), "{}", message) {
            eprintln!("Write log failed: {:?}", e);
            return;
        } else {
            eprintln!("Log written to {:?}", path);
        }
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
