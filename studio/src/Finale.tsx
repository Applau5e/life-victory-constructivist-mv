// S35–S42 · the quiet philosophy, the held breath, the burst, and the curtain call.
import React from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {BlenderLayer} from './Blender';
import {SofaPlate} from './SofaPlate';
import {GoodThings, goodThingsHoldFrame} from './GoodThings';
import {Medal, MedalInk} from './VictoryReveal';
import {
  type Shot, INK, PAPER, RED, GOLD, at, layer, lin, mix, range, snap, land, glide, away, quake, kick,
  Sheet, Fill, Rect, Disc, P, T, Drop, Slam, Stamp, wipe, FONT, ClockHands,
} from './kit';

const quiet: React.CSSProperties = {background: PAPER, overflow: 'hidden'};

// ── S35 · 人生啊 有多少这样的战役 ──────────────────────────────────────────────
const lifeLabels = ['考试', '面试', '截止日', '堵车', '房贷', '牙疼'];
function LifeIcon({index, size}: {index: number; size: number}) {
  const car = (x: number, y: number) => <g transform={`translate(${x} ${y})`}>
    <path d="M2 18h4L14 7h19l9 11h7v15H2z"/><path fill={PAPER} d="M13 18l6-7h11l6 7z"/>
    <circle cx="12" cy="32" r="5"/><circle cx="40" cy="32" r="5"/></g>;
  const icons = [
    <g><path d="M25 8h55l17 18v84H25z"/><path fill={PAPER} d="M77 11v19h17zM37 44h45v5H37zM37 57h35v5H37zM37 70h31v5H37z"/><path d="m62 90 8 7 26-38" stroke={RED} strokeWidth="7" fill="none"/></g>,
    <g><circle cx="60" cy="30" r="21"/><path d="M15 108V91q5-33 37-37l8 11 8-11q33 4 37 37v17z"/><path d="m51 60 9 8 9-8-5 12 4 17-8 10-8-10 4-17z" fill={PAPER}/></g>,
    <g><path d="M13 27h94v79H13zM32 10h8v22h-8zM81 10h8v22h-8z"/><path fill={PAPER} d="M21 48h78v49H21z"/><path d="M30 56h12v6H30zM54 56h12v6H54zM78 56h12v6H78zM30 77h12v6H30zM54 77h12v6H54z"/><circle cx="84" cy="80" r="12" fill="none" stroke={RED} strokeWidth="5"/></g>,
    <g>{car(0, 43)}{car(54, 43)}{car(27, 16)}<path d="M2 87h102v6H2z"/></g>,
    <g><path d="m5 51 50-39 50 39h-12v55H18V51z"/><path fill={PAPER} d="M31 65h49v30H31z"/><text x="55" y="90" textAnchor="middle" fontSize="26" fontWeight="900">30</text></g>,
    <path d="M60 22c-10-5-15-11-29-7-17 4-22 21-16 38l12 30c4 11 4 24 13 24 10 0 10-31 20-31s11 31 21 31c9 0 10-14 13-25l12-30c5-15 0-34-16-38-12-3-21 3-30 8z"/>,
  ];
  return <svg width={size} height={size} viewBox="0 0 120 120" fill={INK} aria-hidden="true">{icons[index]}</svg>;
}
function LifeBattles({frame: f, duration: d}: Shot) {
  const slide = glide(f, d - 20, d);
  return <AbsoluteFill style={quiet}>
    {f < 24 && <Disc cx={mix(960, 305, glide(f, 6, 23))} cy={mix(540, 610, glide(f, 6, 23))}
      d={12 * (1 - glide(f, 14, 24))} fill={INK}/>}
    <T x={0} y={150} size={80} track={.3} style={{width: 1920, textAlign: 'center'}}><Drop text="人生啊" f={f} at={9} gap={5} len={9}/></T>
    <T x={0} y={262} size={136} track={.06} style={{width: 1920, textAlign: 'center'}}><Drop text="有多少这样的战役" f={f} at={54} gap={3} len={8}/></T>
    <div style={{...layer, transform: `translateX(${-1900 * slide}px)`}}>
      {lifeLabels.map((label, i) => {
        const s = 14 + i * 7, show = glide(f, s, s + 9);
        return <div key={label} style={{...at(205 + i * 262, 520 + (1 - show) * 18, 200, 300), textAlign: 'center', opacity: show}}>
          <svg width="30" height="18" style={{opacity: 1 - glide(f, s + 5, s + 15)}}><path d="M0 0h30L15 16z" fill={RED}/></svg>
          <LifeIcon index={i} size={176}/>
          <div style={{fontFamily: FONT.caption, fontWeight: 700, fontSize: 40, letterSpacing: '.2em', marginTop: 18, color: INK}}>{label}</div>
        </div>;
      })}
    </div>
  </AbsoluteFill>;
}

// ── S36 · 你以为过不去 其实再憋一口气 ─────────────────────────────────────────
function Breath({frame: f, duration: d}: Shot) {
  const breath = glide(f, 0, 90), crack = glide(f, 82, 96), seam = glide(f, d - 18, d);
  return <AbsoluteFill style={quiet}>
    <P id="H-17" x={140} y={300} w={540} o="50% 100%" style={{transform: `scale(${1 + .045 * breath})`}}/>
    <div style={{...layer, transform: 'translateX(200px)'}}><BlenderLayer camera="05_B" frame={f}/></div>
    {crack > 0 && <Sheet>
      <path d="M1142 382l-10 64 12 18-22 50 16 22-24 70 14 30-12 46" pathLength={1} fill="none" stroke={GOLD} strokeWidth="7"
        strokeDasharray="1" strokeDashoffset={1 - crack} style={{filter: 'drop-shadow(0 0 7px #d9a93a)'}}/>
    </Sheet>}
    <T x={760} y={760} size={100} style={{opacity: glide(f, 3, 16)}}>你以为过不去</T>
    <T x={760} y={890} size={112} style={{opacity: glide(f, 58, 72)}}>其实再憋一口<span style={{color: f >= 82 ? GOLD : INK}}>气</span></T>
    {seam > 0 && <Rect x={960 * (1 - seam)} y={539} w={1920 * seam} h={3} fill={GOLD}/>}
  </AbsoluteFill>;
}

// ── S37 · 大事小事 不过如此 (after Lissitzky's two squares) ───────────────────
function Squares({frame: f}: Shot) {
  const balance = glide(f, 29, 59), shrink = glide(f, 74, 101);
  const portrait = .22 * glide(f, 4, 27) * (1 - glide(f, 62, 89));
  const square = (large: boolean) => {
    const pos = mix(mix(large ? 620 : 1320, large ? 780 : 1140, balance), large ? 960 : 983, shrink);
    const size = mix(mix(large ? 460 : 200, 300, balance), large ? 24 : 10, shrink);
    return <div style={{...at(pos - size / 2, 520 - size / 2, size, size), background: large ? RED : INK,
      display: 'grid', placeItems: 'center', borderRadius: large ? `${50 * shrink}%` : 0,
      rotate: `${(large ? -15 : 15) * (1 - balance)}deg`, opacity: large ? 1 : 1 - glide(f, 93, 103)}}>
      <span style={{fontFamily: FONT.title, fontSize: size * .3, color: PAPER, opacity: 1 - glide(f, 74, 88), whiteSpace: 'nowrap'}}>{large ? '大事' : '小事'}</span>
    </div>;
  };
  const dotY = mix(520, 540, shrink);
  return <AbsoluteFill style={quiet}>
    <P id="H-18" x={570} y={60} w={780} style={{opacity: portrait}}/>
    <div style={{...layer, transform: `translateY(${dotY - 520}px)`}}>{square(true)}{square(false)}</div>
    <T x={0} y={800} size={112} track={.3} style={{width: 1920, textAlign: 'center', opacity: glide(f, 37, 52) * (1 - glide(f, 77, 91))}}>不过如此</T>
  </AbsoluteFill>;
}

// ── S39 · 能出来的 都是好——事——！ ───────────────────────────────────────────
function ParallelBars({f, burst = false}: {f: number; burst?: boolean}) {
  const offset = burst ? 300 * (1 - snap(f, 0, 13)) : -f * .36;
  return <Sheet>
    {[-1, 0, 1].map(i => <g key={i} transform={`translate(${offset} ${100 * i})`}>
      <path d="M-260 390 580 -95" fill="none" stroke={INK} strokeWidth={i === 0 ? 52 : 13}/>
      <path d="m1450 1178 635-367" fill="none" stroke={INK} strokeWidth={i === 0 ? 58 : 15}/>
    </g>)}
    {burst && <g fill={GOLD} transform={`translate(${-offset} 0) rotate(-30 1751 171)`}><rect x="1604" y="131" width="236" height="24"/><rect x="1664" y="178" width="111" height="11"/></g>}
  </Sheet>;
}
// ── S40 · curtain call ─────────────────────────────────────────────────────────
const cast = ['主演 · 同志', '合唱 · 壮汉合唱团', '特别出演 · 那扇门', '时间 · 十分钟', '沙发 · 本色出演', '它 · 红楔',
  '鬼门关 · 友情客串', '珠穆朗玛峰', '冠军领奖台', '尊严', '胜利纪念塔', '全体人民'];
function Prop({actor, frame, clockMinutes = 0}: {actor: number; frame: number; clockMinutes?: number}) {
  if (actor === 10) return <BlenderLayer camera="01_D" layer="tower" frame={frame % 30} style={at(-130, -82, 660, 433)}/>;
  if (actor === 9) return <><MedalInk/><Medal x={45} y={-4} w={300}/></>;
  // Reuse the finished S12 model plate at a fixed camera; preserve its aspect ratio.
  if (actor === 4) return <SofaPlate frame={0}
    style={at(195 - 1035 * .32, -810 * .32, 1920 * .32, 1080 * .32)}/>;
  if (actor === 3) return <div style={{...at(0, 0, 1254, 1254), transformOrigin: '0 0',
    transform: `translate(195px,0px) scale(${360 / 1254}) translate(-627px,-1240px)`}}>
    <P id="O-07" x={0} y={0} w={1254}/>
    {/* O-07's dial axle, independent of the bells and feet in the full image. */}
    <svg viewBox="0 0 1254 1254" style={at(0, 0, 1254, 1254)}>
      <g transform="translate(623 740) scale(3.25) translate(-100 -100)">
        <ClockHands hours={8} minutes={clockMinutes}/>
      </g>
    </svg>
  </div>;
  const photos: Record<number, string> = {0: 'H-19', 1: 'C-01', 11: 'CR-02'};
  if (photos[actor]) return <P id={photos[actor]} x={actor === 0 ? 90 : -15} y={actor === 0 ? -120 : 0} w={actor === 0 ? 250 : 420}/>;
  const shapes: Record<number, React.ReactNode> = {
    2: <><path d="M128 8h132v224H128z" fill={INK}/><path d="M118 0h152v8H118zM118 8h10v224h-10zM260 8h10v224h-10z" fill={RED}/><circle cx="235" cy="127" r="6" fill={PAPER}/></>,
    5: <path d="M20 208 300 120 60 116z" fill={RED}/>,
    6: <>{[0, 1, 2].map(i => <path key={i} d={`M${29 + 42 * i} 226V${24 + 22 * i}h${180 - 16 * i}v${202 - 22 * i}`} fill="none" stroke={INK} strokeWidth={21 - i * 4}/>)}</>,
    7: <><path d="m13 225 169-192 146 192z" fill={RED}/><path d="m139 82 43-49 40 52-38-17-17 11z" fill={PAPER}/><path d="M182 35V2l51 8-49 12" fill={RED} stroke={INK} strokeWidth="3"/></>,
    8: <><path d="M36 224v-89h83v89zm177 0v-58h85v58z" fill={INK}/><path d="M120 224V73h92v151z" fill={RED}/><text x="165" y="170" textAnchor="middle" fill={PAPER} fontSize="80" fontFamily={FONT.num}>1</text></>,
  };
  return <svg style={at(25, 48, 340, 275)} viewBox="0 0 340 250">{shapes[actor]}</svg>;
}
function VictoryPoster({assembly, title}: {assembly: number; title?: boolean}) {
  const gather = 1 - assembly;
  const heroX = 600 - 460 * gather, heroY = 170 + 330 * gather;
  return <AbsoluteFill style={quiet}>
    <ParallelBars f={0}/>
    <Sheet>
      <path d="M0 0h557v1080H0z" fill={INK}/>
      <path d="m-170 1011 970-616-486 610z" fill={RED} transform={`translate(${-500 * gather} ${310 * gather})`}/>
      {/* Everest occupies the right-hand region behind the choir. */}
      <g transform={`translate(${430 * gather} ${-230 * gather})`}>
        <path d="M1110 990L1535 390L1990 990Z" fill={RED}/>
        <path d="M1474 477L1535 390L1600 481L1543 455L1512 470Z" fill={PAPER}/>
        <path d="M1535 397V307l125 24-122 33" fill={RED} stroke={INK} strokeWidth="7"/>
      </g>
    </Sheet>
    {/* Dedicated low-angle perspective plate, including the porcelain toilet.
        Its lower structure extends behind the hero and crowd, like the reference. */}
    <BlenderLayer camera="01_Poster" layer="production" frame={0}
      style={at(-206 + 590 * gather, -190 - 295 * gather, 2592, 1458)}/>
    <P id="C-01" x={1026 + 600 * gather} y={621 - 270 * gather} w={904}/>
    <P id="H-12" x={heroX} y={heroY} w={600}/>
    <MedalInk/>
    <Medal x={heroX + 217} y={heroY + 235} w={112}/>
    <P id="CR-02" x={-50 - 680 * gather} y={650 + 190 * gather} w={900}/>
    {title && <>
      <div style={{...at(-49, 500), transformOrigin: 'left center', transform: 'rotate(-30deg)', display: 'flex', alignItems: 'baseline',
        background: INK, padding: '10px 38px 24px 70px', gap: 6}}>
        <span style={{fontFamily: FONT.title, fontSize: 118, color: PAPER, letterSpacing: '-.04em'}}>人生最大的</span>
        <span style={{fontFamily: FONT.title, fontSize: 188, color: RED, letterSpacing: '-.06em'}}>胜利</span>
      </div>
      <div style={{...at(1520, 850), border: `10px double ${RED}`, padding: '6px 20px', transform: 'rotate(-8deg)', background: PAPER, textAlign: 'center'}}>
        <div style={{fontFamily: FONT.title, fontSize: 96, color: RED, letterSpacing: '.08em', lineHeight: 1.05}}>完成</div>
        <div style={{fontFamily: '"Arial Black",sans-serif', fontSize: 26, letterSpacing: '.3em', color: RED}}>ПОБЕДА</div>
      </div>
    </>}
  </AbsoluteFill>;
}
function CurtainCall({frame: f, duration: d, abs}: Shot) {
  const {fps} = useVideoConfig();
  const mergeAt = d - 53, merge = glide(f, mergeAt, d - 1);
  const perform = lin(f, 3, mergeAt - 8) * 11;
  const step = Math.floor(perform) + glide(perform % 1, .13, .91);
  const active = Math.min(11, Math.round(step));
  // Hold 08:00 on entry; advance ten minutes during the clock's own bow,
  // then keep both hands at 08:10 for the remainder of its parade exit.
  const clockAt = 3 + (mergeAt - 11) * 2.65 / 11;
  const clockMinutes = 10 * glide(f, clockAt, clockAt + .4 * fps);
  // The foreground audience itself becomes the final cast member.
  const crowdJoin = glide(perform, 10, 11);
  const crowdDx = (step - 11) * 553;
  return <AbsoluteFill style={quiet}>
    {merge < 1 && <AbsoluteFill style={{opacity: 1 - merge}}>
      <ParallelBars f={f}/>
      <Sheet>{[0, 1, 2].map(i => <path key={i} d={`M-270 ${1314 + 46 * i} 2180 ${-101 + 46 * i}`} stroke={i === 1 ? RED : INK} strokeWidth={i === 1 ? 30 : 9}/>)}</Sheet>
      <T x={96} y={90} size={132} font="num" color={RED} track={.04}>{f < d / 2 ? 'OH-OH-OH' : 'AH-AH-AH'}</T>
      {cast.map((name, i) => {
        if (i === 11) return null; // CR-02 is the persistent foreground layer below.
        const dx = (step - i) * 553;
        if (Math.abs(dx) > 1350) return null;
        // Keep the clock upright, with its leading foot on the inclined upper rail.
        const y = i === 3 ? 1314 - (960 + dx + (920 - 627) * 360 / 1254 + 270) * 1415 / 2450 - 4.5 * Math.hypot(1, 1415 / 2450)
          : i === 4 ? 1314 - (960 + dx + (1610 - 1035) * .32 + 270) * 1415 / 2450 - 4.5 * Math.hypot(1, 1415 / 2450)
          : 299 - dx * .577 + 4 * Math.sin(f / 7);
        return <div key={name} style={{...at(765 + dx, y, 390, 340)}}><Prop actor={i} frame={f} clockMinutes={clockMinutes}/></div>;
      })}
      <T key={active} x={1090} y={830} size={64} bg={PAPER} r={-6}
        style={{border: `6px solid ${RED}`, padding: '14px 24px 20px', transform: `scale(${mix(1.4, 1, snap(f - Math.floor(f), 0, 1))})`}}>{cast[active]}</T>
      <T x={1090} y={730} size={36} font="caption" color={INK} track={.4}>— 演 员 表 —</T>
      {/* One image continuously joins the belt; never show a second crowd actor. */}
      <P id="CR-02" x={mix(-50, 750 + crowdDx, crowdJoin)}
        y={mix(730 - 6 * kick(abs), 299 - crowdDx * .577 + 4 * Math.sin(f / 7), crowdJoin)}
        w={mix(820, 420, crowdJoin)}/>
    </AbsoluteFill>}
    {merge > 0 && <AbsoluteFill style={{opacity: glide(f, mergeAt, mergeAt + 17)}}><VictoryPoster assembly={merge}/></AbsoluteFill>}
    {f < 8 && <div style={{...layer, transform: `translate(${2200 * away(f, 0, 7)}px,${-2200 / Math.sqrt(3) * away(f, 0, 7)}px)`}}>
      <GoodThings frame={goodThingsHoldFrame(180)} duration={180} abs={4698}/>
    </div>}
  </AbsoluteFill>;
}

// ── S41 / S42 · final hit, then applause over the poster ─────────────────────
function FinalHit({frame, duration: d, hit}: Shot & {hit: boolean}) {
  const f = hit ? 0 : frame + 1;
  const [qx, qy] = quake(f, 18, 12);
  const iris = hit ? 0 : glide(frame, d - 45, d - 2);
  const push = hit ? 0 : glide(frame, 0, d - 1);
  return <AbsoluteFill style={{background: INK}}>
    <AbsoluteFill style={{overflow: 'hidden', clipPath: `circle(${mix(1120, 0, iris)}px at 50% 50%)`, opacity: iris >= 1 ? 0 : 1}}>
      <AbsoluteFill style={{transform: `translate(${qx}px,${qy}px) scale(${1.02 + push * .03})`}}>
        <VictoryPoster assembly={1} title/>
        {!hit && frame >= 30 && <div style={{position: 'absolute', right: 96, top: 64, display: 'flex', alignItems: 'baseline', gap: 14, whiteSpace: 'nowrap', background: INK, padding: '10px 22px 12px',
          opacity: glide(frame, 30, 39) * (1 - glide(frame, d - 47, d - 43))}}>
          <span style={{fontFamily: FONT.caption, fontWeight: 700, fontSize: 30, letterSpacing: '.18em', color: PAPER}}>制作：</span>
          <span style={{fontFamily: FONT.title, fontSize: 46, letterSpacing: '.02em', color: RED}}>Applau5e</span>
        </div>}
      </AbsoluteFill>
    </AbsoluteFill>
  </AbsoluteFill>;
}

export function Finale({shot, ...props}: Shot & {shot: number}) {
  switch (shot) {
    case 35: return <LifeBattles {...props}/>;
    case 36: return <Breath {...props}/>;
    case 37: return <Squares {...props}/>;
    case 38: return <AbsoluteFill style={quiet}><Disc cx={960} cy={540} d={24} fill={RED}/></AbsoluteFill>;
    case 39: return <GoodThings {...props}/>;
    case 40: return <CurtainCall {...props}/>;
    case 41: return <FinalHit {...props} hit/>;
    case 42: return <FinalHit {...props} hit={false}/>;
    default: return null;
  }
}
