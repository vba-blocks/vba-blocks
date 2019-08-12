Attribute VB_Name = "Validation"
Public Function Validate() As String
    On Error GoTo ErrorHandling

    Dim Errors As New Collection

    If ThisWorkbook.VBProject.VBComponents.Count <> 8 Then
        Errors.Add "Found " & ThisWorkbook.VBProject.VBComponents.Count & " components (expected 8)"
    End If

    Dim ComponentNames() As Variant
    Dim Components() As Variant
    Dim Index As Long
    Dim Component As Object

    ComponentNames = Array("Sheet1", "Sheet2", "Sheet3", "ThisWorkbook", "Class1")
    Components = Array(Sheet1, Sheet2, Sheet3, ThisWorkbook, New Class1)

    For Index = 0 To UBound(Components)
        Set Component = Components(Index)

        If Not Component.IsValid Then
            Errors.Add "Component """ & ComponentNames(Index) & """ is not valid"
        End If
    Next Index

    Dim References As New Collection
    Dim Reference As Object
    For Each Reference In ThisWorkbook.VBProject.References
        If Not Reference.BuiltIn And Reference.Name <> "stdole" And Reference.Name <> "Office" And Reference.Name <> "MSForms" Then
            References.Add Reference
        End If
    Next Reference

    If References.Count <> 1 Then
        Errors.Add "Found " & References.Count & " reference(s) (expected 1)"
    End If

    If References(1).Name <> "VBIDE" Then
        Errors.Add "Expected reference to be ""VBIDE"" (found """ & References(1).Name & """)"
    End If

    If Errors.Count = 0 Then
        Validate = "{""success"":true,""errors"":[]}"
        Exit Function
    End If

ErrorHandling:

    If Err.Number <> 0 Then
        Errors.Add Err.Description
    End If

    Validate = "{""success"":false,""errors"":[""" & JoinCollection(Errors, """,""") & """]}"
End Function

Private Function JoinCollection(Values As Collection, Optional Separator = ",") As String
    Dim Result As String
    Dim Value As Variant

    For Each Value In Values
        If Result <> "" Then
            Result = Result & Separator
        End If

        Result = Result & Value
    Next Value

    JoinCollection = Result
End Function
