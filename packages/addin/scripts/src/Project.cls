VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "Project"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = True
Private Enum ApplicationType
    Excel
End Enum

Private ProjectType As ApplicationType
Private AppWasOpen As Boolean
Private DocWasOpen As Boolean

Dim App As Object
Dim Doc As Object

Public Property Get Project() As VBProject
    Set Project = Doc.VBProject
End Property

Public Sub OpenProject(Path As String)
    On Error Resume Next
        
    ProjectType = ApplicationType.Excel
    Set App = Application
    Set Doc = App.Workbooks(GetFilename(Path))
    If Doc Is Nothing Or Err.Number <> 0 Then
        Err.Clear
        Set Doc = App.Workbooks.Open(Path)
        DocWasOpen = False
    Else
        DocWasOpen = True
    End If
End Sub

Public Sub CloseProject()
    If Not DocWasOpen And Not Doc Is Nothing Then
        Doc.Close True
    End If
    If Not AppWasOpen And Not App Is Nothing Then
        App.Quit
    End If
End Sub

Private Function GetFilename(Path As String) As String
    Dim Parts() As String
    Parts = Split(Path, "\")
    
    GetFilename = Parts(UBound(Parts))
End Function

Private Sub Class_Terminate()
    CloseProject
End Sub
