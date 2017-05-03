Dim Excel
Dim ExcelWasOpen
Set Excel = Nothing
Dim Workbook
Dim WorkbookWasOpen
Set Workbook = Nothing

Dim Command
Dim Manifest

App = WScript.Arguments(0)
Addin = Unescape(WScript.Arguments(1))
Command = WScript.Arguments(2)
Target = Unescape(WScript.Arguments(3))
Manifest = Unescape(WScript.Arguments(4))
Options = Unescape(WScript.Arguments(5))

Run App, Addin, Command, Target, Manifest, Options

Function Run(App, Command, Addin, Target, Manifest, Options)
  Select Case App
  Case "Excel"
    RunExcel Command, Addin, Target, Manifest, Options
  Case Else
    WScript.Echo "Unsupported App: " & App
  End Select
End Function

Function RunExcel(Addin, Command, Target, Manifest, Options)
  WScript.Echo "Excel"
  WScript.Echo "-----"
  WScript.Echo "Addin: " & Addin
  WScript.Echo "Command: " & Command
  WScript.Echo "Target: " & Target
  WScript.Echo "Manifest: " & Manifest
  WScript.Echo "Options: " & Options

  ' ExcelWasOpen = OpenExcel(Excel)
  ' WorkbookWasOpen = OpenWorkbook(Excel, Addin, Workbook)
  ' TODO Application.Run 'addin!'.Comman Target, Manifest, Options
End Function

Function Unescape(Value)
  Unescape = Replace(Replace(Value, "|Q|", Chr(34)), "|S|", Chr(32))
End Function

Function OpenExcel(ByRef Excel)
  On Error Resume Next
  Set Excel = GetObject(, "Excel.Application")

  If Excel Is Nothing Or Err.Number <> 0 Then
    Err.Clear

    Set Excel = CreateObject("Excel.Application")
    Excel.Visible = True
    OpenExcel = False
  Else
    OpenExcel = True
  End If
End Function

Function OpenWorkbook(Excel, Path, ByRef Workbook)
  On Error Resume Next

  Set Workbook = Excel.Workbooks(GetFilename(Path))

  If Workbook Is Nothing Or Err.Number <> 0 Then
    Err.Clear

    Set Workbook = Excel.Workbooks.Open(Path)
    OpenWorkbook = False
  Else
    OpenWorkbook = True
  End If
End Function

Function GetFilename(Path)
  Dim Parts
  Parts = Split(Path, "\")

  GetFilename = Parts(UBound(Parts))
End Function
