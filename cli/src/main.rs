use std::process::{Command, exit};

#[macro_use]
extern crate clap;
use clap::App;

fn main() {
  let yaml = load_yaml!("cli.yml");
  let matches = App::from_yaml(yaml).get_matches();

  if let Some(_) = matches.subcommand_matches("install") {
    install();
  } else if let Some(_) = matches.subcommand_matches("import") {
    import();
  } else if let Some(_) = matches.subcommand_matches("export") {
    export();
  }
}

fn install() {
  println!("Downloading...");
  println!("Installing...\n");

  let args = vec!["a", "b", "c"];  
  match run("install", &args) {
    Ok(stdout) => println!("{}", stdout),
    Err(stderr) => {
      println!("ERROR: {}", stderr);
      exit(1);
    }
  }

  println!("Done.");
}

fn import() {
  println!("Importing...\n");

  let args = vec!["d", "e", "f"];
  match run("import", &args) {
    Ok(stdout) => println!("{}", stdout),
    Err(stderr) => {
      println!("ERROR: {}", stderr);
      exit(1);
    }
  }

  println!("Done.");
}

fn export() {
  println!("Exporting...\n");

  let args = vec!["g", "h", "i"];
  match run("export", &args) {
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
