#!/usr/bin/env python3
"""Build script.md and timing report from script_scenes.json.
Spoken words only. Timings are estimates; replace with TTS timestamps in final pass.
"""
import json, re, pathlib

HERE = pathlib.Path(__file__).parent
data = json.loads((HERE / "script_scenes.json").read_text(encoding="utf-8"))
wpm = data.get("wpm", 140)
pause = data.get("pause_s_per_scene", 0.6)


def words(t: str) -> int:
    return len([w for w in re.split(r"\s+", re.sub(r"[«»…،.؟?!:؛,\"\-]", " ", t)) if w])


def mmss(s: float) -> str:
    s = int(round(s))
    return f"{s // 60:02d}:{s % 60:02d}"


t = 0.0
rows = []
total_w = 0
for sc in data["scenes"]:
    w = words(sc["text"])
    total_w += w
    d = round(w / wpm * 60 + pause, 1)
    rows.append((sc, w, t, t + d, d))
    t += d

out = []
out.append(f"# SCRIPT — {data['episode_id']} «{data['title']}»\n")
out.append("> **الحالة: DRAFT / G0 مفتوح** — ممنوع القفل قبل مراجعة الحقائق والأرقام. هذا الملف مولّد من `script_scenes.json` عبر `build_script.py`.")
out.append(f"> الحساب: الكلمات المنطوقة فقط ÷ {wpm} كلمة/دقيقة + {pause}ث وقفة لكل مشهد. التوقيتات تقديرية وتُستبدل بطوابع الصوت الفعلية.\n")
out.append(f"**إجمالي الكلمات المنطوقة: {total_w} · المدة التقديرية: {mmss(t)} ({t/60:.2f} د) · عدد المشاهد: {len(rows)}**\n")
out.append(f"نطاق عند 130–150 ك/د: {mmss(total_w/150*60 + pause*len(rows))} – {mmss(total_w/130*60 + pause*len(rows))}\n")
out.append("**البراند:** v2 Petrol Teal فقط (لا ذهب/فحمي V1). **وسم الخيال:** المشاهد ⟨خيال/افتراضي⟩ تحتاج disclaimer بصري.\n\n---\n")
for sc, w, a, b, d in rows:
    tag = " ⟨خيال/افتراضي⟩" if sc.get("fiction") else ""
    out.append(f"### [SCENE {sc['id']} | {mmss(a)}-{mmss(b)} | {d:.0f}s] — {sc['beat']}{tag}\n")
    out.append(f"- **النص:** {sc['text']}")
    out.append(f"- **الصورة:** {sc.get('visual','')}")
    out.append(f"- **الحركة:** {sc.get('motion','')}")
    out.append(f"- **النص على الشاشة:** {sc.get('onscreen','')}")
    out.append(f"- **SFX/موسيقى:** {sc.get('sfx','')}")
    out.append(f"- **الدليل/التصنيف:** {sc.get('evidence','')} · *كلمات: {w}*\n")
(HERE / "script.md").write_text("\n".join(out), encoding="utf-8")
print(f"words={total_w} duration={mmss(t)} scenes={len(rows)}")
