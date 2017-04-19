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

' --------------------------------------------- '
' Constants and Private Variables
' --------------------------------------------- '

' ============================================= '
' Public Methods
' ============================================= '

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
