import React, {type CSSProperties} from 'react';
import {staticFile} from 'remotion';
import {INK, PAPER, RED} from './Poster';

type Vertex=[number,number,number]; // horizontal, height above foundation, depth
type Face={points:Vertex[];fill:string};
type Beam={a:Vertex;b:Vertex;width:number;fill:string};
const DARK='#8E1B14';
const tau=2*Math.PI;
const radius=(t:number)=>135-99*t;
const axis=(t:number)=>-105+191*t;
function coil(t:number,angle:number):Vertex{
  return [axis(t)+radius(t)*Math.cos(angle),t*465,radius(t)*Math.sin(angle)];
}
const beams:Beam[]=[];
for(let k=0;k<2;k++){
  for(let i=0;i<80;i++){
    const a=i/80,b=(i+1)/80;
    beams.push({a:coil(a,a*tau*1.68+k*Math.PI),b:coil(b,b*tau*1.68+k*Math.PI),
      width:8.5-2.5*a,fill:RED});
  }
}
for(let level=0;level<10;level++){
  const lo=level/10,hi=(level+1)/10;
  for(let j=0;j<10;j++){
    const a=j*tau/10,b=(j+1)*tau/10;
    beams.push({a:coil(lo,a),b:coil(lo,b),width:3.5,fill:DARK});
    beams.push({a:coil(lo,a),b:coil(hi,b),width:2.7,fill:DARK});
    if(j%2===0)beams.push({a:coil(lo,a),b:coil(hi,a),width:4.3,fill:RED});
  }
}
function solid(t:number,r:number,height:number,count:number,spin:number,taper:number,colors:string[]):Face[]{
  const vertex=(k:number,elev:number,scale:number):Vertex=>[
    axis(t)+r*scale*Math.cos(k*tau/count+spin),465*t+elev,r*scale*Math.sin(k*tau/count+spin)];
  return Array.from({length:count},(_,i)=>({points:[vertex(i,0,1),vertex(i+1,0,1),
    vertex(i+1,height,taper),vertex(i,height,taper)],fill:colors[i%colors.length]}));
}
export function Tower({frame,reveal,style}:{frame:number;reveal:boolean;style?:CSSProperties}){
  const rot=-.4+frame*(reveal?.003:.002);
  const project=([x,h,z]:Vertex)=>{
    const dx=x*Math.cos(rot)-z*Math.sin(rot), dz=z*Math.cos(rot)+x*Math.sin(rot);
    const perspective=760/(760-dz*.57);
    return [252+dx*perspective,554-h*perspective+dz*.21,dz];
  };
  const turn=Math.floor(frame/(1800/123))*Math.PI/28;
  const faces=[...solid(.085,85,84,4,turn,1,[PAPER,'#b8ac92',INK,'#a69a84']),
    ...solid(.345,67,90,4,-turn,0,[RED,DARK,'#aa2017',INK]),
    ...solid(.585,47,62,16,turn,1,[INK,DARK,INK]),
    ...solid(.79,39,36,12,-turn,.4,[PAPER,'#ac9c83','#c7b99d'])];
  const parts=beams.map((b,i)=>{
    const a=project(b.a),c=project(b.b);
    return {z:(a[2]+c[2])/2,node:<line key={'b'+i} x1={a[0]} y1={a[1]} x2={c[0]} y2={c[1]}
      stroke={b.fill} strokeWidth={b.width} strokeLinecap="round"/>};
  });
  faces.forEach((face,i)=>{
    const p=face.points.map(project);
    parts.push({z:p.reduce((a,c)=>a+c[2],0)/p.length,
      node:<polygon key={'f'+i} points={p.map(c=>c.slice(0,2).join(',')).join(' ')} fill={face.fill} stroke={INK} strokeWidth={1.1}/>});
  });
  const top=project([axis(1),465,0]);
  return <svg viewBox="0 0 540 610" style={style} preserveAspectRatio="xMidYMid meet">
    <path d="M30 560 L233 530 L326 548 L120 592 Z" fill={INK}/>
    {parts.sort((a,b)=>a.z-b.z).map(part=>part.node)}
    <g transform={`translate(${top[0]} ${top[1]})`}>
      <path d="M-48 -1 L31 -11 L51 -3 L-27 9 Z" fill={INK}/>
      {reveal && <image href={staticFile('art/O-01.png')} x={-42} y={-87} width={82} height={88}/>}
    </g>
  </svg>;
}
