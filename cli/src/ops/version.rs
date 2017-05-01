use errors::*;

pub fn version(version: &str) -> Result<()> {
    println!("version {}", version);
    Ok(())
}
