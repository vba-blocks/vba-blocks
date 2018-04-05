Attribute VB_Name = "FileSystem"
''
' VBA-FileSystem v0.0.0
' (c) Tim Hall - https://github.com/VBA-tools/VBA-FileSystem
'
' FileSystem helpers for VBA
'
' @module FileSystem
' @author tim.hall.engr@gmail.com
' @license MIT (http://www.opensource.org/licenses/mit-license.php)
'' ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ '

Public Property Get Separator()
    Separator = Application.PathSeparator
End Property

''
' @method FileExists
' @param {String} FilePath
' @returns {Boolean}
''
Public Function FileExists(FilePath As String) As Boolean
    ' TODO Handle Mac truncation (without MacScript)
    FileExists = VBA.Dir(FilePath) <> ""
End Function

''
' @method DeleteFile
' @param {String} FilePath
''
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
' GetExtension("a\b\c\d.xlsm") -> ".xlsm"
' GetExtension("a.") -> "."
' GetExtension("a") -> ""
' GetExtension(".a") -> ""
'
' @method GetExtension
' @param {String} FilePath
' @returns {String}
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
' GetBase("a\b\c\d.xlsm") -> "d.xlsm"
'
' @method GetBase
' @param {String} FilePath
' @returns {String}
''
Public Function GetBase(FilePath As String) As String
    Dim Parts() As String
    Parts = VBA.Split(NormalizePath(FilePath), Separator)
    
    If UBound(Parts) = 0 Then
        GetBase = ""
    Else
        GetBase = Parts(UBound(Parts))
    End If
End Function

''
' GetDir("a\b\c\d.xlsm") -> "a\b\c"
'
' @method GetDir
' @param {String} FilePath
' @returns {String}
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
'
' @method NormalizePath
' @param {String} FilePath
' @returns {String}
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
' Join path parts with separator
'
' @method JoinPath
' @returns {String}
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
