WScript.Echo "(vbscript)"

WScript.Echo "Run: " & WScript.Arguments(0)

WScript.Echo (WScript.Arguments.Count - 1) & " arguments"
For i = 1 To (WScript.Arguments.Count - 1)
  WScript.Echo "  Argument " & i & ": " & WScript.Arguments(i)
Next
