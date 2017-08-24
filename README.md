# vba-blocks

Coming soon: A package manager for VBA.

Documentation: [vba-blocks.com](https://vba-blocks.com)

## Development

This repository contains the Office Add-ins and CLI for working with vba-blocks.
The add-ins are built with vba-blocks and the CLI is built with Rust.

Building CLI:

1. Install [node](https://www.nodejs.com/) v6 or later
2. `cd cli`
3. `npm run pkg`

Building add-in:

1. Build CLI (see above)
2. `cd addin`
3. `node tasks/bootstrap`
4. Windows: `..\cli\target\debug\vba-blocks build`
5. Mac: `../cli/target/debug/vba-blocks build`
