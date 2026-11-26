import React from 'react';
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from 'remotion';
import { colors } from '../brand/tokens';

/**
 * Ep001 "ماذا لو لم تسقط بغداد؟" — SCAFFOLD ONLY.
 * This is a structural placeholder for scene assembly. It is NOT final.
 * Replace each Sequence with the real scene components (ParallaxScene,
 * HistoricalTimeline, QuoteCard, AnimatedMapRoute, SplitScreenComparison).
 * Brand v2 (Petrol Teal / Ink Navy / Amber accents) — V1 gold/charcoal forbidden.
 */

const SECTIONS: { id: string; title: string; subtitle: string; from: number; dur: number }[] = [
  { id: 'ch01', title: 'ماذا لو لم تسقط بغداد؟', subtitle: 'الهوك', from: 0, dur: 900 },
  { id: 'ch02', title: 'مدينة السلام', subtitle: 'صعود بغداد', from: 900, dur: 900 },
  { id: 'ch03', title: 'التصدع قبل الانكسار', subtitle: '945 — 1258', from: 1800, dur: 900 },
  { id: 'ch04', title: 'الحصار والسقوط', subtitle: '1258', from: 2700, dur: 900 },
  { id: 'ch05', title: 'الكتب والذاكرة', subtitle: 'ماذا ضاع؟', from: 3600, dur: 900 },
  { id: 'ch06', title: 'السيناريو البديل', subtitle: 'WHAT IF', from: 4500, dur: 900 },
  { id: 'ch07', title: 'ما الذي تغيّر فعلًا؟', subtitle: 'الأثر', from: 5400, dur: 900 },
  { id: 'ch08', title: 'السؤال الذي يبقى', subtitle: 'الخاتمة', from: 6300, dur: 900 },
];

const Card: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center', direction: 'rtl' }}>
      <div style={{ opacity, textAlign: 'center', fontFamily: "'Cairo', sans-serif", color: colors.text }}>
        <div style={{ fontSize: 28, letterSpacing: 2, color: colors.accentAlt, marginBottom: 16 }}>{subtitle}</div>
        <div style={{ fontSize: 72, fontWeight: 700 }}>{title}</div>
        <div style={{ marginTop: 28, fontSize: 22, color: colors.accent, opacity: 0.8 }}>SCAFFOLD — NOT FINAL</div>
      </div>
    </AbsoluteFill>
  );
};

export const Ep001BaghdadWhatIf: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg }}>
      {SECTIONS.map((s) => (
        <Sequence key={s.id} from={s.from} durationInFrames={s.dur} name={s.id}>
          <Card title={s.title} subtitle={s.subtitle} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

export const EP001_DURATION = 7200; // 4 min scaffold @30fps; expand to 15-20 min in assembly
