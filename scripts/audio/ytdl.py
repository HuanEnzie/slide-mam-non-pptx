import sys, yt_dlp
sys.stdout.reconfigure(encoding="utf-8")

def probe(url, label, opts_list):
    for name, extra in opts_list:
        o = {"quiet": True, "no_warnings": True, "noplaylist": True, "skip_download": True, "socket_timeout": 20, **extra}
        try:
            with yt_dlp.YoutubeDL(o) as y:
                info = y.extract_info(url, download=False)
            print(f"[{label}] OK with {name}: {info.get('title')!r} | {info.get('uploader')} | {info.get('duration')}s | formats={len(info.get('formats') or [])}")
            return name, extra
        except Exception as e:
            print(f"[{label}] {name}: {str(e).splitlines()[0][:150]}")
    return None

yt_opts = [(f"yt client={c}", {"extractor_args": {"youtube": {"player_client": [c]}}, "js_runtimes": {"node": {}}})
           for c in ["default", "tv", "web_safari", "mweb", "ios", "android_vr", "web_embedded"]]
tt_opts = [("tiktok default", {}),
           ("tiktok api_hostname=api22-normal-c-useast2a.tiktokv.com", {"extractor_args": {"tiktok": {"api_hostname": ["api22-normal-c-useast2a.tiktokv.com"]}}}),
           ("tiktok api_hostname=api16-normal-c-useast1a.tiktokv.com", {"extractor_args": {"tiktok": {"api_hostname": ["api16-normal-c-useast1a.tiktokv.com"]}}}),
           ("tiktok impersonate chrome", {"impersonate": __import__("yt_dlp.networking.impersonate", fromlist=["ImpersonateTarget"]).ImpersonateTarget("chrome")})]
r1 = probe("https://youtu.be/7BnSAqbAkRs", "YouTube", yt_opts)
r2 = probe("https://www.tiktok.com/@trandungbgyt/video/7598533593098489096", "TikTok", tt_opts)
print("RESULT", bool(r1), bool(r2))
