Dim App
Dim Addin
Dim Command
Dim Args()

If WScript.Arguments.Count < 3 Then
  Fail "ERROR #1: Invalid Input (appname, file, and macro are required"
Else If WScript.Arguments.Count > 13 Then
  Fail "ERROR #2: Invalid Input (only 10 arguments are supported)"
End If

App = WScript.Arguments(0)
File = WScript.Arguments(1)
Command = WScript.Arguments(2)

For i = 3 To WScript.Arguments.Count - 1
  Args(i - 3) = Unescape(WScript.Arguments(i))
Next

Run App, File, Command, Args
WScript.Quit 0

Function Run(App, File, Command, Args)
  Dim Instance
  Dim Result

  Select Case App
  Case "excel"
    Set Instance = New Excel
    Result = Instance.Run(File, Command, Args)
  Case Else
    Fail "ERROR #3: Unsupported App """ & App & """"
  End Select

  PrintLn Result
End Function

' Excel
' -----

Class Excel
  Private App
  Private ExcelWasOpen
  Private Workbook
  Private WorkbookWasOpen

  Private Sub Class_Initialize
    OpenExcel
  End Sub

  Public Function Run(File, Command, Args)
    On Error Resume Next

    OpenWorkbook(File)
    Run = RunMacro(App, Command, Args)

    If Err.Number <> 0 Then
      Fail "ERROR #4: Failed to run command - " & Err.Description
    End If
  End Function

  Private Sub OpenExcel()
    On Error Resume Next
    Set App = GetObject(, "Excel.Application")

    If Err.Number <> 0 Then
      Err.Clear
      Set App = CreateObject("Excel.Application")

      If Err.Number <> 0 Then
        Fail "ERROR #5: Failed to open Excel - " & Err.Description
      End If

      App.Visible = False
    Else
      ExcelWasOpen = True
    End If
  End Sub

  Private Sub OpenWorkbook(Path)
    On Error Resume Next

    ' Check add-ins first
    ' C:/.../vba-blocks.xlam -> index = vba-blocks
    Set Workbook = App.AddIns(GetFileName(Path))
    If Err.Number = 0 Then
      If Workbook.IsOpen Then
        WorkbookWasOpen = True
        Exit Sub
      End If
    End If

    Err.Clear
    Set Workbook = App.Workbooks(GetFileBase(Path))
    If Err.Number = 0 Then
      WorkbookWasOpen = True
      Exit Sub
    End If

    Err.Clear
    Set Workbook = App.Workbooks.Open(Path)

    If Err.Number <> 0 Then
      Fail "ERROR #6: Failed to open workbook - " & Err.Description
    End If
  End Sub

  Private Sub Class_Terminate
    If Not WorkbookWasOpen And Not Workbook Is Nothing Then
      Workbook.Close True
      Set Workbook = Nothing
    End If
    If Not ExcelWasOpen And Not App Is Nothing Then
      App.Quit
      Set App = Nothing
    End If
  End Sub
End Class

Function RunMacro(App, Command, Args)
  If Args.Count = 0 Then
    RunMacro = App.Run(Command)
  Else If WScript.Arguments.Count = 1 Then
    RunMacro = App.Run(Command, Args(0))
  Else If WScript.Arguments.Count = 2 Then
    RunMacro = App.Run(Command, Args(0), Args(1))
  Else If WScript.Arguments.Count = 3 Then
    RunMacro = App.Run(Command, Args(0), Args(1), Args(2))
  Else If WScript.Arguments.Count = 4 Then
    RunMacro = App.Run(Command, Args(0), Args(1), Args(2), Args(3))
  Else If WScript.Arguments.Count = 5 Then
    RunMacro = App.Run(Command, Args(0), Args(1), Args(2), Args(3), Args(4))
  Else If WScript.Arguments.Count = 6 Then
    RunMacro = App.Run(Command, Args(0), Args(1), Args(2), Args(3), Args(4), Args(5))
  Else If WScript.Arguments.Count = 7 Then
    RunMacro = App.Run(Command, Args(0), Args(1), Args(2), Args(3), Args(4), Args(5), Args(6))
  Else If WScript.Arguments.Count = 8 Then
    RunMacro = App.Run(Command, Args(0), Args(1), Args(2), Args(3), Args(4), Args(5), Args(6), Args(7))
  Else If WScript.Arguments.Count = 9 Then
    RunMacro = App.Run(Command, Args(0), Args(1), Args(2), Args(3), Args(4), Args(5), Args(6), Args(7), Args(8))
  Else If WScript.Arguments.Count = 10 Then
    RunMacro = App.Run(Command, Args(0), Args(1), Args(2), Args(3), Args(4), Args(5), Args(6), Args(7), Args(8), Args(9))
  End If
End Function

' General
' -------

Function Unescape(Value)
  Unescape = Replace(Value, "^q", Chr(34))
End Function

Function GetFileBase(Path)
  Dim Parts
  Parts = Split(Replace(Path, "\", "/"), "/")

  GetFileBase = Parts(UBound(Parts))
End Function

Function GetFileName(Path)
  Dim Parts
  Parts = Split(GetFileBase(Path), ".")

  ' Naive approach, may need to be revisited in the future
  GetFileName = Parts(LBound(Parts))
End Function

Sub Fail(Message)
  PrintLn "{""success"":false,""errors"":[""" & Message &  """]}"
  WScript.Quit 1
End Sub

Sub Print(Message)
  WScript.StdOut.Write Message
End Sub

Sub PrintLn(Message)
  WScript.Echo Message
End Sub

Sub PrintErr(Message)
  WScript.StdErr.Write Message
End Sub
