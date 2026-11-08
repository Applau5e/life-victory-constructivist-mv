// Shared vocabulary for every shot: palette, beat clock, easing, type and geometry.
import React, {type CSSProperties, type ReactNode} from 'react';
import {Img, staticFile} from 'remotion';
import art from './art.json';
import {INK, PAPER, RED, GOLD} from './Poster';

export {INK, PAPER, RED, GOLD};
export const DARK = '#8E1B14', GREY = '#8C857A', OCHRE = '#C9A45C';
export const BEAT = 1800 / 123;

/** frame = shot-local frame, duration = shot length, abs = absolute movie frame of `frame`. */
export type Shot = {frame: number; duration: number; abs: number};

// ---------- time ----------
export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lin = (f: number, a: number, b: number) => clamp((f - a) / Math.max(1e-6, b - a));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export const range = (n: number) => Array.from({length: n}, (_, i) => i);
const expo = (t: number) => (t >= 1 ? 1 : 1 - 2 ** (-10 * t));
const smooth = (t: number) => t * t * (3 - 2 * t);
/** Machine move: fast in, hard stop. */
export const snap = (f: number, start = 0, len = 7) => expo(lin(f, start, start + len));
/** Slight overshoot, for things that land. */
export const land = (f: number, start = 0, len = 9) => {
  const t = lin(f, start, start + len), c = 1.7;
  return 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2;
};
/** Soft move — reserved for Outro 1 and slow camera drifts. */
export const glide = (f: number, a: number, b: number) => smooth(lin(f, a, b));
/** Accelerating exit. */
export const away = (f: number, a: number, b: number) => lin(f, a, b) ** 2.4;
/** Beat counter that clicks forward like a ratchet. */
export const ratchet = (abs: number, len = 5) => {
  const b = Math.floor(abs / BEAT);
  return b + snap(abs - b * BEAT, 0, len);
};
export const beatNo = (abs: number) => Math.floor(abs / BEAT + 1e-6);
/** 1 on the beat, decaying to 0 within `len` frames. */
export const kick = (abs: number, len = 6) => 1 - lin(abs - beatNo(abs) * BEAT, 0, len);
/** Decaying impact offset, `since` = frames after the hit. */
export const quake = (since: number, amp = 18, len = 12): [number, number] => {
  if (since < 0 || since > len) return [0, 0];
  const k = amp * (1 - since / len) ** 2;
  return [k * Math.sin(since * 2.9 + .6), k * .62 * Math.cos(since * 3.7)];
};
export const seeded = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// ---------- layout ----------
export const at = (left: number, top: number, width?: number, height?: number): CSSProperties =>
  ({position: 'absolute', left, top, width, height});
export const layer: CSSProperties = {position: 'absolute', left: 0, top: 0, width: 1920, height: 1080};

export function Group({x = 0, y = 0, s = 1, r = 0, o = '50% 50%', style, children}: {
  x?: number; y?: number; s?: number; r?: number; o?: string; style?: CSSProperties; children: ReactNode;
}) {
  return <div style={{...layer, transformOrigin: o, transform: `translate(${x}px,${y}px) rotate(${r}deg) scale(${s})`, ...style}}>{children}</div>;
}
export function Sheet({children, style}: {children: ReactNode; style?: CSSProperties}) {
  return <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{...layer, overflow: 'visible', ...style}}>{children}</svg>;
}
export function Fill({color = PAPER, style}: {color?: string; style?: CSSProperties}) {
  return <div style={{...layer, background: color, ...style}}/>;
}
export function Rect({x, y, w, h, fill = INK, r = 0, o = '0 50%', style}: {
  x: number; y: number; w: number; h: number; fill?: string; r?: number; o?: string; style?: CSSProperties;
}) {
  return <div style={{...at(x, y, w, h), background: fill, transformOrigin: o, rotate: `${r}deg`, ...style}}/>;
}
/** A bar drawn from (x,y) along angle r; `grow` 0..1 extends it like a ruling pen. */
export function Bar({x, y, len, thick = 24, r = -30, fill = INK, grow = 1}: {
  x: number; y: number; len: number; thick?: number; r?: number; fill?: string; grow?: number;
}) {
  return <div style={{...at(x, y - thick / 2, len * grow, thick), background: fill, transformOrigin: '0 50%', rotate: `${r}deg`}}/>;
}
export function Wedge({x, y, w, h, fill = RED, r = 0, style}: {
  x: number; y: number; w: number; h: number; fill?: string; r?: number; style?: CSSProperties;
}) {
  return <div style={{...at(x, y, w, h), background: fill, clipPath: 'polygon(0 0,100% 50%,0 100%)', transformOrigin: '0 50%', rotate: `${r}deg`, ...style}}/>;
}
export function Disc({cx, cy, d, fill = INK, style}: {cx: number; cy: number; d: number; fill?: string; style?: CSSProperties}) {
  return <div style={{...at(cx - d / 2, cy - d / 2, d, d), background: fill, borderRadius: '50%', ...style}}/>;
}

// ---------- photographs ----------
type ArtItem = (typeof art)[number];
const sizes = Object.fromEntries((art as ArtItem[]).map(a => [a.id, a.width / a.height]));
export const aspect = (id: string) => sizes[id] ?? 1;
/** Printed (halftone) cut-out. Width-driven; height follows the image. */
export function P({id, x, y, w, flip = false, r = 0, o = '50% 50%', style}: {
  id: string; x: number; y: number; w: number; flip?: boolean; r?: number; o?: string; style?: CSSProperties;
}) {
  const printed = /^(H|C|CR|HD|O)-\d{2}$/.test(id) && id !== 'H-00';
  return <Img src={staticFile(printed ? 'print/' + id + '.webp' : 'art/' + id + '.png')}
    style={{...at(x, y, w, w / aspect(id)), transformOrigin: o,
      transform: `${flip ? 'scaleX(-1) ' : ''}rotate(${r}deg)`, ...style}}/>;
}
/** Same, placed by bottom-centre and height (for standing figures). */
export function Figure({id, cx, by, h, flip, r, style}: {
  id: string; cx: number; by: number; h: number; flip?: boolean; r?: number; style?: CSSProperties;
}) {
  const w = h * aspect(id);
  return <P id={id} x={cx - w / 2} y={by - h} w={w} flip={flip} r={r} o="50% 100%" style={style}/>;
}
export const maskOf = (id: string): CSSProperties => ({
  maskImage: `url("${staticFile('art/' + id + '.png')}")`, maskSize: '100% 100%', maskRepeat: 'no-repeat',
  WebkitMaskImage: `url("${staticFile('art/' + id + '.png')}")`, WebkitMaskSize: '100% 100%', WebkitMaskRepeat: 'no-repeat',
});
/** Red over-print restricted to a cut-out's silhouette. */
export function RedPrint({id, x, y, w, amount, from = 'bottom'}: {id: string; x: number; y: number; w: number; amount: number; from?: 'bottom' | 'top'}) {
  if (amount <= 0) return null;
  const h = w / aspect(id), cut = 100 * (1 - amount);
  return <div style={{...at(x, y, w, h), ...maskOf(id), background: RED, mixBlendMode: 'multiply', opacity: .88,
    clipPath: from === 'bottom' ? `inset(${cut}% 0 0 0)` : `inset(0 0 ${cut}% 0)`}}/>;
}

// ---------- type ----------
export const FONT = {
  title: '"Victory Title","Victory Caption",sans-serif',
  caption: '"Victory Caption",sans-serif',
  num: '"Victory Numeral","Victory Title",sans-serif',
};
type TextProps = {
  x: number; y: number; size: number; color?: string; bg?: string; font?: keyof typeof FONT;
  pad?: string; r?: number; o?: string; track?: number; style?: CSSProperties; children: ReactNode;
};
/** One line of type. `track` is letter-spacing in em. */
export function T({x, y, size, color = INK, bg, font = 'title', pad, r = 0, o = '0 50%', track, style, children}: TextProps) {
  const caption = font === 'caption';
  return <div style={{...at(x, y), fontFamily: FONT[font], fontSize: size, lineHeight: 1, whiteSpace: 'nowrap',
    color, background: bg, padding: pad ?? (bg ? `${size * .1}px ${size * .16}px ${size * .16}px` : undefined),
    letterSpacing: `${track ?? (caption ? .08 : font === 'num' ? 0 : -.02)}em`, fontWeight: caption ? 700 : 400,
    transformOrigin: o, rotate: `${r}deg`, ...style}}>{children}</div>;
}
/** Characters slam in one by one: big → set, `gap` frames apart. */
export function Slam({text, f, at: start = 0, gap = 2, len = 4, from = 1.7}: {
  text: string; f: number; at?: number; gap?: number; len?: number; from?: number;
}) {
  return <>{Array.from(text).map((c, i) => {
    const s = start + i * gap;
    return <span key={i} style={{display: 'inline-block', visibility: f < s ? 'hidden' : 'visible',
      transform: `scale(${mix(from, 1, snap(f, s, len))})`}}>{c}</span>;
  })}</>;
}
/** Characters drop into the line like hand-set type. */
export function Drop({text, f, at: start = 0, gap = 2, len = 5, dist = .3}: {
  text: string; f: number; at?: number; gap?: number; len?: number; dist?: number;
}) {
  return <>{Array.from(text).map((c, i) => {
    const s = start + i * gap;
    return <span key={i} style={{display: 'inline-block', visibility: f < s ? 'hidden' : 'visible',
      transform: `translateY(${-dist * (1 - snap(f, s, len))}em)`}}>{c}</span>;
  })}</>;
}
/** Reveal by a hard wipe (clip) from the left or right. */
export const wipe = (t: number, fromRight = false): CSSProperties =>
  ({clipPath: fromRight ? `inset(-20% -20% -20% ${100 * (1 - t)}%)` : `inset(-20% ${100 * (1 - t)}% -20% -20%)`});

/** Rubber stamp: boxed, tilted, lands with a thump. */
export function Stamp({x, y, size, text, f, at: start = 0, r = -6, color = RED, bg}: {
  x: number; y: number; size: number; text: ReactNode; f: number; at?: number; r?: number; color?: string; bg?: string;
}) {
  if (f < start) return null;
  const t = snap(f, start, 3);
  return <T x={x} y={y} size={size} color={color} bg={bg} r={r} o="50% 50%"
    style={{border: `${Math.max(4, size * .07)}px solid ${color}`, padding: `${size * .06}px ${size * .18}px ${size * .14}px`,
      transform: `scale(${mix(1.45, 1, t)})`, opacity: .94}}>{text}</T>;
}
/** Documentary caption: ink tab with a red key, lower left. */
export function Note({f, at: start = 0, text, x = 96, y = 984}: {f: number; at?: number; text: string; x?: number; y?: number}) {
  const t = snap(f, start, 8);
  if (f < start) return null;
  return <div style={{...at(x, y), display: 'flex', alignItems: 'stretch', height: 50, ...wipe(t)}}>
    <div style={{width: 16, background: RED}}/>
    <div style={{background: INK, color: PAPER, fontFamily: FONT.caption, fontWeight: 700, fontSize: 28,
      letterSpacing: '.12em', padding: '0 22px', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap'}}>{text}</div>
  </div>;
}

// ---------- props ----------
export function Arrow({x, y, len = 160, r = 0, fill = INK, thick = 26}: {x: number; y: number; len?: number; r?: number; fill?: string; thick?: number}) {
  const head = thick * 1.9;
  return <svg style={{...at(x, y - head, len, head * 2), overflow: 'visible', transformOrigin: `0 ${head}px`, rotate: `${r}deg`}}
    viewBox={`0 0 ${len} ${head * 2}`}>
    <path d={`M0 ${head - thick / 2}H${len - head * 1.2}V0L${len} ${head}L${len - head * 1.2} ${head * 2}V${head + thick / 2}H0Z`} fill={fill}/>
  </svg>;
}
export function PressureGauge({x, y, w, angle, r = 0}: {x: number; y: number; w: number; angle: number; r?: number}) {
  return <div style={{...at(x, y, w, w), transform: `rotate(${r}deg)`, transformOrigin: '50% 50%'}}>
    <P id="O-06" x={0} y={0} w={w}/>
    {/* O-06 axle measured from the radial ticks, rather than the whole image. */}
    <svg viewBox="0 0 1254 1254" style={at(0, 0, w, w)}>
      <g transform={`translate(623 517) rotate(${angle})`}>
        <path d="M-17.5 42L0 -250 17.5 42Z" fill={RED}/>
        <circle cx="0" cy="0" r="32" fill={INK}/>
      </g>
    </svg>
  </div>;
}
export function ClockHands({minutes = 0, hours = 8}: {minutes?: number; hours?: number}) {
  return <>
    <path d="M100 100V48" stroke={INK} strokeWidth="9" strokeLinecap="square"
      transform={`rotate(${hours * 30 + minutes * .5} 100 100)`}/>
    <path d="M100 116V20" stroke={RED} strokeWidth="5" transform={`rotate(${minutes * 6} 100 100)`}/>
    <circle cx="100" cy="100" r="7" fill={INK}/>
  </>;
}
export function Clock({cx, cy, d, minutes = 0, hours = 8, halo = 0}: {cx: number; cy: number; d: number; minutes?: number; hours?: number; halo?: number}) {
  return <svg style={at(cx - d / 2, cy - d / 2, d, d)} viewBox="0 0 200 200">
    <circle cx="100" cy="100" r="96" fill={PAPER} fillOpacity={1 - halo} stroke={INK} strokeWidth="7"/>
    <g opacity={1 - halo}>
    {range(60).map(i => <path key={i} d={i % 5 === 0 ? 'M100 10v17' : 'M100 10v6'}
      transform={`rotate(${i * 6} 100 100)`} stroke={INK} strokeWidth={i % 5 === 0 ? 4.5 : 1.3}/>)}
    <ClockHands hours={hours} minutes={minutes}/>
    </g>
  </svg>;
}
/** Parallel bars on the 30° diagonal that click forward on the beat. */
export function Slats({abs, gold = false, quiet = false}: {abs: number; gold?: boolean; quiet?: boolean}) {
  const step = ratchet(abs);
  const bars: [number, number, number, number, string][] = [
    [-700, -40, 1180, 92, INK], [-880, 92, 1300, 18, INK], [-720, 150, 800, 42, RED],
    [1060, 1000, 1400, 108, gold ? GOLD : INK], [1080, 1140, 1260, 26, INK], [1360, 872, 940, 74, RED]];
  return <Sheet style={{opacity: quiet ? .5 : 1}}>
    <g transform={`rotate(-30 960 540) translate(${(step % 6) * 18 - 45} 0)`}>
      {bars.map(([x, y, w, h, c], i) => <rect key={i} x={x} y={y} width={w} height={h} fill={c}/>)}
    </g>
  </Sheet>;
}
export function Flash({on, color = PAPER, opacity = 1}: {on: boolean; color?: string; opacity?: number}) {
  return on ? <Fill color={color} style={{opacity}}/> : null;
}
/** Ink splash used under slammed words (texture from T-04, inverted when needed). */
export function Splash({x, y, d, n = 2, invert = false, opacity = .7}: {x: number; y: number; d: number; n?: number; invert?: boolean; opacity?: number}) {
  return <Img src={staticFile(`art/T-04-${n}.png`)} style={{...at(x - d / 2, y - d / 2, d, d), opacity,
    mixBlendMode: invert ? 'screen' : 'multiply', filter: invert ? 'invert(1)' : undefined}}/>;
}
