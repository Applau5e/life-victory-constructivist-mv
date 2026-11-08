import React from 'react';
import tracks from './toilet-track.json';
import {Group, Sheet, INK, BEAT, glide, lin, mix} from './kit';

// Both shots use the same absolute timeline, including the camera push across 120.
export const CROWN_ORIGIN = tracks['BL-01_A'][0]!;
// Never underscale the full-frame tower plate: its cropped left edge must stay offscreen.
const cameraTravel = (abs: number) => glide(abs, 96, 150);
export const openingPush = (abs: number) => mix(1, 1.15, cameraTravel(abs));
export const openingTowerEnter = (abs: number) => glide(abs, 108, 132);

export function OpeningCamera({abs, children}: {abs: number; children: React.ReactNode}) {
  const travel = cameraTravel(abs);
  // Camera travels upper-right along the 30-degree line; scenery moves lower-left.
  return <Group x={90 * (1 - travel)} y={-52 * (1 - travel)}
    s={openingPush(abs)} o={`${CROWN_ORIGIN[0]}px ${CROWN_ORIGIN[1]}px`}>
    {children}
  </Group>;
}

/** Three graphic trails in echelon formation; one fly-past every two musical beats. */
export function TowerBeams({abs}: {abs: number}) {
  const firstBeat = Math.ceil(120 / BEAT) * BEAT;
  if (abs < firstBeat) return null;
  const phase = (abs - firstBeat) % (2 * BEAT);
  // Constant flight speed, with both ends offscreen when the next formation starts.
  const lead = mix(-2400, 2400, lin(phase, 0, 2 * BEAT));
  return <Sheet>
    <g data-tower-beams="background-formation" transform="translate(960 650) rotate(-30)" fill={INK}>
      {[{y:-100, ahead:0, length:1050, width:18},
        {y:0, ahead:140, length:1250, width:26},
        {y:100, ahead:-90, length:1050, width:18}].map((trail, i) =>
        <path key={i} data-tower-beam={i} transform={`translate(${lead + trail.ahead} ${trail.y})`}
          d={`M${-trail.length} ${-trail.width / 2} H-24 L0 0 L-24 ${trail.width / 2} H${-trail.length} Z`}/>)}
    </g>
  </Sheet>;
}
