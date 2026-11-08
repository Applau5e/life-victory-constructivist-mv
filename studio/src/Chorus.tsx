// S18–S34 · both choruses and the bridge.
import React, {type ReactNode} from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {actorBox, BlenderLayer, GroundedPhoto, hasPlate} from './Blender';
import {GateInscription, gatePanelTrack} from './GateInscription';
import {SYNC} from './sync';
import {SummitChampion, MonumentReveal, MedalInk, Medal} from './VictoryReveal';
import {Dignity} from './Dignity';
import {ToiletMatch, StadiumPlate, StadiumImpact, StadiumFireworks} from './Stadium';
import {MonumentFinale} from './MonumentFinale';
import cityGateway from './s29-gateway.json';
import {
  type Shot, INK, PAPER, RED, GOLD, DARK, GREY, BEAT, at, layer, lin, mix, range, snap, land, glide, away, ratchet, beatNo, kick, quake,
  Group, Sheet, Fill, Rect, Bar, Disc, P, Figure, RedPrint, maskOf, aspect, T, Slam, Drop, wipe, Stamp, Slats, PressureGauge,
} from './kit';

// ── S18 · 最后一次 我咬紧牙关 ────────────────────────────────────────────────
function Decision({frame: f, duration: d, abs}: Shot) {
  const [qx, qy] = quake(f, 16, 12);
  const face = mix(1.25, 1, snap(f, 0, 5)) * mix(1, 1.1, glide(f, 0, d));
  const choir = {x: -180, y: 500 + 6 * kick(abs), w: 960, r: 9};
  return <Group x={qx} y={qy} s={1.02}>
    <Fill color={RED}/><Slats abs={abs}/>
    <Sheet><polygon points="0,720 1920,180 1920,660 0,1080" fill={PAPER}/></Sheet>
    <P id="C-01" {...choir}/>
    {/* P mirrors the rotated image; sharing r preserves exact left/right symmetry. */}
    <P id="C-01" {...choir} x={1920 - choir.x - choir.w} flip/>
    <div style={{...layer, transform: `scale(${face})`, transformOrigin: '50% 58%'}}><P id="H-10" x={490} y={130} w={940}/></div>
    <T x={96} y={40} size={176} color={PAPER} bg={INK}><Slam text="最后一次" f={f} at={0} gap={9}/></T>
    {f >= 72 && <T x={560} y={880} size={150} color={PAPER} bg={INK} style={{transform: 'scaleY(.86)', transformOrigin: '0 0'}}>
      <Slam text="我咬紧牙关" f={f} at={72} gap={2}/></T>}
  </Group>;
}

// ── S19 · 脸憋得通红 青筋都在呐喊 ────────────────────────────────────────────
const veins = [
  [530, 297, 345, 210, 115, 210], [558, 356, 377, 444, 106, 444], [514, 402, 285, 532, 65, 532],
  [1400, 294, 1570, 197, 1775, 197], [1415, 348, 1575, 439, 1807, 439], [1435, 404, 1655, 530, 1860, 530]];
function Veins({frame: f, duration: d, abs}: Shot) {
  const w = mix(1180, 1300, glide(f, 0, d)), x = 960 - w / 2, y = mix(20, -30, glide(f, 0, d));
  return <>
    <Fill color={PAPER}/><Slats abs={abs}/>
    <P id="H-10" x={x} y={y} w={w}/>
    <RedPrint id="H-10" x={x} y={y} w={w} amount={snap(f, 16, 7)}/>
    <Sheet>{veins.map(([ax, ay, bx, by, cx, cy], i) => <path key={i} d={`M${ax},${ay}L${bx},${by}H${cx}`}
      fill="none" stroke={RED} strokeWidth={12} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - snap(f, 40 + i * 3, 9)}/>)}</Sheet>
    {veins.map(([, , , , cx, cy], i) => f > 50 + i * 3 && <React.Fragment key={i}>
      <P id="O-05" x={cx - 84} y={cy - 88} w={168} flip={i < 3}/>
      {f > 58 + i * 3 && <T x={i < 3 ? cx - 70 : cx + 40} y={cy - 150} size={84} color={RED} r={-8}
        style={{transform: `scale(${mix(1.8, 1, snap(f, 58 + i * 3, 4))})`}}>喊</T>}
    </React.Fragment>)}
    <T x={70} y={744} size={150} color={PAPER} bg={INK}><Drop text="脸憋得通红" f={f} at={1} gap={3}/></T>
    {f >= 44 && <T x={700} y={912} size={118} color={PAPER} bg={RED}><Drop text="青筋都在呐喊" f={f} at={44} gap={2}/></T>}
  </>;
}

// ── S20 / S30 · 鬼门关 ─────────────────────────────────────────────────────────
function PowerPlate({f, fleet}: {f: number; fleet: boolean}) {
  const rows = fleet ? 3 : 1;
  return <div style={{...at(70, 740, 780, 270), border: `7px solid ${INK}`, background: PAPER, boxShadow: `14px 14px 0 ${RED}`}}>
    <T x={24} y={16} size={40} font="caption" track={.2}>{fleet ? '全民 · 动力来源' : '动力来源'}</T>
    <P id="O-09" x={16} y={70} w={150}/>
    {range(rows).map(i => {
      const power = Math.round(snap(f, 6 + i * 6, 46) * 100);
      return <div key={i} style={{...at(180, 78 + i * 56, 560, fleet ? 42 : 60), border: `4px solid ${INK}`}}>
        <div style={{width: `${power}%`, height: '100%', background: RED}}/>
        <T x={440} y={fleet ? 4 : 10} size={fleet ? 30 : 38} font="num" color={power > 82 ? PAPER : INK}>{power}%</T>
      </div>;
    })}
    {!fleet && <T x={180} y={160} size={76}>吃奶的劲</T>}
  </div>;
}
function Gate({frame: f, duration: d, fleet = false}: Shot & {fleet?: boolean}) {
  const cam = fleet ? 'B' : 'A', native = '06_' + cam;
  let shown = f;
  // Hold the nearest finished entrance frame together with its own lettering.
  if (gatePanelTrack[cam][f]) while (shown > 0 && !hasPlate(native, 'main', shown)) shown--;
  const second = f >= (fleet ? 60 : 70);
  const line = second ? '仿佛过鬼门关' : (fleet ? '使出了全民吃奶的劲' : '使出了吃奶的劲');
  const at0 = second ? (fleet ? 60 : 70) : 0;
  return <>
    <Fill color={PAPER}/>
    <BlenderLayer camera={native} frame={shown}/>
    {hasPlate(native, 'main', shown) && <GateInscription camera={cam} frame={shown}/>}
    <PressureGauge x={1560} y={560} w={340} r={-13}
      angle={mix(-110, 70 + 6 * Math.sin(f * 1.7), snap(f, 4, 40))}/>
    <PowerPlate f={f} fleet={fleet}/>
    <T x={96} y={280} size={110} color={PAPER} bg={INK}><Drop key={line} text={line} f={f} at={at0} gap={2}/></T>
  </>;
}

// ── S21 / S31 · 噗通 ───────────────────────────────────────────────────────────
function Diamond({x, y, size}: {x: number; y: number; size: number}) {
  return <path d={`M${x} ${y - size}L${x + size * .36} ${y - size * .36} ${x + size} ${y} ${x + size * .36} ${y + size * .36} ${x} ${y + size} ${x - size * .36} ${y + size * .36} ${x - size} ${y} ${x - size * .36} ${y - size * .36}Z`} fill={GOLD}/>;
}
function Impact({frame: f, top = false, stop, hitA, hitB, hey = 59}: {frame: number; top?: boolean; stop: number; hitA: number; hitB: number; hey?: number}) {
  const cam = top ? '07_B' : '07_A';
  const fall = f < stop ? 39 * f / stop : f < hitA ? 39 : 41 + 2 * (f - hitA);
  const plateStyle = top ? {left: 683, top: 558, width: 544, height: 408} : undefined;
  const impact = f - hitA, ring = f - hitB;
  const [ax, ay] = quake(impact, 18, 12), [bx, by] = quake(ring, 12, 10);
  const vacuum = f === stop; // the held frame: paper, black water, red wedge — nothing else
  return <Group x={ax + bx} y={ay + by} s={f >= hitA ? 1.02 : 1}>
    {!top && <BlenderLayer camera={cam} layer="water" frame={fall}/>}
    {f < hitA && <BlenderLayer camera={cam} layer="wedge" frame={fall} style={plateStyle}/>}
    {f >= hitA && ['crown', 'droplets'].map(l => <BlenderLayer key={l} camera={cam} layer={l} frame={fall} style={plateStyle}/>)}
    {f >= hitB && <BlenderLayer camera={cam} layer="ripples" frame={45 + 2 * ring} style={plateStyle}/>}
    {f < stop && !vacuum && <T x={top ? 96 : 120} y={mix(70, 200, lin(f, 0, stop))} size={top ? 120 : 150} bg={top ? PAPER : undefined}>
      <Drop text="噗通一声" f={f} at={0} gap={4}/></T>}
    {f >= hitA && <T x={top ? 120 : 100} y={top ? 380 : 330} size={340} color={RED}
      style={{transform: `scale(${mix(1.7, 1, snap(impact, 0, 4))})`}}>噗</T>}
    {f >= hitB && <T x={top ? 1440 : 1480} y={top ? 400 : 360} size={340} color={RED}
      style={{transform: `scale(${mix(1.7, 1, snap(ring, 0, 4))})`}}>通</T>}
    {f >= hitB && ring < 16 && <Sheet>{[[96, 96], [1824, 96], [96, 984], [1824, 984]].map(([x, y], i) =>
      <Diamond key={i} x={x} y={y} size={40 * (1 - lin(ring, 4, 16))}/>)}</Sheet>}
    {top && f >= hey && <T x={780} y={150} size={200} font="num" color={PAPER} bg={RED} r={-8}
      style={{transform: `scale(${mix(1.6, 1, snap(f, hey, 4))})`}}>HEY!</T>}
  </Group>;
}

// ── S22 · 天哪 我终于完成了这件大事 ──────────────────────────────────────────
function Confetti({f, count = 46}: {f: number; count?: number}) {
  return <Sheet>{range(count).map(i => {
    const y = ((f * 5.6 + i * 137) % 1380) - 160, x = (i * 491 + (y + 200) * .43) % 2070 - 60;
    return <g key={i} transform={`translate(${x} ${y}) rotate(${i * 17 + f * (i % 3 - 1) * 2})`}>
      {i % 4 === 0 ? <circle r="10" fill={GOLD}/> : i % 4 === 1 ? <path d="M-12 12L0 -12L12 12Z" fill={RED}/> :
        <rect x="-7" y="-7" width={i % 4 === 2 ? 16 : 40} height={i % 4 === 2 ? 16 : 8} fill={i % 4 === 2 ? INK : PAPER}/>}</g>;
  })}</Sheet>;
}
function Triumph({frame: f, duration: d, abs}: Shot) {
  const lift = land(f, 0, 18), [qx, qy] = quake(f - 72, 14, 10), leave = away(f, d - 6, d);
  return <>
    <Slats abs={abs} gold/>
    <Sheet><path d="M-90 1080L800 190H1120L230 1080Z" fill={RED}/></Sheet>
    <Figure id="H-12" cx={560} by={mix(1900, 1110, lift)} h={1020}/>
    <Confetti f={f}/>
    <T x={980} y={56} size={280} style={{transform: `scale(${mix(1.6, 1, snap(f, 0, 4))})`, transformOrigin: '0 0'}}>天哪</T>
    <T x={990} y={352} size={110}><Drop text="我终于完成了" f={f} at={29} gap={2}/></T>
    {f >= 50 && <T x={990} y={480} size={110} color={RED}><Drop text="这件" f={f} at={50} gap={3}/></T>}
    {f >= 72 && <div style={{...layer, transform: `translate(${qx}px,${qy - 900 * leave}px)`}}>
      <T x={880} y={600} size={380} color={PAPER} bg={RED} r={-7}
        style={{borderTop: `12px solid ${GOLD}`, borderBottom: `12px solid ${GOLD}`, padding: '0 34px 26px', transform: `scale(${mix(1.6, 1, snap(f, 72, 4))})`}}>大事</T>
    </div>}
  </>;
}

// ── S23 / S33 · 珠峰 · 冠军 ────────────────────────────────────────────────────
function Laurels() {
  return <Sheet>{[-1, 1].map(side => <g key={side} transform={`translate(970 520) scale(${side},1)`}>
    <path d="M35 119Q274 129 348 -131" stroke={GOLD} fill="none" strokeWidth="10"/>
    {range(8).map(i => <g key={i} transform={`translate(${72 + i * 36} ${117 - i * i * 3.7}) rotate(${-11 - i * 6})`}>
      <path d="M0 0Q17 -48 65 -53Q49 -18 0 0Z" fill={GOLD}/></g>)}</g>)}</Sheet>;
}
function Flag({x, y, w, open = 1}: {x: number; y: number; w: number; open?: number}) {
  return <g transform={`translate(${x} ${y})`}><path d="M0 215V0" stroke={INK} strokeWidth="7"/>
    <path d={`M3 0Q${w * .33 * open} -17 ${w * .65 * open} 6L${w * open} -2L${w * .82 * open} 61Q${w * .4 * open} 49 3 61Z`} fill={RED} stroke={INK} strokeWidth="3"/></g>;
}
function PoleChampion({actor, frame}: {actor: ReturnType<typeof actorBox>; frame: number}) {
  // Match H-20's cap-to-sole height, not the taller canvas containing the pole.
  const scale = actor.h * (1515 / 1536) / 1466;
  const x = actor.x + actor.w / 2 - 450 * scale;
  const y = actor.y + actor.h * .995 - 1656 * scale;
  const wave = Math.sin(frame * .24), wave2 = Math.sin(frame * .24 - 1.2);
  const open = snap(frame, 5, 10);
  return <div style={{...at(x, y, 948, 1660), transform: `scale(${scale})`, transformOrigin: '0 0'}}>
    <P id="H-21" x={0} y={0} w={948}/>
    {/* Both luff endpoints stay pinned to the photographed wooden pole. */}
    <svg width={948} height={1660} viewBox="0 0 948 1660" style={{...at(0, 0), overflow: 'visible'}}>
      <g transform={`translate(683 35) scale(${-open} 1)`}>
        <path d={`M0 0C155 ${-25 + wave * 14} 320 ${20 + wave2 * 16} 500 ${-12 + wave * 14}
          L465 ${128 + wave * 14}C315 ${160 + wave2 * 16} 145 ${115 + wave * 14} 0 140Z`}
          fill={RED} stroke={INK} strokeWidth={5}/>
      </g>
    </svg>
    {/* S23's medal proportions mapped from cap-to-sole anatomy to this pose. */}
    <MedalInk/>
    <Medal x={368} y={541 - 450 / scale * (1 - land(frame, 20, 13))} w={188}/>
  </div>;
}
function Platform({frame: f, duration: d, abs, combined = false}: Shot & {combined?: boolean}) {
  const half = combined ? 0 : Math.floor(d / 2);
  const podium = combined || f >= half;
  const camera = combined ? 'BL-08_C' : podium ? 'BL-08_B' : 'BL-08_A';
  const local = combined || !podium ? f : f - half;
  const actor = actorBox({camera, frame: local, id: podium ? 'H-20' : 'H-13', metres: 1.93, contact: .995});
  const rise = combined ? snap(f, 0, 61) : 1;
  const pull = combined ? 0 : away(f, d - 10, d);
  const medalAt = combined ? 20 : half + 4;
  const medalTop = combined ? .17 : .24;
  const word = combined ? (f < 60 ? '珠峰' : '冠军') : (podium ? '冠军' : '珠峰');
  const lead = combined ? (f < 60 ? '感觉像登了' : '像拿了') : (podium ? '像拿了' : '感觉像登了');
  const wordAt = combined ? (f < 60 ? 10 : 60) : (podium ? half : 5);
  const champion = word === '冠军';
  return <>
    <Slats abs={abs} gold/>
    {combined && <>
      {/* Keep the cheering row in screen space as the camera rises. Smaller groups
          expose faces as well as hands; the podium remains in front of them. */}
      <P id="CR-02" x={-100} y={710 - 12 * kick(abs)} w={1120} r={-2}/>
      <P id="CR-02" x={900} y={720 - 12 * kick(abs)} w={1120} r={2} flip/>
    </>}
    <div style={{...layer, transform: `translateY(${(1 - rise) * -170}px) scale(${1 + (1 - rise) * .15 + pull * 4.3})`, transformOrigin: '50% 42%'}}>
      {podium && <Laurels/>}
      <BlenderLayer camera={camera.slice(3)} frame={local}/>
      {!podium ? <>
        <GroundedPhoto camera="BL-08_A" frame={f} id="H-13" metres={1.93} contact={.995}/>
        <Sheet><Flag x={actor.x + .694 * actor.w} y={actor.y + .009 * actor.h} w={actor.h * .32} open={snap(f, 6, 8)}/></Sheet>
      </> : combined ? <PoleChampion actor={actor} frame={f}/> : <>
        <GroundedPhoto camera={camera} frame={local} id="H-20" metres={1.93} contact={.995}/>
        <P id="O-08" x={actor.x + .405 * actor.w} y={actor.y + medalTop * actor.h - 450 * (1 - land(f, medalAt, 13))} w={actor.w * .19}
          style={{filter: 'sepia(1) saturate(2.8) contrast(1.1)'}}/>
      </>}
    </div>
    <T x={96} y={70} size={100} color={PAPER} bg={INK}><Drop key={lead} text={lead} f={f} at={wordAt - 5 < 0 ? 0 : wordAt - 5} gap={2}/></T>
    {f >= wordAt && <T x={1180} y={130} size={300} color={champion ? GOLD : PAPER} bg={champion ? INK : RED} r={-7}
      style={{transform: `scale(${mix(1.6, 1, snap(f, wordAt, 4))})`}}>{word}</T>}
  </>;
}

// ── S25 · 擦擦汗！冲个水！(call and response) ───────────────────────────────
function CallResponse({frame: f, duration: d}: Shot) {
  if (f >= 78) {
    const t = f - 78;
    return <>
      <Fill color={INK}/>
      <BlenderLayer camera="09_A" frame={Math.min(89, t * 7.8)}/>
      <T x={640} y={430} size={190} color={PAPER} bg={RED} r={-9} style={{transform: `scale(${mix(1.6, 1, snap(t, 0, 4))})`}}>冲个水！</T>
    </>;
  }
  const answer = f >= 24 && f < 54, flush = f >= 54;
  return <>
    <div style={{...at(0, 0, 948, 1080), overflow: 'hidden', background: PAPER}}>
      {flush ? <P id="HD-04" x={210} y={-60 + 90 * snap(f, 58, 6)} w={560}/> : <P id="H-14" x={50} y={170} w={860}/>}
      <T x={70} y={64} size={160} color={PAPER} bg={RED}><Drop key={flush ? 'b' : 'a'} text={flush ? '冲个水' : '擦擦汗'} f={f} at={flush ? 54 : 0} gap={3}/></T>
      {answer && <Fill color={INK} style={{opacity: .72}}/>}
    </div>
    <div style={{...at(966, 0, 954, 1080), overflow: 'hidden', background: RED}}>
      {range(6).map(i => <P key={i} id={i % 3 === 1 ? 'C-03' : 'C-02'} x={(i % 3) * 318 - 4} y={Math.floor(i / 3) * 450 + 150}
        w={330} style={{transform: `translateY(${answer ? (1 - snap(f, 24 + i, 5)) * 60 : 0}px)`}}/>)}
      {answer ? <T x={60} y={60} size={150} bg={PAPER} r={5} style={{transform: `scale(${mix(1.6, 1, snap(f, 24, 4))})`}}>擦擦汗！</T> :
        <Fill color={INK} style={{opacity: .72}}/>}
    </div>
    <Rect x={948} y={0} w={18} h={1080} fill={RED}/>
  </>;
}

// ── S26 · 腿麻了也心甘情愿 · 回头望一眼（望一眼！） ──────────────────────────
function Glance({frame: f, duration: d, abs}: Shot) {
  const faceAt = 78, eyeAt = 102;
  if (f < faceAt) {
    const x = 600, y = 70, h = 980, w = h * aspect('H-16');
    const shift = Math.sin(f * 2.65) * 3;
    return <>
      <Slats abs={abs} quiet/>
      <div style={{...at(x, y, w, h), maskImage: `url("${staticFile('art/H-16.png')}"),url("${staticFile('art/H-16-legs.png')}")`,
        maskSize: '100% 100%', maskRepeat: 'no-repeat', maskComposite: 'subtract'}}><P id="H-16" x={0} y={0} w={w}/></div>
      <div style={{...at(x + shift, y, w, h), ...maskOf('H-16-legs')}}><P id="H-16" x={0} y={0} w={w}/></div>
      <Sheet>{[0, 1, 2].map(i => <path key={i} d={`M${x + 150 + i * 120 + shift} ${y + 660}l-45 54 47 -7 -54 68 37 -10 -45 52`}
        stroke={RED} strokeWidth="8" fill="none"/>)}</Sheet>
      <T x={96} y={150} size={150}><Drop text="腿" f={f} at={2}/></T>
      <T x={150 + shift * 2} y={290} size={380} color={RED} style={{visibility: f < 8 ? 'hidden' : 'visible'}}>麻</T>
      <T x={150} y={690} size={110}><Drop text="了也" f={f} at={17} gap={3}/></T>
      <T x={1220} y={640} size={140} color={PAPER} bg={INK}><Drop text="心甘" f={f} at={34} gap={4}/></T>
      <T x={1220} y={820} size={140} color={PAPER} bg={INK}><Drop text="情愿" f={f} at={42} gap={4}/></T>
    </>;
  }
  if (f < eyeAt) return <>
    <Slats abs={abs} quiet/>
    <P id="H-15" x={720} y={90 + 30 * (1 - snap(f, faceAt, 8))} w={1060}/>
    <T x={80} y={170} size={160} color={PAPER} bg={RED}><Slam text="回头望一眼" f={f} at={faceAt} gap={3}/></T>
  </>;
  const w = 1020, x = 434, y = 36, cx = x + w * 687 / 1254, cy = y + w * 642 / 1254, diam = w * 260 / 1254;
  const blink = Math.max(.025, 1 - .975 * Math.sin(Math.PI * lin(f, eyeAt + 2, eyeAt + 9)));
  return <>
    <Fill color={RED}/>
    <div style={{...layer, transform: `scale(${1 + lin(f, Math.max(eyeAt + 8, d - 8), d) ** 3 * 31})`, transformOrigin: `${cx}px ${cy}px`}}>
      <P id="O-13" x={x} y={y} w={w}/>
      <div style={{...at(x, y, w, w), ...maskOf('O-13-lens'), background: INK}}>
        <div style={{...at(cx - x - diam / 2, cy - y - diam / 2, diam, diam), overflow: 'hidden', borderRadius: '50%', transform: `scaleY(${blink})`}}>
          <Img src={staticFile('art/H-11.png')} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(1) contrast(1.25)'}}/></div></div>
    </div>
    {f < d - 5 && <T x={90} y={130} size={170} color={PAPER} bg={INK} r={-6} style={{transform: `scale(${mix(1.6, 1, snap(f, eyeAt, 4))})`}}>望一眼！</T>}
  </>;
}

// ── S27 · 那漂着的 是我今天的尊严—— + solo + HEY! HEY! ───────────────────────

// ── S28 · 最后一次（全民） ─────────────────────────────────────────────────────
function Masses({frame: f, duration: d}: Shot) {
  const launch = away(f, d - 10, d - 1);
  // One chorus follows the exact lower edge; dense heads fill the rest to the tip.
  const crowdWedge = 'polygon(-185px 656px, 1660px 257px, 20px 1090px)';
  const lowerEdge = (x: number) => 1090 + (x - 20) * (257 - 1090) / (1660 - 20);
  const angle = Math.atan2(257 - 1090, 1660 - 20);
  const chorus = {x: 38, by: lowerEdge(38), w: 920, h: 920 / aspect('C-01')};
  const cs = Math.cos(angle), sn = Math.sin(angle);
  // Pack in the same tilted coordinate system as the chorus. The lower edge
  // is v=0, so every portrait shares the slope without leaking across the wedge.
  const local = (x: number, y: number) => {
    const dx = x - chorus.x, dy = y - chorus.by;
    return [dx * cs + dy * sn, -dx * sn + dy * cs];
  };
  const [upperU, upperV] = local(-185, 656), [tipU] = local(1660, 257);
  const upperEdge = (u: number) => upperV * (tipU - u) / (tipU - upperU);
  const gapHeads: {x: number; y: number; w: number; depth: number}[] = [];
  const headSize = 142; // Original large-copy size, identical all the way to the tip.
  // No heads above the chorus. Start immediately beside its right edge,
  // rather than rounding to a global grid and leaving an empty strip.
  for (let u = chorus.w + 4; u < tipU; u += 96) {
    const bottom = 16;
    for (let v = bottom - headSize; v + headSize > upperEdge(u); v -= 88) {
      gapHeads.push({x: chorus.x + u * cs - v * sn, y: chorus.by + u * sn + v * cs, w: headSize, depth: v});
    }
  }
  gapHeads.sort((a, b) => a.depth - b.depth); // Back rows first, front faces on top.
  return <>
    <Group y={1100 * launch}>
      <P id="CR-03" x={-60} y={300} w={2040}/>
    </Group>
    <Group x={2160 * launch} y={-1247 * launch}>
      <div style={{...layer, clipPath: crowdWedge}}>
        <Fill color={RED}/>
        {gapHeads.map(({depth, ...box}, i) => <P key={`head-${i}`} id="H-10" {...box} r={angle * 180 / Math.PI} o="0 0%"/>)}
        <P id="C-01" x={chorus.x} y={chorus.by - chorus.h} w={chorus.w} r={angle * 180 / Math.PI} o="0 100%"/>
      </div>
    </Group>
    <Group y={1100 * launch}>
      <P id="H-10" x={1070} y={250} w={840}/>
    </Group>
    <Sheet>
      {Array.from('最后一次').map((c, i) => <g key={c}
        transform={`translate(${430 + i * 240} ${mix(-520, -18, snap(f, [0, 14, 29, 44][i], 8))})`}>
        {/* Tall hanging flags, anchored outside the upper frame edge. */}
        <path d="M0 0H190V430L95 410 0 430Z" fill={RED}/>
        <path d="M0 0H190V16H0Z" fill={DARK}/>
        <text x="95" y="260" textAnchor="middle" dominantBaseline="central" fill={PAPER}
          fontSize="150" fontFamily='"Victory Title","Victory Caption",sans-serif'>{c}</text>
      </g>)}
    </Sheet>
    <Stamp x={70} y={55} size={44} text="全民的胜利" f={f} at={0} r={-5} color={INK}/>
    {f >= 73 && <T x={96} y={900} size={130} color={PAPER} bg={INK}><Slam text="我咬紧牙关" f={f} at={73} gap={2}/></T>}
  </>;
}

// ── S29 · the whole city strains ───────────────────────────────────────────────
function CityCry({frame: f, duration: d, abs}: Shot) {
  const second = f >= 58;
  const redAt = 21; // Existing “通红” cue; six-frame upward color wipe.
  const approach = glide(f, d - 20, d - 1);
  const revealGate = glide(f, d - 28, d - 20);
  const cityExit = away(f, d - 20, d - 4);
  const scale = mix(.46, 1, approach);
  const gx = mix(1100, 984, approach), gy = mix(600, 480, approach);
  const gather = glide(f, d - 23, d - 9);
  const overlayOut = 1 - lin(f, d - 10, d - 4);
  const matchGate = glide(f, d - 4, d - 1);
  const cityPlate = <>
    <BlenderLayer camera="12_A" layer="city_cream" frame={f}/>
    <div style={{...layer, clipPath: `inset(${100 * (1 - lin(f, redAt, redAt + 6))}% 0 0 0)`}}>
      {/* Recolor the complete alpha silhouette, including formerly black objects.
          Two red toon bands preserve light/dark faces without rebuilding plates. */}
      <BlenderLayer camera="12_A" layer="city_cream" frame={f} style={{filter: 'url(#s29-whole-city-red)'}}/>
    </div>
  </>;
  return <>
    <svg width="0" height="0" aria-hidden="true"><defs>
      <filter id="s29-whole-city-red" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values=".2126 .7152 .0722 0 0 .2126 .7152 .0722 0 0 .2126 .7152 .0722 0 0 0 0 0 1 0"/>
        <feComponentTransfer>
          <feFuncR type="discrete" tableValues={`${142 / 255} ${213 / 255}`}/>
          <feFuncG type="discrete" tableValues={`${27 / 255} ${43 / 255}`}/>
          <feFuncB type="discrete" tableValues={`${20 / 255} ${30 / 255}`}/>
        </feComponentTransfer>
      </filter>
    </defs></svg>
    {/* Same projected entrance as BL-06_B frame 1, placed in the distance. */}
    {revealGate > 0 && <Group x={gx - 984} y={gy - 480} s={scale} o="984px 480px" style={{opacity: revealGate}}>
      <Sheet>{cityGateway.faces.map((face, i) => <polygon key={i}
        points={face.points.map(p => p.join(',')).join(' ')} fill={face.color}/>)}</Sheet>
      <GateInscription camera="B" frame={0}/>
    </Group>}
    {/* The approved city framing is unchanged. Only the exit parts it sideways. */}
    {[-1, 1].map(side => <div key={side} style={{...layer,
      clipPath: side < 0 ? 'inset(0 50% 0 0)' : 'inset(0 0 0 50%)',
      transform: `translateX(${side * 1100 * cityExit}px)`}}>{cityPlate}</div>)}
    <BlenderLayer camera="12_A" layer="wires" frame={f} style={{opacity: 1 - glide(f, d - 23, d - 13)}}/>
    <Sheet style={{opacity: 1 - matchGate}}>{[0, 1, 2].map(i => {
      const original = [[-50, 410 + i * 58], [380, 330 + i * 58], [760, 466 + i * 58],
        [1240, 283 + i * 58], [1650, 388 + i * 58], [2020, 238 + i * 58]];
      const target = [[-180, 1000 + i * 70], [200, 850 + i * 40], [gx - 60 * scale, gy + (25 + i * 10) * scale],
        [gx + 60 * scale, gy + (25 + i * 10) * scale], [1720, 850 + i * 40], [2100, 1000 + i * 70]];
      const wire = original.map((p, n) => `${n ? 'L' : 'M'}${mix(p[0], target[n][0], gather)} ${mix(p[1], target[n][1], gather)}`).join(' ');
      return <g key={i}><path d={wire} stroke={INK} fill="none" strokeWidth="6"/>
        {f > 62 && <path d={wire} stroke={RED} fill="none" strokeWidth="14" strokeDasharray="82 175" strokeDashoffset={-f * 14 + i * 16}/>}</g>;
    })}</Sheet>
    <div style={{...layer, opacity: overlayOut}}>
    {[340, 864, 1518].map((x, i) => f > 80 + i * 5 && <React.Fragment key={i}>
      <P id="O-05" x={x} y={300 - (i % 2) * 112} w={180}/>
      <T x={x + 160} y={260 - (i % 2) * 112} size={96} color={PAPER} bg={RED} r={-8}
        style={{transform: `scale(${mix(1.7, 1, snap(f, 80 + i * 5, 4))})`}}>喊</T></React.Fragment>)}
    <T x={80} y={60} size={136} color={PAPER} bg={INK}><Drop key={second ? 2 : 1} text={second ? '青筋都在呐喊' : '脸憋得通红'} f={f} at={second ? 58 : 0} gap={2}/></T>
    </div>
    {/* Finish on the actual first frame of S30, including the existing fleet,
        inscription and UI. The next shot continues from this exact state. */}
    {matchGate > 0 && <div style={{...layer, opacity: matchGate}}>
      <Gate frame={0} duration={120} abs={abs - f + d} fleet/>
    </div>}
  </>;
}

// ── S32 · 号外 ─────────────────────────────────────────────────────────────────
function Extra({frame: f, abs}: Shot) {
  const fly = snap(f, 0, 13);
  return <>
    <StadiumPlate rise={f}/>
    <StadiumFireworks frame={f}/>
    <Slats abs={abs} gold/>
    <Confetti f={f} count={28}/>
    <div style={{...at(530, 36, 860, 1010), overflow: 'hidden', background: PAPER, boxShadow: `16px 18px 0 ${INK}`,
      transform: `translateY(${(1 - fly) * 700}px) rotate(${(1 - fly) * 720 - 4}deg) scale(${.7 + fly * .3})`}}>
      <Img src={staticFile('art/K-02.png')} style={{width: '100%', height: '100%'}}/>
      <T x={56} y={34} size={96} bg={PAPER} track={.1}>大事报</T>
      <T x={36} y={168} size={96} color={PAPER} bg={RED}>号外！大事完成！</T>
      <div style={{...at(100, 340, 660, 430), background: INK, overflow: 'hidden'}}><P id="H-12" x={100} y={-6} w={460}/></div>
      <T x={64} y={810} size={36} font="caption" bg={PAPER} track={.04} style={{width: 730, whiteSpace: 'normal', lineHeight: 1.5}}>
        本报讯　今日上午，一位同志在第三次战役中取得决定性胜利。</T>
    </div>
    <T x={60} y={30} size={120} bg={PAPER}><Slam text="天哪" f={f} at={0} gap={3}/></T>
    <T x={1440} y={250} size={76} color={PAPER} bg={INK} style={{writingMode: 'vertical-rl', padding: '20px 14px'}}>
      <Drop text="我终于完成了" f={f} at={28} gap={2}/></T>
    {f >= 56 && <T x={1580} y={690} size={150} color={PAPER} bg={RED} r={-6} style={{transform: `scale(${mix(1.6, 1, snap(f, 56, 4))})`}}>大事</T>}
  </>;
}

export function Chorus({shot, frame: f, duration, abs}: Shot & {shot: number}) {
  const props = {frame: f, duration, abs};
  const scenes: Record<number, () => ReactNode> = {
    18: () => <Decision {...props}/>, 19: () => <Veins {...props}/>, 20: () => <Gate {...props}/>,
    21: () => <Impact frame={f} {...SYNC.first}/>, 22: () => <Triumph {...props}/>,
    23: () => <SummitChampion {...props}/>, 24: () => <MonumentReveal {...props}/>,
    25: () => <CallResponse {...props}/>, 26: () => <Glance {...props}/>, 27: () => <Dignity {...props}/>,
    28: () => <Masses {...props}/>, 29: () => <CityCry {...props}/>,
    30: () => f >= duration - 4 ? <ToiletMatch/> : <Gate {...props} fleet/>,
    31: () => <StadiumImpact frame={f}/>,
    32: () => <Extra {...props}/>, 33: () => <Platform {...props} combined/>,
    34: () => <MonumentFinale {...props}/>,
  };
  return <AbsoluteFill style={{background: PAPER, overflow: 'hidden'}}>{scenes[shot]?.()}</AbsoluteFill>;
}
