use errors::*;

pub fn init(name: Option<&str>) -> Result<()> {
    let name_value = name.unwrap_or("(no name)");

    println!("init, name: {}", name_value);

    Ok(())
}
