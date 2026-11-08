import React from 'react';
import {actorBox, BlenderLayer, GroundedPhoto} from './Blender';
import projection from './s24-projection.json';
import groundProjection from './s24-ground.json';
import summitPlatform from './s23-platform.json';
import {type Shot, PAPER, INK, RED, GOLD, layer, at, mix, lin, glide, land, snap, range, P, Sheet, T, Slam, Drop} from './kit';

// O-08's circular face in the square source image (the ribbon occupies its top half).
const MEDAL = {x: .5, y: .766, radius: .226};
const CLOSE_RADIUS = 1200;
const PODIUM_TRIANGLE = {left: 770, right: 1150, top: 668, tip: 850};
const SUMMIT_OUTLINE = {left: 79, right: 1753, base: 1080, peakX: 943, peakY: 385};
const TRIANGLE_INK = '#A91D14';
function SummitClimber({frame, flagPlant}: {frame: number; flagPlant: number}) {
  const {frontFeet: [left, right]} = summitPlatform[Math.min(summitPlatform.length - 1, Math.round(frame))];
  // H-13's two sole contacts in source pixels; keep its original aspect ratio.
  const dx = right[0] - left[0], dy = right[1] - left[1];
  const scale = Math.hypot(dx, dy) / Math.hypot(670, -101);
  const rotation = Math.atan2(dy, dx) - Math.atan2(-101, 670);
  const h = 1536;
  return <div style={{...at(0, 0, 1024, h), transformOrigin: '0 0',
    transform: `translate(${left[0]}px,${left[1]}px) rotate(${rotation}rad) scale(${scale}) translate(-95px,-1528px)`}}>
    <P id="H-13" x={0} y={0} w={1024}/>
    <svg viewBox="0 0 1024 1536" width={1024} height={h} style={{...at(0, 0), overflow: 'visible'}}>
      <g transform={`translate(${1024 * .694} ${h * .009})`}>
        <path d={`M0 0Q${h * .1 * flagPlant} ${-h * .025} ${h * .2 * flagPlant} 2L${h * .32 * flagPlant} -1L${h * .26 * flagPlant} ${h * .12}Q${h * .13 * flagPlant} ${h * .1} 0 ${h * .12}Z`} fill={RED} stroke={INK} strokeWidth={12}/>
      </g>
    </svg>
  </div>;
}
export function MedalInk() {
  return <svg width={0} height={0}><defs><filter id="s23-medal-gold" colorInterpolationFilters="sRGB">
    <feColorMatrix type="matrix" values=".1643 .5529 .0558 0 .078  .126 .4234 .0427 0 .071  .0349 .1173 .0118 0 .063  0 0 0 1 0"/>
  </filter></defs></svg>;
}
export function Medal({x, y, w}: {x: number; y: number; w: number}) {
  return <P id="O-08" x={x} y={y} w={w} style={{filter: 'url(#s23-medal-gold)'}}/>;
}
function Laurels() {
  return <Sheet>{[-1, 1].map(side => <g key={side} transform={`translate(960 435) scale(${side},1)`}>
    <path d="M35 180Q270 160 310 -150" stroke={GOLD} fill="none" strokeWidth={10}/>
    {range(8).map(i => <path key={i} d="M0 0Q17 -48 65 -53Q49 -18 0 0Z" fill={GOLD}
      transform={`translate(${60 + i * 32} ${170 - i * i * 5.3}) rotate(${-11 - i * 6})`}/>)}</g>)}</Sheet>;
}

export function SummitChampion({frame: f, duration: d}: Shot) {
  const half = d / 2;
  const podium = f >= half;
  const local = Math.max(0, f - half);
  const actor = actorBox({camera: 'BL-08_B', frame: local, id: 'H-20', metres: 1.93, contact: .995});
  const medalW = actor.w * .19;
  const medalX = actor.x + .405 * actor.w;
  const medalY = mix(-medalW - 20, actor.y + .24 * actor.h, land(f, half + 4, 13));
  const medalCx = medalX + MEDAL.x * medalW;
  const medalCy = medalY + MEDAL.y * medalW;
  const push = glide(f, d - 18, d - 1);
  const zoom = Math.exp(Math.log(CLOSE_RADIUS / (MEDAL.radius * medalW)) * push);
  const triangle = glide(f, half - 12, half - 4);
  const landing = glide(f, half - 4, half + 4);
  const flatten = glide(f, half - 7, half - 4);
  const podiumReveal = glide(f, half - 10, half - 4);
  const winnerReveal = glide(f, half - 2, half + 2);
  const landingLift = 200 * (1 - landing);
  const sourceMid = (SUMMIT_OUTLINE.left + SUMMIT_OUTLINE.right) / 2;
  const targetMid = (PODIUM_TRIANGLE.left + PODIUM_TRIANGLE.right) / 2;
  const mountainScaleX = (PODIUM_TRIANGLE.right - PODIUM_TRIANGLE.left) / (SUMMIT_OUTLINE.right - SUMMIT_OUTLINE.left);
  const mountainScaleY = (PODIUM_TRIANGLE.tip - PODIUM_TRIANGLE.top) / (SUMMIT_OUTLINE.base - SUMMIT_OUTLINE.peakY);
  const mountainShear = mountainScaleX * (SUMMIT_OUTLINE.peakX - sourceMid) / (SUMMIT_OUTLINE.base - SUMMIT_OUTLINE.peakY);
  const flagPlant = land(f, 6, 8);
  return <>
    <MedalInk/>
    <div style={{...layer, transformOrigin: `${medalCx}px ${medalCy}px`,
      transform: `translate(${(960 - medalCx) * push}px,${(540 - medalCy) * push}px) scale(${zoom})`}}>
      <div style={{...layer, opacity: podiumReveal}}>
        <Laurels/>
        <BlenderLayer camera="08_B" frame={local}/>
      </div>
      {/* One persistent summit/triangle layer: turn above the podium, then land on it. */}
      <div style={{...layer, transformOrigin: `${sourceMid}px ${SUMMIT_OUTLINE.base}px`,
        transform: `translate(${(targetMid - sourceMid) * triangle}px,${(PODIUM_TRIANGLE.top - SUMMIT_OUTLINE.base - landingLift) * triangle}px) rotate(${180 * triangle}deg) matrix(${mix(1, mountainScaleX, triangle)},0,${mountainShear * triangle},${mix(1, mountainScaleY, triangle)},0,0)`}}>
        <BlenderLayer camera="08_A" frame={Math.min(f, half - 12)} style={{opacity: 1 - flatten}}/>
        <Sheet style={{opacity: flatten}}><path d={`M${SUMMIT_OUTLINE.left} ${SUMMIT_OUTLINE.base}H${SUMMIT_OUTLINE.right}L${SUMMIT_OUTLINE.peakX} ${SUMMIT_OUTLINE.peakY}Z`} fill={TRIANGLE_INK}/></Sheet>
        {f < half - 12 && <SummitClimber frame={f} flagPlant={flagPlant}/>}
      </div>
      <div style={{...layer, opacity: winnerReveal}}>
        <GroundedPhoto camera="BL-08_B" frame={local} id="H-20" metres={1.93} contact={.995}/>
        <Medal x={medalX} y={medalY} w={medalW}/>
      </div>
    </div>
    <div style={{...layer, opacity: 1 - lin(f, d - 18, d - 13)}}>
      <T x={96} y={70} size={100} color={PAPER} bg={INK}><Drop key={podium ? 'champion' : 'summit'}
        text={podium ? '像拿了' : '感觉像登了'} f={podium ? local : f} at={0} gap={2}/></T>
      <T x={1180} y={190} size={300} color={podium ? GOLD : PAPER} bg={podium ? INK : RED} r={-7}>
        <Slam key={podium ? 'champion' : 'summit'} text={podium ? '冠军' : '珠峰'} f={podium ? local : f} at={podium ? 0 : 5} gap={2}/>
      </T>
    </div>
  </>;
}

/** Gentle hand-set type: each glyph settles a few pixels without a slam or bounce. */
function Typeset({text, f, start, gap}: {text: string; f: number; start: number; gap: number}) {
  return <>{Array.from(text).map((char, i) => {
    const t = glide(f, start + i * gap, start + i * gap + 5);
    return <span key={i} style={{display: 'inline-block', opacity: t, transform: `translateY(${6 * (1 - t)}px)`}}>{char === ' ' ? '\u00a0' : char}</span>;
  })}</>;
}

function MonumentGround({frame}: {frame: number}) {
  const ground = groundProjection[Math.min(groundProjection.length - 1, Math.max(0, Math.round(frame)))];
  const reveal = glide(frame, 197, 221);
  if (!reveal || ground.horizonY === null || ground.horizonY >= 1080) return null;
  const horizon = Math.max(0, ground.horizonY);
  const footprint = ground.footprint.map(point => point.join(',')).join(' ');
  return <Sheet style={{opacity: reveal}}>
    {/* This is the camera's projected ground plane, not an offset drop shadow. */}
    <defs><filter id="s24-ground-contact" x="-10%" y="-100%" width="120%" height="300%">
      <feGaussianBlur stdDeviation={2}/>
    </filter></defs>
    <path d={`M0 ${horizon}H1920V1080H0Z`} fill="#C7BA9C" opacity={.42}/>
    <path d={`M0 ${horizon}H1920`} stroke={INK} strokeWidth={1.5} opacity={.12}/>
    <polygon points={footprint} fill={INK} stroke={INK} strokeWidth={12}
      strokeLinejoin="round" opacity={.25} filter="url(#s24-ground-contact)"/>
  </Sheet>;
}

/** Low foreground roofline follows the projected plinth and closes the gap to frame bottom. */
function MonumentForeground({frame}: {frame: number}) {
  const {bounds} = groundProjection[Math.min(groundProjection.length - 1, Math.max(0, Math.round(frame)))];
  const roof = bounds.top - 8;
  if (roof - 18 >= 1080) return null;
  const left = bounds.left - 90, right = bounds.right + 96;
  const width = right - left;
  return <Sheet>
    <path data-s24-foreground="roofline" fill={INK}
      d={`M${left} 1080 V${roof + 14} H${left + width * .12} V${roof}
        H${left + width * .34} V${roof - 18} H${left + width * .61} V${roof}
        H${left + width * .84} V${roof + 12} H${right} V1080 Z`}/>
  </Sheet>;
}

export function MonumentReveal({frame: f, duration: d}: Shot) {
  const index = Math.min(projection.length - 1, Math.max(0, Math.round(f)));
  const {water} = projection[index];
  const [wx, wy, wrx, wry] = water;
  const reflection = 1 - glide(f, 7, 38);
  const reflectMorph = glide(f, 0, 20);
  // Preserve the medal's round face: fit one uniform radius inside the water.
  const waterRadius = Math.min(wrx, wry);
  const reflectionRadius = Math.min(waterRadius * .9, mix(CLOSE_RADIUS, Math.min(CLOSE_RADIUS, waterRadius * .78), reflectMorph));
  const reflectionW = reflectionRadius / MEDAL.radius;
  const rippleAge = f - (d - 15);
  const rippleRadius = 2 + Math.max(0, rippleAge) * .8;
  const exit = glide(f, d - 6, d - 1);
  const circleX = mix(wx, 957, exit), circleY = mix(wy, 540, exit);
  const circleRadius = mix(rippleRadius, 1200, exit);
  return <>
    <MedalInk/>
    <MonumentGround frame={f}/>
    <div style={{...layer, opacity: glide(f, 150, 180), transform: `translateY(${330 + 300 * (1 - glide(f, 150, 200))}px)`}}>
      <BlenderLayer camera="12_B" layer="city_cream" frame={0}/>
    </div>
    {/* B4 rises vertically with an upright rim, then rejoins the approved B2 tail. */}
    <BlenderLayer camera="01_B" layer="production-b4" frame={f}/>
    <MonumentForeground frame={f}/>
    {reflection > 0 && <div style={{...layer, opacity: reflection,
      transform: `translate(${mix(960, wx, reflectMorph)}px,${mix(540, wy, reflectMorph)}px)`, transformOrigin: '0 0'}}>
      <div style={{...at(-reflectionRadius, -reflectionRadius, reflectionRadius * 2, reflectionRadius * 2), borderRadius: '50%', overflow: 'hidden'}}>
        <Medal x={reflectionRadius - MEDAL.x * reflectionW} y={reflectionRadius - MEDAL.y * reflectionW} w={reflectionW}/>
      </div>
    </div>}
    {f >= 30 && <div style={{...layer, opacity: 1 - glide(f, 132, 152)}}>
      <T x={110} y={24} size={154} color={PAPER} bg={RED} pad="12px 24px 18px">
        <Slam text="原来人生最大的胜利" f={f} at={30} gap={4.5}/>
      </T>
    </div>}
    <div style={{...layer, opacity: 1 - exit}}>
      {f >= 112 && <T x={1040} y={690} size={94} style={{WebkitTextStroke: `3px ${PAPER}`, paintOrder: 'stroke fill'}}><Typeset text="有时候 就藏在" f={f} start={112} gap={4}/></T>}
      {f >= 164 && <T x={1040} y={820} size={108} style={{WebkitTextStroke: `3px ${PAPER}`, paintOrder: 'stroke fill'}}><Typeset text="一声水响里面" f={f} start={164} gap={4}/></T>}
    </div>
    {rippleAge >= 0 && <Sheet>
      <ellipse cx={circleX} cy={circleY} rx={circleRadius} ry={mix(rippleRadius * .4, circleRadius, exit)}
        fill={exit > 0 ? PAPER : 'none'} stroke={GOLD} strokeWidth={mix(2, 9, exit)}/>
      {exit > 0 && <path d={`M${circleX} ${circleY - circleRadius}V${circleY + circleRadius}`} stroke={RED} strokeWidth={18}/>}
    </Sheet>}
  </>;
}
