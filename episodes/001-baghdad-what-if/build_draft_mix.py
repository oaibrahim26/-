#!/usr/bin/env python3
import subprocess, re, json, pathlib, os, math
HERE=pathlib.Path('episodes/001-baghdad-what-if')
FFMPEG='/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v9.0.2'
OUT=HERE/'audio/master'
OUT.mkdir(parents=True, exist_ok=True)
NORM=HERE/'audio/chapters_normalized'
MUSIC=HERE/'audio/music'
SFX=pathlib.Path('/home/user/-/public/sfx')

chapters=[f'ch0{i}.mp3' for i in range(1,9)]
# durations
def dur(p):
    r=subprocess.run([FFMPEG,'-i',str(p)],capture_output=True,text=True)
    m=re.search(r'Duration: (\d+):(\d+):(\d+\.\d+)',r.stderr)
    h,mi,s=m.groups(); return int(h)*3600+int(mi)*60+float(s)
durs=[dur(NORM/c) for c in chapters]
total=sum(durs)
# transition points at chapter boundaries (end of ch1..ch7)
starts=[]; t=0
for d in durs: starts.append(t); t+=d
transitions=starts[1:] # 7 transitions
print('durations',durs)
print('transitions',transitions,'total',total)

# Step 1: concat narration
concat=OUT/'concat.txt'
concat.write_text("\n".join([f"file '{(NORM/c).resolve().as_posix()}'" for c in chapters]), encoding='utf-8')
narr=OUT/'narration_normalized.wav'
subprocess.run([FFMPEG,'-hide_banner','-y','-f','concat','-safe','0','-i',str(concat),'-ar','48000','-ac','1',str(narr)],check=True)

# Step 2: build music bed
# segments: Dark Tranquility 0->starts[3]+? (ch01-03) crossfade to Sinister at starts[3]-4 for 8s
# Sinister starts[3]-4 -> starts[5]-4 crossfade to Warzone 8s
# Warzone starts[5]-4 -> starts[7]-4 crossfade to Dark Tranquility 8s
# Dark Tranquility starts[7]-4 -> total fade out 4s
dt=MUSIC/'Dark Tranquility - Anno Domini Beats.mp3'
si=MUSIC/'Sinister - Anno Domini Beats.mp3'
wz=MUSIC/'Warzone - Anno Domini Beats.mp3'
cf=8.0
s1=max(0, transitions[2]-cf/2)  # before ch04
s2=max(0, transitions[4]-cf/2)  # before ch06
s3=max(0, transitions[6]-cf/2)  # before ch08
# make each segment as wav, then crossfade
seg1=OUT/'m1.wav'; seg2=OUT/'m2.wav'; seg3=OUT/'m3.wav'; seg4=OUT/'m4.wav'
subprocess.run([FFMPEG,'-hide_banner','-y','-stream_loop','-1','-i',str(dt),'-t',str(s1+cf),'-ar','48000','-ac','1','-vn',str(seg1)],check=True)
subprocess.run([FFMPEG,'-hide_banner','-y','-stream_loop','-1','-i',str(si),'-t',str(s2-s1+cf),'-ar','48000','-ac','1','-vn',str(seg2)],check=True)
subprocess.run([FFMPEG,'-hide_banner','-y','-stream_loop','-1','-i',str(wz),'-t',str(s3-s2+cf),'-ar','48000','-ac','1','-vn',str(seg3)],check=True)
subprocess.run([FFMPEG,'-hide_banner','-y','-stream_loop','-1','-i',str(dt),'-t',str(total-s3+2),'-ar','48000','-ac','1','-vn',str(seg4)],check=True)
# crossfade chain
bed=OUT/'music_bed.wav'
# stepwise acrossfade: m1+m2 -> t1, t1+m3 -> t2, t2+m4 -> bed
t1=OUT/'mt1.wav'; t2m=OUT/'mt2.wav'
subprocess.run([FFMPEG,'-hide_banner','-y','-i',str(seg1),'-i',str(seg2),'-filter_complex',f'acrossfade=d={cf}:c1=tri:c2=tri','-ar','48000','-ac','1',str(t1)],check=True)
subprocess.run([FFMPEG,'-hide_banner','-y','-i',str(t1),'-i',str(seg3),'-filter_complex',f'acrossfade=d={cf}:c1=tri:c2=tri','-ar','48000','-ac','1',str(t2m)],check=True)
subprocess.run([FFMPEG,'-hide_banner','-y','-i',str(t2m),'-i',str(seg4),'-filter_complex',f'acrossfade=d={cf}:c1=tri:c2=tri,afade=t=out:st={max(0,total-4)}:d=4','-ar','48000','-ac','1',str(bed)],check=True)

# Step 3: mix with sidechaingate (silence music when narration silent)
# music target ~ -18 dB under narration. Narration normalized around -14 LUFS; music bed raw is ~-10 to -14, so set music volume to ~ -20dB before gating, then adjust.
# We'll use sidechaingate: when narration is above threshold gate opens, else closes (silence).
mixed=OUT/'mix_narr_music.wav'
# volume for music: -18dB approx 0.126
fc=f"[1:a]volume=0.125,sidechaingate=threshold=0.015:ratio=8:attack=80:release=700:range=0.0001[bg];[0:a][bg]amix=inputs=2:duration=first:normalize=0[out]"
subprocess.run([FFMPEG,'-hide_banner','-y','-i',str(narr),'-i',str(bed),'-filter_complex',fc,'-map','[out]','-ar','48000','-ac','1',str(mixed)],check=True)

# Step 4: overlay whoosh stings at transitions
# build delay filters for whooshes
whoosh=SFX/'whoosh.wav'
inputs=['-i',str(mixed)]
filters=[]
labels=[]
for i,tr in enumerate(transitions):
    inputs += ['-i',str(whoosh)]
    delay_ms=int(tr*1000)
    filters.append(f"[{i+1}:a]adelay={delay_ms}|{delay_ms},volume=0.35[s{i}]")
    labels.append(f"[s{i}]")
all_labels=''.join(labels)
n=len(transitions)
filters.append(f"[0:a]{all_labels}amix=inputs={1+n}:duration=first:normalize=0[out]")
draft=OUT/'draft_mix.wav'
cmd=[FFMPEG,'-hide_banner','-y']+inputs+['-filter_complex',';'.join(filters),'-map','[out]','-ar','48000','-ac','1',str(draft)]
r=subprocess.run(cmd,capture_output=True,text=True)
if r.returncode!=0:
    print(r.stderr[-800:])
    raise SystemExit(1)

# Step 5: master loudness measurement and final export
# measure
r2=subprocess.run([FFMPEG,'-hide_banner','-i',str(draft),'-af','loudnorm=I=-14:TP=-1:LRA=11:print_format=json','-f','null','-'],capture_output=True,text=True)
m=re.search(r'\{[^{}]*"input_i"[^{}]*\}',r2.stderr,re.S)
meas=json.loads(m.group(0)) if m else {}
# apply final loudnorm pass (same safe chain style) to hit -14/TP<=-1
final=OUT/'ep001_draft_mix_master.mp3'
af='highpass=f=60,acompressor=threshold=-28dB:ratio=3:attack=5:release=100,alimiter=limit=0.794:attack=2:release=30,loudnorm=I=-14:TP=-1.1:LRA=11'
subprocess.run([FFMPEG,'-hide_banner','-y','-i',str(draft),'-af',af,'-ar','48000','-ac','1','-b:a','192k',str(final)],check=True)
r3=subprocess.run([FFMPEG,'-hide_banner','-i',str(final),'-af','loudnorm=I=-14:TP=-1:LRA=11:print_format=json','-f','null','-'],capture_output=True,text=True)
m2=re.search(r'\{[^{}]*"input_i"[^{}]*\}',r3.stderr,re.S)
meas2=json.loads(m2.group(0)) if m2 else {}

report={
 'total_duration_s':round(total,3),
 'chapters':[{'chapter':c,'duration_s':round(d,3),'start_s':round(s,3)} for c,d,s in zip(chapters,durs,starts)],
 'transitions':[{'at_s':round(t,3),'type':'whoosh','file':'public/sfx/whoosh.wav','reason':'component/chapter transition sting'} for t in transitions],
 'music_plan':[
   {'range':'ch01-ch03','track':'Dark Tranquility - Anno Domini Beats.mp3','role':'main bed'},
   {'range':'ch04-ch05','track':'Sinister - Anno Domini Beats.mp3','role':'tension (siege/fall/aftermath)'},
   {'range':'ch06','track':'Warzone - Anno Domini Beats.mp3','role':'climax (counterfactual)'},
   {'range':'ch07-ch08','track':'Dark Tranquility - Anno Domini Beats.mp3','role':'reflection/closing'},
 ],
 'music_level':'~ -18dB under narration (volume 0.125) + sidechaingate keyed by narration so silence periods remain silent',
 'crossfades_s':cf,
 'draft_pre_master_measure':{k:meas.get(k) for k in ['input_i','input_tp','input_lra','input_thresh']},
 'final_master_measure':{k:meas2.get(k) for k in ['input_i','input_tp','input_lra','input_thresh','target_offset']},
 'final_master':str(final)
}
(HERE/'build'/'draft_mix_report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'final':meas2.get('input_i'), 'tp':meas2.get('input_tp'), 'file':str(final)}, ensure_ascii=False))
