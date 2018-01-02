Attribute VB_Name = "Build"
Public Function ImportGraph(Info As Variant) As String
    Dim Messages As New Collection
    Dim Warnings As New Collection
    Dim Errors As New Collection
    
    Dim Result As New Dictionary
    Result("success") = True
    Result.Add "messages", Messages
    Result.Add "warnings", Warnings
    Result.Add "errors", Errors

    ImportGraph = JsonConverter.ConvertToJson(Result)
End Function
