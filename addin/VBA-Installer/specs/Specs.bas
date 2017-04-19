Attribute VB_Name = "Specs"
Public Function Specs() As SpecSuite
    Set Specs = New SpecSuite
    Specs.Description = "VBA-Installer"
    
    Dim Reporter As New ImmediateReporter
    Reporter.ListenTo Specs
    
    Dim Fixture As New InstallerFixture
    Fixture.ListenTo Specs
    
    With Specs.It("should import component")
        .Expect(Fixture.HasComponent(Fixture.ImportName)).ToEqual False
        
        Installer.Import Fixture.Project, Fixture.ImportName, Fixture.ImportPath
        .Expect(Fixture.HasComponent(Fixture.ImportName)).ToEqual True
    End With
    
    With Specs.It("should throw 10102 when importing if component file not found")
        On Error Resume Next
        
        Installer.Import Fixture.Project, Fixture.ImportName, Fixture.GetFullPath("NonExistent.bas")
        .Expect(Err.Number).ToEqual 10102
        
        Err.Clear
        On Error GoTo 0
    End With
    
    With Specs.It("should throw 10103 when importing if component exists")
        Installer.Import Fixture.Project, Fixture.ImportName, Fixture.ImportPath
        .Expect(Fixture.HasComponent(Fixture.ImportName)).ToEqual True
        
        On Error Resume Next
        Installer.Import Fixture.Project, Fixture.ImportName, Fixture.ImportPath
        .Expect(Err.Number).ToEqual 10103
        
        Err.Clear
        On Error GoTo 0
    End With
    
    With Specs.It("should overwrite existing when importing for Overwrite:=True")
        Installer.Import Fixture.Project, Fixture.ImportName, Fixture.ImportPath
        .Expect(Fixture.HasComponent(Fixture.ImportName)).ToEqual True
        
        On Error Resume Next
        Installer.Import Fixture.Project, Fixture.ImportName, Fixture.ImportPath, Overwrite:=True
        .Expect(Err.Number).ToEqual 0
        
        Err.Clear
        On Error GoTo 0
    End With
    
    With Specs.It("should export component")
        Installer.Import Fixture.Project, Fixture.ImportName, Fixture.ImportPath
        
        Installer.Export Fixture.Project, Fixture.ImportName, Fixture.ExportPath
        .Expect(FileSystem.FileExists(Fixture.ExportPath)).ToEqual True
        
        FileSystem.DeleteFile Fixture.ExportPath
    End With
    
    With Specs.It("should throw 10104 when exporting if file exists")
        Installer.Import Fixture.Project, Fixture.ImportName, Fixture.ImportPath
        
        Installer.Export Fixture.Project, Fixture.ImportName, Fixture.ExportPath
        .Expect(FileSystem.FileExists(Fixture.ExportPath)).ToEqual True
        
        On Error Resume Next
        Installer.Export Fixture.Project, Fixture.ImportName, Fixture.ExportPath
        .Expect(Err.Number).ToEqual 10104
        
        Err.Clear
        On Error GoTo 0
        
        FileSystem.DeleteFile Fixture.ExportPath
    End With
    
    With Specs.It("should throw 10105 when exporting if component not found")
        On Error Resume Next
        Installer.Export Fixture.Project, "NonExistent", Fixture.ExportPath
        .Expect(Err.Number).ToEqual 10105
        
        Err.Clear
        On Error GoTo 0
    End With
    
    With Specs.It("should overwrite existing when exporting for Overwrite:=True")
        Installer.Import Fixture.Project, Fixture.ImportName, Fixture.ImportPath
        
        Installer.Export Fixture.Project, Fixture.ImportName, Fixture.ExportPath
        .Expect(FileSystem.FileExists(Fixture.ExportPath)).ToEqual True
        
        On Error Resume Next
        Installer.Export Fixture.Project, Fixture.ImportName, Fixture.ExportPath, Overwrite:=True
        .Expect(Err.Number).ToEqual 0
        
        Err.Clear
        On Error GoTo 0
        
        FileSystem.DeleteFile Fixture.ExportPath
    End With
    
    With Specs.It("should remove component")
        Installer.Import Fixture.Project, Fixture.ImportName, Fixture.ImportPath
        .Expect(Fixture.HasComponent(Fixture.ImportName)).ToEqual True
        
        Installer.Remove Fixture.Project, Fixture.ImportName
        .Expect(Fixture.HasComponent(Fixture.ImportName)).ToEqual False
    End With
End Function

Public Sub RunSpecs()
    Dim Reporter As New WorkbookReporter
    Reporter.ConnectTo SpecRunner

    Reporter.Start NumSuites:=1
    Reporter.Output Specs

    Reporter.Done
End Sub

