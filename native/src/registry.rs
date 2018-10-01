use inflections::Inflect;
use itertools::Itertools;
use std::ffi::CString;
use std::io;
use std::path::Path;
use winapi::shared::basetsd::PDWORD_PTR;
use winapi::shared::minwindef::{DWORD, LPARAM, PDWORD, UINT, WPARAM};
use winapi::um::winuser::{
    SendMessageTimeoutA, HWND_BROADCAST, SMTO_ABORTIFHUNG, WM_SETTINGCHANGE,
};
use winreg::enums::*;
use winreg::transaction::Transaction;
use winreg::RegKey;

pub fn add_to_open(application: &str, filename: &str) {
    let application = application.to_title_case();

    let options = open_application_key(&application)
        .expect("Could not find Office application in registry")
        .open_subkey_with_flags("Options", KEY_ALL_ACCESS)
        .expect("Could not find/open Options");

    let open = options
        .enum_values()
        .map(|x| x.unwrap())
        .filter(|(key, _)| key.starts_with("OPEN"));

    let mut index = 0;
    for (name, _) in open {
        let value: String = options
            .get_value(&name)
            .expect("Could not get OPEN value");

        if value == get_reg_string(&filename) {
            println!("Existing OPEN value found: {} = {}", name, value);
            return;
        }
        index += 1;
    }

    let name = get_open_key(index);
    let value = get_reg_string(&filename);

    println!("Adding {} = {} to {}\\Options", name, value, application);
    options
        .set_value(name, &value)
        .expect("Failed to set OPEN value");
}

pub fn remove_from_open(application: &str, filename: &str) {
    let application = application.to_title_case();
    let t = Transaction::new().expect("Failed to start transaction");

    let options = open_application_key(&application)
        .expect("Could not find Office application in registry")
        .open_subkey_transacted_with_flags("Options", &t, KEY_ALL_ACCESS)
        .expect("Count not find/open Options");

    let open = options
        .enum_values()
        .map(|x| x.unwrap())
        .filter(|(key, _)| key.starts_with("OPEN"))
        .sorted_by_key(|(key, _)| get_index(&key));

    let mut index = 0;
    let mut found = false;
    for (name, _) in open {
        let value: String = options
            .get_value(&name)
            .expect("Could not get OPEN value");

        if found {
            let shifted = get_open_key(index);

            println!("Shifting {} -> {}", name, shifted);
            options
                .set_value(shifted, &value)
                .expect("Could not shift OPEN value");
            options
                .delete_value(name)
                .expect("Could not shift OPEN value");

            index += 1;
        } else if value == get_reg_string(&filename) {
            println!("Deleting {} = {}", name, value);
            options
                .delete_value(name)
                .expect("Could not remove OPEN value");
            found = true;
        } else {
            index += 1;
        }
    }

    t.commit()
        .expect("Failed to complete remove transaction");
}

pub fn enable_vbom(application: &str) {
    let application = application.to_title_case();

    let security = open_application_key(&application)
        .expect("Could not find Office application in registry")
        .open_subkey_with_flags("Security", KEY_ALL_ACCESS)
        .expect("Count not find/open Security");

    println!("Setting {}\\Security: AccessVBOM = 1", application);
    security
        .set_value("AccessVBOM", &1u32)
        .expect("Could not set AccessVBOM");
}

pub fn add_to_path(path: &str) {
    let environment = RegKey::predef(HKEY_CURRENT_USER)
        .open_subkey_with_flags("Environment", KEY_ALL_ACCESS)
        .expect("Count not open Environment");

    let path_value: String = environment
        .get_value("Path")
        .expect("Could not get Path from registry");

    let mut values: Vec<&str> = path_value
        .split(";")
        .filter(|value| value.len() > 0)
        .collect();

    for value in values.iter() {
        if &path == value {
            println!("Existing value in PATH: {}", value);
            return;
        }
    }

    values.push(&path);
    let result = values.join(";");

    println!("Adding \"{}\" to PATH = {}", path, result);
    environment
        .set_value("Path", &result)
        .expect("Could not set Path in registry");

    broadcast_environment_change().expect("Failed to notify environment");
}

pub fn remove_from_path(path: &str) {
    let environment = RegKey::predef(HKEY_CURRENT_USER)
        .open_subkey_with_flags("Environment", KEY_ALL_ACCESS)
        .expect("Could not open Environment");

    let path_value: String = environment
        .get_value("Path")
        .expect("Could not get Path from registry");

    let values: Vec<&str> = path_value
        .split(";")
        .filter(|value| value.len() > 0)
        .collect();

    let existing = values.len();
    let filtered: Vec<String> = values
        .iter()
        .map(|value| value.to_string())
        .filter(|value| &path != value)
        .collect();

    if filtered.len() == existing {
        println!("\"{}\" not found in PATH", path);
        return;
    }

    println!("Removed \"{}\" from PATH = {}", path, filtered.join(";"));
    environment
        .set_value("Path", &(filtered.join(";")))
        .expect("Failed to remove value from Path");
    broadcast_environment_change().expect("Failed to notify environment");
}

fn broadcast_environment_change() -> Result<(), io::Error> {
    match unsafe {
        let result: DWORD = 0;

        SendMessageTimeoutA(
            HWND_BROADCAST,
            WM_SETTINGCHANGE,
            0 as WPARAM,
            CString::new("Environment").unwrap().as_ptr() as LPARAM,
            SMTO_ABORTIFHUNG,
            5000 as UINT,
            (result as PDWORD) as PDWORD_PTR,
        );
        result
    } {
        0 => Ok(()),
        err => Err(io::Error::from_raw_os_error(err as i32)),
    }
}

fn get_index(name: &str) -> i32 {
    name.replace("OPEN", "").parse::<i32>().unwrap_or(0)
}

fn get_open_key(index: i32) -> String {
    if index > 0 {
        format!("OPEN{}", index)
    } else {
        "OPEN".to_string()
    }
}

fn get_reg_string(value: &str) -> String {
    format!("\"{}\"", value)
}

fn open_application_key(application: &str) -> Result<RegKey, &'static str> {
    let office = RegKey::predef(HKEY_CURRENT_USER)
        .open_subkey("Software\\Microsoft\\Office")
        .or_else(|_| Err("Failed to find Office in registry"))?;

    let latest = office
        .enum_keys()
        .map(|key| key.unwrap())
        .max_by(|a, b| {
            let a_value = a.parse::<f32>().unwrap_or(0.0);
            let b_value = b.parse::<f32>().unwrap_or(0.0);

            a_value.partial_cmp(&b_value).unwrap()
        })
        .ok_or("Failed to find latest Office version")?;

    let path = Path::new(&latest).join(application);

    office
        .open_subkey(&path)
        .or_else(|_| Err("Failed to find application key registry"))
}
