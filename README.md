# vba-blocks

Coming soon: A package manager for VBA.

This repository contains the Office Add-ins and CLI for working with vba-blocks.

## Building the CLI

> vba-blocks Desktop (coming soon) takes care of all of this for you.

### Prerequisites

1. `git clone` this repo
2. Install [node](https://www.nodejs.com/) v8.11.4 or later
3. Install [yarn](https://www.yarnpkg.com/) v1.9.4 or later
4. Install node-gyp dependencies for [Mac](https://github.com/nodejs/node-gyp#on-macos) or [Windows](https://github.com/nodejs/node-gyp#on-macos)

### Build

1. Run `yarn`
2. Run `yarn build:win` (Windows) or `yarn build:mac` (Mac)
3. Verify build with `dist\bin\vba-blocks healthcheck` (Windows) or `dist/bin/vba-blocks healthcheck` (Mac)

### Install

1. Add `{vba-blocks directory}\dist\bin` to user or system PATH on Windows (TODO add to PATH for Mac)
2. Add `{vba-blocks directory}\dist\addins\vba-blocks.{...}` to desired Office applications (only Excel is supported at the moment)
3. Open a new cmd/terminal window and run `vba-blocks healthcheck` to verify installation
4. :rocket: You're ready to go!
