use errors::*;

pub fn update(blocks: Option<Vec<&str>>) -> Result<()> {
    let blocks_value = match blocks {
        Some(blocks) => blocks.join(" "),
        None => "(all blocks)".to_string(),
    };

    println!("update {}", blocks_value);

    Ok(())
}
