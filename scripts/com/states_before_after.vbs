Set fso = CreateObject("Scripting.FileSystemObject"): d = fso.GetAbsolutePathName(".")
Set app = CreateObject("PowerPoint.Application")
Set p = app.Presentations.Open(d & "\Kham-pha-nghe-nong-v22.pptx", True, False, False)
correct = Array(1, 3, 0, 2, 1, 0, 2)
nopt = Array(4, 4, 4, 3, 4, 4, 3)
For q = 0 To 6
  Set s = p.Slides(13 + q)
  ' ---- BEFORE: hide the reveal decorations
  For Each nm In Array("okbell", "ok", "ok_star0", "ok_star1", "ok_star2")
    s.Shapes(nm).Visible = False
  Next
  s.Export d & "\r\before" & (q + 1) & ".png", "PNG", 1600, 900
  ' ---- AFTER: show decorations, remove wrong options + hint, grow + centre the right one
  For Each nm In Array("okbell", "ok", "ok_star0", "ok_star1", "ok_star2")
    s.Shapes(nm).Visible = True
  Next
  For i = 0 To nopt(q) - 1
    If i <> correct(q) Then s.Shapes("opt" & i).Visible = False
  Next
  On Error Resume Next
  s.Shapes("hint").Visible = False
  On Error GoTo 0
  Set g = s.Shapes("opt" & correct(q))
  If q = 6 Then f = 1.08: cy = 4.2 Else f = 1.2: cy = 4.87
  g.ScaleWidth f, False, 1
  g.ScaleHeight f, False, 1
  g.Left = p.PageSetup.SlideWidth / 2 - g.Width / 2
  g.Top = cy * 72 - g.Height / 2
  s.Export d & "\r\after" & (q + 1) & ".png", "PNG", 1600, 900
Next
p.Close: app.Quit
