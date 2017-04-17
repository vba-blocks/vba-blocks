pub fn test(filters: Vec<&str>) {
  let filter_value = match filters.len() {
    0 => "(no filters)".to_string(),
    _ => filters.join(" "),
  };

  println!("test, filters: {}", filter_value);
}
