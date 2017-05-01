use std::path::Path;
use std::fs::File;
use std::collections::HashMap;
use std::io::prelude::*;
use toml;

use errors::*;

#[derive(Deserialize)]
pub struct Manifest {
    pub package: Package,
    pub targets: Option<Vec<Target>>,

    // TODO "path" -> { path = "path" } conversion
    pub src: Option<HashMap<String, toml::Value>>,
}

#[derive(Deserialize)]
pub struct Package {
    pub name: String,
    pub version: String,
    pub authors: Vec<String>,
}

#[derive(Deserialize)]
pub struct Target {
    pub name: Option<String>,
    pub path: String,

    // "type" is reserved, rename to extension
    #[serde(rename = "type")]
    pub extension: String,
}

pub fn load<P: AsRef<Path>>(file: P) -> Result<Manifest> {
    let mut file = File::open(file).chain_err(|| "Failed to open manifest")?;
    let mut contents = String::new();
    file.read_to_string(&mut contents)
        .chain_err(|| "Failed to read manifest")?;

    let loaded = toml::from_str(contents.as_str())
        .chain_err(|| "Failed to parse manifest")?;

    Ok(loaded)
}
