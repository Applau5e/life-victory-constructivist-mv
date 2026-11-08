import React, {type CSSProperties,type ReactNode} from 'react';
import {getStaticFiles, Img, staticFile} from 'remotion';
import contacts from './anchors.json';
import manifest from './blender-plates.json';
import art from './art.json';
import {Photo} from './Poster';
type ActorContact={camera:keyof typeof contacts;frame:number;id:string;metres:number;contact:number};
export function actorBox({camera,frame,id,metres,contact}:ActorContact){
  const track=contacts[camera];
  const [x,y,pxPerMetre]=track[Math.max(0,Math.min(track.length-1,Math.round(frame)))];
  const image=art.find(item=>item.id===id)!;
  const h=pxPerMetre*metres,w=h*image.width/image.height;
  return {x:x-w/2,y:y-h*contact,w,h};
}
export function GroundedPhoto({children,...props}:ActorContact&{children?:ReactNode}){
  if(!hasPlate(props.camera.slice(3),props.camera==='BL-02_A'?'bg':'main',props.frame))return <>{children}</>;
  return <Photo id={props.id} {...actorBox(props)}/>;
}

const lengths: Record<string, Record<string, number>> = manifest;
let files:ReturnType<typeof getStaticFiles>|undefined;
let index=new Set<string>();
function exists(path:string){
  const available=getStaticFiles();
  if(available!==files){files=available;index=new Set(available.map(item=>item.name));}
  return index.has(path);
}
export function platePath(camera:string,layer:string,frame:number){
  const count = lengths[camera]?.[layer];
  if (!count) throw new Error(`Unregistered Blender plate: ${camera}/${layer}`);
  const n=Math.min(count,Math.max(1,Math.round(frame)+1));
  return 'blender/BL-'+camera+'/'+layer+'/'+String(n).padStart(4,'0')+'.png';
}
export function hasPlate(camera:string,layer:string,frame:number){
  return exists(platePath(camera,layer,frame));
}
export function BlenderLayer({camera,layer='main',frame,style,children,onLoad}:{
  camera:string;layer?:string;frame:number;style?:CSSProperties;children?:ReactNode;onLoad?:()=>void;
}){
  const path=platePath(camera,layer,frame);
  return exists(path)?<Img src={staticFile(path)} onLoad={onLoad} style={{position:'absolute',left:0,top:0,width:1920,height:1080,...style}}/>:<>{children}</>;
}
