use std::process::Command;
use std::path::{Path, MAIN_SEPARATOR};
use std::fs;
use std::env;

use archive;
use manifest::{Manifest};

use errors::*;

pub struct BuildOptions<'a> {
    pub release: bool,
    pub features: Option<Vec<&'a str>>,
    pub all_features: bool,
    pub no_default_features: bool,
}

pub fn build(options: BuildOptions) -> Result<()> {
    let features = options.features.unwrap_or(vec![]);

    println!("Build -- release: {}, features: {}, all-features: {}, no-default-features: {}\n",
             options.release,
             match features.len() {
                 0 => "(no features)".to_string(),
                 _ => features.join(" "),
             },
             options.all_features,
             options.no_default_features);

    let cwd = env::current_dir()
        .chain_err(|| "Failed to find current directory")?;
    let manifest = Manifest::load("vba-block.toml")
        .chain_err(|| "Failed to load manifest")?;

    println!("{}", manifest.to_json()?);
    build_targets(cwd, manifest)?;

    // TEMP
    match run("build", &features) {
        Ok(stdout) => println!("{}", stdout),
        Err(stderr) => {
            println!("ERROR: {}", stderr);
            return Err(stderr);
        }
    }

    println!("Done.");
    Ok(())
}

fn build_targets<P: AsRef<Path>>(cwd: P, manifest: Manifest) -> Result<()> {
    let build_dir = cwd.as_ref().join("build");
    fs::create_dir_all(build_dir.clone())
        .chain_err(|| "Failed to create build folder")?;

    for target in manifest.targets {
        let path = cwd.as_ref()
            .join(target
                        .path
                        .replace("/", MAIN_SEPARATOR.to_string().as_str()));
        let file = build_dir.join(format!("{}.{}", target.name, target.extension));

        archive::zip(path, file)
            .chain_err(|| "Failed to create target")?;
    }

    Ok(())
}

fn run(name: &str, args: &Vec<&str>) -> Result<String> {
    let mut script_dir = env::current_exe()
        .chain_err(|| "Failed to find script directory")?;

    // TODO Check for development vs installed

    script_dir.pop(); // vba-blocks.exe
    script_dir.pop(); // debug/
    script_dir.pop(); // target/
    script_dir.push("scripts");
    let script_dir = script_dir
        .to_str()
        .ok_or("Failed to find script directory")?;

    let output = if cfg!(target_os = "windows") {
        let command = format!("cscript {}\\run.vbs {} {}",
                              script_dir,
                              name,
                              args.join(" "));
        println!("Command: {}", command);
        Command::new("cmd")
            .args(&["/C", &command])
            .output()
            .chain_err(|| "Failed to execute script")?
    } else {
        let command = format!("osascript {}/run.scpt {} {}",
                              script_dir,
                              name,
                              args.join(" "));
        println!("Command: {}", command);
        Command::new("sh")
            .args(&["-c", &command])
            .output()
            .chain_err(|| "Failed to execute script")?
    };

    if output.stderr.len() > 0 {
        bail!(String::from_utf8(output.stderr).unwrap());
    } else {
        Ok(String::from_utf8(output.stdout).unwrap())
    }
}
