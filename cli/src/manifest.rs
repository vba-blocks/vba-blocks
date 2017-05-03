use std::path::{Path, PathBuf, MAIN_SEPARATOR};
use std::fs::File;
use std::collections::HashMap;
use std::io::prelude::*;
use std::env;
use toml;
use serde::Serializer;
use serde_json;
use std::result::Result as StdResult;
use semver::Version;

use errors::*;

#[derive(Serialize, Debug)]
pub struct Manifest {
    pub build: PathBuf,
    pub metadata: Metadata,
    pub src: Vec<Src>,
    pub dependencies: Vec<Dependency>,
    pub dev_dependencies: Vec<Dependency>,
    pub targets: Vec<Target>,
}

#[derive(Serialize, Debug)]
pub struct Metadata {
    pub name: String,
    #[serde(serialize_with = "version_to_str")]
    pub version: Version,
    pub authors: Vec<String>,
}

#[derive(Serialize, Debug)]
pub struct Src {
    pub name: String,
    pub path: String,
    pub optional: bool,
    pub fullpath: PathBuf,
}

#[derive(Serialize, Debug)]
pub struct Dependency {
    pub name: String,
    #[serde(serialize_with = "version_to_str")]
    pub version: Version,
    pub optional: bool,
}

#[derive(Serialize, Debug)]
pub struct Target {
    pub name: String,
    pub path: String,
    pub extension: String,
    pub fullpath: PathBuf,
    pub file: PathBuf,
}

impl Manifest {
    pub fn load<P: AsRef<Path>>(file: P) -> Result<Manifest> {
        let mut file = File::open(file).chain_err(|| "Failed to open manifest")?;
        let mut contents = String::new();
        file.read_to_string(&mut contents)
            .chain_err(|| "Failed to read manifest")?;

        let raw: RawManifest = toml::from_str(contents.as_str())
            .chain_err(|| "Failed to parse manifest")?;

        let cwd = env::current_dir()
            .chain_err(|| "Failed to load current directory")?;
        let build_dir = cwd.join("build");
        let package_name = raw.package.name;

        let mut src = vec![];
        for (name, value) in raw.src.unwrap_or(HashMap::new()) {
            match value {
                toml::Value::String(path) => {
                    let fullpath = cwd.join(normalize_path(&path));
                    src.push(Src {
                                 name,
                                 path,
                                 optional: false,
                                 fullpath,
                             });
                }
                toml::Value::Table(table) => {
                    let path =
                        value_to_string(table.get("path").ok_or("path is required for src")?)?;
                    let optional = table
                        .get("optional")
                        .unwrap_or(&toml::Value::Boolean(false))
                        .as_bool()
                        .ok_or("Failed to convert optional to boolean")?;
                    let fullpath = cwd.join(normalize_path(&path));

                    src.push(Src {
                                 name,
                                 path,
                                 optional,
                                 fullpath,
                             });
                }
                _ => bail!("Incompatible type for src"),
            }
        }

        let dependencies = vec![];
        let dev_dependencies = vec![];

        let mut targets = vec![];
        for target in raw.targets.unwrap_or(vec![]) {
            let name = target.name.unwrap_or(package_name.clone());
            let path = target.path;
            let fullpath = cwd.join(normalize_path(&path));
            let file = build_dir.join(format!("{}.{}", name, target.extension));

            targets.push(Target {
                             name,
                             path,
                             extension: target.extension,
                             fullpath,
                             file,
                         });
        }

        let parsed = Manifest {
            build: build_dir,
            metadata: Metadata {
                name: package_name,
                version: Version::parse(raw.package.version.as_str())
                    .chain_err(|| "Invalid package version")?,
                authors: raw.package.authors,
            },
            src,
            dependencies,
            dev_dependencies,
            targets,
        };
        Ok(parsed)
    }

    pub fn to_json(&self) -> Result<String> {
        let json = serde_json::to_string_pretty(&self)
            .chain_err(|| "Failed to convert manifest to JSON")?;

        Ok(json)
    }
}

// Deserialize is intentionally loose for user benefit
// toml -> RawManifest -> Manifest

#[derive(Deserialize, Debug)]
struct RawManifest {
    package: RawPackage,
    src: Option<HashMap<String, toml::Value>>,
    dependencies: Option<HashMap<String, toml::Value>>,

    #[serde(rename = "dev-dependencies")]
    dev_dependencies: Option<HashMap<String, toml::Value>>,
    targets: Option<Vec<RawTarget>>,
}

#[derive(Deserialize, Debug)]
struct RawPackage {
    name: String,
    version: String,
    authors: Vec<String>,
}

#[derive(Deserialize, Debug)]
struct RawTarget {
    name: Option<String>,
    path: String,

    // "type" is reserved, rename to extension
    #[serde(rename = "type")]
    extension: String,
}

fn value_to_string(value: &toml::Value) -> Result<String> {
    Ok(value
           .as_str()
           .ok_or("Failed to convert value to string")?
           .to_string())
}

fn version_to_str<S>(version: &Version, serializer: S) -> StdResult<S::Ok, S::Error>
    where S: Serializer
{
    serializer.serialize_str(version.to_string().as_str())
}

fn normalize_path(path: &String) -> String {
    path.replace("/", MAIN_SEPARATOR.to_string().as_str())
}
