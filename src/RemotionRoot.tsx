import React from 'react';
import { Composition } from 'remotion';
import { BabZuwaylaRemotion } from '../docs/legacy/BabZuwaylaRemotion.tsx';
import { RuwaqGeoRemotion } from './geo/RuwaqGeoRemotion.tsx';
import { RuwaqMotionDemo } from './compositions/RuwaqMotionDemo.tsx';
import { Ep001BaghdadWhatIf, EP001_DURATION } from './compositions/Ep001BaghdadWhatIf.tsx';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* 0. Ruwaq motion-system demo — proves the brand/motion/audio system.
          Kept separate from the Bab Zuwayla production composition. */}
      <Composition
        id="RuwaqMotionDemo"
        component={RuwaqMotionDemo}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ variant: 'wide' }}
      />
      <Composition
        id="RuwaqMotionDemoShorts"
        component={RuwaqMotionDemo}
        durationInFrames={270}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ variant: 'shorts' }}
      />

      {/* 1. Historical Geography Map Sequence (600 frames = 20s at 30fps) */}
      <Composition
        id="RuwaqHistoricalMap"
        component={RuwaqGeoRemotion}
        durationInFrames={600}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* 2. 3D Architectural Reconstruction Sequence (300 frames = 10s at 30fps) */}
      <Composition
        id="RuwaqBabZuwayla"
        component={BabZuwaylaRemotion}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          showAnnotations: false,
        }}
      />

      {/* 3. Ep001 Baghdad "What If" — SCAFFOLD (replace sections with real scenes) */}
      <Composition
        id="Ep001BaghdadWhatIf"
        component={Ep001BaghdadWhatIf}
        durationInFrames={EP001_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};

