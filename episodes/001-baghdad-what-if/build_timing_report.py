#!/usr/bin/env python3
import json, subprocess, pathlib, re
HERE = pathlib.Path(__file__).parent
FFMPEG = '/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v9.0.2'
def dur(p):
    r = subprocess.run([FFMPEG,'-i',str(p)], capture_output=True, text=True)
    m = re.search(r'Duration: (\d+):(\d+):(\d+\.\d+)', r.stderr)
    if not m: return None
    h,mi,s = m.groups(); return int(h)*3600+int(mi)*60+float(s)
chapters = sorted((HERE/'audio/chapters_assembled').glob('ch*.mp3'))
rows=[]
total=0
for c in chapters:
    d=dur(c); total += d
    rows.append({'chapter':c.name,'seconds':round(d,3),'mmss':f"{int(d)//60:02d}:{d%60:05.2f}"})
report={'chapters':rows,'total_seconds':round(total,3),'total_mmss':f"{int(total)//60:02d}:{total%60:05.2f}"}
(HERE/'build'/'actual_timing_report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
