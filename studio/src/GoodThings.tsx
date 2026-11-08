import React from 'react';
import {AbsoluteFill} from 'remotion';
import {type Shot, INK, PAPER, RED, GOLD, DARK, GREY, FONT, at, layer, lin, mix, range, snap, glide, quake, Sheet, Rect, Disc, P, T} from './kit';

const BURST = 53, BAND = 72;
const SECRET = 117; // User-approved single frame: keep absolute frame 4647 unchanged.
export const goodThingsHoldFrame = (duration: number) => duration - 12;

function BurstGeometry({frame: g}: {frame: number}) {
  const thrust = (x: number, y: number, start: number) => {
    const t = 1 - snap(g, start, 14);
    return `translate(${x * t} ${y * t})`;
  };
  return <Sheet>
    {/* Three black parallel banks and offset gold blocks. */}
    {[[0, 250, -700, 400], [1470, 120, 650, -375], [1390, 1050, 700, -404]].map(([x, y, dx, dy], bank) =>
      <g key={bank} transform={thrust(dx, dy, bank * 2)}>
        {[0, 1, 2].map(i => <path key={i} d={`M${x} ${y + i * 52}l620 -357.957`}
          stroke={INK} strokeWidth={i === 1 ? 32 : 10}/>) }
        <path d={`M${x + 60} ${y + 170}l190 -109.697`} stroke={GOLD} strokeWidth="18"/>
      </g>)}
    {/* S01's circle, square, fine parallels and half-disc return. */}
    <g transform={thrust(-920, -450, 1)}><circle cx="920" cy="64" r="49" fill={INK}/></g>
    <g transform={thrust(520, -430, 2)}><rect x="1760" y="115" width="110" height="110" fill={DARK}
      stroke={INK} strokeWidth="6" transform="rotate(-15 1815 170)"/></g>
    <g transform={thrust(-520, 500, 3)}>
      <path d="M35 760A92 92 0 0 1 219 760Z" fill={PAPER} stroke={INK} strokeWidth="9"/>
      {range(5).map(i => <path key={i} d={`M12 ${850 + i * 20}l290 -167.432`} stroke={INK} strokeWidth="5"/>)}
    </g>
    {/* S11's fallen rectangles reassemble from four different screen edges. */}
    {[[270, 1015, 230, 24, -25], [600, 80, 120, 60, 16], [1125, 445, 160, 26, -18], [1770, 980, 100, 58, 12]].map(([x, y, w, h, a], i) =>
      <g key={i} transform={thrust(i % 2 ? 950 : -950, i < 2 ? -650 : 650, 2 + i)}>
        <rect x={x} y={y} width={w} height={h} fill={i % 2 ? GREY : INK} transform={`rotate(${a} ${x} ${y})`}/>
      </g>)}
    {/* S12 compass arrows, arranged around the same centre. */}
    <g transform={thrust(650, 200, 3)}>
      {range(8).map(i => <path key={i} transform={`translate(1830 380) rotate(${i * 45})`}
        d="M32 -5H65V-13L89 0L65 13V5H32Z" fill={i % 2 ? GOLD : INK}/>) }
    </g>
    {/* S23 mountain: horizontal base, centred summit; the snow cap shares that summit. */}
    <g transform={thrust(850, -500, 2)}>
      <path d="M900 410L1080 105L1260 410Z" fill={INK}/>
      <path d="M1040 173L1080 105L1120 173L1098 160L1080 170L1062 157Z" fill={PAPER}/>
    </g>
  </Sheet>;
}

export function GoodThings({frame: clock, duration: d}: Shot) {
  const freeze = goodThingsHoldFrame(d), f = Math.min(clock, freeze);
  const open = glide(f, 2, 20), out = glide(f, 14, 46);
  const dotX = 960 + 130 * out;
  const cameraPush = 1 + .04 * glide(f, 0, BURST);
  if (f < BURST) return <AbsoluteFill style={{background: PAPER, overflow: 'hidden'}}>
    <div style={{...layer, transform: `scale(${cameraPush})`}}>
      {/* The dot is behind the door: its visible edge emerges only after crossing the jamb. */}
      <Disc cx={dotX} cy={540} d={24} fill={RED}/>
      <Rect x={940 - 50 * open} y={500 - 80 * open} w={100 * open} h={160 * open} fill={INK}/>
      <T x={600} y={690} size={100}>
        {Array.from('能出来的').map((c, i) => <span key={i} style={{visibility: f >= 3 + i * 3 ? 'visible' : 'hidden'}}>{c}</span>)}
      </T>
      <T x={1080} y={690} size={100}>
        {Array.from('都是').map((c, i) => <span key={i} style={{visibility: f >= 30 + i * 5 ? 'visible' : 'hidden'}}>{c}</span>)}
      </T>
    </div>
  </AbsoluteFill>;

  const g = f - BURST, ink = lin(g, 0, 5);
  const [ax, ay] = quake(g, 18, 12), [bx, by] = quake(f - BAND, 10, 9);
  const stretch = glide(f, BURST + 4, freeze - 6);
  const jitter = 3 * Math.sin(f * 1.44) * (1 - glide(f, freeze - 6, freeze));
  const dot = {cx: 960 + 130 * 1.04, cy: 540, size: 24 * 1.04};
  // Exactly six sampled frames: a circle becomes a rectangular red printing plate.
  const plate = {
    x: mix(dot.cx - dot.size / 2, -32, ink), y: mix(dot.cy - dot.size / 2, -32, ink),
    w: mix(dot.size, 1984, ink), h: mix(dot.size, 1144, ink),
  };
  return <AbsoluteFill style={{background: PAPER, overflow: 'hidden'}}>
    {g < 5 && <Rect x={890 * 1.04 - 38.4} y={420 * 1.04 - 21.6} w={104} h={166.4} fill={INK}/>}
    <div style={{...at(plate.x, plate.y, plate.w, plate.h), background: RED, borderRadius: 12 * (1 - ink)}}/>
    <div style={{...layer, transform: `translate(${ax + bx}px,${ay + by}px)`}}>
      {g >= 1 && <>
        <BurstGeometry frame={g}/>
        {/* Measured Victory Title ink bounds keep both words inside the frame,
            including the widest stretched glyph and the approved secret glyph. */}
        <Sheet><g fill={PAPER} fontFamily={FONT.title}>
          <text x="40" y="700" fontSize="880" transform={`translate(40 400) scale(${mix(1.08, 1, snap(g, 1, 5))}) translate(-40 -400)`}>好</text>
          {g >= 3 && <g transform={`translate(850 ${1040 + jitter}) scale(${1 + .3 * stretch} 1)`}>
            <text x="0" y="0" fontSize="800">{f === SECRET ? '屎' : '事'}</text>
          </g>}
        </g></Sheet>
        {/* Three distinct depth layers enter along the same exact 30-degree vector.
            Photos are above the lettering, so faces never disappear under a glyph. */}
        {[{id: 'CR-02', x: -50, y: 730, w: 820, delay: 1, travel: 1450},
          {id: 'C-01', x: 600, y: 465, w: 800, delay: 3, travel: 1650},
          {id: 'H-12', x: 1340, y: 45, w: 450, delay: 5, travel: 2100}].map(p => {
          const travel = p.travel * (1 - snap(g, p.delay, 15));
          return <P key={p.id} id={p.id} x={p.x - travel} y={p.y + travel / Math.sqrt(3)} w={p.w}/>;
        })}
      </>}
    </div>
  </AbsoluteFill>;
}
