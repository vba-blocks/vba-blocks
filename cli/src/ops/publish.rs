pub struct PublishOptions {
  pub dry_run: bool,
}

pub fn publish(options: PublishOptions) {
  println!("publish, dry-run: {}", options.dry_run);
}
