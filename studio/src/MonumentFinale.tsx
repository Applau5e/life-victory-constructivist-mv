import React from 'react';
import {BlenderLayer} from './Blender';
import mouth from './s34-mouth.json';
import bounds from './s34-layout.json';
import {type Shot, layer, INK, PAPER, RED, GOLD, lin, snap, away, kick, P, T, Sheet, wipe} from './kit';

function SlidingBeams({frame: f}: {frame: number}) {
  return <Sheet>{[0, 1].map(side => [0, 1, 2].map(i => {
    // Both banks slide along the same -30 degree vector, with staggered starts.
    const distance = -380 * (1 - snap(f, side * 9 + i * 5, 28)) + f * .35;
    const x = (side ? 1390 : -610) + distance;
    const y = (side ? 970 : 430) + i * 75 - distance / Math.sqrt(3);
    return <path key={`${side}-${i}`} d={`M${x} ${y}l1120 -646.632`}
      stroke={i === 1 ? RED : INK} strokeWidth={i === 0 ? 48 : i === 1 ? 19 : 10}/>;
  }))}</Sheet>;
}

function Procession({frame: f, abs}: {frame: number; abs: number}) {
  const far = f * .24, near = f * .65;
  return <>
    {/* A shared 30-degree travel direction, with the foreground moving faster. */}
    {[0, 1].map(i => <P key={'far-' + i} id="CR-01" x={-450 + i * 1780 + far}
      y={465 - far / Math.sqrt(3)} w={1800}/>) }
    {[0, 1, 2].map(i => <P key={'near-' + i} id="CR-02" x={-240 + i * 1090 + near}
      y={740 - near / Math.sqrt(3) - 8 * kick(abs)} w={1120}/>) }
  </>;
}

function MonumentRays({x, y, pulse}: {x: number; y: number; pulse: number}) {
  // Four unequal, hard-edged printed wedges. Extend past the viewport so every
  // ray still reaches an edge as camera C moves the mouth across the picture.
  return <Sheet>{[[-5, 62], [30, 160], [150, 118], [185, 44]].map(([angle, width]) => {
    const radians = angle * Math.PI / 180;
    const dx = Math.cos(radians), dy = Math.sin(radians);
    const distance = Math.min(
      ((dx > 0 ? 1968 : -48) - x) / dx,
      ((dy > 0 ? 1128 : -48) - y) / dy,
    );
    const ex = x + dx * distance, ey = y + dy * distance;
    const half = width * (.9 + .1 * pulse) / 2;
    return <polygon key={angle} fill={GOLD} opacity={.86 + .14 * pulse}
      points={`${x - dy * 2},${y + dx * 2} ${ex - dy * half},${ey + dx * half} ${ex + dy * half},${ey - dx * half} ${x + dy * 2},${y - dx * 2}`}/>;
  })}</Sheet>;
}

export function MonumentFinale({frame: f, duration: d, abs}: Shot) {
  const native = Math.min(239, f);
  const [left, top, right, bottom] = bounds.tower[native];
  // Preserve camera C's actual perspective/orbit; fit the whole tower to 90% height.
  const scale = 972 / (bottom - top);
  const tx = 760 - (left + right) * .5 * scale, ty = 1026 - bottom * scale;
  const [mx, my] = mouth[native];
  const cityFrame = Math.round(lin(f, 0, 239) * 119);
  const cityScale = .94;
  const cityY = 1080 - bounds.city[cityFrame][3] * cityScale;
  const collapse = away(f, d - 20, d - 1);
  const glint = .5 + .5 * kick(abs, 10);
  return <>
    <div style={{...layer, overflow: 'hidden', transformOrigin: '960px 540px', transform: `scale(${1 - collapse})`}}>
      <SlidingBeams frame={f}/>
      <MonumentRays x={tx + mx * scale} y={ty + my * scale} pulse={glint}/>
      <div style={{...layer, transformOrigin: '0 0', transform: `translate(58px,${cityY}px) scale(${cityScale})`}}>
        <BlenderLayer camera="12_A" layer="city_cream" frame={cityFrame}/>
        <BlenderLayer camera="12_A" layer="wires" frame={cityFrame}/>
      </div>
      <div style={{...layer, transformOrigin: '0 0', transform: `translate(${tx}px,${ty}px) scale(${scale})`}}>
        {/* The C tower plate already includes its porcelain toilet. */}
        <BlenderLayer camera="01_C" layer="tower" frame={native}/>
      </div>
      <Sheet><circle cx={tx + mx * scale} cy={ty + my * scale} r="5" fill={GOLD}/></Sheet>
      <Procession frame={f} abs={abs}/>
      <T x={70} y={198} size={116} color={PAPER} bg={RED} r={-4}
        style={wipe(snap(f, 0, 13))}>原来人生最大的胜利</T>
      {f >= 110 && <T x={1090} y={520} size={96} color={PAPER} bg={INK} r={1.5}
        style={wipe(snap(f, 110, 13), true)}>有时候 就藏在</T>}
      {f >= 168 && <T x={1090} y={695} size={106} bg={PAPER}>
        {Array.from('一声水响里面').map((letter, i) => <span key={i}
          style={{visibility: f >= 168 + i * 4 ? 'visible' : 'hidden'}}>{letter}</span>)}
      </T>}
    </div>
    {collapse > .7 && <Sheet><circle cx="960" cy="540" r="6" fill={INK}/></Sheet>}
  </>;
}
