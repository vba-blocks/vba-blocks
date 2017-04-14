# CLI

## Initial Design

### Add

Add the given block to the project. Recalculate dependency tree, update `vba-block.lock`, and download dependencies, as-needed.

```sh
Usage:
  vba-blocks add <block> [options]

Options:
  --git URL     Add block from url, using <git remote url>[#<branch/commit/tag>]
  --path PATH   Add block from given path

Arguments:
  block         block-name, block-name@1.2.3, block-name@tag
```

### Remove

Remove one or more packages from the project. Recalculate dependency tree and update `vba-block.lock`.

```sh
Usage:
  vba-blocks remove <block>...

Arguments:
  block(s)  Block names to remove
```

### Update

Update given block or all blocks. Recalculate dependency tree, update `vba-block.lock`, and download dependencies, as-needed.

```sh
Usage:
  vba-blocks update [<block>]

Arguments:
  block     block name to update
```

### Build

```sh
Usage:
  vba-blocks build [options]

Options:
  --release               Build for release
  --features FEATURES     Space-separated list of features to build
  --all-features          Build all available features
  --no-default-features   Do not build the `default` feature
```

### Test

```sh
Usage:
  vba-blocks test [options] [<filters>...]

Options:
  (options passed to test function)  

Arguments:
  filters...  Test filters (generally by name)
```

Initially, there will be no default test runner for vba-blocks,
instead one can be specified in `vba-block.toml`

```toml
[package]
test = "'workbook name.xlsm'!Specs.RunSpecs"
```

This is then called with the project's manifest and test options/arguments:

```vb
Public Function RunSpecs(Manifest As Dictionary, Options As Dictionary) As String
  Dim Filters As Collection
  Set Filters = Options("filters")

  RunSpecs = "TAP output"
End Function
```

### New

Create a new vba-blocks project at the given path.

```sh
Usage:
  vba-blocks new [options] <path>

Options:
  --name NAME   Set the package name, defaults to the value of <path>
```

### Init

Create a new vba-blocks project in the current directory.

```sh
Usage:
  vba-blocks init [options]

Options:
  --name NAME   Set the package name
```

### Version

Set the package's version and (when git's present) commit and tag with version.

```sh
Usage:
  vba-blocks version [<version> | major | minor | patch | prerelease]
```

### Publish

Upload a package to vba-blocks.

```sh
Usage:
  vba-blocks publish [options]

Options:
  --dry-run   Perform all checks without uploading
```

## Implementation 

Rust-based CLI using:

- [clap](https://github.com/kbknapp/clap-rs)
- [semver](https://github.com/steveklabnik/semver)
- [git2](https://github.com/alexcrichton/git2-rs)
- [curl](https://github.com/alexcrichton/curl-rust)
- applescript/vbscript for interacting with Office
