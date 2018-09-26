Dim App
Dim Addin
Dim Command
Dim Arg

App = WScript.Arguments(0)
File = WScript.Arguments(1)
Command = WScript.Arguments(2)
Arg = Unescape(WScript.Arguments(3))

Run App, File, Command, Arg
WScript.Quit 0

Function Run(App, File, Command, Arg)
  Dim Instance
  Dim Result

  Select Case App
  Case "excel"
    Set Instance = New Excel
    Result = Instance.Run(File, Command, Arg)
  Case Else
    Fail "Unsupported App: " & App
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

  Public Function Run(File, Command, Arg)
    On Error Resume Next

    OpenWorkbook(File)
    Run = App.Run("'" & Workbook.Name & "'!" & Command, Arg)

    If Err.Number <> 0 Then
      Fail "Failed to run command: " & Err.Description
    End If
  End Function

  Private Sub OpenExcel()
    On Error Resume Next
    Set App = GetObject(, "Excel.Application")

    If Err.Number <> 0 Then
      Err.Clear
      Set App = CreateObject("Excel.Application")

      If Err.Number <> 0 Then
        Fail "Failed to open Excel: " & Err.Description
      End If

      App.Visible = False
    Else
      ExcelWasOpen = True
    End If
  End Sub

  Private Sub OpenWorkbook(Path)
    Dim Name
    Dim Addin
    Name = GetFilename(Path)

    ' Check add-ins first
    For Each Addin In App.AddIns
      If Addin.Name = Name And Addin.IsOpen Then
        Set Workbook = Addin
        WorkbookWasOpen = True
      End If
    Next

    On Error Resume Next
    Set Workbook = App.Workbooks(Name)

    If Err.Number <> 0 Then
      Err.Clear
      Set Workbook = App.Workbooks.Open(Path)

      If Err.Number <> 0 Then
        Fail "Failed to open workbook: " & Err.Description
      End If
    Else
      WorkbookWasOpen = True
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

' General
' -------

Function Unescape(Value)
  Unescape = Replace(Value, "^q", Chr(34))
End Function

Function GetFilename(Path)
  Dim Parts
  Parts = Split(Path, "\")

  GetFilename = Parts(UBound(Parts))
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
