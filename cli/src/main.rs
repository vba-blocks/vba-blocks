#[macro_use] extern crate clap;
#[macro_use] extern crate serde_derive;
extern crate toml;
extern crate serde_json;
#[macro_use] extern crate error_chain;
extern crate archive;

mod manifest;
mod ops;

use clap::App;
use ops::{add, update, remove, build, test, init, version, publish, list, search, BuildOptions,
          PublishOptions};

mod errors {
    error_chain!{}
}
use errors::*;

quick_main!(run);

fn run() -> Result<()> {
    let yaml = load_yaml!("cli.yml");
    let matches = App::from_yaml(yaml).get_matches();

    if let Some(matches) = matches.subcommand_matches("add") {
        let block = matches
            .value_of("block")
            .ok_or("<block> is required for `vba-blocks add <block>`")?;
        let git = matches.value_of("git");
        let path = matches.value_of("path");

        add(block, git, path)?;
    } else if let Some(matches) = matches.subcommand_matches("update") {
        let blocks = match matches.values_of("blocks") {
            Some(blocks) => Some(blocks.collect()),
            None => None,
        };

        update(blocks)?;
    } else if let Some(matches) = matches.subcommand_matches("remove") {
        let blocks = matches
            .values_of("blocks")
            .ok_or("<blocks> is required for `vba-blocks remove <blocks>`")?
            .collect();

        remove(blocks)?;
    } else if let Some(matches) = matches.subcommand_matches("build") {
        let features = match matches.values_of("features") {
            Some(features) => Some(features.collect()),
            None => None,
        };

        let options = BuildOptions {
            release: matches.is_present("release"),
            features: features,
            all_features: matches.is_present("all-features"),
            no_default_features: matches.is_present("no-default-features"),
        };

        build(options)?;
    } else if let Some(matches) = matches.subcommand_matches("test") {
        let filters = match matches.values_of("filters") {
            Some(filters) => filters.collect(),
            None => vec![],
        };

        test(filters)?;
    } else if let Some(matches) = matches.subcommand_matches("init") {
        let name = matches.value_of("name");

        init(name)?;
    } else if let Some(matches) = matches.subcommand_matches("version") {
        let value = matches
            .value_of("version")
            .ok_or("<version> is required for `vba-blocks version <version>`")?;

        version(value)?;
    } else if let Some(matches) = matches.subcommand_matches("publish") {
        let options = PublishOptions { dry_run: matches.is_present("dry-run") };

        publish(options)?;
    } else if let Some(_) = matches.subcommand_matches("list") {
        list()?;
    } else if let Some(matches) = matches.subcommand_matches("search") {
        let query = matches
            .value_of("query")
            .ok_or("<query> is required for `vba-blocks search <query>`")?;

        search(query)?;
    }

    Ok(())
}
