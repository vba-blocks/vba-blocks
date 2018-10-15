set installer_path to (path to me)
set installer_dir to do shell script "dirname " & quoted form of POSIX path of (path to me)
set cwd to POSIX file installer_dir as alias

set src to POSIX file ((POSIX path of cwd) & "vba-blocks.app")
set target to POSIX file "/Applications" as alias

log cwd
log src
log target

tell application "Finder" to duplicate file src to target
do shell script "/Applications/vba-blocks.app/bin/vba-blocks setup"
