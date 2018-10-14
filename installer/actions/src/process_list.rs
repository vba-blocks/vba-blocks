use sysinfo::{ProcessExt, System, SystemExt};

pub fn get_processes() {
    let mut system = System::new();
    system.refresh_processes();

    for (_, process) in system.get_process_list() {
        let name = process.name().to_string();
        if name != "" {
            println!("{}", name)
        }
    }
}
