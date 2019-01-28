VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "ThisWorkbook"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = True
Private WithEvents App As Excel.Application
Attribute App.VB_VarHelpID = -1

Private Sub Workbook_Open()
    Set App = Application
End Sub

Private Sub App_WorkbookAfterSave(ByVal WB As Workbook, ByVal Success As Boolean)
    ' Dim ProjectDir As String
    ' Dim TargetType As String

    ' ProjectDir = FileSystem.GetDir(WB.Path)
    ' TargetType = Replace(FileSystem.GetExtension(WB.Name), ".", "")

    ' TODO vba-blocks export {TargetType} --cwd {ProjectDir}
End Sub
