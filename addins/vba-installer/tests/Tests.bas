Attribute VB_Name = "Tests"
Public Function Run(Optional OutputPath As Variant)
    Dim Suite As New TestSuite
    Suite.Description = "vba-installer"

    Dim Immediate As New ImmediateReporter
    Immediate.ListenTo Suite

    If Not IsMissing(OutputPath) And CStr(OutputPath) <> "" Then
        Dim Reporter As New FileReporter
        Reporter.WriteTo OutputPath
        Reporter.ListenTo Suite
    End If

    Dim Fixture As New InstallerFixture
    Fixture.ListenTo Suite

    With Suite.Test("should import component")
        .IsEqual Fixture.HasComponent(Fixture.ImportName), False

        Installer.Import Fixture.Project, Fixture.ImportName, Fixture.ImportPath
        .IsEqual Fixture.HasComponent(Fixture.ImportName), True
    End With

    With Suite.Test("should throw 10102 when importing if component file not found")
        On Error Resume Next

        Installer.Import Fixture.Project, Fixture.ImportName, Fixture.GetFullPath("NonExistent.bas")
        .IsEqual Err.Number, 10102 + &H30000 + vbObjectError

        Err.Clear
        On Error GoTo 0
    End With

    With Suite.Test("should throw 10103 when importing if component exists")
        Installer.Import Fixture.Project, Fixture.ImportName, Fixture.ImportPath
        .IsEqual Fixture.HasComponent(Fixture.ImportName), True

        On Error Resume Next
        Installer.Import Fixture.Project, Fixture.ImportName, Fixture.ImportPath
        .IsEqual Err.Number, 10103 + &H30000 + vbObjectError

        Err.Clear
        On Error GoTo 0
    End With

    With Suite.Test("should overwrite existing when importing for Overwrite:=True")
        Installer.Import Fixture.Project, Fixture.ImportName, Fixture.ImportPath
        .IsEqual Fixture.HasComponent(Fixture.ImportName), True

        On Error Resume Next
        Installer.Import Fixture.Project, Fixture.ImportName, Fixture.ImportPath, Overwrite:=True
        .IsEqual Err.Number, 0

        Err.Clear
        On Error GoTo 0
    End With

    With Suite.Test("should export component")
        Installer.Import Fixture.Project, Fixture.ImportName, Fixture.ImportPath

        Installer.Export Fixture.Project, Fixture.ImportName, Fixture.ExportPath
        .IsEqual FileSystem.FileExists(Fixture.ExportPath), True

        FileSystem.DeleteFile Fixture.ExportPath
    End With

    With Suite.Test("should throw 10104 when exporting if file exists")
        Installer.Import Fixture.Project, Fixture.ImportName, Fixture.ImportPath

        Installer.Export Fixture.Project, Fixture.ImportName, Fixture.ExportPath
        .IsEqual FileSystem.FileExists(Fixture.ExportPath), True

        On Error Resume Next
        Installer.Export Fixture.Project, Fixture.ImportName, Fixture.ExportPath
        .IsEqual Err.Number, 10104 + &H30000 + vbObjectError

        Err.Clear
        On Error GoTo 0

        FileSystem.DeleteFile Fixture.ExportPath
    End With

    With Suite.Test("should throw 10105 when exporting if component not found")
        On Error Resume Next
        Installer.Export Fixture.Project, "NonExistent", Fixture.ExportPath
        .IsEqual Err.Number, 10105 + &H30000 + vbObjectError

        Err.Clear
        On Error GoTo 0
    End With

    With Suite.Test("should overwrite existing when exporting for Overwrite:=True")
        Installer.Import Fixture.Project, Fixture.ImportName, Fixture.ImportPath

        Installer.Export Fixture.Project, Fixture.ImportName, Fixture.ExportPath
        .IsEqual FileSystem.FileExists(Fixture.ExportPath), True

        On Error Resume Next
        Installer.Export Fixture.Project, Fixture.ImportName, Fixture.ExportPath, Overwrite:=True
        .IsEqual Err.Number, 0

        Err.Clear
        On Error GoTo 0

        FileSystem.DeleteFile Fixture.ExportPath
    End With

    With Suite.Test("should remove component")
        Installer.Import Fixture.Project, Fixture.ImportName, Fixture.ImportPath
        .IsEqual Fixture.HasComponent(Fixture.ImportName), True

        Installer.Remove Fixture.Project, Fixture.ImportName
        .IsEqual Fixture.HasComponent(Fixture.ImportName), False
    End With
End Function

