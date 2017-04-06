Attribute VB_Name = "Specs"
Public Function Specs() As SpecSuite
    Set Specs = New SpecSuite
    Specs.Description = "VBA-Installer"
    
    Dim Reporter As New ImmediateReporter
    Reporter.ListenTo Specs
    
    Dim Fixture As New InstallerFixture
    Fixture.ListenTo Specs
    
    Dim Project As VBProject
    Set Project = ThisWorkbook.VBProject
    
    With Specs.It("should find existing component")
        .Expect(Installer.HasComponent(Project, "Installer")).ToEqual True
    End With
    
    With Specs.It("should not find non-existent component")
        .Expect(Installer.HasComponent(Project, "nonexistent")).ToEqual False
    End With
    
    With Specs.It("should import component")
        .Expect(Installer.HasComponent(Project, "SpecModule")).ToEqual False
        
        Installer.Import Project, "SpecModule", Fixture.ModulePath
        
        .Expect(Installer.HasComponent(Project, "SpecModule")).ToEqual True
    End With
    
    With Specs.It("should throw 10102 when importing if component file not found")
        On Error Resume Next
        Installer.Import Project, "SpecModule", ThisWorkbook.Path & Application.PathSeparator & "nonexistent.bas"
        .Expect(Err.Number).ToEqual 10102
        
        Err.Clear
        On Error GoTo 0
    End With
    
    With Specs.It("should throw 10103 when importing if component exists")
        Installer.Import Project, "SpecModule", Fixture.ModulePath
        .Expect(Installer.HasComponent(Project, "SpecModule")).ToEqual True
        
        On Error Resume Next
        Installer.Import Project, "SpecModule", Fixture.ModulePath
        .Expect(Err.Number).ToEqual 10103
        
        Err.Clear
        On Error GoTo 0
    End With
    
    With Specs.It("should overwrite existing when importing for Overwrite:=True")
        Installer.Import Project, "SpecModule", Fixture.ModulePath
        .Expect(Installer.HasComponent(Project, "SpecModule")).ToEqual True
        
        On Error Resume Next
        Installer.Import Project, "SpecModule", Fixture.ModulePath, Overwrite:=True
        .Expect(Err.Number).ToEqual 0
        
        Err.Clear
        On Error GoTo 0
    End With
End Function

Public Sub RunSpecs()
    Dim Reporter As New WorkbookReporter
    Reporter.ConnectTo SpecRunner

    Reporter.Start NumSuites:=1
    Reporter.Output Specs

    Reporter.Done
End Sub

