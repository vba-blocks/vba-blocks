use errors::*;

pub fn remove(blocks: Vec<&str>) -> Result<()> {
    println!("remove {}", blocks.join(" "));

    Ok(())
}
