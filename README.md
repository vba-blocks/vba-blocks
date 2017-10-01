# vba-blocks

Coming soon: A package manager for VBA.

Documentation: [vba-blocks.com](https://vba-blocks.com)

## Development

This repository contains the Office Add-ins and CLI for working with vba-blocks.
The add-ins are built with vba-blocks and the CLI is built with Node and [pkg](https://github.com/zeit/pkg).

Getting Started:

1. Install [node](https://www.nodejs.com/) v8.6.0 or later
2. Install [yarn](https://yarnpkg.com/) 1.1.0 or later
3. Install dependencies with `yarn`

Testing:

1. `yarn test`

Building CLI:

1. `cd packages/cli`
2. `yarn run build`
2. `yarn run pkg`

Building add-in:

1. Build CLI (see above)
2. `cd packages/addin`
3. `node tasks/bootstrap`
4. Windows: `..\cli\build\vba-blocks build`
5. Mac: `../cli/build/vba-blocks build`
