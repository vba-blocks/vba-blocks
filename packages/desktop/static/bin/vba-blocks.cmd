@echo off
setlocal
set ELECTRON_RUN_AS_NODE=1
echo %time%
call "%~dp0..\vba-blocks.exe" "%~dp0\vba-blocks.js" %*
echo %time%
endlocal
