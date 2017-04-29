pub fn init(name: Option<&str>) {
    let name_value = name.unwrap_or("(no name)");

    println!("init, name: {}", name_value);
}
