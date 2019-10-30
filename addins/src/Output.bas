Attribute VB_Name = "Output"
''
' # Output
'
' Standard result stdout
'
' @module Output
' @author Tim Hall <tim.hall.engr@gmail.com>
' @repository https://github.com/vba-blocks/vba-blocks
' @license MIT
'' ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ '

Public Messages As New Collection
Public Warnings As New Collection
Public Errors As New Collection

Public Property Get Result() As String
    Dim Parts As New Dictionary
    Parts.Add "messages", Messages
    Parts.Add "warnings", Warnings
    Parts.Add "errors", Errors
    Parts.Add "success", Errors.Count = 0

    Result = JsonConverter.ConvertToJson(Parts)
End Property
