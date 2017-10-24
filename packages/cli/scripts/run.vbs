Dim Excel
Dim ExcelWasOpen
Set Excel = Nothing
Dim Workbook
Dim WorkbookWasOpen
Set Workbook = Nothing

' TODO Other apps

Dim App
Dim Addin
Dim Command
Dim Args
Dim Result

App = WScript.Arguments(0)
Addin = Unescape(WScript.Arguments(1))
Command = WScript.Arguments(2)
Args = Unescape(WScript.Arguments(3))

PrintLn "-----"
Run App, Addin, Command, Args
WScript.Quit 0

Function Run(App, Addin, Command, Args)
  Select Case App
  Case "excel"
    RunExcel Addin, Command, Args
  Case Else
    WScript.Echo "Unsupported App: " & App
  End Select
End Function

' Excel
' -----

Function RunExcel(Addin, Command, Args)
  On Error Resume Next

  ExcelWasOpen = OpenExcel(Excel)
  If Excel Is Nothing Then
    PrintErr "Error #1: Failed to open Excel" & vbNewLine & IIf(Err.Number <> 0, Err.Description, "Unknown Error")
    WScript.Quit 1
  End If

  WorkbookWasOpen = OpenWorkbook(Excel, Addin, Workbook)

  If Workbook Is Nothing Then
    PrintErr "Error #2: Failed to open workbook" & vbNewLine & IIf(Err.Number <> 0, Err.Description, "Unknown Error")
    
    CloseExcel Excel, ExcelWasOpen
    WScript.Quit 1
  End if

  Result = Excel.Run("'" & Workbook.Name & "'!" & Command, Args)

  If Err.Number <> 0 Then
    PrintErr "Error #3: Failed to run command" & vbNewLine & IIf(Err.Number <> 0, Err.Description, "Unknown Error")

    CloseWorkbook Workbook, WorkbookWasOpen
    CloseExcel Excel, ExcelWasOpen
    WScript.Quit 1
  End If

  PrintLn Result

  CloseWorkbook Workbook, WorkbookWasOpen
  CloseExcel Excel, ExcelWasOpen
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

Sub CloseWorkbook(ByRef Workbook, KeepWorkbookOpen)
  If Not KeepWorkbookOpen And Not Workbook Is Nothing Then
    Workbook.Close True
  End If

  Set Workbook = Nothing
End Sub

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
