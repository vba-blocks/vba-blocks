use std::env;
use std::path::{Path, PathBuf, MAIN_SEPARATOR};
use errors::*;

#[derive(Serialize, Debug)]
pub struct Config {
    pub cwd: PathBuf,
    pub build: PathBuf,
    pub addins: PathBuf,
    pub scripts: PathBuf,
}

enum Mode {
    Development,
    // TODO Installed,
}

impl Config {
    pub fn load() -> Result<Config> {
        let cwd = env::current_dir()
            .chain_err(|| "Failed to load current directory")?;

        // TODO Check for development vs installed
        let mode = Mode::Development;
        let root = match mode {
            Mode::Development => {
                let mut root = env::current_exe()
                    .chain_err(|| "Failed to find install directory")?;

                root.pop(); // vba-blocks
                root.pop(); // debug/
                root.pop(); // target/
                root.pop(); // cli/
                root
            },
        };
        
        let build = cwd.join("build");
        let addins = match mode {
            Mode::Development => {
                let mut addins = root.clone();
                addins.push("addin");
                addins.push("build");
                addins
            },
        };
        let scripts = match mode {
            Mode::Development => {
                let mut scripts = root.clone();
                scripts.push("cli");
                scripts.push("scripts");
                scripts
            },
        };

        let config = Config {
            cwd,
            build,
            addins,
            scripts,
        };
        Ok(config)
    }

    pub fn relative_to_cwd<P: AsRef<Path>>(&self, path: &P) -> PathBuf {
        self.cwd.join(normalize_path(path.as_ref()))
    }

    pub fn relative_to_build<P: AsRef<Path>>(&self, path: &P) -> PathBuf {
        self.build.join(normalize_path(path.as_ref()))
    }

    pub fn relative_to_addins<P: AsRef<Path>>(&self, path: &P) -> PathBuf {
        self.addins.join(normalize_path(path.as_ref()))
    }

    pub fn relative_to_scripts<P: AsRef<Path>>(&self, path: &P) -> PathBuf {
        self.scripts.join(normalize_path(path.as_ref()))
    }
}

fn normalize_path(path: &Path) -> String {
    path.to_string_lossy().replace("/", MAIN_SEPARATOR.to_string().as_str())
}
