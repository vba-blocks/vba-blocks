use std::process::{Command, exit};

pub struct BuildOptions<'a> {
  pub release: bool,
  pub features: Option<Vec<&'a str>>,
  pub all_features: bool,
  pub no_default_features: bool,
}

pub fn build(options: BuildOptions) {
  let features = options.features.unwrap_or(vec![]);

  println!("Build, release: {}, features: {}, all-features: {}, no-default-features: {}",
    options.release,
    match features.len() {
      0 => "(no features)".to_string(),
      _ => features.join(" "),
    },
    options.all_features,
    options.no_default_features
  );

  match run("build", &features) {
    Ok(stdout) => println!("{}", stdout),
    Err(stderr) => {
      println!("ERROR: {}", stderr);
      exit(1);
    }
  }

  println!("Done.");
}

fn run(name: &str, args: &Vec<&str>) -> Result<String, String> {
  let output = if cfg!(target_os = "windows") {
    let command = format!("cscript scripts/run.vbs {} {}", name, args.join(" "));
    Command::new("cmd")
      .args(&["/C", &command])
      .output()
      .expect("Failed to execute script")
  } else {
    let command = format!("osascript scripts/run.scpt {} {}", name, args.join(" "));
    Command::new("sh")
      .args(&["-c", &command])
      .output()
      .expect("Failed to execute script")
  };

  if output.stderr.len() > 0 {
    Err(String::from_utf8(output.stderr).unwrap())
  } else {
    Ok(String::from_utf8(output.stdout).unwrap())
  }
}
