Attribute VB_Name = "Build"
Public Function ImportGraph(Graph As Variant) As String
    On Error GoTo ErrorHandling

    Dim Values As Dictionary
    Dim Document As Object
    Dim App As New OfficeApplication

    Set Values = JsonConverter.ParseJson(Graph)
    Set Document = App.GetDocument(Values("file"))
    
    Dim Src As Dictionary
    For Each Src In Values("src")
        Output.Messages.Add "src: " & Src("name") & ", " & Src("path")
        Installer.Import Document.VBProject, Src("name"), Src("path"), Overwrite:=True
    Next Src

    ' TODO Receiving the following error:
    '
    ' Failed to add reference. -2147319779: Object library not registered
    '
    ' Dim Ref As Dictionary
    ' For Each Ref In Values("references")
    '     Output.Messages.Add "ref: " & Ref("name") & ", " & Ref("guid") & ", " & Ref("major") & ", " & Ref("minor")
    '     Installer.AddReference Document.VBProject, Ref("guid"), Ref("major"), Ref("minor")
    ' Next Ref

    Document.Save

    ImportGraph = Output.Result
    Exit Function
    
ErrorHandling:

    Output.Errors.Add Err.Number & ": " & Err.Description
    ImportGraph = Output.Result
End Function

Public Function ExportTo(Info As Variant) As String
    On Error GoTo ErrorHandling

    Dim Values As Dictionary
    Dim Staging As String
    Dim Document As Object
    Dim App As New OfficeApplication

    Set Values = JsonConverter.ParseJson(Info)
    Set Document = App.GetDocument(Values("file"))
    Staging = Values("staging")

    Dim Component As Object
    For Each Component In Document.VBProject.Components
        ' TODO
        ' Installer.Export Document.VBProject, Component.Name, FileSystem.Join(Staging, Component.Name & ...?), Overwrite:=True
        Output.Messages.Add "Export: " & Component.Name
    Next Component

    ExportTo = Output.Result
    Exit Function

ErrorHandling:

    Output.Errors.Add Err.Number & ": " & Err.Description
    ExportTo = Output.Result
End Function
