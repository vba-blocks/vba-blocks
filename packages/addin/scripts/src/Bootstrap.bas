Attribute VB_Name = "Bootstrap"
Public Messages As New Collection
Public Warnings As New Collection
Public Errors As New Collection

Private Type VersionParts
    Major As Long
    Minor As Long
End Type

Public Function ImportGraph(Info As Variant) As String
    Dim Result As New Dictionary
    Result.Add "messages", Messages
    Result.Add "warnings", Warnings
    Result.Add "errors", Errors
    
    On Error GoTo ErrorHandling

    Dim Values As Dictionary
    Dim Instance As New Project
    Dim Src As Dictionary
    Dim Ref As Dictionary
    Dim Version As VersionParts

    Set Values = JsonConverter.ParseJson(Info)
    Instance.OpenProject Values("file")
    
    For Each Src In Values("src")
        Installer.Import Instance.Project, Src("name"), Src("path"), Overwrite:=True
    Next Src
    
    For Each Ref In Values("references")
        Version = GetVersionParts(Ref("version"))
        Installer.AddReference Instance.Project, Ref("guid"), Version.Major, Version.Minor
    Next Ref

    Result("success") = True
    ImportGraph = JsonConverter.ConvertToJson(Result)

    Exit Function
    
ErrorHandling:

    Result("success") = False
    Errors.Add Err.Number & ": " & Err.Description
    
    ImportGraph = JsonConverter.ConvertToJson(Result)
End Function

Private Function GetVersionParts(Value As String) As VersionParts
    Dim Parts() As String
    Parts = VBA.Split(Value, ".", 2)
    
    Dim Result As VersionParts
    Result.Major = CLng(Parts(0))
    Result.Minor = CLng(Parts(1))
    
    GetVersionParts = Result
End Function



