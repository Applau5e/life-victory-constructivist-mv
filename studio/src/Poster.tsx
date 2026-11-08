import React, {type CSSProperties} from 'react';
import {Img, staticFile} from 'remotion';

export const INK='#141210', PAPER='#EDE3CC', RED='#D52B1E', GOLD='#D9A93A';
type PhotoProps={id:string;x:number;y:number;w:number;h:number;style?:CSSProperties};
export function Photo({id,x,y,w,h,style}:PhotoProps) {
  const printed = /^(H|C|CR|HD|O)-\d{2}$/.test(id) && id!=='H-00';
  return <Img src={staticFile(printed?'print/'+id+'.webp':'art/'+id+'.png')}
    style={{position:'absolute',left:x,top:y,width:w,height:h,objectFit:'contain',...style}}/>;
}
