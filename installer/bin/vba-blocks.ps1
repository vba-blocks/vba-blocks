#!/usr/bin/env pwsh
$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent

& "$basedir/../node/node.exe" "$basedir/../lib/vba-blocks.js" $args
exit $LASTEXITCODE
