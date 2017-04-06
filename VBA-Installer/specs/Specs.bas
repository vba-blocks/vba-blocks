Attribute VB_Name = "Specs"
Public Function Specs() As SpecSuite
    Set Specs = New SpecSuite
    Specs.Description = "VBA-Installer"
    
    Dim Reporter As New ImmediateReporter
    Reporter.ListenTo Specs
End Function

Public Sub RunSpecs()
    Dim Reporter As New WorkbookReporter
    Reporter.ConnectTo SpecRunner

    Reporter.Start NumSuites:=1
    Reporter.Output Specs

    Reporter.Done
End Sub

