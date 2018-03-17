VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "OfficeApplication"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = True
''
' Manage Office application and document/workbook instances
'
' Errors:
' 10200 - Unrecognized extension
' 10201 - Failed to open application
' 10202 - Failed to open document
'
' @module OfficeApplication
' @author tim.hall.engr@gmail.com
' @license MIT (http://www.opensource.org/licenses/mit-license.php)
'' ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ '

Private Applications As Dictionary
Private Documents As Dictionary

''
' Get or open application
'
' @method GetApplication
' @param {String} AppType "Excel", "Word", "Powerpoint", "Access", or "Outlook"
' @returns {Object} Application
''
Public Function GetApplication(AppType As String) As Object
    If Applications.Exists(AppType) Then
        Set GetApplication = Applications(AppType)("Application")
        Exit Function
    End If

    Dim WasOpen As Boolean
    Dim App As Object
    
    Select Case AppType
    Case "Excel"
        WasOpen = OpenExcel(App)
    Case "Word"
        ' ...
    Case "Powerpoint"
        ' ...
    Case "Access"
        ' ...
    Case "Outlook"
        ' ...
    End Select
    
    If App Is Nothing Then
        Err.Raise 10201, Description:="Failed to open application"
    End If
    
    Dim Instance As New Dictionary
    Instance("Type") = AppType
    Instance("WasOpen") = WasOpen
    Set Instance("Application") = App
    Set Applications(AppType) = Instance
    
    Set GetApplication = App
End Function

''
' Get or open document, workbook, etc.
'
' @method GetDocument
' @param {String} Path
' @returns {Object} Document, Workbook, etc.
''
Public Function GetDocument(Path As String) As Object
    Path = FileSystem.NormalizePath(Path)

    If Documents.Exists(Path) Then
        Set GetDocument = Documents(Path)("Document")
        Exit Function
    End If
    
    Dim AppType As String
    Dim App As Object
    Dim Doc As Object
    
    AppType = GetType(Path)
    Set App = GetApplication(AppType)
    
    Select Case AppType
    Case "Excel"
        WasOpen = OpenWorkbook(App, Path, Doc)
    Case "Word"
        ' ...
    Case "Powerpoint"
        ' ...
    Case "Access"
        ' ...
    Case "Outlook"
        ' ...
    End Select
    
    If Doc Is Nothing Then
        Err.Raise 10202, Description:="Failed to open document (" & Path & ")"
    End If
    
    Dim Instance As New Dictionary
    Instance("Type") = AppType
    Instance("WasOpen") = WasOpen
    Set Instance("Document") = Doc
    Set Documents(Path) = Instance
    
    Set GetDocument = Doc
End Function

''
' Unload all documents and applications
'
' @method Unload
''
Public Sub Unload()
    Dim i As Long
    Dim Instance As Dictionary
    
    For i = 0 To UBound(Documents.Items)
        Set Instance = Documents.Items(i)
        If Not Instance("WasOpen") Then
            Select Case Instance("Type")
            Case "Excel"
                CloseWorkbook Instance("Document")
            Case "Word"
                ' ...
            Case "Powerpoint"
                ' ...
            Case "Access"
                ' ...
            Case "Outlook"
                ' ...
            End Select
        End If
    Next i
    
    For i = 0 To UBound(Applications.Items)
        Set Instance = Applications.Items(i)
        If Not Instance("WasOpen") Then
            Select Case Instance("Type")
            Case "Excel"
                CloseExcel Instance("Application")
            Case "Word"
                ' ...
            Case "Powerpoint"
                ' ...
            Case "Access"
                ' ...
            Case "Outlook"
                ' ...
            End Select
        End If
        
        Instance.Remove "Application"
    Next i
    
    Set Documents = New Dictionary
    Set Instances = New Dictionary
End Sub

' --------------------------------------------- '
' Excel
' --------------------------------------------- '

Private Function OpenExcel(ByRef App As Object) As Boolean
    OpenExcel = OpenApplication(App, "Excel.Application")
End Function

Private Sub CloseExcel(App As Object)
    App.Quit
End Sub

Private Function OpenWorkbook(App As Object, Path As String, ByRef WB As Object) As Boolean
    On Error Resume Next
    Set WB = App.Workbooks(FileSystem.GetBase(Path))
    
    If WB Is Nothing Or Err.Number <> 0 Then
        Err.Clear
        
        Set WB = App.Workbooks.Open(Path)
        If Err.Number <> 0 Then
            Output.Warnings.Add "Failed to open workbook: " & Err.Description
        End If
        
        OpenWorkbook = False
    Else
        OpenWorkbook = True
    End If
End Function

Private Sub CloseWorkbook(Workbook As Object)
    Workbook.Close False
End Sub

' --------------------------------------------- '
' Word
' --------------------------------------------- '

' TODO

' --------------------------------------------- '
' Powerpoint
' --------------------------------------------- '

' TODO

' --------------------------------------------- '
' Access
' --------------------------------------------- '

' TODO

' --------------------------------------------- '
' Outlook
' --------------------------------------------- '

' TODO

' --------------------------------------------- '
' General
' --------------------------------------------- '

Private Function GetType(Path As String) As String
    Select Case FileSystem.GetExtension(Path)
    Case ".xls", ".xlsx", ".xlsm", ".xlsb", ".xlam"
        GetType = "Excel"
    ' TODO Remaining extensions
    Case Default
        Err.Raise 10200, "OfficeApplication", "Unrecognized extension """ & Extension & """ (""" & Path & """)"
    End Select
End Function

Private Function OpenApplication(ByRef App As Object, Id As String) As Boolean
    On Error Resume Next
    Set App = GetObject(, Id)
    
    If App Is Nothing Or Err.Number <> 0 Then
        Err.Clear
        
        Set App = CreateObject(Id)
        OpenApplication = False
    Else
        OpenApplication = True
    End If
End Function

Private Sub Class_Initialize()
    Set Documents = New Dictionary
    Set Applications = New Dictionary
End Sub

Private Sub Class_Terminate()
    Unload
End Sub

