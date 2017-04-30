use std::process::{Command};
use std::path::{PathBuf};
use std::env;

pub fn process() -> Command {
    Command::new(vbablocks_exe())
}

pub fn vbablocks_dir() -> PathBuf {
    env::current_exe().ok().map(|mut path| {
        path.pop();
        if path.ends_with("deps") {
            path.pop();
        }
        path
    }).expect("Cannot determine vba-blocks directory, exiting test")
}

pub fn vbablocks_exe() -> PathBuf {
    vbablocks_dir().join(format!("vba-blocks{}", env::consts::EXE_SUFFIX))
}
