use std::{io, error, fmt};
use std::path::{Path};
use std::fs::File;
use std::io::prelude::*;
use toml;

#[derive(Deserialize)]
pub struct Package {
    pub name: String,
    pub version: String,
    pub authors: Vec<String>
}

#[derive(Deserialize)]
pub struct Manifest {
    pub package: Package,
}

pub fn load<P: AsRef<Path>>(file: P) -> Result<Manifest, ManifestError> {
    let mut file = File::open(file)?;
    let mut contents = String::new();
    file.read_to_string(&mut contents)?;

    let loaded = toml::from_str(contents.as_str())?;
    Ok(loaded)
}

#[derive(Debug)]
pub enum ManifestError {
    Io(io::Error),
    Toml(toml::de::Error)
}

impl fmt::Display for ManifestError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match *self {
            ManifestError::Io(ref err) => write!(f, "IO error: {}", err),
            ManifestError::Toml(ref err) => write!(f, "TOML error: {}", err),
        }
    }
}

impl error::Error for ManifestError {
    fn description(&self) -> &str {
        match *self {
            ManifestError::Io(ref err) => err.description(),
            ManifestError::Toml(ref err) => err.description(),
        }
    }

    fn cause(&self) -> Option<&error::Error> {
        match *self {
            ManifestError::Io(ref err) => Some(err),
            ManifestError::Toml(ref err) => Some(err),
        }
    }
}

impl From<io::Error> for ManifestError {
    fn from(err: io::Error) -> ManifestError {
        ManifestError::Io(err)
    }
}

impl From<toml::de::Error> for ManifestError {
    fn from(err: toml::de::Error) -> ManifestError {
        ManifestError::Toml(err)
    }
}
