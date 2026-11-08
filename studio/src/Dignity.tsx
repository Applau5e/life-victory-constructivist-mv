// S27: finished medal plate plus frame-driven performance layers.
import React from 'react';
import {BlenderLayer} from './Blender';
import track from './s27-track.json';
import solo from './s27-solo.json';
import {type Shot, INK, PAPER, RED, GOLD, layer, lin, mix, snap, glide, quake, Group, Sheet, Fill, T} from './kit';

const points = (p: number[][]) => p.map(v => v.join(',')).join(' ');
const typeSet = (text: string, f: number, start: number, gap: number) =>
  Array.from(text).map((letter, i) => <span key={i} style={{visibility: f >= start + i * gap ? 'visible' : 'hidden'}}>{letter}</span>);

export function Dignity({frame: f, duration: d}: Shot) {
  // These coordinates come from the same camera/parent animation as draft-ribbon-v5.
  const pose = track[Math.max(0, Math.min(track.length - 1, Math.round(f)))];
  const [cx, cy] = pose.center, [gx, gy] = pose.glint;
  // Preserve the existing vocal cues (190 / 197). S28 actually cuts at 3205,
  // so the push into the existing rendered medal occupies the final five frames.
  const heyA = 190, heyB = 197, exitAt = d - 5;
  const [ax, ay] = quake(f - heyA, 10, 8), [bx, by] = quake(f - heyB, 10, 8);
  const exit = lin(f, exitAt, d - 1) ** 2;
  // Use the projected face's inscribed radius to cover all corners. Keep the
  // render's color, relief and perspective; never replace it with a painted disc.
  const innerRadius = Math.min(...pose.rim.map(([x, y]) => Math.hypot(x - cx, y - cy)));
  const zoom = mix(1, Math.hypot(960, 540) * 1.12 / innerRadius, exit);
  const zx = mix(cx, 960, exit), zy = mix(cy, 540, exit);
  const titles = 1 - lin(f, exitAt, exitAt + 2);
  const stretch = glide(f, 32, 110);
  const beamRise = glide(f, 90, 180);
  const currentBolt = solo.events.findIndex(e => f >= e.frame && f < e.frame + 7);
  const event = solo.events[currentBolt];
  const age = event ? f - event.frame : 0;
  const boltAlpha = event ? 1 - lin(age, 3, 7) : 0;
  const origin = currentBolt % 2 ? [1950, 70] : [-30, 170];
  const dx = gx - origin[0], dy = gy - origin[1];
  const boltPath = `M${origin[0]} ${origin[1]} L${origin[0] + dx * .43} ${origin[1] + dy * .32} L${origin[0] + dx * .35} ${origin[1] + dy * .49} L${gx} ${gy}`;
  const revealLength = snap(age, 0, 2);
  const hey = (at: number, x: number) => f >= at && f < exitAt + 2 && <T x={x} y={340} size={210}
    font="num" color={PAPER} bg={RED} r={-8} style={{opacity: titles, transform: `scale(${mix(1.6, 1, snap(f, at, 4))})`}}>HEY!</T>;

  return <Group x={ax + bx} y={ay + by}>
    <Fill color={INK}/>
    <div style={{...layer, transformOrigin: `${cx}px ${cy}px`,
      transform: f > exitAt ? undefined : `translate(${zx - cx}px,${zy - cy}px) scale(${zoom})`}}>
      {/* The final four frames already carry the optical push at full resolution. */}
      <BlenderLayer camera="10_A" layer="production-brass" frame={f}/>
    </div>
    <Sheet style={{opacity: 1 - lin(f, exitAt, exitAt + 2)}}>
      <defs>
        {/* The preview is a combined water/medal plate. Its projected silhouette
            keeps the distant beams behind the medal, buckle and ribbon. */}
        <mask id="s27-behind-medal" maskUnits="userSpaceOnUse" x="0" y="0" width="1920" height="1080">
          <rect width="1920" height="1080" fill="white"/>
          {pose.masks.map((p, i) => <polygon key={i} points={points(p)} fill="black" stroke="black" strokeWidth="5"/>)}
        </mask>
        <clipPath id="s27-distant-water"><rect width="1920" height="650"/></clipPath>
        <linearGradient id="s27-spot" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={PAPER} stopOpacity=".035"/>
          <stop offset="1" stopColor={PAPER} stopOpacity=".24"/>
        </linearGradient>
      </defs>
      <g mask="url(#s27-behind-medal)" clipPath="url(#s27-distant-water)" opacity={.32 * glide(f, 90, 114)}>
        {[RED, PAPER, RED].map((color, i) => <path key={i}
          d={`M-100 ${1040 + i * 78 - beamRise * 330} l2200 -1270.17`}
          stroke={color} strokeWidth={[20, 12, 8][i]} fill="none"/>) }
      </g>
      <g style={{mixBlendMode: 'screen'}}>
        <path d={`M${-90 + Math.sin(f / 80) * 38} -100 L${gx + 240} ${gy + 130} L${gx - 150} ${gy + 115}Z`} fill="url(#s27-spot)"/>
        <path d={`M${2010 - Math.sin(f / 80) * 38} -100 L${gx - 240} ${gy + 130} L${gx + 150} ${gy + 115}Z`} fill="url(#s27-spot)"/>
        <ellipse cx={gx} cy={gy + 30} rx="190" ry="38" fill={PAPER} opacity=".035"/>
      </g>
      {event && <g opacity={boltAlpha}>
        <path d={boltPath} stroke={RED} strokeWidth={event.width} fill="none" strokeLinejoin="miter"
          pathLength="1" strokeDasharray="1" strokeDashoffset={1 - revealLength}/>
        <g transform={`translate(${gx} ${gy}) scale(${mix(.45, 1.2, snap(age, 0, 2))})`} opacity={lin(age, 0, 1)}>
          <path d="M0 -55L11 -12 50 0 11 12 0 55 -11 12 -50 0 -11 -12Z" fill={GOLD}/>
          <path d="M-25 -25L0 -7 25 -25 7 0 25 25 0 7 -25 25 -7 0Z" fill={PAPER} opacity=".8"/>
        </g>
      </g>}
    </Sheet>
    <div style={{...layer, opacity: titles}}>
      <T x={96} y={60} size={106} color={PAPER}>{typeSet('那漂着的', f, 0, 3)}</T>
      <T x={100} y={190} size={80} color={PAPER}>{typeSet('是我今天的', f, 22, 2)}</T>
      {f >= 32 && <div style={{position: 'absolute', left: 960, top: 750, display: 'flex',
        gap: mix(40, 920, stretch), transform: 'translateX(-50%)', color: GOLD,
        fontFamily: '"Victory Title"', fontSize: 300, lineHeight: 1, whiteSpace: 'nowrap'}}>
        {Array.from('尊严').map(c => <span key={c} style={{display: 'block', transform: `scaleX(${mix(1, 1.24, stretch)})`}}>{c}</span>)}
      </div>}
    </div>
    {hey(heyA, 100)}{hey(heyB, 1280)}
  </Group>;
}
