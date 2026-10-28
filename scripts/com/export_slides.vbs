Set fso = CreateObject("Scripting.FileSystemObject"): d = fso.GetAbsolutePathName(".")
Set app = CreateObject("PowerPoint.Application")
Set p = app.Presentations.Open(d & "\" & WScript.Arguments(0), True, False, False)
For Each n In Array(5, 8, 10)
  p.Slides(n).Export d & "\v23\r\" & WScript.Arguments(1) & n & ".png", "PNG", 1600, 900
Next
p.Close: app.Quit
