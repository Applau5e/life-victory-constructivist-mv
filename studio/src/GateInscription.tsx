import React from 'react';
import cameraA from './gate-panel-A.json';
import cameraB from './gate-panel-B.json';
import {PAPER} from './Poster';

export const gatePanelTrack = {A:cameraA,B:cameraB};
export function GateInscription({camera,frame}:{camera:'A'|'B';frame:number}){
  const face=gatePanelTrack[camera][frame];
  if(!face)return null;
  const [topLeft,topRight,,bottomLeft]=face;
  const w=480,h=91;
  // Project the local sign rectangle onto the actual four corners of the Blender face.
  const origin=topLeft[2];
  const column=(p:number[],span:number)=>{
    const weight=p[2]/origin;
    return [(p[0]*weight-topLeft[0])/span,(p[1]*weight-topLeft[1])/span,0,(weight-1)/span];
  };
  const matrix=[...column(topRight,w),...column(bottomLeft,h),0,0,1,0,topLeft[0],topLeft[1],0,1];
  return <div data-gate-inscription={camera} style={{position:'absolute',left:0,top:0,width:w,height:h,
    transformOrigin:'0 0',transform:'matrix3d('+matrix.join(',')+')',display:'grid',placeItems:'center',
    overflow:'hidden',color:PAPER,fontFamily:'"Victory Title","Victory Caption",sans-serif',
    fontSize:73,lineHeight:1,letterSpacing:12,textIndent:12,whiteSpace:'nowrap'}}>鬼门关</div>;
}
