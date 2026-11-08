import React from 'react';
import {Img, staticFile} from 'remotion';
import {BlenderLayer} from './Blender';
import {SYNC} from './sync';
import shape from './s31-shape.json';
import {at, layer, PAPER, INK, RED, GOLD, lin, mix, quake, snap, T, Drop, Sheet, range, BEAT} from './kit';

// Both approved images share the same 1672 × 941 registration canvas.
// Keep the black opening fixed through the four-frame match dissolve.
const canvas = {width: 1920, height: 1080};
const outline = shape.outline.map(p => p.join(',')).join(' ');
const field = 'M835 207C746 207 675 379 675 557C675 716 729 790 835 790C941 790 997 717 997 557C997 379 924 207 835 207Z';
const standPatches = [
  '650,31 1023,31 1023,55 650,55', '650,64 1023,64 1023,88 650,88', '650,96 1023,96 1023,132 650,132',
  '787,163 800,198 757,221 724,184', '715,189 750,229 704,331 615,307 646,222',
  '610,320 698,345 675,461 576,480', '574,496 673,480 674,581 562,582',
  '561,596 674,596 688,685 575,687', '580,701 694,700 730,751 628,796',
  '638,811 743,760 810,792 805,899 711,873', '821,800 851,800 868,911 818,914',
  '864,792 925,760 1029,814 958,879 883,903', '938,749 972,700 1086,704 1040,798',
  '979,686 995,596 1110,596 1099,689', '996,581 997,482 1096,498 1110,581',
  '994,464 974,346 1060,322 1092,480', '968,332 923,231 960,189 1022,222 1056,307',
  '869,198 882,163 947,182 914,222',
];

export function ToiletMatch({opacity = 1}: {opacity?: number}) {
  // Use the approved source, not the old portrait-shaped print cached in Studio.
  return <Img src={staticFile('art/O-02.png') + '?v=bc9543b67972547b'}
    style={{...layer, ...canvas, objectFit: 'contain', objectPosition: 'center', opacity}}/>;
}

export function StadiumPlate({frame = 0, rise = 0}: {frame?: number; rise?: number}) {
  const jump = Math.max(0, 1 - Math.abs((frame - SYNC.second.hitB - 3) / 3));
  const progress = lin(rise, 0, 90);
  return <div style={{...layer, transformOrigin: '50% 50%', transform: `rotate(${45 * progress}deg) scale(${mix(1, .4, progress)})`}}>
    <svg viewBox="0 0 1672 941" {...canvas} style={layer}>
      <defs>
        <clipPath id="s31-outline"><polygon points={outline}/></clipPath>
        {standPatches.map((points, i) => <clipPath key={i} id={'s31-bank-' + i}><polygon points={points}/></clipPath>)}
      </defs>
      <g clipPath="url(#s31-outline)">
        <image href={staticFile('art/K-03c.png')} width="1672" height="941"/>
        {/* Local stand patches pulse together. Fixed stairs, field and red rim do not scale. */}
        {jump > 0 && standPatches.map((points, i) => {
          const ps = points.split(' ').map(p => p.split(',').map(Number));
          const cx = ps.reduce((sum, p) => sum + p[0], 0) / ps.length;
          const cy = ps.reduce((sum, p) => sum + p[1], 0) / ps.length;
          return <g key={i} clipPath={`url(#s31-bank-${i})`}>
            <image href={staticFile('art/K-03c.png')} width="1672" height="941"
              transform={`translate(${cx} ${cy}) scale(${1 + .3 * jump}) translate(${-cx} ${-cy})`}/>
          </g>;
        })}
      </g>
    </svg>
  </div>;
}

function WaterEffects({frame: f}: {frame: number}) {
  const hit = f - SYNC.second.hitA;
  const rippleAge = hit - 5;
  // BL-07_B is centred at (960,540), water radius 513. Register to the new field.
  const sx = 161 / 513 * 1920 / 1672, sy = 294 / 513 * 1080 / 941;
  const cx = 835 * 1920 / 1672, cy = 500 * 1080 / 941;
  const style = (k: number) => ({left: cx - 960 * sx * k, top: cy - 540 * sy * k, width: 1920 * sx * k, height: 1080 * sy * k});
  return <>
    <svg width="0" height="0"><defs><clipPath id="s31-water" clipPathUnits="objectBoundingBox">
      <path d={field} transform="scale(0.0005980861 0.0010626993)"/>
    </clipPath></defs></svg>
    <div style={{...layer, clipPath: 'url(#s31-water)'}}>
      {hit >= 0 && hit < 19 && <BlenderLayer camera="07_B" layer="crown" frame={41 + hit * 2} style={style(2.7)}/>}
      {/* Leave the crown first; the outer wave reaches the stands on hit2b. */}
      {rippleAge >= 0 && rippleAge < 30 && <BlenderLayer camera="07_B" layer="ripples" frame={40 + rippleAge * 2} style={style(1)}/>}
    </div>
    {hit >= 0 && hit < 19 && <BlenderLayer camera="07_B" layer="droplets" frame={41 + hit * 2} style={style(1.6)}/>}
  </>;
}

export function StadiumImpact({frame: f}: {frame: number}) {
  const {stop, hitA, hitB} = SYNC.second;
  const impact = f - hitA, ring = f - hitB;
  const [x, y] = quake(impact, 18, 12);
  const [rx, ry] = quake(ring, 12, 10);
  const fall = lin(f, 0, stop);
  const size = mix(780, 82, fall ** .7);
  const cx = 835 * 1920 / 1672, cy = 500 * 1080 / 941;
  return <div style={{...layer, transform: `translate(${x + rx}px,${y + ry}px)`}}>
    <StadiumPlate frame={f}/>
    {f < 4 && <ToiletMatch opacity={1 - f / 4}/>}
    {f < hitA && <svg viewBox="0 0 100 112" style={{...at(cx - size / 2, cy - size * .56, size, size * 1.12), overflow: 'visible'}}>
      <path d="M5 8L96 25L53 106Z" fill={RED} stroke={INK} strokeWidth=".6"/>
      <path d="M5 8L53 106L49 40Z" fill="#8E1B14" stroke={INK} strokeWidth=".6"/>
      <path d="M5 8L96 25L49 40Z" fill="#E13B28" stroke={INK} strokeWidth=".6"/>
    </svg>}
    <WaterEffects frame={f}/>
    {f < stop && <T x={96} y={mix(70, 200, lin(f, 0, stop))} size={120} bg={PAPER}>
      <Drop text="噗通一声" f={f} at={0} gap={4}/></T>}
    {impact >= 0 && <T x={120} y={380} size={340} color={RED} style={{transform: `scale(${mix(1.7, 1, snap(impact, 0, 4))})`}}>噗</T>}
    {ring >= 0 && <T x={1440} y={400} size={340} color={RED} style={{transform: `scale(${mix(1.7, 1, snap(ring, 0, 4))})`}}>通</T>}
    {ring >= 0 && ring < 16 && <Sheet>{[[96, 96], [1824, 96], [96, 984], [1824, 984]].map(([px, py], i) =>
      <path key={i} transform={`translate(${px} ${py}) scale(${40 * (1 - lin(ring, 4, 16))})`}
        d="M0 -1L.25 -.25L1 0L.25 .25L0 1L-.25 .25L-1 0L-.25 -.25Z" fill={GOLD}/>)}</Sheet>}
    {f >= 59 && <div style={{...at(960, 540), transform: `rotate(-8deg) scale(${mix(1.6, 1, snap(f, 59, 4))})`}}>
      <T x={0} y={0} size={200} font="num" color={PAPER} bg={RED} style={{transform: 'translate(-50%, -50%)'}}>HEY!</T></div>}
  </div>;
}

export function StadiumFireworks({frame: f}: {frame: number}) {
  return <Sheet>{range(8).map(i => {
    const age = f - Math.round(i * BEAT);
    if (age < 0 || age > 24) return null;
    const t = lin(age, 0, 24), cx = 140 + (i % 4) * 520, cy = 820 - (i % 4) * 290;
    return <g key={i} transform={`translate(${cx} ${cy - 90 * t})`} opacity={1 - t}>
      {range(8).map(j => <path key={j} transform={`rotate(${j * 45})`} d={`M${20 + 70 * t} 0H${65 + 130 * t}`}
        stroke={[INK, RED, GOLD][(i + j) % 3]} strokeWidth="7"/>)}</g>;
  })}</Sheet>;
}
