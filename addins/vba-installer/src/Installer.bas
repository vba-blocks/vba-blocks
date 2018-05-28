Attribute VB_Name = "Installer"
''
' VBA-Installer v0.0.0
' (c) Tim Hall - https://github.com/vba-blocks/vba-blocks
'
' Installer for VBA
'
' Errors:
' 10100 - VBA Project access is disabled
' 10101 - VBA Project is locked
' 10102 - Component file not found
' 10103 - Existing component found
' 10104 - Existing component file found
' 10105 - No matching component
' 10106 - Failed to import component
' 10107 - Failed to export module
' 10108 - Failed to remove module
' 10109 - Failed to add reference
' 10110 - Failed to remove reference
'
' @module Installer
' @author tim.hall.engr@gmail.com
' @license MIT (http://www.opensource.org/licenses/mit-license.php)
'' ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ '

' TODO Add reference to VBIDE for proper typing of VBProject and friends

' --------------------------------------------- '
' Constants and Private Variables
' --------------------------------------------- '

' ============================================= '
' Public Methods
' ============================================= '

''
' @method Import
' @param {VBProject} Project
' @param {String} ComponentName
' @param {String} FullPath
' @param {Boolean} [Overwrite = False]
''
Public Sub Import(Project As Object, ComponentName As String, FullPath As String, Optional Overwrite As Boolean = False)
    Precheck Project

    If Not FileSystem.FileExists(FullPath) Then
        Err.Raise 10102, "Installer.Import", _
            "Component file not found. No component file found at path: """ & FullPath & """."
    End If

    Dim ExistingComponent As Object ' VBComponent
    Set ExistingComponent = GetComponent(Project, ComponentName)

    If Not ExistingComponent Is Nothing Then
        If Not Overwrite Then
            Err.Raise 10103, "Installer.Import", _
                "Existing component found. A module with the name """ & ModuleName & """ is already part of the project. " & _
                "Use `Installer.Import(Project, ComponentName, FullPath, Overwrite:=True)` to overwrite an existing module."
        Else
            Remove Project, ComponentName
        End If
    End If

    On Error GoTo ErrorHandling

    Project.VBComponents.Import FullPath
    Exit Sub

ErrorHandling:

    Err.Raise 10106, "Installer.Import", _
        "Failed to import module. " & Err.Number & ": " & Err.Description
End Sub

''
' @method Export
' @param {VBProject} Project
' @param {String} ComponentName
' @param {String} FullPath
' @param {Boolean} [Overwrite = False]
''
Public Sub Export(Project As Object, ComponentName As String, FullPath As String, Optional Overwrite As Boolean = False)
    Precheck Project

    If Not Overwrite And FileSystem.FileExists(FullPath) Then
        Err.Raise 10104, "Installer.Export", _
            "Existing component file found. A file was found at path: """ & FullPath & """. " & _
            "Use `Installer.Export(Project, ComponentName, FullPath, Overwrite:=True)` to overwrite an existing file."""
    End If

    Dim Component As Object ' VBComponent
    Set Component = GetComponent(Project, ComponentName)

    If Component Is Nothing Then
        Err.Raise 10105, "Installer.Export", _
            "No matching component. No component named """ & ComponentName & """ was found in the project."
    End If

    On Error GoTo ErrorHandling

    Component.Export FullPath
    Exit Sub

ErrorHandling:

    Err.Raise 10107, "Installer.Export", _
        "Failed to export module. " & Err.Number & ": " & Err.Description
End Sub

''
' @method Remove
' @param {VBProject} Project
' @param {String} ComponentName
''
Public Sub Remove(Project As Object, ComponentName As String)
    Precheck Project

    Dim Component As Object ' VBComponent
    Set Component = GetComponent(Project, ComponentName)

    If Component Is Nothing Then
        Exit Sub
    End If

    On Error GoTo ErrorHandling

    Project.VBComponents.Remove Component
    Exit Sub

ErrorHandling:

    Err.Raise 10108, "Installer.Remove", _
        "Failed to remove module. " & Err.Number & ": " & Err.Description
End Sub

''
' @method AddRefererence
' @param {VBProject} Project
' @param {String} Guid
' @param {Long} MajorVersion
' @param {Long} MinorVersion
''
Public Sub AddReference(Project As Object, Guid As String, MajorVersion As Long, MinorVersion As Long)
    Precheck Project

    If Not GetReference(Project, Guid, MajorVersion, MinorVersion) Is Nothing Then
        Exit Sub
    End If

    On Error GoTo ErrorHandling

    Project.References.AddFromGuid Guid, MajorVersion, MinorVersion
    Exit Sub

ErrorHandling:

    Err.Raise 10109, "Installer.AddReference", _
        "Failed to add reference. " & Err.Number & ": " & Err.Description
End Sub

''
' @method RemoveReference
' @param {VBProject} Project
' @param {String} Guid
' @param {Long} MajorVersion
' @param {Long} MinorVersion
''
Public Sub RemoveReference(Project As Object, Guid As String, MajorVersion As Long, MinorVersion As Long)
    Precheck Project

    Dim ExistingReference As Object ' Reference
    Set ExistingReference = GetReference(Project, Guid, MajorVersion, MinorVersion)

    If ExistingReference Is Nothing Then
        Exit Sub
    End If

    On Error GoTo ErrorHandling

    Project.References.Remove ExistingReference
    Exit Sub

ErrorHandling:

    Err.Raise 10110, "Installer.RemoveReference", _
        "Failed to remove reference. " & Err.Number & ": " & Err.Description
End Sub

' ============================================= '
' Private Methods
' ============================================= '

' (VBProject, String) => VBComponent
Private Function GetComponent(Project As Object, ComponentName As String) As Object
    On Error Resume Next
    Set GetComponent = Project.VBComponents(ComponentName)

    On Error GoTo 0
End Function

' (VBProject, String, Long, Long) => Reference
Private Function GetReference(Project As Object, Guid As String, MajorVersion As Long, MinorVersion As Long) As Object
    Dim Ref As Object ' Reference
    For Each Ref In Project.References
        If Ref.Guid = Guid And Ref.Major = MajorVersion And Ref.Minor = MinorVersion Then
            Set GetReference = Ref
        End If
    Next Ref
End Function

' (VBProject)
Private Sub Precheck(Project As Object)
    If Not VbaIsTrusted(Project) Then
        Err.Raise 10100, "Installer", _
            "VBA Project access is disabled. To enable:" & vbNewLine & _
            vbNewLine & _
            "File > Options > Trust Center > Trust Center Settings" & vbNewLine & _
            "Macro Settings > Developer Macro Settings" & vbNewLine & _
            "Enable ""Trust access to the VBA project object model"""
    End If

    If Not VbaIsUnlocked(Project) Then
        Err.Raise 10101, "Installer", _
            "VBA Project is locked. To import in this project, unlock VBA and try again."
    End If
End Sub

' (VBProject)
Private Function VbaIsUnlocked(Project As Object) As Boolean
    ' 0 = vbext_ProjectProtection.vbext_pp_none
    If Project.Protection = 0 Then
        VbaIsUnlocked = True
    End If
End Function

' (VBProject)
Private Function VbaIsTrusted(Project As Object) As Boolean
    On Error Resume Next

    Dim ComponentCount As Long
    ComponentCount = Project.VBComponents.Count

    If Err.Number <> 0 Then
        Err.Clear
        On Error GoTo 0

        VbaIsTrusted = False
    Else
        VbaIsTrusted = True
    End If
End Function
