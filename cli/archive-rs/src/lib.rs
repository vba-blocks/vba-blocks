use std::path::{Path, StripPrefixError, /*MAIN_SEPARATOR*/};
use std::{fs, io, error, fmt};
use std::process::{Command, Stdio};
// use std::fs::File;
// use std::io::prelude::*;

// extern crate walkdir;
// use walkdir::WalkDir;

// extern crate zip;
// use zip::write::FileOptions;

pub fn zip<P: AsRef<Path>>(dir: P, outfile: P) -> Result<(), ArchiveError> {
    let dir = dir.as_ref();
    let outfile = outfile.as_ref();

    let dir_path = dir.to_string_lossy();
    let outfile_path = outfile.to_string_lossy();

    if outfile.exists() {
        fs::remove_file(outfile)?;
    }
    
    if cfg!(target_os = "windows") {
        let command = format!(
            "& {{ Add-Type -A 'System.IO.Compression.FileSystem'; [IO.Compression.ZipFile]::CreateFromDirectory('{}', '{}'); }}",
            dir_path,
            outfile_path
        );

        let child = Command::new("powershell")
            .args(&["-command", &command])
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()?;
            
        let output = child
            .wait_with_output()?;

        if !output.status.success() {
            return Err(ArchiveError::Powershell(String::from_utf8(output.stderr).unwrap()))
        }
    } else {
        // TODO Mac
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

pub fn unzip() {
    // TODO powershell -command & { Add-Type -A 'System.IO.Compression.FileSystem'; [IO.Compression.ZipFile]::ExtractToDirectory('foo.zip', 'bar'); }
    println!("TODO unzip");
}

#[derive(Debug)]
pub enum ArchiveError {
    Io(io::Error),
    // Zip(zip::result::ZipError),
    StripPrefix(StripPrefixError),
    Powershell(String),
}

impl fmt::Display for ArchiveError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match *self {
            ArchiveError::Io(ref err) => write!(f, "IO error: {}", err),
            // ArchiveError::Zip(ref err) => write!(f, "Zip error: {}", err),
            ArchiveError::StripPrefix(ref err) => write!(f, "Strip prefix error: {}", err),
            ArchiveError::Powershell(ref err) => write!(f, "Powershell error: {}", err),
        }
    }
}

impl error::Error for ArchiveError {
    fn description(&self) -> &str {
        match *self {
            ArchiveError::Io(ref err) => err.description(),
            // ArchiveError::Zip(ref err) => err.description(),
            ArchiveError::StripPrefix(ref err) => err.description(),
            ArchiveError::Powershell(ref err) => err.as_str(),
        }
    }

    fn cause(&self) -> Option<&error::Error> {
        match *self {
            ArchiveError::Io(ref err) => Some(err),
            // ArchiveError::Zip(ref err) => Some(err),
            ArchiveError::StripPrefix(ref err) => Some(err),
            ArchiveError::Powershell(_) => None,
        }
    }
}

impl From<io::Error> for ArchiveError {
    fn from(err: io::Error) -> ArchiveError {
        ArchiveError::Io(err)
    }
}

// impl From<zip::result::ZipError> for ArchiveError {
//     fn from(err: zip::result::ZipError) -> ArchiveError {
//         ArchiveError::Zip(err)
//     }
// }

impl From<StripPrefixError> for ArchiveError {
    fn from(err: StripPrefixError) -> ArchiveError {
        ArchiveError::StripPrefix(err)
    }
}
