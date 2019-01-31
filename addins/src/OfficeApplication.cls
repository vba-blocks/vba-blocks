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
' 10201 - Failed to open document
' 10202 - Document already exists
'
' @module OfficeApplication
' @author tim.hall.engr@gmail.com
' @license MIT (http://www.opensource.org/licenses/mit-license.php)
'' ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ '

Private Documents As Dictionary

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
    Dim Doc As Object

    AppType = GetType(Path)

    Select Case AppType
    Case "excel"
        WasOpen = OpenWorkbook(Path, Doc)
    Case "word"
        ' ...
    Case "powerpoint"
        ' ...
    Case "access"
        ' ...
    Case "outlook"
        ' ...
    End Select

    If Doc Is Nothing Then
        Err.Raise 10201, Description:="Failed to open document (" & Path & ")"
    End If

    Dim Instance As New Dictionary
    Instance("Type") = AppType
    Instance("WasOpen") = WasOpen
    Set Instance("Document") = Doc
    Set Documents(Path) = Instance

    Set GetDocument = Doc
End Function

''
' Create document, workbook, etc.
'
' @method CreateDocument
' @param {String} Path
' @returns {Object} Document, Workbook, etc.
''
Public Function CreateDocument(Path As String) As Object
    Path = FileSystem.NormalizePath(Path)

    If FileSystem.FileExists(Path) Then
        Err.Raise 10202, Description:="Document already exists at " & Path
    End If

    Dim AppType As String
    Dim Doc As Object

    AppType = GetType(Path)
    Select Case AppType
    Case "excel"
        Set Doc = CreateWorkbook(Path)
    Case "word"
        ' ...
    Case "powerpoint"
        ' ...
    Case "access"
        ' ...
    Case "outlook"
        ' ...
    End Select

    Dim Instance As New Dictionary
    Instance("Type") = AppType
    Instance("WasOpen") = False
    Set Instance("Document") = Doc
    Set Documents(Path) = Instance

    Set CreateDocument = Doc
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
            Case "excel"
                CloseWorkbook Instance("Document")
            Case "word"
                ' ...
            Case "powerpoint"
                ' ...
            Case "access"
                ' ...
            Case "outlook"
                ' ...
            End Select
        End If
    Next i

    Set Documents = New Dictionary
End Sub

' --------------------------------------------- '
' Excel
' --------------------------------------------- '

Private Function OpenWorkbook(Path As String, ByRef WB As Object) As Boolean
    On Error Resume Next
    Set WB = Application.Workbooks(FileSystem.GetBase(Path))

    If WB Is Nothing Or Err.Number <> 0 Then
        Err.Clear

        Set WB = Application.Workbooks.Open(Path)
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

Private Function CreateWorkbook(Path As String) As Object
    Dim WB As Object

    Set WB = Application.Workbooks.Add
    WB.SaveAs Path, 52 ' XlFileFormat.xlOpenXMLWorkbookMacroEnabled

    Set CreateWorkbook = WB
End Function

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
        GetType = "excel"
    ' TODO Remaining extensions
    Case Default
        Err.Raise 10200, "OfficeApplication", "Unrecognized extension """ & Extension & """ (""" & Path & """)"
    End Select
End Function

Private Sub Class_Initialize()
    Set Documents = New Dictionary
End Sub

Private Sub Class_Terminate()
    Unload
End Sub

