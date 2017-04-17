use std::process::{Command, exit};

#[macro_use]
extern crate clap;
use clap::App;

struct BuildOptions<'a> {
  release: bool,
  features: Option<Vec<&'a str>>,
  all_features: bool,
  no_default_features: bool,
}

struct PublishOptions {
  dry_run: bool,
}

fn main() {
  let yaml = load_yaml!("cli.yml");
  let matches = App::from_yaml(yaml).get_matches();

  if let Some(matches) = matches.subcommand_matches("add") {
    let block = matches.value_of("block")
      .expect("<block> is required for `vba-blocks add <block>`");
    let git = matches.value_of("git");
    let path = matches.value_of("path");

    add(block, git, path);
  } else if let Some(matches) = matches.subcommand_matches("remove") {
    let blocks = matches.values_of("blocks")
      .expect("<blocks> is required for `vba-blocks remove <blocks>`")
      .collect();

    remove(blocks);
  } else if let Some(matches) = matches.subcommand_matches("update") {
    let blocks = match matches.values_of("blocks") {
      Some(blocks) => Some(blocks.collect()),
      None => None,
    };

    update(blocks);
  } else if let Some(matches) = matches.subcommand_matches("build") {
    let features = match matches.values_of("features") {
      Some(features) => Some(features.collect()),
      None => None,
    };

    let options = BuildOptions {
      release: matches.is_present("release"),
      features: features,
      all_features: matches.is_present("all-features"),
      no_default_features: matches.is_present("no-default-features"),
    };

    build(options);
  } else if let Some(matches) = matches.subcommand_matches("test") {
    let filters = match matches.values_of("filters") {
      Some(filters) => filters.collect(),
      None => vec![],
    };

    test(filters);
  } else if let Some(matches) = matches.subcommand_matches("init") {
    let name = matches.value_of("name");

    init(name);
  } else if let Some(matches) = matches.subcommand_matches("version") {
    let value = matches.value_of("version")
      .expect("<version> is required for `vba-blocks version <version>`");

    version(value);
  } else if let Some(matches) = matches.subcommand_matches("publish") {
    let options = PublishOptions {
      dry_run: matches.is_present("dry-run"),
    };

    publish(options);
  } else if let Some(_) = matches.subcommand_matches("list") {
    list();
  } else if let Some(matches) = matches.subcommand_matches("search") {
    let query = matches.value_of("query")
      .expect("<query> is required for `vba-blocks search <query>`");

    search(query);
  }
}

fn add(block: &str, git: Option<&str>, path: Option<&str>) {
  let git_value = git.unwrap_or("(no git)");
  let path_value = path.unwrap_or("(no path)");

  println!("add {} {} {}", block, git_value, path_value);
}

fn remove(blocks: Vec<&str>) {
  println!("remove {}", blocks.join(" "));
}

fn update(blocks: Option<Vec<&str>>) {
  let blocks_value = match blocks {
    Some(blocks) => blocks.join(" "),
    None => "(all blocks)".to_string(),
  };

  println!("update {}", blocks_value);
}

fn build(options: BuildOptions) {
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

fn test(filters: Vec<&str>) {
  let filter_value = match filters.len() {
    0 => "(no filters)".to_string(),
    _ => filters.join(" "),
  };

  println!("test, filters: {}", filter_value);
}

fn init(name: Option<&str>) {
  let name_value = name.unwrap_or("(no name)");

  println!("init, name: {}", name_value);
}

fn version(version: &str) {
  println!("version {}", version);
}

fn publish(options: PublishOptions) {
  println!("publish, dry-run: {}", options.dry_run);
}

fn list() {
  println!("list");
}

fn search(query: &str) {
  println!("search {}", query);
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
