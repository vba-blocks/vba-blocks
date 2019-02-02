#!/usr/bin/env pwsh
$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent

& "$basedir/vba-blocks" $args
exit $LASTEXITCODE
