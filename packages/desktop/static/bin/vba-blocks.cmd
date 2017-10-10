@echo off
setlocal
set ELECTRON_RUN_AS_NODE=1
call "%~dp0..\vba-blocks.exe" -e "console.log(process.versions)" %*
endlocal
