# CLI

From add-in: Resolve, download, and prepare dependencies for installation

From command line: `install`, `add`, `remove`, `test`, `version`, `publish`

## Install

Process:

1. Resolve dependencies from vba-blocks.com
2. Build dependency list and update vba-block.lock, if necessary
3. Fetch dependencies, as needed based on local cache

From CLI: Run applescript/vbscript to open workbook/document and run installation from add-in

## Add/Remove

Add/remove top-level dependency to vba-block.toml and install.

## Test

Rebuild project using `cfg(test)` and run test script.

```toml
[scripts]
test = "Specs.All"
```

## Version/Publish

Update vba-block.toml version, commit, tag release, and publish to vba-blocks.com.

## Design 

Rust-based CLI using:

- [clap](https://github.com/kbknapp/clap-rs)
- [semver](https://github.com/steveklabnik/semver)
- [git2](https://github.com/alexcrichton/git2-rs)
- [curl](https://github.com/alexcrichton/curl-rust)
- applescript/vbscript for interacting with Office
