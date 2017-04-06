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
' 10104 - Failed to import component
' 10105 - Existing component file found
' 10106 - No matching component
' 10107 - Failed to export module
' 10108 - Failed to remove module
'
' @module Installer
' @author tim.hall.engr@gmail.com
' @license MIT (http://www.opensource.org/licenses/mit-license.php)
'' ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ '

' --------------------------------------------- '
' Constants and Private Variables
' --------------------------------------------- '

' ============================================= '
' Public Methods
' ============================================= '

Public Sub Import(Project As VBProject, ComponentName As String, FullPath As String, Optional Overwrite As Boolean = False)
    If Not VbaIsTrusted(Project) Then
        Err.Raise 10100, "Installer.Import", _
            "VBA Project access is disabled. To enable:" & vbNewLine & _
            vbNewLine & _
            "File > Options > Trust Center > Trust Center Settings" & vbNewLine & _
            "Macro Settings > Developer Macro Settings" & vbNewLine & _
            "Enable ""Trust access to the VBA project object model"""
    End If
    
    If Not VbaIsUnlocked(Project) Then
        Err.Raise 10101, "Installer.Import", _
            "VBA Project is locked. To import in this project, unlock VBA and try again."
    End If
    
    If Not FileSystem.FileExists(FullPath) Then
        Err.Raise 10102, "Installer.Import", _
            "Component file not found. No component file found at path: """ & FullPath & """."
    End If
    
    Dim ExistingComponent As VBComponent
    Set ExistingComponent = GetComponent(Project, ComponentName)
    
    If Not (ExistingComponent Is Nothing) Then
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

    Err.Raise 10104, "Installer.Import", _
        "Failed to import module. " & Err.Number & ": " & Err.Description
End Sub

Public Sub Export(Project As VBProject, ComponentName As String, FullPath As String, Optional Overwrite As Boolean = False)
    If Not VbaIsTrusted(Project) Then
        Err.Raise 10100, "Installer.Export", _
            "VBA Project access is disabled. To enable:" & vbNewLine & _
            vbNewLine & _
            "File > Options > Trust Center > Trust Center Settings" & vbNewLine & _
            "Macro Settings > Developer Macro Settings" & vbNewLine & _
            "Enable ""Trust access to the VBA project object model"""
    End If
    
    If Not VbaIsUnlocked(Project) Then
        Err.Raise 10101, "Installer.Export", _
            "VBA Project is locked. To import in this project, unlock VBA and try again."
    End If
    
    If Not Overwrite And FileSystem.FileExists(FullPath) Then
        Err.Raise 10105, "Installer.Export", _
            "Existing component file found. A file was found at path: """ & FullPath & """. " & _
            "Use `Installer.Export(Project, ComponentName, FullPath, Overwrite:=True)` to overwrite an existing file."""
    End If
    
    Dim Component As VBComponent
    Set Component = GetComponent(Project, ComponentName)
    
    If Component Is Nothing Then
        Error.Raise 10106, "Installer.Export", _
            "No matching component. No component named """ & ComponentName & """ was found in the project."
    End If
    
    On Error GoTo ErrorHandling
    
    Component.Export FullPath
    Exit Sub
    
ErrorHandling:

    Err.Raise 10107, "Installer.Export", _
        "Failed to export module. " & Err.Number & ": " & Err.Description
End Sub

Public Sub Remove(Project As VBProject, ComponentName As String)
    If Not VbaIsTrusted(Project) Then
        Err.Raise 10100, "Installer.Remove", _
            "VBA Project access is disabled. To enable:" & vbNewLine & _
            vbNewLine & _
            "File > Options > Trust Center > Trust Center Settings" & vbNewLine & _
            "Macro Settings > Developer Macro Settings" & vbNewLine & _
            "Enable ""Trust access to the VBA project object model"""
    End If
    
    If Not VbaIsUnlocked(Project) Then
        Err.Raise 10101, "Installer.Remove", _
            "VBA Project is locked. To import in this project, unlock VBA and try again."
    End If
    
    Dim Component As VBComponent
    Set Component = GetComponent(Project, ComponentName)
    
    If Component Is Nothing Then
        Error.Raise 10106, "Installer.Remove", _
            "No matching component. No component named """ & ComponentName & """ was found in the project."
    End If
    
    On Error GoTo ErrorHandling
    
    Project.VBComponents.Remove Component
    Exit Sub
    
ErrorHandling:

    Error.Raise 10108, "Installer.Remove", _
        "Failed to remove module. " & Err.Number & ": " & Err.Description
End Sub

Public Function HasComponent(Project As VBProject, ComponentName As String) As Boolean
    If Not (GetComponent(Project, ComponentName) Is Nothing) Then
        HasComponent = True
    End If
End Function

' ============================================= '
' Private Methods
' ============================================= '

Private Function GetComponent(Project As VBProject, ComponentName As String) As VBComponent
    On Error Resume Next
    Set GetComponent = Project.VBComponents(ComponentName)
    
    On Error GoTo 0
End Function

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
