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

Public Function FileExists(FilePath As String) As Boolean
    ' TODO Handle Mac truncation (without MacScript)
    On Error Resume Next

    If VBA.Len(VBA.Dir(FilePath)) <> 0 Then
        FileExists = True
    End If
End Function
