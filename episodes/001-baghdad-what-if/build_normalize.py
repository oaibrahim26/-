#!/usr/bin/env python3
import json, subprocess, pathlib, re, sys, os
HERE = pathlib.Path(__file__).parent
FFMPEG = '/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v9.0.2'
IN_DIR = HERE/'audio/chapters_assembled'
OUT_DIR = HERE/'audio/chapters_normalized'
OUT_DIR.mkdir(parents=True, exist_ok=True)
TARGET_I = -14.0
TARGET_TP = -1.0
TARGET_LRA = 11.0

def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    return r.returncode, r.stdout, r.stderr

def measure(path):
    cmd = [FFMPEG,'-hide_banner','-i',str(path),'-af',
           f'loudnorm=I={TARGET_I}:TP={TARGET_TP}:LRA={TARGET_LRA}:print_format=json','-f','null','-']
    rc,out,err = run(cmd)
    # loudnorm prints json in stderr
    m = re.search(r'\{[^{}]*"input_i"[^{}]*\}', err, re.S)
    if not m:
        print('NO JSON', path, err[-500:], file=sys.stderr)
        return None
    return json.loads(m.group(0))

def normalize(src, dst, m):
    cmd = [FFMPEG,'-hide_banner','-y','-i',str(src),'-af',
           f"loudnorm=I={TARGET_I}:TP={TARGET_TP}:LRA={TARGET_LRA}:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true:print_format=json",
           '-ar','48000','-b:a','192k',str(dst)]
    rc,out,err = run(cmd)
    if rc != 0:
        print('FAIL', src, err[-500:], file=sys.stderr)
        return None
    m2 = re.search(r'\{[^{}]*"input_i"[^{}]*\}', err, re.S)
    return json.loads(m2.group(0)) if m2 else None

report=[]
for src in sorted(IN_DIR.glob('ch*.mp3')):
    dst = OUT_DIR/src.name
    print('MEASURE', src.name)
    m1 = measure(src)
    if not m1: 
        report.append({'file':src.name,'status':'measure_failed'}); continue
    print('NORMALIZE', src.name)
    m2 = normalize(src,dst,m1)
    report.append({
        'file':src.name,
        'status':'ok' if m2 else 'normalize_failed',
        'pre': {k:m1.get(k) for k in ['input_i','input_tp','input_lra','input_thresh']},
        'post': {k:(m2.get(k) if m2 else None) for k in ['input_i','input_tp','input_lra','input_thresh','target_offset']} if m2 else None
    })

(HERE/'build'/'loudnorm_report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
