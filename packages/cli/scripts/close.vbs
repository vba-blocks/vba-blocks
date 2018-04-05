Dim App
Dim Addin

App = WScript.Arguments(0)
Addin = Unescape(WScript.Arguments(1))

PrintLn "-----"
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
  Dim Workbook

  On Error Resume Next

  Set Excel = Nothing
  GetExcel Excel
  If Excel Is Nothing Then
    Exit Sub
  End If

  Set Workbook = Nothing
  GetWorkbook Excel, Addin, Workbook
  If Workbook Is Nothing Then
    CloseExcel Excel
    Exit Sub
  End if

  CloseWorkbook Workbook
  CloseExcel Excel
End Sub

Sub GetExcel(ByRef Excel)
  On Error Resume Next
  Set Excel = GetObject(, "Excel.Application")
End Sub

Sub CloseExcel(ByRef Excel)
  If Not Excel Is Nothing Then
    Excel.Quit
  End If

  Set Excel = Nothing
End Sub

Sub GetWorkbook(Excel, Path, ByRef Workbook)
  On Error Resume Next
  Set Workbook = Excel.Workbooks(GetFilename(Path))
End Sub

Sub CloseWorkbook(ByRef Workbook)
  If Not Workbook Is Nothing Then
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
