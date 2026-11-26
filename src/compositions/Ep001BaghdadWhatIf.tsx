import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { brand, colors, fonts } from '../brand/tokens';

export const EP001_FPS = 30;
export const EP001_DURATION = 22994; // 766.45s @ 30fps

type SceneDef = {
  id: string;
  chapter: string;
  beat: string;
  fiction: boolean;
  from: number;
  dur: number;
  title: string;
  subtitle: string;
  onscreen: string;
  image?: string;
  accent?: string;
};

const SCENES: SceneDef[] = [
  { id: '01', chapter: 'ch01', beat: 'HOOK', fiction: false, from: 0, dur: 1550,
    title: 'ماذا لو لم تسقط بغداد؟', subtitle: 'شتاء 1258م', onscreen: '1258م · بغداد · ماذا لو لم تسقط؟',
    image: 'assets/ep001/baghdad-1258.jpg', accent: colors.accentAlt },
  { id: '02', chapter: 'ch02', beat: 'BACKGROUND_FOUNDING', fiction: false, from: 1550, dur: 1258,
    title: 'مدينة السلام', subtitle: 'تأسيس بغداد', onscreen: '762م · المنصور · مدينة السلام',
    image: 'assets/ep001/baghdad-762.jpg', accent: colors.accent },
  { id: '03', chapter: 'ch02', beat: 'BACKGROUND_GOLDEN_AGE', fiction: false, from: 2808, dur: 2793,
    title: 'العصر الذهبي', subtitle: 'العلم والترجمة', onscreen: 'حركة الترجمة · بيت الحكمة · حنين بن إسحاق · ثابت بن قرة · الكندي',
    image: 'assets/ep001/bayt-hikma.jpg', accent: colors.accent },
  { id: '04', chapter: 'ch03', beat: 'DECLINE', fiction: false, from: 5601, dur: 3061,
    title: 'التصدع قبل الانكسار', subtitle: '945م — 1258م', onscreen: '945م · البويهيون · صعود المغول · هولاكو · المستعصم',
    image: 'assets/ep001/scholar-portrait.jpg', accent: colors.steel },
  { id: '05', chapter: 'ch04', beat: 'SIEGE_FALL', fiction: false, from: 8662, dur: 3130,
    title: 'الحصار والسقوط', subtitle: 'يناير – فبراير 1258م', onscreen: 'سقوط بغداد · أرقام الخسائر: مختلف عليها',
    image: 'assets/ep001/baghdad-1258.jpg', accent: colors.accentAlt },
  { id: '06', chapter: 'ch05', beat: 'AFTERMATH_KNOWLEDGE', fiction: false, from: 11792, dur: 3241,
    title: 'الكتب والذاكرة', subtitle: 'ما ضاع وما بقي', onscreen: 'رواية متداولة · مرصد مراغة · نصير الدين الطوسي',
    image: 'assets/ep001/bayt-hikma.jpg', accent: colors.accent },
  { id: '07', chapter: 'ch06', beat: 'COUNTERFACTUAL', fiction: true, from: 15033, dur: 3289,
    title: 'ماذا لو لم تسقط؟', subtitle: 'سيناريو افتراضي', onscreen: 'خيال تاريخي · لا أرقام يقينية · لا ادعاء بما لم يحدث',
    image: 'assets/ep001/baghdad-golden-alt.jpg', accent: colors.accentAlt },
  { id: '08', chapter: 'ch07', beat: 'AFTERMATH_REFLECTION', fiction: false, from: 18322, dur: 2499,
    title: 'ما الذي تغيّر فعلًا؟', subtitle: 'هشاشة مدن المعرفة', onscreen: 'ما ضاع · ما بقي · هشاشة مدن المعرفة',
    image: 'assets/ep001/scholar-portrait.jpg', accent: colors.steel },
  { id: '09', chapter: 'ch08', beat: 'CLOSING', fiction: false, from: 20821, dur: 2173,
    title: 'كيف نصون مدن المعرفة؟', subtitle: 'السؤال الذي يبقى', onscreen: brand.tagline,
    image: 'assets/ep001/baghdad-golden-alt.jpg', accent: colors.accent },
];

const FADE = 18; // frames

const LogoBug: React.FC = () => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 36,
        right: 44,
        zIndex: 100,
        opacity: 0.92,
        filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.45))',
      }}
    >
      <Img src={staticFile('brand/ruwaq-logo-teal-v2.png')} style={{ width: 84, height: 84, objectFit: 'contain' }} />
    </div>
  );
};

const FilmVignette: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: 'none',
      background:
        'radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(0,0,0,0.22) 75%, rgba(0,0,0,0.55) 100%)',
    }}
  />
);

const SceneBackground: React.FC<{ image?: string; dur: number; accent: string }> = ({ image, dur, accent }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const d = dur || durationInFrames;
  const scale = interpolate(frame, [0, d], [1.03, 1.11], { extrapolateRight: 'clamp' });
  const x = interpolate(frame, [0, d], [0, -18], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ backgroundColor: colors.bgDark }}>
      {image ? (
        <AbsoluteFill style={{ transform: `scale(${scale}) translateX(${x}px)`, transformOrigin: 'center center' }}>
          <Img src={staticFile(image)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </AbsoluteFill>
      ) : null}
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, rgba(8,28,31,0.25) 0%, rgba(8,28,31,0.35) 35%, rgba(8,28,31,0.72) 72%, rgba(8,28,31,0.92) 100%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `linear-gradient(90deg, rgba(14,42,46,0.55) 0%, rgba(14,42,46,0.05) 45%, rgba(14,42,46,0.35) 100%)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 8,
          background: `linear-gradient(180deg, ${accent}00, ${accent}cc, ${accent}00)`,
          opacity: 0.7,
        }}
      />
    </AbsoluteFill>
  );
};

const SceneText: React.FC<{ scene: SceneDef }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 20, mass: 0.8, stiffness: 90 }, durationInFrames: 28 });
  const opacity = interpolate(frame, [0, FADE], [0, 1], { extrapolateRight: 'clamp' });
  const y = interpolate(enter, [0, 1], [30, 0]);
  return (
    <AbsoluteFill style={{ direction: 'rtl', fontFamily: fonts.headline, color: colors.text }}>
      <div
        style={{
          position: 'absolute',
          bottom: 92,
          right: 96,
          left: 280,
          opacity,
          transform: `translateY(${y}px)`,
        }}
      >
        <div
          style={{
            display: 'inline-block',
            padding: '8px 18px',
            marginBottom: 18,
            fontSize: 22,
            fontFamily: fonts.body,
            color: colors.bgDark,
            backgroundColor: scene.accent || colors.accent,
            borderRadius: 4,
            fontWeight: 700,
            letterSpacing: 0.2,
          }}
        >
          {scene.subtitle}
        </div>
        <div
          style={{
            fontSize: scene.id === '01' || scene.id === '09' ? 72 : 64,
            fontWeight: 800,
            lineHeight: 1.2,
            textShadow: '0 4px 24px rgba(0,0,0,0.45)',
            maxWidth: 1200,
          }}
        >
          {scene.title}
        </div>
        <div
          style={{
            marginTop: 22,
            fontSize: 28,
            lineHeight: 1.6,
            fontFamily: fonts.body,
            color: colors.sand,
            maxWidth: 1150,
            textShadow: '0 2px 10px rgba(0,0,0,0.35)',
          }}
        >
          {scene.onscreen}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const FictionDisclaimer: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  return (
    <div
      style={{
        position: 'absolute',
        top: 40,
        left: 44,
        zIndex: 120,
        opacity,
        direction: 'rtl',
        fontFamily: fonts.body,
        fontSize: 20,
        fontWeight: 700,
        color: colors.sand,
        background: 'rgba(11,31,58,0.72)',
        border: `1px solid ${colors.accentAlt}88`,
        padding: '10px 16px',
        borderRadius: 6,
        backdropFilter: 'blur(2px)',
      }}
    >
      تصور افتراضي — ليس حدثًا تاريخيًا موثقًا
    </div>
  );
};

const Scene: React.FC<{ scene: SceneDef }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const fadeIn = interpolate(frame, [0, FADE], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - FADE, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const opacity = Math.min(fadeIn, fadeOut);
  return (
    <AbsoluteFill style={{ opacity }}>
      <SceneBackground image={scene.image} dur={scene.dur} accent={scene.accent || colors.accent} />
      <FilmVignette />
      <SceneText scene={scene} />
      {scene.fiction ? <FictionDisclaimer /> : null}
    </AbsoluteFill>
  );
};

const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = interpolate(frame, [0, 24], [0, 1], { extrapolateRight: 'clamp' });
  const s = spring({ frame, fps, config: { damping: 20, mass: 0.9, stiffness: 80 } });
  return (
    <AbsoluteFill style={{ backgroundColor: colors.bgDark, justifyContent: 'center', alignItems: 'center', opacity }}>
      <div style={{ textAlign: 'center', direction: 'rtl', transform: `scale(${0.96 + s * 0.04})` }}>
        <Img src={staticFile('brand/ruwaq-logo-teal-v2.png')} style={{ width: 140, height: 140, objectFit: 'contain', marginBottom: 28 }} />
        <div style={{ fontFamily: fonts.headline, fontSize: 68, fontWeight: 800, color: colors.text }}>رِوَاق</div>
        <div style={{ fontFamily: fonts.body, fontSize: 30, color: colors.sand, marginTop: 14 }}>{brand.tagline}</div>
      </div>
    </AbsoluteFill>
  );
};

export const Ep001BaghdadWhatIf: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: colors.bgDark }}>
      <Audio src={staticFile('audio/ep001/ep001_draft_mix_master.mp3')} />
      {SCENES.map((scene) => (
        <Sequence key={scene.id} from={scene.from} durationInFrames={scene.dur} name={`${scene.id}-${scene.beat}`}>
          <Scene scene={scene} />
        </Sequence>
      ))}
      <Sequence from={Math.max(0, durationInFrames - 120)} durationInFrames={120} name="end-card">
        <EndCard />
      </Sequence>
      <LogoBug />
    </AbsoluteFill>
  );
};
