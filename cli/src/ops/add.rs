use errors::*;

pub fn add(block: &str, git: Option<&str>, path: Option<&str>) -> Result<()> {
    let git_value = git.unwrap_or("(no git)");
    let path_value = path.unwrap_or("(no path)");

    println!("add {} {} {}", block, git_value, path_value);

    Ok(())
}
