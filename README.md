# vba-blocks

Coming soon: A package manager for VBA.

Documentation: [vba-blocks.com](https://vba-blocks.com)

## Development

This repository contains the Office Add-ins and CLI for working with vba-blocks.
The add-ins are built with vba-blocks and the CLI is built with Rust.

Building CLI:

1. Use [rustup](https://www.rustup.rs/) to install Rust and Cargo on Windows or Mac
2. `cd cli`
3. `cargo build`

Building add-in:

1. Build CLI (see above)
2. `cd addin`
3. `..\cli\target\debug\vba-blocks build`
