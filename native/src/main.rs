extern crate clap;

#[cfg(windows)]
extern crate inflections;
#[cfg(windows)]
extern crate itertools;
#[cfg(windows)]
extern crate sysinfo;
#[cfg(windows)]
extern crate winapi;
#[cfg(windows)]
extern crate winreg;

#[cfg(windows)]
mod process_list;
#[cfg(windows)]
mod registry;

use clap::{App, SubCommand};

#[cfg(windows)]
fn main() {
    let matches = App::new("vba-blocks-native")
        .version("0.0.0")
        .subcommand(SubCommand::with_name("get-processes"))
        .subcommand(SubCommand::with_name("add-to-open")
            .args_from_usage("[application] 'Office application name'
                              [filename]    'Add-in filename'"))
        .subcommand(SubCommand::with_name("remove-from-open")
            .args_from_usage("[application] 'Office application name'
                              [filename]    'Add-in filename'"))
        .subcommand(SubCommand::with_name("enable-vbom")
            .args_from_usage("[application] 'Office application name'"))
        .subcommand(SubCommand::with_name("add-to-path")
            .args_from_usage("[path]"))
        .subcommand(SubCommand::with_name("remove-from-path")
            .args_from_usage("[path]"))
        .get_matches();

    if let Some(_) = matches.subcommand_matches("get-processes") {
        process_list::get_processes();
    } else if let Some(matches) = matches.subcommand_matches("add-to-open") {
        let application = matches.value_of("application").expect("application is required");
        let filename = matches.value_of("filename").expect("filename is required");

        registry::add_to_open(application, filename);
    } else if let Some(matches) = matches.subcommand_matches("remove-from-open") {
        let application = matches.value_of("application").expect("application is required");
        let filename = matches.value_of("filename").expect("filename is required");

        registry::remove_from_open(application, filename);
    } else if let Some(matches) = matches.subcommand_matches("enable-vbom") {
        let application = matches.value_of("application").expect("application is required");

        registry::enable_vbom(application);
    } else if let Some(matches) = matches.subcommand_matches("add-to-path") {
        let path = matches.value_of("path").expect("path is required");

        registry::add_to_path(path);
    } else if let Some(matches) = matches.subcommand_matches("remove-from-path") {
        let path = matches.value_of("path").expect("path is required");

        registry::remove_from_path(path);
    }
}

#[cfg(not(windows))]
fn main() {
    panic!("Not supported on this platform.");
}
