use std::path::{Path, /*MAIN_SEPARATOR*/};
use std::{fs, io};
use std::process::{Command, Stdio};
use std::fs::File;
// use std::io::prelude::*;

// extern crate walkdir;
// use walkdir::WalkDir;

extern crate zip;
// use zip::write::FileOptions;

#[macro_use] extern crate error_chain;
mod errors {
    error_chain! {}
}
use errors::*;
pub use errors::{Result, Error, ErrorKind};

pub fn zip<P: AsRef<Path>>(dir: P, out_file: P) -> Result<()> {
    let dir = dir.as_ref();
    let out_file = out_file.as_ref();

    if out_file.exists() {
        fs::remove_file(out_file).chain_err(|| "Failed to remove file")?;
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
            .spawn().chain_err(|| "Failed to spawn powershell")?;
            
        let output = child
            .wait_with_output().chain_err(|| "Powershell didn't complete")?;

        if !output.status.success() {
            bail!(String::from_utf8(output.stderr).unwrap());
        }
    } else {
        if let (Some(out_file), Some(dir)) = (out_file.to_str(), dir.to_str()) {
            let child = Command::new("zip")
                .args(&["-r", "-X", out_file, dir])
                .spawn().chain_err(|| "Failed to spawn zip")?;

            let output = child
                .wait_with_output().chain_err(|| "zip didn't complete")?;

            if !output.status.success() {
                bail!(String::from_utf8(output.stderr).unwrap());
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

pub fn unzip<P: AsRef<Path>>(zip_file: P, out_dir: P) -> Result<()> {
    let out_dir = out_dir.as_ref();
    let file = File::open(zip_file.as_ref()).chain_err(|| "Failed to open zip file")?;
    let mut unzipped = zip::ZipArchive::new(file).chain_err(|| "Failed to unzip file")?;

    for i in 0..unzipped.len() {
        let mut file = unzipped.by_index(i).chain_err(|| "File not found for index")?;
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

fn create_file(file: &mut zip::read::ZipFile, out_path: &Path) -> Result<()> {
    let mut out_file = File::create(&out_path).chain_err(|| "Failed to create file")?;
    io::copy(file, &mut out_file).chain_err(|| "Failed to copy to file")?;
    Ok(())
}

fn create_directory(path: &Path) -> Result<()> {
    fs::create_dir_all(path).chain_err(|| "Failed to create directory")?;
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
