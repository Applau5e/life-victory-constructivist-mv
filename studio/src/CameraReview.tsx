import React from 'react';
import {AbsoluteFill,Img,Sequence,getStaticFiles,staticFile} from 'remotion';
import {INK,PAPER,RED} from './Poster';
export const cameras=['01_A','01_B','01_C','01_D','02_A','03_A','03_Open','03_B','04_A','05_A','05_A2','05_B',
  '06_A','06_B','07_A','07_B','07_Perspective','08_A','08_B','08_C','09_A','10_A','11_A','11_Rise','12_A','12_B'];
const names=['胜利纪念塔','构成主义舞台','黑方门','沙发虚空','红楔与墙','鬼门关','噗通','珠峰与领奖台','冲水漩涡','尊严勋章','体育场','城市'];
export function CameraReview(){
  const files=new Set(getStaticFiles().map(file=>file.name));
  return <AbsoluteFill style={{backgroundColor:PAPER,fontFamily:'Microsoft YaHei,sans-serif'}}>{cameras.map((cam,i)=>{
    const path='blender/previews/BL-'+cam+'.png';
    const title=names[Number(cam.slice(0,2))-1];
    return <Sequence key={cam} name={'BL-'+cam+' '+title} from={60*i} durationInFrames={60}>
      <AbsoluteFill style={{backgroundColor:PAPER,alignItems:'center',justifyContent:'center'}}>
        {files.has(path)?<Img src={staticFile(path)+(cam.startsWith('11_')?'?v=o02-section5':cam.startsWith('06_')?'?v=entrance-lintel':'')} style={{width:1920,height:1080}}/>:<div style={{fontSize:44}}>正在生成该机位的预览图</div>}
        <div style={{position:'absolute',left:44,top:40,color:PAPER,background:INK,padding:'10px 22px',fontSize:37,
          borderLeft:'12px solid '+RED}}>{'BL-'+cam}　{title}</div>
      </AbsoluteFill>
    </Sequence>;
  })}</AbsoluteFill>;
}
