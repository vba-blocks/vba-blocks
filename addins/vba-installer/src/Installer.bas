Attribute VB_Name = "Installer"
''
' # Installer
'
' Install and export modules, classes, forms, and references for VBA
'
' ## Errors
'
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
' 10111 - Component imported with errors
'
' @module Installer
' @author Tim Hall <tim.hall.engr@gmail.com>
' @repository https://github.com/vba-blocks/vba-blocks
' @license MIT
'' ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ '

''
' Import component (class, module, or form) with given name from path into project
'
' ```vb
' Dim ImportPath As String
' ImportPath = ".../ModuleName.bas"
'
' Installer.Import ThisWorkbook.Project, "ModuleName", ImportPath
' ```
''
Public Sub Import(Project As VBProject, ComponentName As String, FullPath As String, Optional Overwrite As Boolean = False)
    Precheck Project

    If Not FileSystem.FileExists(FullPath) Then
        Err.Raise 10102 + &H30000 + vbObjectError, "Installer.Import", _
            "[10102] Component file not found. No component file found at path: """ & FullPath & """."
    End If

    Dim ExistingComponent As VBComponent
    Set ExistingComponent = GetComponent(Project, ComponentName)

    If Not ExistingComponent Is Nothing Then
        If Not Overwrite Then
            Err.Raise 10103 + &H30000 + vbObjectError, "Installer.Import", _
                "[10103] Existing component found. A module with the name """ & ModuleName & """ is already part of the project. " & _
                "Use `Installer.Import(Project, ComponentName, FullPath, Overwrite:=True)` to overwrite an existing module."
        Else
            If ExistingComponent.Type = vbext_ComponentType.vbext_ct_Document Then
                ' For ThisWorkbook and Sheets, can't remove and then import
                ' Instead, overwrite with imported module
                Dim ImportedComponent As Object
                Set ImportedComponent = Project.VBComponents.Import(FullPath)

                ExistingComponent.CodeModule.DeleteLines 1, ExistingComponent.CodeModule.CountOfLines
                If ImportedComponent.CodeModule.CountOfLines > 0 Then
                    ExistingComponent.CodeModule.AddFromString ImportedComponent.CodeModule.Lines(1, ImportedComponent.CodeModule.CountOfLines)
                End If

                Project.VBComponents.Remove ImportedComponent
                Exit Sub
            End If

            Remove Project, ComponentName
        End If
    End If

    On Error GoTo ErrorHandling

    Project.VBComponents.Import FullPath

    On Error Resume Next

    ' Verify component imported correctly
    Set ExistingComponent = GetComponent(Project, ComponentName)
    If ExistingComponent Is Nothing Or ExistingComponent.CodeModule Is Nothing Then
        Err.Raise 10111 + &H30000 + vbObjectError, "Installer.Import", "[10111] Module """ & ComponentName & """ was imported, but has errors."
    End If

    Exit Sub

ErrorHandling:

    Err.Raise 10106 + &H30000 + vbObjectError, "Installer.Import", _
        "[10106] Failed to import module """ & ComponentName & """. " & Err.Number & ": " & Err.Description
End Sub

''
' Export named component from project to given path
'
' ```vb
' Dim ExportPath As String
' ExportPath = ".../ClassName.cls"
'
' Installer.Export ThisWorkbook.Project, "ClassName", ExportPath
' ```
''
Public Sub Export(Project As VBProject, ComponentName As String, FullPath As String, Optional Overwrite As Boolean = False)
    Precheck Project

    If Not Overwrite And FileSystem.FileExists(FullPath) Then
        Err.Raise 10104 + &H30000 + vbObjectError, "Installer.Export", _
            "[10104] Existing component file found. A file was found at path: """ & FullPath & """. " & _
            "Use `Installer.Export(Project, ComponentName, FullPath, Overwrite:=True)` to overwrite an existing file."""
    End If

    Dim Component As VBComponent
    Set Component = GetComponent(Project, ComponentName)

    If Component Is Nothing Then
        Err.Raise 10105 + &H30000 + vbObjectError, "Installer.Export", _
            "[10105] No matching component. No component named """ & ComponentName & """ was found in the project."
    End If

    On Error GoTo ErrorHandling

    Component.Export FullPath
    Exit Sub

ErrorHandling:

    Err.Raise 10107 + &H30000 + vbObjectError, "Installer.Export", _
        "[10107] Failed to export module. " & Err.Number & ": " & Err.Description
End Sub

''
' Remove named component from project
'
' ```vb
' Installer.Remove ThisWorkbook.Project, "FormName"
' ```
''
Public Sub Remove(Project As VBProject, ComponentName As String)
    Precheck Project

    Dim Component As VBComponent
    Set Component = GetComponent(Project, ComponentName)

    If Component Is Nothing Then
        Exit Sub
    End If

    On Error GoTo ErrorHandling

    Project.VBComponents.Remove Component
    Exit Sub

ErrorHandling:

    Err.Raise 10108 + &H30000 + vbObjectError, "Installer.Remove", _
        "[10108] Failed to remove module. " & Err.Number & ": " & Err.Description
End Sub

''
' Add reference to project from guid, major version, and minor version
'
' ```vb
' ' Add VBIDE
' Installer.AddReference ThisWorkbook.Project, "{0002E157-0000-0000-C000-000000000046}", 5, 3
' ```
''
Public Sub AddReference(Project As VBProject, Guid As String, MajorVersion As Long, MinorVersion As Long)
    Precheck Project

    If Not GetReference(Project, Guid, MajorVersion, MinorVersion) Is Nothing Then
        Exit Sub
    End If

    On Error GoTo ErrorHandling

    Project.References.AddFromGuid Guid, MajorVersion, MinorVersion
    Exit Sub

ErrorHandling:

    Err.Raise 10109 + &H30000 + vbObjectError, "Installer.AddReference", _
        "[10109] Failed to add reference. " & Err.Number & ": " & Err.Description
End Sub

''
' Remove reference from project from guid, major version, and minor version
'
' ```vb
' ' Remove VBIDE
' Installer.RemoveReference ThisWorkbook.Project, "{0002E157-0000-0000-C000-000000000046}", 5, 3
' ```
''
Public Sub RemoveReference(Project As VBProject, Guid As String, MajorVersion As Long, MinorVersion As Long)
    Precheck Project

    Dim ExistingReference As Reference
    Set ExistingReference = GetReference(Project, Guid, MajorVersion, MinorVersion)

    If ExistingReference Is Nothing Then
        Exit Sub
    End If

    On Error GoTo ErrorHandling

    Project.References.Remove ExistingReference
    Exit Sub

ErrorHandling:

    Err.Raise 10110 + &H30000 + vbObjectError, "Installer.RemoveReference", _
        "[10110] Failed to remove reference. " & Err.Number & ": " & Err.Description
End Sub

' ============================================= '

Private Function GetComponent(Project As VBProject, ComponentName As String) As VBComponent
    On Error Resume Next
    Set GetComponent = Project.VBComponents(ComponentName)

    On Error GoTo 0
End Function

Private Function GetReference(Project As VBProject, Guid As String, MajorVersion As Long, MinorVersion As Long) As Reference
    Dim Ref As Reference
    For Each Ref In Project.References
        If Ref.Guid = Guid And Ref.Major = MajorVersion And Ref.Minor = MinorVersion Then
            Set GetReference = Ref
        End If
    Next Ref
End Function

Private Sub Precheck(Project As VBProject)
    If Not VbaIsTrusted(Project) Then
        Err.Raise 10100 + &H30000 + vbObjectError, "Installer", _
            "[10100] VBA Project access is disabled. To enable:" & vbNewLine & _
            vbNewLine & _
            "File > Options > Trust Center > Trust Center Settings" & vbNewLine & _
            "Macro Settings > Developer Macro Settings" & vbNewLine & _
            "Enable ""Trust access to the VBA project object model"""
    End If

    If Not VbaIsUnlocked(Project) Then
        Err.Raise 10101, "Installer", _
            "[10101] VBA Project is locked. To import in this project, unlock VBA and try again."
    End If
End Sub

Private Function VbaIsUnlocked(Project As VBProject) As Boolean
    If Project.Protection = vbext_ProjectProtection.vbext_pp_none Then
        VbaIsUnlocked = True
    End If
End Function

Private Function VbaIsTrusted(Project As VBProject) As Boolean
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
