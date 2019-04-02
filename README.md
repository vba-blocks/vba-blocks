# vba-blocks

A package manager and build tool for VBA.

## Installation

__Windows__

In powershell, run the following:

```shellsession
> iwr https://vba-blocks.com/install.ps1 | iex
```

__Mac__

In terminal, run the following:

```shellsession
$ curl -fsSL https://vba-blocks.com/install.sh | sh
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

:rocket: You're ready to go! Open a new command-line session (cmd / terminal) and try `vba-blocks --help`

## Usage

### `new`

Create a new folder with a blank/generated vba-blocks project inside

Create a folder "project-name" with a blank xlsm project:

```shellsession
$ vba-blocks new project-name.xlsm
```

(equivalent to above)

```shellsession
$ vba-blocks new project-name --target xlsm
```

Create a folder "from-existing" with a project from an existing workbook:

```shellsession
$ vba-blocks new from-existing --from existing.xlsm
```

Create a blank package for sharing as a library between projects:

```shellsession
$ vba-blocks new json-converter --package
```

### `init`

Create a blank/generated vba-blocks project in the current folder

Create a blank xlsm project with the current folder's name:

```shellsession
$ vba-blocks init --target xlsm
```

Create a project from an existing workbook:

```shellsession
$ vba-blocks init --from existing.xlsm
```

Create a blank package:

```shellsession
$ vba-blocks init --package
```

### `build`

Build an Excel workbook from the project's source. The built file is located in the `build/` folder and if a previously built file is found it is moved to `/.backup` to protect against losing any previously saved work.

Build a project:

```shellsession
$ vba-blocks build
```

Build and open a project for editing:

```shellsession
$ vba-blocks build --open
```

Build a package using a blank target:

```shellsession
$ vba-blocks build --target xlsm
```

### `export`

Once you've completed your edits and are ready to commit your changes, export your project with `vba-blocks export`.

Export a project:

```shellsession
$ vba-blocks export
```

Export a previously-built package:

```shellsession
$ vba-blocks export --target xlsm
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

```shellsession
$ vba-blocks run build/example.xlsm Tests.RunTests
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
