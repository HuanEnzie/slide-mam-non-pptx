Set fso = CreateObject("Scripting.FileSystemObject"): d = fso.GetAbsolutePathName(".")
Set app = CreateObject("PowerPoint.Application")
For Each f In Array("Kham-pha-nghe-nong-v22.pptx", "Kham-pha-nghe-nong-v23.pptx")
  Set p = app.Presentations.Open(d & "\" & f, True, False, False)
  For Each n In Array(5, 8, 10)
    Set sq = p.Slides(n).TimeLine.MainSequence: c = 0
    For i = 1 To sq.Count
      If sq.Item(i).Timing.TriggerType = 1 Then c = c + 1
    Next
    WScript.Echo f & " slide " & n & ": effects=" & sq.Count & " clicks=" & c
  Next
  p.Close
Next
app.Quit
