set cwd to (path to me)
set bin to (POSIX path of cwd) & "bin"

tell application "Terminal"
	activate
	do script "PATH=\"$PATH:" & bin & "\" && vba-blocks"
end tell
