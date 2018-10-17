if application "Terminal" is running then
  tell application "Terminal"
    do script "vba-blocks help"
    activate
  end tell
else
  tell application "Terminal"
    do script "vba-blocks help" in window 1
    activate
  end tell
end if
