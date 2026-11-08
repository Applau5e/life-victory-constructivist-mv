// S01–S17 · Intro, the first two sorties, and the build to the wall.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {actorBox, BlenderLayer} from './Blender';
import wallProjection from './s13-projection.json';
import wallCloseupProjection from './s14-wall-projection.json';
import {OpeningCamera, TowerBeams, openingTowerEnter} from './OpeningCrown';
import {CHARGE_TIMING, chargeRunX} from './chargeMotion';
import {SofaPlate} from './SofaPlate';
import {
  type Shot, INK, PAPER, RED, DARK, GREY, BEAT, at, layer, lin, mix, range, snap, land, glide, away, ratchet, beatNo, kick, quake,
  seeded, Group, Sheet, Fill, Rect, Bar, Wedge, Disc, P, Figure, RedPrint, aspect, T, Slam, Drop, wipe, Stamp, Note, Arrow, Clock, PressureGauge, Splash,
} from './kit';

const localTick = (f: number, len = 5) => Math.floor(f / BEAT) + snap(f % BEAT, 0, len);
const DOOR = {x: 1372, y: 128, w: 410, h: 806}; // interior of BL-03_A when shifted 620px right

// ── S01 · Proun assembles, then the camera pushes into the red square ─────────
function Exposure({frame: f, abs}: Shot) {
  const iris = glide(f, 0, 12), push = glide(abs, 106, 119);
  const strum = Math.round(BEAT), woo = Math.round(6 * BEAT);
  // Four pieces click into place on the beats after the first guitar thrust.
  const starts = range(4).map(i => Math.round((i + 2) * BEAT));
  const origins = ['1280px 320px', '960px 540px', '700px 700px', '650px 350px'];
  const show = (i: number, el: React.ReactNode) => f < starts[i] ? null :
    <div key={i} data-opening-piece={i} style={{...layer,
      transform: `scale(${mix(1.2, 1, snap(f, starts[i], 4))})`, transformOrigin: origins[i]}}>{el}</div>;
  // One shared pulse; it settles before the existing 106–119 camera push.
  const pulse = 1 + .075 * (snap(f, woo, 2) - snap(f, woo + 2, 10));
  return <>
    <Fill color={INK}/>
    <div data-opening-iris style={{...layer, background: PAPER, clipPath: `circle(${1180 * iris}px at 50% 50%)`}}>
      {/* The central red square reaches exactly the same full-frame S02 wipe. */}
      <Group s={mix(1, 12, push)} o="960px 540px">
      <Group s={pulse} o="960px 540px">
        {f >= strum && <Bar x={-160} y={1660} len={Math.hypot(2240, 2240)}
          thick={40} r={-45} fill={RED} grow={snap(f, strum, 8)}/>}
        {show(0, <Disc cx={1280} cy={320} d={400}/>)}
        {show(2, <>{range(5).map(i => <Bar key={i} x={465 + i * 22} y={740 + i * 22}
          len={420} thick={6} r={-45}/>)}</>)}
        {show(1, <Rect x={845} y={425} w={230} h={230} fill={RED} r={-15} o="50% 50%"/>)}
        {show(3, <Sheet><path d="M470 350 A180 180 0 0 1 830 350 Z"
          fill={PAPER} stroke={INK} strokeWidth={7} strokeLinejoin="round"
          transform="rotate(18 650 350)"/></Sheet>)}
      </Group>
      </Group>
    </div>
  </>;
}

// ── S02 · continue the opening push with the tower only, no toilet or cover ──
function TowerCrowd({surge = 0, clap = 0, shake = 0}: {
  surge?: number; clap?: number; shake?: number;
}) {
  // CR-01's heads begin near source row 539; its upper half is transparent.
  // The final crop samples the opaque crowd at x753–1161, y582–812.
  return <P id="CR-01" x={mix(-240, -3540, surge) + shake * (1 - surge)}
    y={mix(220, -2737, surge) - 14 * clap * (1 - surge)}
    w={mix(2400, 9000, surge)} style={{filter: 'grayscale(1) brightness(.5)'}}/>;
}
function Monument({frame: f, duration: d, abs}: Shot) {
  const surge = away(f, d - 13, d - 1), clap = beatNo(abs) % 2 === 1 ? kick(abs, 6) : 0;
  const shake = 4 * clap * Math.sin((abs - beatNo(abs) * BEAT) * 2.9);
  return <>
    <OpeningCamera abs={abs}>
    <Group y={1200 * (1 - openingTowerEnter(abs))}>
    <TowerBeams abs={abs}/>
    <BlenderLayer camera="01_A" layer="tower" frame={f}/>
    </Group>
    </OpeningCamera>
    <Group y={420 * (1 - openingTowerEnter(abs))}>
      <TowerCrowd surge={surge} clap={clap} shake={shake}/>
    </Group>
    {/* Exact S01 end-square geometry at f=0, then a hard-edged upper-right wipe. */}
    {f < 12 && <Rect x={-420 + 3200 * glide(f, 0, 12)}
      y={-840 - 1848 * glide(f, 0, 12)} w={2760} h={2760}
      fill={RED} r={-15} o="50% 50%"/>}
  </>;
}

// ── S03 · the people answer: chants out of the loud-hailer, claps on 2 and 4 ──
const chants = [{t: 7, w: 'WOO!'}, {t: 37, w: 'HEY!'}, {t: 59, w: 'YEAH!'}, {t: 81, w: 'WOO!'}, {t: 103, w: 'HEY-YEAH!'}];
function Rally({frame: f, duration: d, abs}: Shot) {
  const current = [...chants].reverse().find(c => f >= c.t);
  const k = current ? chants.indexOf(current) : -1;
  const [sx, sy] = current ? quake(f - current.t, 9, 8) : [0, 0];
  const beat = beatNo(abs), clap = beat % 2 === 1 && abs - beat * BEAT < 6;
  const panel = snap(f, d - 8, 8);
  return <>
    <Sheet><polygon points="0,900 1920,330 1920,560 0,1130" fill={RED}/></Sheet>
    {[{w: 1500, x: 560, y: 330, o: .55}, {w: 1800, x: 140, y: 450, o: .8}, {w: 2150, x: -280, y: 570, o: 1}].map((c, i) =>
      <P key={i} id="CR-02" x={c.x - 1100 * (1 - snap(f, i * 4, 11))} y={c.y + (clap ? 5 : 0) * (i + 1) / 3} w={c.w} style={{opacity: c.o}}/>)}
    <P id="O-05" x={20 - 400 * (1 - snap(f, 0, 9))} y={30} w={540} r={-6}/>
    {current && <div style={{...layer, transform: `translate(${sx}px,${sy}px)`}}>
      <T x={[540, 620, 560, 640, 520][k]} y={[60, 120, 70, 130, 90][k]} size={k === 4 ? 250 : 320} font="num" color={RED} r={-12}
        style={{transform: `scale(${mix(1.7, 1, snap(f, current.t, 4))})`, textShadow: `9px 9px 0 ${INK}`}}>{current.w}</T>
    </div>}
    {clap && <P id="HD-03" x={[1420, 1500, 1270][Math.floor(beat / 2) % 3]} y={[60, 400, 230][Math.floor(beat / 2) % 3]} w={440}
      style={{transform: `scale(${mix(1.3, 1, snap(abs - beat * BEAT, 0, 3))})`}}/>}
    {f >= d - 8 && <Rect x={mix(1920, 0, panel)} y={0} w={1070} h={1080}/>}
  </>;
}

// ── S04 · title card ───────────────────────────────────────────────────────────
function Title({frame: f, duration: d}: Shot) {
  const door = snap(f, d - 8, 8), fade = 1 - lin(f, d - 8, d - 4);
  const [qx, qy] = quake(f - 15, 10, 10);
  return <>
    <Rect x={mix(0, DOOR.x, door)} y={mix(0, DOOR.y, door)} w={mix(1070, DOOR.w, door)} h={mix(1080, DOOR.h, door)}/>
    <div style={{...layer, opacity: fade, transform: `translate(${qx}px,${qy}px)`}}>
      <Group r={-30} o="110px 905px">
        <Wedge x={-260} y={918} w={1120 * snap(f, 20, 8)} h={78}/>
        <T x={110} y={752} size={150} color={PAPER} track={.02}><Slam text="人生最大的" f={f} at={0} gap={2}/></T>
        <T x={890} y={600} size={300} color={RED} track={-.04}><Slam text="胜利" f={f} at={12} gap={3} from={2}/></T>
      </Group>
      <T x={110} y={862} size={52} color={PAPER} track={.1}><Drop text="第三号战役纪实" f={f} at={22}/></T>
      <T x={112} y={936} size={30} color={PAPER} font="caption" track={.24}><Drop text="一部关于意志的纪录片" f={f} at={30} gap={1}/></T>
      <div style={{...at(1350, 930), display: 'flex', alignItems: 'baseline', gap: 18, whiteSpace: 'nowrap', ...wipe(snap(f, 34, 9))}}>
        <span style={{fontFamily: '"Victory Caption",sans-serif', fontWeight: 700, fontSize: 34, letterSpacing: '.18em', color: INK}}>制作：</span>
        <span style={{fontFamily: '"Victory Title",sans-serif', fontSize: 68, color: RED, letterSpacing: '.02em'}}>Applau5e</span>
      </div>
      <Rect x={1350} y={1022} w={470} h={8} style={{...wipe(snap(f, 38, 9))}}/>
    </div>
  </>;
}

// ── S05 · 第一次 我冲进那扇门 ───────────────────────────────────────────────
function Charge({frame: f, duration: d}: Shot) {
  const timing = CHARGE_TIMING;
  const actorWidth = 820, actorHeight = actorWidth / aspect('H-01');
  const rotation = 6 * Math.PI / 180;
  const rotatedHalfWidth = (actorWidth * Math.cos(rotation) + actorHeight * Math.sin(rotation)) / 2;
  // The open aperture ends at the inner edge of the right jamb in the BL-03_A plate.
  const exitEdge = 1763;
  const approachX = DOOR.x - actorWidth / 2 - rotatedHalfWidth - 8;
  const insideX = exitEdge - actorWidth / 2 + rotatedHalfWidth + 8;
  const approach = glide(f, 10, timing.enterStart);
  const swallowed = glide(f, timing.enterStart, timing.enterEnd);
  const x = chargeRunX(f, approachX, insideX);
  const y = mix(650, 300, approach) - 6 * (1 - Math.cos(f * .9)) * (1 - glide(f, 60, 82));
  // BL-03_A indices 9–17 open the leaf; 23–31 close it and settle the rebound.
  const doorFrame = f < timing.closeStart
    ? mix(9, 17, lin(f, timing.openStart, timing.openEnd))
    : mix(23, 31, lin(f, timing.closeStart, timing.closeEnd));
  const numeral = snap(f, 0, 5), retreat = snap(f, 40, 14), zoom = snap(f, d - 8, 7);
  return <>
    <T x={40 - 300 * retreat} y={-190} size={1250} font="num" color={RED} style={{transform: `scale(${mix(1.5, 1, numeral)})`, transformOrigin: '20% 50%'}}>1</T>
    <BlenderLayer camera="03_A" frame={doorFrame} style={{left: 620}}/>
    <div style={{...layer, clipPath: `inset(0 ${1920 - exitEdge}px 0 0)`}}>
      <div style={{...layer, opacity: 1 - swallowed}}>
        {[0, 1, 2].map(i => <Bar key={i} x={x - 600 + i * 70} y={y + 330 + i * 46} len={540 - i * 120} thick={24 - i * 7} fill={RED} r={-13}/>)}
      </div>
      <P id="H-01" x={x} y={y} w={actorWidth} r={-6}/>
    </div>
    <T x={520} y={92} size={130}><Drop text="第一次" f={f} at={3} gap={3}/></T>
    <T x={520 - 600 * (1 - snap(f, 32, 6))} y={250} size={230} style={{opacity: f < 32 ? 0 : 1}}>我冲进</T>
    <T x={DOOR.x + 30} y={952} size={92}><Drop text="那扇门" f={f} at={54} gap={3}/></T>
    <Arrow x={DOOR.x + 330} y={1000} len={120} r={-90} fill={RED} thick={20}/>
    <Note f={f} at={18} text="第一号作战 · 出发时间 07:42"/>
    {zoom > 0 && <Rect x={mix(DOOR.x, 0, zoom)} y={mix(DOOR.y, 0, zoom)} w={mix(DOOR.w, 1920, zoom)} h={mix(DOOR.h, 1080, zoom)}/>}
  </>;
}

// ── S06–S08 · inside: the stage-set lavatory ──────────────────────────────────
const SEAT = {x: 960, y: 934};
// Visible clock disc on the BL-02 background, measured in plate pixels.
const CLOCK = {x: 959.5, y: 332.5, d: 214};
const STAGE_X = -420; // S06 slides the set left so the slogan can climb the right side
// S06's camera push ends exactly at S07's held close-up.
const CLOCK_CLOSEUP = {x: 600, y: 560, d: 1000};
function Stage({plate, s, o, ty = 0, openable = false, behind, children, onBackdropLoad}: {plate: number; s: number; o: string; ty?: number; openable?: boolean; behind?: React.ReactNode; children?: React.ReactNode; onBackdropLoad?:()=>void}) {
  return <Group s={s} o={o} y={ty}>
    {behind}
    <BlenderLayer camera="02_A" layer={openable ? 'bg_s08' : 'bg'} frame={0} onLoad={onBackdropLoad}/>
    <BlenderLayer camera="02_A" layer="gear" frame={plate}/>
    <BlenderLayer camera="02_A" layer="ramp" frame={0} style={{transform: 'translate(610px, -220px)'}}/>
    {children}
  </Group>;
}
function Sitter({id, plate}: {id: string; plate: number}) {
  const b = actorBox({camera: 'BL-02_A', frame: plate, id, metres: 1.38, contact: .57});
  return <P id={id} x={b.x} y={b.y} w={b.w}/>;
}
function Confident({frame: f, duration: d}: Shot) {
  const [backdropReady, setBackdropReady] = React.useState(false);
  const s = mix(1.06, 1, glide(f, 0, d - 1)), zoom = away(f, d - 12, d - 1);
  const clock = {x: CLOCK.x, y: CLOCK.y}; // in plate space
  const screen = {x: SEAT.x + STAGE_X + (CLOCK.x - SEAT.x) * s, y: SEAT.y + (CLOCK.y - SEAT.y) * s};
  return <>
    <Group x={(CLOCK_CLOSEUP.x - screen.x) * zoom} y={(CLOCK_CLOSEUP.y - screen.y) * zoom}
      s={mix(1, CLOCK_CLOSEUP.d / (CLOCK.d * s), zoom)} o={`${screen.x}px ${screen.y}px`}>
      <Group x={STAGE_X}><Stage plate={f} s={s} o={`${SEAT.x}px ${SEAT.y}px`} onBackdropLoad={() => setBackdropReady(true)}
        behind={<div style={{...layer, clipPath: 'inset(540px 700px 100px 640px)'}}>
          {[44, 20, 12].map((thick, i) => {
            const travel = 720 * (1 - snap(f, i * 4, 10));
            return <Bar key={i} x={640 - travel} y={915 + 60 * i + travel * Math.tan(Math.PI / 6)}
              len={660} thick={thick} fill={RED} r={-30}/>;
          })}
        </div>}>
        <Sitter id="H-02" plate={f}/>
        {backdropReady && <Clock cx={clock.x} cy={clock.y} d={CLOCK.d} minutes={0}/>}
      </Stage></Group>
    </Group>
    <div style={{opacity: 1 - lin(f, d - 10, d - 4)}}>
      {Array.from('信心满满').map((c, i) => <T key={i} x={1310 + i * 146} y={520 - i * 80} size={150}
        style={{visibility: f < [4, 12, 22, 29][i] ? 'hidden' : 'visible', transform: `scale(${mix(1.7, 1, snap(f, [4, 12, 22, 29][i], 4))})`}}>{c}</T>)}
      {range(4).map(i => <Rect key={i} x={1310 + i * 146} y={688 - i * 80} w={140} h={14} fill={RED}
        style={{...wipe(snap(f, [4, 12, 22, 29][i] + 2, 5))}}/>)}
      <T x={1180} y={900} size={76} color={PAPER} bg={INK}><Drop text="以为一切会自然发生" f={f} at={57} gap={3}/></T>
    </div>
  </>;
}

const retreatScale = 1.6, retreatY = -140;
const seated = actorBox({camera: 'BL-02_A', frame: 240, id: 'H-02', metres: 1.38, contact: .57});
// The centre of H-02's head lies near (48%, 10%) of the cut-out.
const HALO = {
  x: SEAT.x + (seated.x + .48 * seated.w - SEAT.x) * retreatScale,
  y: SEAT.y + (seated.y + .10 * seated.h - SEAT.y) * retreatScale + retreatY,
  d: 146,
};
type Dial = {x: number; y: number; d: number; halo: number};
function Waiting({frame: f, duration: d}: Shot) {
  const exit = glide(f, d - 16, d - 1);
  const minutes = Math.min(10, localTick(f) * 1.25);
  const sink = glide(f, 54, d - 8);
  const cx = mix(CLOCK_CLOSEUP.x, HALO.x, exit);
  const cy = mix(CLOCK_CLOSEUP.y, HALO.y, exit);
  const dd = mix(CLOCK_CLOSEUP.d, HALO.d, exit);
  const secs = Math.round(minutes * 60);
  return <>
    <div style={{opacity: 1 - exit}}>
      {range(3).map(i => {
        const drops = Math.max(0, localTick(f) - 3.6 - i * .4);
        return <Rect key={i} x={1140 + i * 250} y={-420 + Math.min(330, drops * 64)} w={210} h={400 + i * 40}/>;
      })}
      <T x={1140} y={96} size={150}><Drop text="蹲了十分钟" f={f} at={4} gap={3}/></T>
      {f >= 54 && <T x={1140} y={300 + 70 * sink} size={150} track={-.02 - .07 * sink}
        style={{transform: `scaleY(${1 + .4 * sink})`, transformOrigin: '0 0'}}><Drop text="空气都变沉" f={f} at={54} gap={2}/></T>}
      <div style={{...at(1180, 600, 620, 360), border: `8px solid ${INK}`, background: PAPER, overflow: 'hidden'}}>
        <Group x={-SEAT.x + 310} y={-SEAT.y + 290}>
          <BlenderLayer camera="02_A" layer="bg" frame={120 + f}/>
          <Sitter id="H-03" plate={120 + f}/>
        </Group>
      </div>
    </div>
    <Clock cx={cx} cy={cy} d={dd} minutes={minutes} halo={exit}/>
    <Note f={f} at={10} text={`已等待 00:${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')} · 战果：无`}/>
    {exit > 0 && <div style={{...layer, background: PAPER, opacity: exit}}>
      <Retreat frame={0} abs={810} duration={108} incoming={{x: cx, y: cy, d: dd, halo: exit}}/>
    </div>}
  </>;
}

const chapterTwoPanel = {width: 600, height: 1080};

function Retreat({frame: f, duration: d, incoming}: Shot & {incoming?: Dial}) {
  const plate = 240 + f, s = retreatScale, ty = retreatY;
  const turn = lin(f, 42, 52), walk = glide(f, 57, 79);
  const sitting = turn < .5;
  const h = 1.78 * 165.82 * mix(1, .82, walk), w = h * aspect('H-04');
  const flip = Math.max(.03, Math.abs(Math.cos(turn * Math.PI)));
  const halo = 1 - snap(f, 46, 6);
  const dial = incoming ?? {...HALO, d: HALO.d * halo, halo: 1};
  const doorOpen = snap(f, 49, 8) * (1 - snap(f, 80, 7));
  const cover = glide(f, d - 9, d - 1);
  // The opening's far jamb hides the actor once he crosses the threshold.
  const actorX = mix(SEAT.x, 1550, walk);
  const foot = mix(SEAT.y + 75, 976, walk) - 5 * Math.abs(Math.sin(walk * Math.PI * 4));
  // Slide the door into the chapter numeral's backing at the left edge.
  const panelX = SEAT.x + (1154 + 300 * doorOpen - SEAT.x) * s;
  const panelY = SEAT.y + (138 - SEAT.y) * s + ty;
  return <>
    <Stage plate={plate} s={s} o={`${SEAT.x}px ${SEAT.y}px`} ty={ty} openable>
      {dial.d > 0 && <Clock cx={(dial.x - SEAT.x) / s + SEAT.x} cy={(dial.y - ty - SEAT.y) / s + SEAT.y}
        d={dial.d / s} minutes={10} halo={dial.halo}/>}
      <div style={{...layer, clipPath: 'inset(0 500px 0 0)', transform: `scaleX(${flip})`, transformOrigin: `${SEAT.x}px 0`}}>
        {sitting ? <Sitter id="H-02" plate={plate}/> : <P id="H-04" x={actorX - w / 2} y={foot - h * .98} w={w}/>}
      </div>
    </Stage>
    <div style={{...at(mix(panelX, 0, cover), mix(panelY, 0, cover), 272, 847), background: INK,
      transformOrigin: '0 0', transform: `scale(${mix(s, chapterTwoPanel.width / 272, cover)}, ${mix(s, chapterTwoPanel.height / 847, cover)})`,
      zIndex: cover > 0 ? 1 : undefined}}>
      <div style={{...layer, opacity: 1 - cover}}><Stamp x={17} y={562} size={47} text="战果：0" f={f} at={88} r={-5}/></div>
    </div>
    <Rect x={0} y={0} w={400} h={1080}/>
    <T x={150} y={90} size={92} color={PAPER} style={{writingMode: 'vertical-rl', letterSpacing: '.06em'}}><Drop text="最后只收获一个" f={f} at={9} gap={3}/></T>
    {f >= 44 && <T x={1040} y={110} size={170} bg={PAPER} o="50% 50%"
      style={{transform: `scaleX(${f < 52 ? -1 : -Math.cos(lin(f, 52, 62) * Math.PI)})`}}>尴尬的转身</T>}
  </>;
}

// ── S09 · 第二次 我又奔赴战场 ────────────────────────────────────────────────
function March({frame: f, duration: d}: Shot) {
  const step = localTick(f) * 9, push = away(f, d - 9, d);
  const lead = {cx: 1580 + step, by: 760, h: 650};
  return <>
    <Rect x={0} y={0} w={chapterTwoPanel.width} h={chapterTwoPanel.height}/>
    {f > 0 && <T x={60} y={-110} size={1050} font="num" color={RED} style={{transform: `scale(${mix(1.5, 1, snap(f, 1, 5))})`, transformOrigin: '20% 50%'}}>2</T>}
    <Group s={1 + 1.6 * push} o={`${lead.cx}px ${lead.by - lead.h * .45}px`} style={{opacity: snap(f, 0, 6)}}>
      <Bar x={520} y={1100} len={1700} thick={76} fill={RED} r={-14} grow={snap(f, 2, 10)}/>
      <Arrow x={1560} y={210} len={300} r={-30} fill={RED} thick={34}/>
      {range(7).map(i => {
        const h = 300 + i * 58, w = h * aspect('H-05');
        const cx = 690 + i * 148 + step, by = 1000 - i * 40 - 3 * Math.abs(Math.sin(f * .43 + i));
        const flap = Math.sin(f * .31 + i) * 10;
        return <React.Fragment key={i}>
          <svg style={{...at(cx - w / 2, by - h, w, h), overflow: 'visible'}} viewBox="0 0 1024 1536">
            {/* Fixed hoist follows H-05's sloping pole in source pixels; only the fly moves. */}
            <path d={`M975 38 L${1352 + flap * 3} ${82 + flap * 2} L${1270 + flap * 2} ${205 + flap * 3} L838 225Z`} fill={RED}/>
          </svg>
          <Figure id="H-05" cx={cx} by={by} h={h}/>
        </React.Fragment>;
      })}
    </Group>
    <T x={680} y={74} size={124}><Drop text="第二次" f={f} at={2} gap={3}/></T>
    <T x={1080} y={74} size={124}><Drop text="我又" f={f} at={18} gap={3}/></T>
    {Array.from('奔赴战场').map((c, i) => <Stamp key={i} x={680 + i * 176} y={236 - i * 8} size={118} text={c}
      f={f} at={[33, 55, 62, 69][i]} r={[-5, 3, -3, 5][i]}/>)}
  </>;
}

// ── S10 · 肚子在叫 可下面就是不开腔 ─────────────────────────────────────────
function Shutter({x, y, w, h}: {x: number; y: number; w: number; h: number}) {
  return <svg style={at(x, y, w, h)} viewBox="0 0 480 270" preserveAspectRatio="none">
    <rect width="480" height="270" fill={INK}/>
    <g stroke="#5c5851" strokeWidth="4">{range(7).map(i => <path key={i} d={`M15 ${18 + i * 38}h450`}/>)}</g>
    <g fill={PAPER}>{[16, 464].map(cx => [17, 252].map(cy => <circle key={cx + '-' + cy} cx={cx} cy={cy} r="4"/>))}</g>
    <rect x="218" y="129" width="44" height="38" rx="4" fill={PAPER}/>
    <path d="M226 129v-13a14 14 0 0128 0v13" stroke={PAPER} strokeWidth="5" fill="none"/>
    <path d="M240 142v13" stroke={INK} strokeWidth="5"/>
  </svg>;
}
function Split({frame: f, duration: d, abs}: Shot) {
  const grow = snap(f, d - 9, 9), pump = kick(abs, 8);
  return <>
    <div style={{...at(0, 0, 1920, 520), background: RED, overflow: 'hidden'}}>
      <P id="H-06" x={110} y={-200} w={660}/>
      {range(3).map(i => <svg key={i} style={{...at(660 + i * 34, 250 + i * 46, 420, 90), transform: `scaleX(${.75 + .4 * pump + i * .1})`, transformOrigin: '0 50%'}} viewBox="0 0 420 90">
        <path d="M0 60h30l18-38 26 52 26-58 24 46 34-20 26 28 24-34h212" fill="none" stroke={i === 1 ? INK : PAPER} strokeWidth="7"/>
      </svg>)}
      <T x={840} y={84} size={176} color={PAPER}><Slam text="肚子在叫" f={f} at={1} gap={7}/></T>
      {f >= 28 && <T x={1250} y={330} size={110} r={Math.sin(f * .5) * 4}>咕——</T>}
    </div>
    <Rect x={0} y={520} w={1920} h={20}/>
    <T x={110} y={610} size={124}><Drop text="可下面就是" f={f} at={45} gap={3}/></T>
    {Array.from('不开腔').map((c, i) => <Stamp key={i} x={110 + i * 214} y={790} size={156} text={c} f={f} at={[67, 73, 80][i]} r={i === 2 ? 10 : -3}/>)}
    {f >= 45 && <svg style={at(990, 640, 110, 100)} viewBox="0 0 110 100">
      <path d="M8 34h22l30-26v84L30 66H8z" fill={INK}/><path d="M74 30l30 40M104 30L74 70" stroke={RED} strokeWidth="9"/></svg>}
    <Shutter x={mix(1150, 0, grow)} y={mix(600, 0, grow)} w={mix(680, 1920, grow)} h={mix(390, 1080, grow)}/>
  </>;
}

// ── S11 · 灰溜溜回来 像打了败仗 (the red has drained out) ─────────────────────
function Defeat({frame: f, duration: d}: Shot) {
  const walk = lin(f, 0, d), slump = snap(f, 25, 8);
  const fallBlock = snap(f, d - 16, 16);
  return <>
    {range(4).map(i => {
      const t = away(f, 6 + i * 13, 40 + i * 13);
      return <Rect key={i} x={170 + i * 300} y={70 + i * 60 + t * (760 + i * 40)} w={i % 2 ? 170 : 300} h={i % 2 ? 100 : 22}
        fill={i % 2 ? GREY : INK} r={-24 + t * (40 + i * 9)} o="50% 50%"/>;
    })}
    <Bar x={60} y={1000} len={900} thick={16} r={-8} fill={GREY}/>
    <Wedge x={300} y={860} w={360} h={110} fill={GREY} r={12}/>
    <Figure id="H-07" cx={mix(1340, 430, walk)} by={mix(1010, 1050, walk) - 4 * Math.abs(Math.sin(f * .22))} h={780}/>
    <T x={96} y={64 + 36 * slump} size={150}><Drop text="灰溜溜回来" f={f} at={11} gap={1} len={3}/></T>
    {f >= 62 && <div style={at(1030, 330)}>
      <T x={0} y={0} size={150} color={GREY}><Drop text="像打了败" f={f} at={62} gap={2}/>
        <span style={{display: 'inline-block', color: INK, transform: `translate(${60 * away(f, 84, 104)}px,${760 * away(f, 84, 108)}px) rotate(${32 * away(f, 84, 108)}deg)`}}>仗</span></T>
      {f >= 77 && <svg style={{...at(250, 30, 520, 110), ...wipe(snap(f, 77, 4))}} viewBox="0 0 520 110" fill="none">
        <path d="M0 70l70-38 52 44 48-34 90 28 42-36 64 22 70-26 84 12" stroke={PAPER} strokeWidth="7"/></svg>}
    </div>}
    {f >= d - 16 && <Rect x={700} y={mix(-260, 500, fallBlock)} w={520} h={190} fill={GREY}/>}
  </>;
}

// ── S12 · 坐在沙发上 怀疑人生的方向 ──────────────────────────────────────────
function Sofa({frame: f, duration: d, abs}: Shot) {
  const colour = glide(f, 0, 40), whip = lin(f, d - 9, d - 1) ** 1.4;
  const b = actorBox({camera: 'BL-04_A', frame: f, id: 'H-08', metres: 1.4, contact: .57});
  const alignAt = d - Math.round(BEAT), align = f >= alignAt;
  const arrowTime = align ? abs - f + alignAt - 1 : abs;
  const beat = beatNo(arrowTime);
  const sway = align ? 0 : ((beat % 3) - 1) * 9;
  return <>
    <Group x={-1920 * whip}>
      <div style={{...layer, filter: `grayscale(${1 - colour})`}}><SofaPlate frame={f}/></div>
      <P id="H-08" x={b.x} y={b.y} w={b.w}/>
      {range(8).map(i => {
        const a = i * 45 + 22.5, rad = a * Math.PI / 180;
        const cx = 960 + Math.cos(rad) * 560, cy = 560 + Math.sin(rad) * 330;
        const target = Math.floor(seeded(i * 17 + beat) * 8) * 45;
        const prev = Math.floor(seeded(i * 17 + beat - 1) * 8) * 45;
        const start = mix(prev, target, snap(arrowTime - beat * BEAT, 0, 5));
        const turn = align ? start + ((540 - start) % 360 - 180) * snap(f, alignAt, 5) : start;
        return <Arrow key={i} x={cx - 85} y={cy} len={170} r={turn} fill={i % 2 ? INK : RED} thick={22}/>;
      })}
    <T x={96} y={70} size={136}><Drop text="坐在沙发上" f={f} at={7} gap={3}/></T>
    <T x={1180} y={700} size={104}><Drop text="怀疑人生的" f={f} at={49} gap={3}/></T>
    {f >= 62 && <T x={1180} y={830} size={230} color={RED} o="30% 60%" r={sway} style={{transform: `scale(${mix(1.6, 1, snap(f, 62, 4))})`}}>方向</T>}
    <Note f={f} at={20} text="第二号作战 · 撤退"/>
    </Group>
    {f >= d - 9 && <Group x={1920 * (1 - whip)}>
      <BlenderLayer camera="05_A" layer="wallonly" frame={0}/>
    </Group>}
  </>;
}

// ── S13 · 它明明在那里 却像隔着一堵墙 ────────────────────────────────────────
function RamOutline({points, edges, width = 1}: {points: number[][]; edges: number[][][]; width?: number}) {
  const edgeKey = (ends: number[][]) => ends.map(p => p.join(',')).sort().join('|');
  const border = new Set(points.map((p, i) => edgeKey([p, points[(i + 1) % points.length]])));
  return <Sheet>
    <polygon points={points.map(p => p.join(',')).join(' ')}
      fill="none" stroke={INK} strokeWidth={width} strokeLinejoin="miter" strokeMiterlimit={10}/>
    {edges.filter(ends => !border.has(edgeKey(ends))).map(([a, b], i) =>
      <path key={i} d={`M${a.join(',')}L${b.join(',')}`} fill="none" stroke={INK} strokeWidth={width}/>)}
  </Sheet>;
}
function WallPush({frame: f, duration: d}: Shot) {
  const tilt = glide(f, 0, d - 1);
  const {rear, contact: [tx, ty], outline, edges} = wallProjection[Math.min(wallProjection.length - 1, Math.round(f))];
  const heroWidth = 730;
  // H-09's palm follows the ram's rear face through the approach and each shove.
  const heroX = rear[0] - 1420 * heroWidth / 1536;
  const heroY = rear[1] - 215 * heroWidth / 1536;
  return <Group r={15 * tilt}>
      <BlenderLayer camera="05_A" layer="wallfix" frame={f}/>
      <RamOutline points={outline} edges={edges}/>
      <P id="H-09" x={heroX} y={heroY} w={heroWidth}/>
      {f >= 63 && <Sheet style={{...wipe(snap(f, 63, 8))}}>
        <circle cx={tx} cy={ty} r="46" fill="none" stroke={RED} strokeWidth="6"/>
        <path d={`M${tx + 38} ${ty - 24}L${tx + 120} ${ty - 110}H${tx + 340}`} fill="none" stroke={INK} strokeWidth="3"/>
        <path d={`M${tx - 20} ${ty + 50}v50M${tx + 20} ${ty + 50}v50M${tx - 20} ${ty + 84}h40`} stroke={INK} strokeWidth="3" fill="none"/>
        <path d={`M${tx - 20} ${ty + 84}L${tx - 100} ${ty + 146}H${tx - 350}`} fill="none" stroke={INK} strokeWidth="3" strokeDasharray="9 7"/>
      </Sheet>}
      {f >= 66 && <T x={tx + 128} y={ty - 162} size={40} font="caption" bg={PAPER}>目标 · 它</T>}
      {f >= 74 && <T x={tx - 350} y={ty + 100} size={40} font="caption" color={RED} bg={PAPER}>距离 ≈ 0 cm</T>}
    <T x={140} y={249} size={260} font="num" color={RED} style={{transform: `scale(${mix(1.5, 1, snap(f, 0, 5))})`, transformOrigin: '20% 50%'}}>3</T>
    {f >= 6 && <T x={430} y={164} size={116} bg={PAPER}><Drop text="它明明在那里" f={f} at={6} gap={3}/></T>}
    {f >= 94 && <T x={1170} y={650} size={82} bg={PAPER}><Drop text="却像隔着" f={f} at={94} gap={3}/></T>}
    {Array.from('一堵墙').map((c, i) => <T key={i} x={1170 + i * 172} y={756} size={94} bg={PAPER}
      style={{border: `6px solid ${INK}`, padding: '10px 17px 16px', visibility: f < [124, 129, 138][i] ? 'hidden' : 'visible',
        transform: `translateY(${-80 * (1 - snap(f, [124, 129, 138][i], 4))}px)`}}>{c}</T>)}
  </Group>;
}

// ── S14 · the build: four cuts, one per beat, counting down ───────────────────
function Build({frame: f, duration: d}: Shot) {
  const cuts = [0, 21, 35, 50, d];
  const sec = cuts.findIndex((c, i) => f >= c && f < cuts[i + 1]);
  const local = f - cuts[sec];
  const tremor = 1 + .03 * (1 - lin(f % (BEAT / 4), 0, 3));
  if (f >= d - 2) return <Fill color={PAPER}/>;
  return <AbsoluteFill style={{background: sec % 2 ? INK : RED}}>
    <Group r={-15} s={tremor}>
      {sec === 0 && <PressureGauge x={460} y={40} w={1000}
        angle={mix(-120, 96, snap(local, 0, 16))}/>}
      {sec === 1 && <P id="H-10" x={-760} y={-860} w={3200}/>}
      {sec === 2 && <>
        <BlenderLayer camera="05_A2" layer="wallfix" frame={Math.min(29, local * 2)}/>
        <RamOutline points={wallCloseupProjection[Math.min(29, local * 2)].outline}
          edges={wallCloseupProjection[Math.min(29, local * 2)].edges} width={3}/>
      </>}
      {sec === 3 && <>
        <P id="O-12" x={230} y={-250} w={1500} r={Math.floor(local / 3) * 6}/>
        <RedPrint id="O-12" x={230} y={-250} w={1500} amount={1}/>
      </>}
    </Group>
    <T x={1540} y={700} size={420} font="num" color={sec % 2 ? RED : PAPER} style={{transform: `scale(${mix(1.5, 1, snap(local, 0, 3))})`}}>{4 - sec}</T>
  </AbsoluteFill>;
}

// ── S15 · 哈！ ─────────────────────────────────────────────────────────────────
function Shout({frame: f}: Shot) {
  const [qx, qy] = quake(f, 20, 7);
  return <AbsoluteFill style={{background: INK}}>
    <Splash x={260} y={180} d={760} n={2} invert opacity={.55}/>
    <Splash x={1650} y={880} d={720} n={3} invert opacity={.55}/>
    <T x={190 + qx} y={70 + qy} size={800} color={RED} o="50% 50%" r={-6}
      style={{transform: `scale(${mix(1.8, 1, snap(f, 0, 4))})`}}>哈！</T>
    {f === 2 && <Fill color={PAPER} style={{opacity: .5}}/>}
  </AbsoluteFill>;
}

// ── S16 · 进进退退三回 ─────────────────────────────────────────────────────────
function RepeatedCharge({frame: f, duration: d}: Shot) {
  const period = 2 * BEAT, p = Math.max(0, f - 6) / period;
  const leg = Math.floor(p * 2), within = (p * 2) % 1;
  const forward = leg % 2 === 0;
  const travel = forward ? snap(within, 0, .55) : 1 - snap(within, 0, .55);
  // H-01's fist reaches the door slab (plate x≈886) at the end of each forward leg.
  const hw = 560, x = mix(-60, 880 - hw * .97, f < 6 ? 0 : travel), floor = 1016;
  const whip = away(f, d - 10, d);
  return <>
    <Group r={-8 - 14 * glide(f, 0, d)} s={.92} x={-1800 * whip} o="960px 700px">
      <Rect x={-600} y={floor} w={3200} h={30}/>
      <BlenderLayer camera="03_B" frame={Math.min(87, f)}/>
      {range(3).map(i => <Bar key={i} x={x - 420 + i * 60} y={floor - 230 + i * 40} len={420 - i * 100} thick={14 - i * 3} fill={RED} r={0}/>)}
      <P id="H-01" x={x} y={floor - hw / aspect('H-01') + 6} w={hw} flip={!forward}/>
    </Group>
    {whip > 0 && range(4).map(i => <Bar key={i} x={0} y={260 + i * 170} len={1920} thick={6 + i * 4} r={-3} fill={i % 2 ? INK : RED}/>)}
    <div style={{...at(96, 64), display: 'flex', gap: 12}}>
      {Array.from('进进退退三回').map((c, i) => <T key={i} x={0} y={0} size={150} color={i >= 4 ? RED : INK}
        style={{position: 'relative', visibility: f < [6, 21, 36, 51, 65, 80][i] ? 'hidden' : 'visible',
          transform: `scale(${mix(1.7, 1, snap(f, [6, 21, 36, 51, 65, 80][i], 4))})`}}>{c}</T>)}
    </div>
    {['Ⅰ', 'Ⅱ', 'Ⅲ'].map((n, i) => <Stamp key={n} x={1310 + i * 180} y={260} size={120} text={n} f={f} at={[35, 64, 93][i]} r={[-4, 3, -3][i]}/>)}
  </>;
}

// ── S17 · 我和马桶两败俱伤—— ─────────────────────────────────────────────────
function Duel({frame: f, duration: d}: Shot) {
  const t = lin(f, 0, d), hold = glide(f, 22, d - 12), crack = lin(f, 18, d - 14);
  const close = snap(f, d - 6, 5), amp = 2 + 6 * t;
  return <AbsoluteFill style={{background: PAPER}}>
    <Group x={Math.sin(f * 2.3) * amp} y={Math.cos(f * 1.9) * amp}>
      <Sheet><polygon points="0,0 1360,0 440,1080 0,1080" fill={INK}/></Sheet>
      <P id="H-10" x={-90} y={250} w={900} r={-4 - 8 * t}/>
      <P id="O-01" x={1250} y={-50} w={580} r={4 + 8 * t}/>
      <Sheet>
        <path d="M1420 -30L1080 380 1136 372 830 740 880 724 520 1120" stroke={RED} strokeWidth="38" fill="none"/>
        <g stroke={PAPER} strokeWidth="7" fill="none" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - crack}>
          <path d="M190 560l72 40 48-8 46 68 58 4 42 36-10 56 62 60" pathLength={1}/><path d="M356 660l-38 58-44 12-20 40" pathLength={1}/></g>
        <g stroke={INK} strokeWidth="6" fill="none" strokeDasharray="1" strokeDashoffset={1 - crack}>
          <path d="M1490 220l-14 68 45 48-24 35 36 39-8 58 54 49" pathLength={1}/><path d="M1520 336l48-14 57 17 36-15" pathLength={1}/></g>
      </Sheet>
    </Group>
    <T x={96} y={86} size={120} color={PAPER}><Drop text="我和马桶" f={f} at={1} gap={3}/></T>
    <Group r={-38} o="760px 640px">
      <T x={700} y={560} size={150} bg={PAPER}><Slam text="两败俱" f={f} at={8} gap={3}/>
        <span style={{display: 'inline-block', color: RED, visibility: f < 17 ? 'hidden' : 'visible', marginLeft: 20 + 60 * hold,
          transform: `scaleX(${1 + 1.4 * hold})`, transformOrigin: '0 50%', marginRight: 150 * 1.4 * hold}}>伤</span></T>
    </Group>
    {close > 0 && <Rect x={0} y={0} w={1920} h={1080} fill={RED} style={{clipPath: `inset(0 ${(1 - close) * 50}% 0 ${(1 - close) * 50}%)`}}/>}
    {f === d - 1 && <Fill color={PAPER}/>}
  </AbsoluteFill>;
}

const scenes: React.FC<Shot>[] = [
  Exposure, Monument, Rally, Title, Charge, Confident, Waiting, Retreat, March,
  Split, Defeat, Sofa, WallPush, Build, Shout, RepeatedCharge, Duel,
];
export function Opening({shot, ...props}: Shot & {shot: number}) {
  const Scene = scenes[shot - 1];
  return Scene ? <AbsoluteFill style={{overflow: 'hidden', background: PAPER}}><Scene {...props}/></AbsoluteFill> : null;
}
