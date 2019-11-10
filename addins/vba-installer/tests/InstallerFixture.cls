VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "InstallerFixture"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = True
Private WithEvents pSuite As TestSuite
Attribute pSuite.VB_VarHelpID = -1

Public Property Get Project() As VBProject
    Set Project = ThisWorkbook.VBProject
End Property

Public Property Get ImportName() As String
    ImportName = "SpecModule"
End Property

Public Property Get ImportPath() As String
    ImportPath = GetFullPath(Me.ImportName & ".bas")
End Property

Public Property Get ExportPath() As String
    ExportPath = GetFullPath("SpecModule-export.bas")
End Property

Public Sub ListenTo(Suite As TestSuite)
    Set pSuite = Suite
End Sub

Public Function GetFullPath(ComponentPath As String) As String
    GetFullPath = FileSystem.JoinPath(FileSystem.GetDir(ThisWorkbook.Path), "tests", ComponentPath)
End Function

Public Function HasComponent(ComponentName As String) As Boolean
    Dim Component As VBComponent

    On Error Resume Next
    Set Component = Project.VBComponents(ComponentName)
    On Error GoTo 0

    If Not Component Is Nothing Then
        HasComponent = True
    End If
End Function

Private Sub pSuite_AfterEach(Test As TestCase)
    Installer.Remove Me.Project, "SpecModule"
    FileSystem.DeleteFile Me.ExportPath
End Sub
