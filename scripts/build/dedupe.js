const fs = require("fs"), crypto = require("crypto"), JSZip = require("jszip");
(async () => {
  const f = process.argv[2];
  const zip = await JSZip.loadAsync(fs.readFileSync(f));
  const byHash = {}, remap = {};
  for (const p of Object.keys(zip.files).filter((p) => p.startsWith("ppt/media/") && !zip.files[p].dir)) {
    const h = crypto.createHash("sha1").update(await zip.file(p).async("nodebuffer")).digest("hex");
    if (byHash[h]) { remap[p.split("/").pop()] = byHash[h].split("/").pop(); zip.remove(p); } else byHash[h] = p;
  }
  for (const p of Object.keys(zip.files).filter((p) => p.endsWith(".rels"))) {
    let x = await zip.file(p).async("string"), y = x;
    y = y.replace(/Target="\.\.\/media\/([^"]+)"/g, (m, n) => `Target="../media/${remap[n] || n}"`);
    if (y !== x) zip.file(p, y);
  }
  fs.writeFileSync(f, await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }));
  console.log("removed", Object.keys(remap).length, "duplicate media");
})();
