use std::path::{Path, StripPrefixError, MAIN_SEPARATOR};
use std::{fs, io, error, fmt};
use std::fs::File;
use std::io::prelude::*;

extern crate walkdir;
use walkdir::WalkDir;

extern crate zip;
use zip::write::FileOptions;

pub fn zip<P: AsRef<Path>>(dir: P, outfile: P) -> Result<(), ArchiveError> {
	let file = fs::File::create(outfile.as_ref())?;
	let mut zipfile = zip::ZipWriter::new(file);
	let entries = WalkDir::new(dir.as_ref()).into_iter().filter_map(|e| e.ok());

	println!("\nZip: {}\n|", outfile.as_ref().display());

	for entry in entries {
		let path = entry.path();
		let prefix = format!("{}{}", dir.as_ref().to_string_lossy(), MAIN_SEPARATOR);
		let relative = path.strip_prefix(&prefix)?;

		if path.is_dir() {
			let dir_path = format!("{}/", relative.to_string_lossy()).replace("\\", "/");
			let dir_options = FileOptions::default()
				.unix_permissions(0o755);

			if &dir_path == "/" { continue; }

			println!("| {}", dir_path);
			zipfile.add_directory(dir_path, dir_options)?;
		} else {
			let file_path = relative.to_string_lossy().replace("\\", "/");
			let file_options = FileOptions::default()
				.compression_method(zip::CompressionMethod::Deflated)
				.unix_permissions(0o644);
			
			let mut file = File::open(path.clone())?;
			let mut contents = String::new();
			file.read_to_string(&mut contents)?;

			println!("|   {}", file_path);
			zipfile.start_file(file_path, file_options)?;
			zipfile.write_all(&contents.into_bytes())?;
		}
	}

	zipfile.finish()?;
	println!("|\nDone.\n");
	
	Ok(())
}

pub fn unzip() {
    println!("unzip");
}

#[derive(Debug)]
pub enum ArchiveError {
	Io(io::Error),
	Zip(zip::result::ZipError),
	StripPrefix(StripPrefixError),
}

impl fmt::Display for ArchiveError {
	fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
		match *self {
			ArchiveError::Io(ref err) => write!(f, "IO error: {}", err),
      ArchiveError::Zip(ref err) => write!(f, "Zip error: {}", err),
      ArchiveError::StripPrefix(ref err) => write!(f, "Strip prefix error: {}", err),
		}
	}
}

impl error::Error for ArchiveError {
  fn description(&self) -> &str {
    match *self {
      ArchiveError::Io(ref err) => err.description(),
      ArchiveError::Zip(ref err) => err.description(),
      ArchiveError::StripPrefix(ref err) => err.description(),
    }
  }

  fn cause(&self) -> Option<&error::Error> {
    match *self {
      ArchiveError::Io(ref err) => Some(err),
      ArchiveError::Zip(ref err) => Some(err),
      ArchiveError::StripPrefix(ref err) => Some(err),
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
