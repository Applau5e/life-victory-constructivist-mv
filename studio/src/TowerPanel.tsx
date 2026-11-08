import React from 'react';
import {at, INK, RED} from './kit';
import tracks from './toilet-track.json';

const firstCrown = tracks['BL-01_A'][0]!;
export const TOWER_PANEL = {
  cx: firstCrown[0], cy: firstCrown[1], width: 760, height: 430,
  slope: Math.tan(7 * Math.PI / 180), trim: 14, pushScale: 1.35,
};

/** Screen-flat black parallelogram shared by S01, S02 and S24. */
export function TowerPanel({cx, cy, scale = 1}: {cx: number; cy: number; scale?: number}) {
  const width = TOWER_PANEL.width * scale;
  const height = TOWER_PANEL.height * scale;
  const rise = TOWER_PANEL.width * TOWER_PANEL.slope;
  // Vertical separation giving a 14px band measured perpendicular to the slant.
  const trim = TOWER_PANEL.trim * Math.sqrt(1 + TOWER_PANEL.slope ** 2);
  return <svg style={at(cx - width / 2, cy - height / 2, width, height)} viewBox="0 0 760 430">
    <polygon points={`0,${rise} 760,0 760,${430 - rise} 0,430`} fill={INK}/>
    <polygon points={`0,${430 - trim} 760,${430 - rise - trim} 760,${430 - rise} 0,430`} fill={RED}/>
  </svg>;
}
