import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Opening} from './Opening';
import {Chorus} from './Chorus';
import {Finale} from './Finale';
import {goodThingsHoldFrame} from './GoodThings';
import {PAPER} from './Poster';
import shots from './shots.json';
import {MovieFonts} from './Fonts';
import {SYNC} from './sync';
import {BEAT, glide} from './kit';

const quietShots = new Set([35, 36, 37, 39]);

function Scene({shot, duration, start}: {shot: number; duration: number; start: number}) {
  const local = useCurrentFrame();
  const cue = shot === 21 ? SYNC.first : SYNC.second;
  // Stop-time: the whole picture, print texture included, holds on the stop frame until the first hit.
  const stopped = (shot === 21 || shot === 31) && local >= cue.stop && local < cue.hitA;
  const still = stopped || shot === 38;
  // S31 holds the printed frame as well as the action; do not remove its texture on stop2.
  const holdPrint = stopped && shot === 31;
  const frame = stopped ? cue.stop : shot === 38 ? 0 : shot === 39 ? Math.min(local, goodThingsHoldFrame(duration)) : local;
  // Freeze the entire S39 printing state, then carry it through the start of S40's wipe.
  const abs = shot === 40 && local < 8 ? start - 12 : start + frame;
  const tick = Math.floor(abs / 2); // print texture changes at 15 fps, like a projector
  // Preserve panel, clock and wall positions across their matching cuts.
  const weaveTick = (shot === 2 || shot === 7 || shot === 13) && local === 0 ? Math.floor((abs - 1) / 2) : tick;
  const quiet = quietShots.has(shot) && !(shot === 39 && local >= 53);
  const weave = quiet ? .22 : .5;
  const snare = Math.abs(((abs / BEAT) % 2) - 1) < .12;
  const inkFilter = 'red-ink-' + shot;
  const Actor = shot < 18 ? Opening : shot < 35 ? Chorus : Finale;
  const openingIris = shot === 1 ? `circle(${1180 * glide(local, 0, 12)}px at 50% 50%)` : undefined;
  const texture = (id: string, i: number) => `url("${staticFile('print/' + id + '-' + (i + 1) + '.webp')}")`;
  return <AbsoluteFill style={{backgroundColor: shot === 1 ? '#141210' : PAPER, overflow: 'hidden'}}>
    <svg width="0" height="0" aria-hidden="true"><defs>
      {/* Second plate: the red ink printed a hair off register, jumping on the snare. */}
      <filter id={inkFilter} x="-1%" y="-1%" width="102%" height="102%" colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values="0 0 0 0 .557  0 0 0 0 .106  0 0 0 0 .078  2 -2 0 0 -.28" result="red"/>
        <feOffset in="red" dx={snare ? 4 : 2} dy={snare ? -2 : -1} result="shifted"/>
        <feComposite in="shifted" in2="red" operator="out" result="edge"/>
        <feComponentTransfer in="edge"><feFuncA type="linear" slope=".30"/></feComponentTransfer>
        <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode/></feMerge>
      </filter>
    </defs></svg>
    <AbsoluteFill style={{
      // Camera B is one smooth reveal: keep its framing free of projector weave.
      transform: (shot === 1 && local <= 12) || (still && !holdPrint) || shot === 24 || shot >= 41 ? 'none' : `translate(${Math.sin(weaveTick * 1.79) * weave}px,${Math.cos(weaveTick * 2.31) * weave}px)`,
      filter: still && !holdPrint ? 'none' : `url(#${inkFilter})`,
    }}>
      <Actor shot={shot} frame={frame} duration={duration} abs={abs}/>
    </AbsoluteFill>
    {(!still || holdPrint) && <AbsoluteFill style={{pointerEvents: 'none', clipPath: openingIris, mixBlendMode: 'multiply',
      opacity: quiet ? .2 : .36, backgroundImage: texture('T-01', tick % 3), backgroundSize: 'cover'}}/>}
    {(!still || holdPrint) && <AbsoluteFill style={{pointerEvents: 'none', clipPath: openingIris, mixBlendMode: 'multiply',
      opacity: quiet ? .06 : .12, backgroundImage: texture('T-03', tick % 3), backgroundSize: 'cover'}}/>}
    {(!still || holdPrint) && <AbsoluteFill style={{pointerEvents: 'none', clipPath: openingIris,
      background: 'radial-gradient(ellipse at 50% 50%, rgba(20,18,16,0) 62%, rgba(20,18,16,.09) 100%)'}}/>}
  </AbsoluteFill>;
}

export function Movie() {
  return <AbsoluteFill
    style={{
      fontFamily: '"Victory Title","Victory Caption",sans-serif',
      translate: '1px 0px'
    }}
  >
    <MovieFonts/>
    <Audio src={staticFile('audio/人生最大的胜利.mp3')} name="人生最大的胜利 · 原曲"/>
    {shots.map(({shot, start, name}, i) => {
      const duration = (shots[i + 1]?.start ?? 5146) - start;
      return <Sequence key={shot} from={start} durationInFrames={duration} name={`S${String(shot).padStart(2, '0')} · ${name}`}>
        <Scene shot={shot} duration={duration} start={start}/>
      </Sequence>;
    })}
  </AbsoluteFill>;
}
