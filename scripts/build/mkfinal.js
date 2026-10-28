// Generate finalize.vbs: PowerPoint COM adds transition sounds, effect sounds and background music.
const fs = require("fs");
const specs = JSON.parse(fs.readFileSync(__dirname + "/specs.json", "utf8"));
const L = [];
L.push(`Set fso = CreateObject("Scripting.FileSystemObject"): d = fso.GetAbsolutePathName(".")`);
L.push(`W = d & "\\aud\\wav\\"`);
L.push(`Set app = CreateObject("PowerPoint.Application")`);
L.push(`Set p = app.Presentations.Open(d & "\\Kham-pha-nghe-nong.pptx", False, False, False)`);
specs.forEach((sp, i) => {
  L.push(`Set sl = p.Slides(${i + 1})`);
  if (sp.snd) L.push(`sl.SlideShowTransition.SoundEffect.ImportFromFile W & "${sp.snd}.wav"`);
  for (const [n, s] of sp.sfx) L.push(`Snd sl, "${n}", "${s}"`);
  if (sp.music) L.push(`Music sl, "${sp.music.file}", ${sp.music.vol}`);
  L.push(`WScript.Echo "Slide ${i + 1}: " & sl.TimeLine.MainSequence.Count & " effects"`);
});
L.push(`p.Save: p.Close: app.Quit`);
L.push(`
Sub Snd(sl, nm, f)
  Dim i, e
  For i = 1 To sl.TimeLine.MainSequence.Count
    Set e = sl.TimeLine.MainSequence.Item(i)
    If e.Shape.Name = nm Then
      e.EffectInformation.SoundEffect.ImportFromFile W & f & ".wav"
      Exit Sub
    End If
  Next
  WScript.Echo "NOT FOUND " & nm
End Sub

Sub Music(sl, f, vol)
  Dim sh, i, e
  Set sh = sl.Shapes.AddMediaObject2(d & "\\aud\\mus\\" & f & ".mp3", False, True, 912, 492, 36, 36)
  sh.Name = "Nhac nen"
  sh.MediaFormat.Volume = vol
  With sh.AnimationSettings.PlaySettings
    .PlayOnEntry = True
    .LoopUntilStopped = True
    .HideWhileNotPlaying = False
    .StopAfterSlides = 1
  End With
  For i = sl.TimeLine.MainSequence.Count To 1 Step -1
    Set e = sl.TimeLine.MainSequence.Item(i)
    If e.Shape.Name = sh.Name And e.EffectType = 83 Then
      e.Timing.TriggerType = 2
      e.Timing.TriggerDelayTime = 0
      e.MoveTo 1
      Exit For
    End If
  Next
End Sub`);
fs.writeFileSync(__dirname + "/finalize.vbs", L.join("\r\n"));
console.log("finalize.vbs written");
