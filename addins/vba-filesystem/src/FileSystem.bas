Attribute VB_Name = "FileSystem"
''
' # FileSystem
'
' FileSystem helpers for VBA
'
' @module FileSystem
' @author Tim Hall <tim.hall.engr@gmail.com>
' @repository https://github.com/vba-blocks/vba-blocks
' @license MIT
'' ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ '

Public Property Get Separator()
    Separator = Application.PathSeparator
End Property

Public Function FileExists(FilePath As String) As Boolean
    ' TODO Handle Mac truncation (without MacScript)
    FileExists = VBA.Dir(FilePath) <> ""
End Function

Public Sub DeleteFile(FilePath As String)
    If FileExists(FilePath) Then
        VBA.SetAttr FilePath, vbNormal
        VBA.Kill FilePath
    End If
End Sub

' --------------------------------------------- '
' Path Helpers
' --------------------------------------------- '

''
' ```vb
' GetExtension("a\b\c\d.xlsm") ' -> ".xlsm"
' GetExtension("a.") ' -> "."
' GetExtension("a") ' -> ""
' GetExtension(".a") ' -> ""
' ```
''
Public Function GetExtension(FilePath As String) As String
    Dim Parts() As String
    Parts = VBA.Split(GetBase(FilePath), ".")

    If UBound(Parts) = 0 Then
        GetExtension = ""
    ElseIf Parts(LBound(Parts)) = "" Then
        GetExtension = ""
    Else
        GetExtension = "." & Parts(UBound(Parts))
    End If
End Function

''
' ```vb
' GetBase("a\b\c\d.xlsm") -> "d.xlsm"
' ```
''
Public Function GetBase(FilePath As String) As String
    Dim Parts() As String
    Parts = VBA.Split(NormalizePath(FilePath), Separator)
    GetBase = Parts(UBound(Parts))
End Function

''
' ```vb
' GetDir("a\b\c\d.xlsm") -> "a\b\c"
' ```
''
Public Function GetDir(FilePath As String) As String
    Dim Parts() As String
    Parts = VBA.Split(NormalizePath(FilePath), Separator)

    If UBound(Parts) = 0 Then
        GetDir = ""
    Else
        ReDim Preserve Parts(UBound(Parts) - 1)
        GetDir = VBA.Join(Parts, Separator)
    End If
End Function

''
' Normalize path separators to current OS
''
Public Function NormalizePath(FilePath As String) As String
    If FilePath = "" Then
        NormalizePath = FilePath
        Exit Function
    End If

    ' Replace "\", ":", and "/" with OS separator
    NormalizePath = VBA.Replace(FilePath, ":\", "[DRIVE]")
    NormalizePath = VBA.Replace(NormalizePath, ":/", "[DRIVE]")
    NormalizePath = VBA.Replace(NormalizePath, "\", "[SEP]")
    NormalizePath = VBA.Replace(NormalizePath, ":", "[SEP]")
    NormalizePath = VBA.Replace(NormalizePath, "/", "[SEP]")
    NormalizePath = VBA.Replace(NormalizePath, "[DRIVE]", ":\")

    ' Remove empty sections
    Dim Parts() As String
    Dim i As Long
    Parts = VBA.Split(NormalizePath, "[SEP]")

    NormalizePath = Parts(0)
    For i = 1 To UBound(Parts)
        If Parts(i) <> "" Then
            NormalizePath = NormalizePath & Separator & Parts(i)
        End If
    Next i
End Function

''
' Join path parts with OS separator
''
Public Function JoinPath(ParamArray Parts()) As String
    Dim Path As String
    Path = Parts(LBound(Parts))

    Dim i As Long
    For i = LBound(Parts) + 1 To UBound(Parts)
        Path = Path & Separator & Parts(i)
    Next i

    JoinPath = NormalizePath(Path)
End Function
