# vba-blocks

A package manager and build tool for VBA.

## Installation

1. Download and install the [latest release](https://github.com/vba-blocks/vba-blocks/releases) for your platform (Windows or Mac)
2. :rocket: You're ready to go! Open a new command-line session (cmd / terminal) and try `vba-blocks help`

## Usage

### `new`

Create a new folder with a blank/generated vba-blocks project inside

```
# Create a folder "project-name" with a blank xlsm project
> vba-blocks new project-name.xlsm

# (equivalent to above)
> vba-blocks new project-name --target xlsm

# Create a folder "from-existing" with a project from an existing workbook
> vba-blocks new from-existing --from existing.xlsm

# Create a blank package for sharing as a library between projects
> vba-blocks new json-converter --package
```

### `init`

Create a blank/generated vba-blocks project in the current folder

```
# Create a blank xlsm project with current folder's name
> vba-blocks init --target xlsm

# Create a project from an existing workbook
> vba-blocks init --from existing.xlsm

# Create a blank package
> vba-blocks init --package
```

### `build`

Build an Excel workbook from the project's source. The built file is located in the `build/` folder and if a previously built file is found it is moved to `/.backup` to protect against losing any previously saved work.

```
# Build a project
> vba-blocks build

# Build and open a project for editing
> vba-blocks build --open

# Build a package using a blank target
> vba-blocks build --target xlsm
```

### `export`

Once you've completed your edits and are ready to commit your changes, export your project with `vba-blocks export`.

```
# Export a project
> vba-blocks export

# Export a previously built package
> vba-blocks export --target xlsm
```

### `run`

`vba-blocks run` is a useful utility function for running a public macro in the given workbook and if it returns a string value, outputing it to the console.

```vb
' File: build/example.xlsm
' Module: Tests
Public Function RunTests(Value As Variant) As String
  ' (currently, a single Variant input argument is required)

  RunTests = "Howdy!"
End Function
```

```
> vba-blocks run build/example.xlsm Tests.RunTests
Howdy!

```

## Development

### Prerequisites

1. `git clone` this repo
2. Install [node](https://www.nodejs.com/) v10.15.3 or later
3. Install [yarn](https://www.yarnpkg.com/) v1.15.2 or later
4. Install node-gyp dependencies for [Mac](https://github.com/nodejs/node-gyp#on-macos) or [Windows](https://github.com/nodejs/node-gyp#on-windows)

### Build

1. Run `yarn`
2. Run `yarn build`
3. Run `yarn build:addins`

### Release

1. Run `yarn version`
2. Run `yarn release`
