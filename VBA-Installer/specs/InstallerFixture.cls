VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "InstallerFixture"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = True
Private WithEvents pSuite As SpecSuite

Public Property Get ModulePath() As String
    ModulePath = ThisWorkbook.Path & Application.PathSeparator & "SpecModule.bas"
End Property

Public Sub ListenTo(Suite As SpecSuite)
    Set pSuite = Suite
End Sub

Private Sub pSuite_AfterEach()
    If Installer.HasComponent(ThisWorkbook.VBProject, "SpecModule") Then
        Installer.Remove ThisWorkbook.VBProject, "SpecModule"
    End If
End Sub
