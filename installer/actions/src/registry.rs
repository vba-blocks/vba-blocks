use itertools::Itertools;
use std::path::Path;
use winreg::enums::*;
use winreg::transaction::Transaction;
use winreg::RegKey;

pub fn add_to_open(application: &str, filename: &str) {
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
    let security = open_application_key(&application)
        .expect("Could not find Office application in registry")
        .open_subkey_with_flags("Security", KEY_ALL_ACCESS)
        .expect("Count not find/open Security");

    println!("Setting {}\\Security: AccessVBOM = 1", application);
    security
        .set_value("AccessVBOM", &1u32)
        .expect("Could not set AccessVBOM");
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
    // TODO registry keys are set on HKCU, which is probably
    // unexpected/incompatible with msi install for all users (likely HKLM is expected)
    //
    // BUT this is where Microsoft looks for OPEN and VBOM
    //
    // -> Look into setting HKCU with WiX
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
