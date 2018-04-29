Dim App
Dim Addin

App = WScript.Arguments(0)
Addin = Unescape(WScript.Arguments(1))

Run App, Addin
WScript.Quit 0

Function Run(App, Addin)
  Select Case App
  Case "excel"
    RunExcel Addin
  Case Else
    WScript.Echo "Unsupported App: " & App
    WScript.Quit 1
  End Select

  PrintLn "{""success"":true}"
End Function

' Excel
' -----

Sub RunExcel(Addin)
  Dim Excel
  Dim ExcelWasOpen
  Dim Workbook
  Dim WorkbookWasOpen

  On Error Resume Next

  Set Excel = Nothing
  ExcelWasOpen = OpenExcel(Excel)
  If Excel Is Nothing Then
    PrintErr "Error #1: Failed to open Excel"
    PrintErr IIf(Err.Number <> 0, Err.Description, "Unknown Error")

    WScript.Quit 1
  End If

  Set Workbook = Nothing
  WorkbookWasOpen = OpenWorkbook(Excel, Addin, Workbook)
  If Workbook Is Nothing Then
    PrintErr "Error #2: Failed to open workbook"
    PrintErr IIf(Err.Number <> 0, Err.Description, "Unknown Error")
    
    CloseExcel Excel, ExcelWasOpen
    WScript.Quit 1
  End if
End Sub

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

Sub CloseExcel(ByRef Excel, KeepExcelOpen)
  If Not KeepExcelOpen And Not Excel Is Nothing Then
    Excel.Quit
  End If
End Sub

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

' General
' -------

Function Unescape(Value)
  Unescape = Replace(Replace(Value, "|Q|", Chr(34)), "|S|", Chr(32))
End Function

Function GetFilename(Path)
  Dim Parts
  Parts = Split(Path, "\")

  GetFilename = Parts(UBound(Parts))
End Function

Sub Print(Message)		
  WScript.StdOut.Write Message		
End Sub
 		
Sub PrintLn(Message)		
  WScript.Echo Message		
End Sub

Sub PrintErr(Message)
  WScript.StdErr.Write Message
End Sub
