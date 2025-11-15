' Original VBA Code from ThisWorkbook
' These macros handle VLOOKUP operations and sheet management

Private Sub GISTR()
    Sheets("Trainer").Range("I5").Value2 = Application.WorksheetFunction.VLookup(Range("I27"), Range("GI_Autofill"), 2, False)
End Sub

Private Sub GICON()
    Sheets("Trainer").Range("I6").Value = Application.WorksheetFunction.VLookup(Range("I28"), Range("GI_Autofill"), 2, False)
End Sub

Private Sub GIDEX()
    Sheets("Trainer").Range("I7").Value = Application.WorksheetFunction.VLookup(Range("I29"), Range("GI_Autofill"), 2, False)
End Sub

Private Sub GIAGI()
    Sheets("Trainer").Range("I8").Value = Application.WorksheetFunction.VLookup(Range("I30"), Range("GI_Autofill"), 2, False)
End Sub

Private Sub GIDIS()
    Sheets("Trainer").Range("I9").Value = Application.WorksheetFunction.VLookup(Range("I31"), Range("GI_Autofill"), 2, False)
End Sub

Private Sub GIAUR()
    Sheets("Trainer").Range("I10").Value = Application.WorksheetFunction.VLookup(Range("I32"), Range("GI_Autofill"), 2, False)
End Sub

Private Sub GILOG()
    Sheets("Trainer").Range("I11").Value = Application.WorksheetFunction.VLookup(Range("I33"), Range("GI_Autofill"), 2, False)
End Sub

Private Sub GIINT()
    Sheets("Trainer").Range("I12").Value = Application.WorksheetFunction.VLookup(Range("I34"), Range("GI_Autofill"), 2, False)
End Sub

Private Sub GIWIS()
    Sheets("Trainer").Range("I13").Value = Application.WorksheetFunction.VLookup(Range("I35"), Range("GI_Autofill"), 2, False)
End Sub

Private Sub GIINF()
    Sheets("Trainer").Range("I14").Value = Application.WorksheetFunction.VLookup(Range("I36"), Range("GI_Autofill"), 2, False)
End Sub

Private Sub ClearTraining()
    Sheets("Trainer").Range("Training_Area").ClearContents
End Sub

Private Sub ClearAscension()
    Sheets("Ascension").Range("Ascension_Area").ClearContents
    Sheets("Ascension").Range("Ascension_Milestones").Value = "False"
End Sub

Private Sub HideUnhideTraining()
    Application.ScreenUpdating = False
    Dim Cell As Range
    Sheets("Trainer").Unprotect Password:="Whirlin"
    If Sheets("Trainer").Range("J41").Value = "True" Then
        For Each Cell In Sheets("Trainer").Range("Current_Total")
            If Cell.Value = 0 Or Cell.Value = "" Then
                Cell.RowHeight = 0
            End If
        Next Cell
    Else
        Sheets("Trainer").Range("Current_Total").RowHeight = 13.5
    End If
    Sheets("Trainer").Protect Password:="Whirlin"
    Application.ScreenUpdating = True
End Sub

Sub Autotraining()
    For Each AA In Range("AutoAssignment")
        Levelup = Trim(UCase(AA.Value))
        ' NOTE: This macro appears to be incomplete in the original
    Next
End Sub
