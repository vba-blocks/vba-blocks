# vba-blocks

A package manager and build tool for VBA.

## Installation

**Windows**

In powershell, run the following:

```txt
iwr https://vba-blocks.com/install.ps1 | iex
```

**Mac**

In terminal, run the following:

```txt
curl -fsSL https://vba-blocks.com/install.sh | sh
```

For more recent versions of Office for Mac, you will need to trust access to the VBA project object model for vba-blocks to work correctly:

<details>
  <summary>Trust access to the VBA project object model</summary>
  <ol>
    <li>Open Excel</li>
    <li>Click "Excel" in the menu bar</li>
    <li>Select "Preferences" in the menu</li>
    <li>Click "Security" in the Preferences dialog</li>
    <li>Check "Trust access to the VBA project object model" in the Security dialog</li>
 </ol>
</details>

If you run into any issues during installation, please see the [known issues](https://github.com/vba-blocks/installer#known-issues) for the installer or [create a new issue](https://github.com/vba-blocks/installer/issues/new) with details about what's happening.

:rocket: You're ready to go! Open a new command-line session (cmd / terminal) and try `vba --help`

## Usage

### `new`

Create a new folder with a blank/generated vba-blocks project inside

Create a folder "project-name" with a blank xlsm project:

```txt
vba new project-name.xlsm
```

(equivalent to above)

```txt
vba new project-name --target xlsm
```

Create a folder "from-existing" with a project from an existing workbook:

```txt
vba new from-existing --from existing.xlsm
```

Create a blank package for sharing as a library between projects:

```txt
vba new json-converter --package
```

### `init`

Create a blank/generated vba-blocks project in the current folder

Create a blank xlsm project with the current folder's name:

```txt
vba init --target xlsm
```

Create a project from an existing workbook:

```txt
vba init --from existing.xlsm
```

Create a blank package:

```txt
vba init --package
```

### `build`

Build an Excel workbook from the project's source. The built file is located in the `build/` folder and if a previously built file is found it is moved to `/.backup` to protect against losing any previously saved work.

Build a project:

```txt
vba build
```

Build and open a project for editing:

```txt
vba build --open
```

Build a package using a blank target:

```txt
vba build --target xlsm
```

### `export`

Once you've completed your edits and are ready to commit your changes, export your project with `vba export`.

Export a project:

```txt
vba export
```

Export a previously-built package:

```txt
vba export --target xlsm
```

### `run`

`vba run` is a useful utility function for running a public macro in the given workbook and if it returns a string value, outputing it to the console.

```vb
' File: build/example.xlsm
' Module: Messages
Public Function SayHi(Name As Variant) As String
  ' (currently, a single Variant input argument is required)

  SayHi = "Howdy " & Name & "!"
End Function
```

```txt
vba run Messages.SayHi Tim
Howdy Tim!
```

## Development

[![Build Status](https://dev.azure.com/vba-blocks/vba-blocks/_apis/build/status/vba-blocks.vba-blocks?branchName=master)](https://dev.azure.com/vba-blocks/vba-blocks/_build/latest?definitionId=1&branchName=master)

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
