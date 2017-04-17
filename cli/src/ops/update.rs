pub fn update(blocks: Option<Vec<&str>>) {
  let blocks_value = match blocks {
    Some(blocks) => blocks.join(" "),
    None => "(all blocks)".to_string(),
  };

  println!("update {}", blocks_value);
}
