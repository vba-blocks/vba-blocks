use std::process::Command;
use std::fs;
use std::path::PathBuf;

use archive;
use config::Config;
use manifest::Manifest;

use errors::*;

pub struct BuildOptions<'a> {
    pub release: bool,
    pub features: Option<Vec<&'a str>>,
    pub all_features: bool,
    pub no_default_features: bool,
}

pub fn build(options: BuildOptions) -> Result<()> {
    let features = options.features.unwrap_or(vec![]);

    println!("Build, release: {}, features: {}, all-features: {}, no-default-features: {}\n",
             options.release,
             match features.len() {
                 0 => "(no features)".to_string(),
                 _ => features.join(" "),
             },
             options.all_features,
             options.no_default_features);

    let config = Config::load()
        .chain_err(|| "Failed to load config")?;
    let manifest = Manifest::load("vba-block.toml")
        .chain_err(|| "Failed to load manifest")?;

    println!("Manifest: {}\n", manifest.to_json_pretty()?);
    build_targets(&config, &manifest)?;

    for target in &manifest.targets {
        // TODO Load app and addin from target
        let options = RunOptions {
            app: "Excel".to_string(),
            addin: config.relative_to_addins(&"vba-blocks.xlam"),
            command: "build".to_string(),
            target: target.fullpath.clone(),
            options: "{}".to_string(),
        };

        match run(&config, &manifest, &options) {
            Ok(stdout) => println!("{}", stdout),
            Err(stderr) => {
                println!("ERROR: {}", stderr);
                return Err(stderr);
            }
        }
    }

    println!("Done.");
    Ok(())
}

fn build_targets(config: &Config, manifest: &Manifest) -> Result<()> {
    fs::create_dir_all(&config.build)
        .chain_err(|| "Failed to create build folder")?;

    for target in &manifest.targets {
        archive::zip(&target.fullpath, &target.file)
            .chain_err(|| "Failed to create target")?;
    }

    Ok(())
}

struct RunOptions {
    app: String,
    addin: PathBuf,
    command: String,
    target: PathBuf,
    options: String,
}

fn run(config: &Config, manifest: &Manifest, options: &RunOptions) -> Result<String> {
    let manifest_json = manifest.to_json()
        .chain_err(|| "Failed to convert manifest to json")?;
    let addin = options.addin.to_str()
        .ok_or("Failed to convert addin path")?;
    let target = options.target.to_str()
        .ok_or("Failed to convert target path")?;

    let output = if cfg!(target_os = "windows") {
        let script = config.relative_to_scripts(&"run.vbs");
        let script = script.to_str()
            .ok_or("Failed to convert script path")?;
        let addin = &escape_cmd(addin);
        let target = &escape_cmd(target);
        let manifest = &escape_cmd(&manifest_json);
        let command_options = &escape_cmd(&options.options);

        Command::new("cscript")
            .args(&[script, &options.app, addin, &options.command, target, manifest, command_options])
            .output()
            .chain_err(|| "Failed to execute script")?
    } else {
        let script = config.relative_to_scripts(&"run.scpt");
        let script = script.to_str()
            .ok_or("Failed to convert script path")?;
        let addin = &escape_sh(addin);
        let target = &escape_sh(target);
        let manifest = &escape_sh(&manifest_json);
        let command_options = &escape_sh(&options.options);

        Command::new("osascript")
            .args(&[script, &options.app, addin, &options.command, target, manifest, command_options])
            .output()
            .chain_err(|| "Failed to execute script")?
    };

    if output.stderr.len() > 0 {
        bail!(String::from_utf8(output.stderr).unwrap());
    } else {
        Ok(String::from_utf8(output.stdout).unwrap())
    }
}

// Use hacky |...| style to escape characters that don't agree with cmd
// (manually need to unescape in vbscript)
fn escape_cmd(arg: &str) -> String {
    arg.replace("\"", "|Q|").replace(" ", "|S|")
}

// TODO
fn escape_sh(arg: &str) -> String {
    arg.to_string()
}
