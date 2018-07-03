Attribute VB_Name = "Build"
Private Const vbext_ct_StdModule = 1
Private Const vbext_ct_ClassModule = 2
Private Const vbext_ct_MSForm = 3
Private Const vbext_ct_Document = 100

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

''
' Export given file to the given staging directory
'
' @method ExportTo
' @param {String} Info json value for file and staging
' @param {String} Info.file absolute file path to document to export
' @param {String} Info.staging absolute path to "staging" directory to export to
' @return {String} json result value
''
Public Function ExportTo(Info As Variant) As String
    On Error GoTo ErrorHandling

    Dim Values As Dictionary
    Dim Staging As String
    Dim Document As Object
    Dim App As New OfficeApplication

    Set Values = JsonConverter.ParseJson(Info)
    Set Document = App.GetDocument(Values("file"))
    Staging = Values("staging")

    ' Iterate through all components in document and export directly to staging
    Dim Component As Object ' VBComponent
    Dim Path As String
    For Each Component In Document.VBProject.VBComponents
        Dim Extension As String
        Select Case Component.Type
        Case vbext_ct_StdModule
            Extension = ".bas"
        Case vbext_ct_ClassModule, vbext_ct_Document
            Extension = ".cls"
        Case vbext_ct_MSForm
            Extension = ".frm"
        Case Else
            ' The only other component type for Excel is vbext_ct_ActiveXDesigner = 11
            ' I'm not sure when this could occur, so just warn for now
            Output.Warnings.Add "Unknown component type: " & Component.Type
        End Select

        ' Avoid exporting built-in modules / classes that are blank
        ' User-added modules / classes that are blank are assumed to be intentional
        If Extension <> "" And Not (Component.Type = vbext_ct_Document And ComponentIsBlank(Component)) Then
            Path = FileSystem.JoinPath(Staging, Component.Name & Extension)
            Installer.Export Document.VBProject, Component.Name, Path, Overwrite:=True
        End If
    Next Component
    
    ' For "indirect" values (VBA project name and references)
    ' export to project.json for post-processing by vba-blocks
    Dim Project As New Dictionary
    
    Project("name") = Document.VBProject.Name
    Set Project("references") = New Collection
    
    Dim Ref As Object ' Reference
    Dim RefInfo As Dictionary
    For Each Ref In Document.VBProject.References
        If Not Ref.BuiltIn Then
            Set RefInfo = New Dictionary
            RefInfo("name") = Ref.Name
            RefInfo("version") = Ref.Major & "." & Ref.Minor
            RefInfo("guid") = Ref.Guid
            RefInfo("major") = Ref.Major
            RefInfo("minor") = Ref.Minor
        
            Project("references").Add RefInfo
        End If
    Next Ref
    
    Dim ProjectPath As String
    Dim ProjectJson As String
    
    ProjectPath = FileSystem.JoinPath(Staging, "project.json")
    ProjectJson = JsonConverter.ConvertToJson(Project)
    
    Open ProjectPath For Output As #1
    Print #1, ProjectJson
    Close #1

    ExportTo = Output.Result
    Exit Function

ErrorHandling:

    Output.Errors.Add Err.Number & ": " & Err.Description
    ExportTo = Output.Result
End Function

''
' Create a blank document at path
'
' @method CreateDocument
' @param {String} Info
' @param {String} Info.path
' @return {String} json result value
''
Public Function CreateDocument(Info As Variant) As String
    On Error GoTo ErrorHandling

    Dim Values As Dictionary
    Dim DocumentPath As String
    Dim Document As Object
    Dim App As New OfficeApplication

    Set Values = JsonConverter.ParseJson(Info)
    App.CreateDocument Values("path")

    CreateDocument = Output.Result
    Exit Function

ErrorHandling:

    Output.Errors.Add Err.Number & ": " & Err.Description
    CreateDocument = Output.Result
End Function

Private Function ComponentIsBlank(Component As Object) As Boolean
    Dim LineNumber As Long
    Dim Line As String
    
    For LineNumber = 1 To Component.CodeModule.CountOfLines
        Line = Component.CodeModule.Lines(LineNumber, 1)
        If Not (Line = "Option Explicit" Or Line = "") Then
            ComponentIsBlank = False
            Exit Function
        End If
    Next LineNumber

    ComponentIsBlank = True
End Function
