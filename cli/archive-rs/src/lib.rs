use std::path::{Path, StripPrefixError, /*MAIN_SEPARATOR*/};
use std::{fs, io, error, fmt};
use std::process::{Command, Stdio};
use std::fs::File;
// use std::io::prelude::*;

// extern crate walkdir;
// use walkdir::WalkDir;

extern crate zip;
// use zip::write::FileOptions;

pub fn zip<P: AsRef<Path>>(dir: P, out_file: P) -> Result<(), ArchiveError> {
    let dir = dir.as_ref();
    let out_file = out_file.as_ref();

    if out_file.exists() {
        fs::remove_file(out_file)?;
    }
    
    if cfg!(target_os = "windows") {
        let command = format!(
            "& {{ Add-Type -A 'System.IO.Compression.FileSystem'; [IO.Compression.ZipFile]::CreateFromDirectory('{}', '{}'); }}",
            dir.to_string_lossy(),
            out_file.to_string_lossy()
        );

        let child = Command::new("powershell")
            .args(&["-command", &command])
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()?;
            
        let output = child
            .wait_with_output()?;

        if !output.status.success() {
            return Err(ArchiveError::Command(String::from_utf8(output.stderr).unwrap()));
        }
    } else {
        if let (Some(out_file), Some(dir)) = (out_file.to_str(), dir.to_str()) {
            let child = Command::new("zip")
                .args(&["-r", "-X", out_file, dir])
                .spawn()?;

            let output = child
                .wait_with_output()?;

            if !output.status.success() {
                return Err(ArchiveError::Command(String::from_utf8(output.stderr).unwrap()));
            }
        }
    }

    Ok(())

    // TODO Use zip-rs once https://github.com/mvdnes/zip-rs/issues/23 is resolved
    //
    // let file = fs::File::create(outfile.as_ref())?;
    // let mut zipfile = zip::ZipWriter::new(file);
    // let entries = WalkDir::new(dir.as_ref()).into_iter().filter_map(|e| e.ok());
    //
    // println!("\nZip: {}\n|", outfile.as_ref().display());
    //
    // for entry in entries {
    // 	let path = entry.path();
    // 	let prefix = format!("{}{}", dir.as_ref().to_string_lossy(), MAIN_SEPARATOR);
    // 	let relative = path.strip_prefix(&prefix)?;
    //
    // 	if path.is_dir() {
    // 		let dir_path = format!("{}/", relative.to_string_lossy()).replace("\\", "/");
    // 		let dir_options = FileOptions::default()
    // 			.unix_permissions(0o755);
    //
    // 		if &dir_path == "/" { continue; }
    //
    // 		println!("| {}", dir_path);
    // 		zipfile.add_directory(dir_path, dir_options)?;
    // 	} else {
    // 		let file_path = relative.to_string_lossy().replace("\\", "/");
    // 		let file_options = FileOptions::default()
    // 			.compression_method(zip::CompressionMethod::Deflated)
    // 			.unix_permissions(0o644);
    //		
    // 		let mut file = File::open(path.clone())?;
    // 		let mut contents = String::new();
    // 		file.read_to_string(&mut contents)?;
    //
    // 		println!("|   {}", file_path);
    // 		zipfile.start_file(file_path, file_options)?;
    // 		zipfile.write_all(&contents.into_bytes())?;
    // 	}
    // }
    //
    // zipfile.finish()?;
    // println!("|\nDone.\n");
    //
    // Ok(())
}

pub fn unzip<P: AsRef<Path>>(zip_file: P, out_dir: P) -> Result<(), ArchiveError> {
    let out_dir = out_dir.as_ref();
    let file = File::open(zip_file.as_ref())?;
    let mut unzipped = zip::ZipArchive::new(file)?;

    for i in 0..unzipped.len() {
        let mut file = unzipped.by_index(i)?;
        let out_path = out_dir.join(sanitize_filename(file.name()));

        if out_path.ends_with("/") {
            create_directory(&out_path)?;
        } else {
            create_directory(out_path.parent().unwrap_or(&out_dir.join(Path::new(""))))?;
            create_file(&mut file, &out_path)?;
        }
    } 

    Ok(())
}

fn create_file(file: &mut zip::read::ZipFile, out_path: &Path) -> Result<(), io::Error> {
    let mut out_file = File::create(&out_path)?;
    io::copy(file, &mut out_file)?;
    Ok(())
}

fn create_directory(path: &Path) -> Result<(), io::Error> {
    fs::create_dir_all(path)?;
    Ok(())
}

fn sanitize_filename(filename: &str) -> std::path::PathBuf {
    let no_null_filename = match filename.find('\0') {
        Some(index) => &filename[0..index],
        None => filename,
    };

    std::path::Path::new(no_null_filename)
        .components()
        .filter(|component| match *component {
            std::path::Component::Normal(..) => true,
            _ => false
        })
        .fold(std::path::PathBuf::new(), |mut path, ref cur| {
            path.push(cur.as_os_str());
            path
        })
}

#[derive(Debug)]
pub enum ArchiveError {
    Io(io::Error),
    Zip(zip::result::ZipError),
    StripPrefix(StripPrefixError),
    Command(String),
}

impl fmt::Display for ArchiveError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match *self {
            ArchiveError::Io(ref err) => write!(f, "IO error: {}", err),
            ArchiveError::Zip(ref err) => write!(f, "Zip error: {}", err),
            ArchiveError::StripPrefix(ref err) => write!(f, "Strip prefix error: {}", err),
            ArchiveError::Command(ref err) => write!(f, "Command error: {}", err),
        }
    }
}

impl error::Error for ArchiveError {
    fn description(&self) -> &str {
        match *self {
            ArchiveError::Io(ref err) => err.description(),
            ArchiveError::Zip(ref err) => err.description(),
            ArchiveError::StripPrefix(ref err) => err.description(),
            ArchiveError::Command(ref err) => err.as_str(),
        }
    }

    fn cause(&self) -> Option<&error::Error> {
        match *self {
            ArchiveError::Io(ref err) => Some(err),
            ArchiveError::Zip(ref err) => Some(err),
            ArchiveError::StripPrefix(ref err) => Some(err),
            ArchiveError::Command(_) => None,
        }
    }
}

impl From<io::Error> for ArchiveError {
    fn from(err: io::Error) -> ArchiveError {
        ArchiveError::Io(err)
    }
}

impl From<zip::result::ZipError> for ArchiveError {
    fn from(err: zip::result::ZipError) -> ArchiveError {
        ArchiveError::Zip(err)
    }
}

impl From<StripPrefixError> for ArchiveError {
    fn from(err: StripPrefixError) -> ArchiveError {
        ArchiveError::StripPrefix(err)
    }
}
