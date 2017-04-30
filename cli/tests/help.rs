extern crate vbablockstest;
#[macro_use]
extern crate hamcrest;

use hamcrest::prelude::*;

#[test]
fn vbablocks_help() {
    let output = vbablockstest::process().arg("--help").output().unwrap();
    let stdout = String::from_utf8(output.stdout).unwrap();
    let mut lines = stdout.lines();

    assert_that!(lines.next().unwrap(), matches_regex(r"vba-blocks \d\.\d\.\d"));
    assert_eq!(lines.next(), Some("Tim Hall <tim.hall.engr@gmail.com>"));
    assert_eq!(lines.next(), Some(""));
    assert_eq!(lines.next(), Some("USAGE:"));
    assert_eq!(lines.next(), Some("    vba-blocks.exe [SUBCOMMAND]"));
}
