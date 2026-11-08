import React from "react";
import { AbsoluteFill, Composition, Img, Sequence, registerRoot, staticFile } from "remotion";
import art from "./art.json";
import {Movie} from "./Movie";
import {CameraReview,cameras} from "./CameraReview";

const INK = "#141210", PAPER = "#EDE3CC", RED = "#D52B1E";
const font = '"Microsoft YaHei","Microsoft JhengHei",sans-serif';
const HOLD = 60;
type Item = (typeof art)[number];
type Background = "paper" | "red" | "black";
const substrates: Record<Background,string> = {paper: PAPER, red: RED, black: INK};

function Plate({item, index, total, background}: {
  item: Item; index: number; total: number; background: Background;
}) {
  const split = item.title.replace(/^风格帧：/, "");
  const transparentProof = background !== "paper";
  return <AbsoluteFill style={{backgroundColor: PAPER, color: INK, fontFamily: font,
    padding: "48px 62px 38px", boxSizing: "border-box"}}>
    <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline",
      paddingBottom:18, borderBottom:"5px solid"}}>
      <div style={{fontSize:37,fontWeight:800}}>人生最大的胜利</div>
      <div style={{fontSize:26,letterSpacing:4}}>构成主义 MV　/　{transparentProof?"透明边缘检查":"美术素材"}</div>
    </div>
    <div style={{flex:1, minHeight:0, display:"flex", paddingTop:32, paddingBottom:26, gap:42}}>
      <div style={{flex:"0 0 340px",display:"flex",flexDirection:"column",paddingTop:12}}>
        <span style={{fontFamily:"Consolas,monospace",fontSize:77,fontWeight:700,
          color:RED,letterSpacing:-4,lineHeight:1.15}}>{item.id}</span>
        <div style={{fontSize:25,color:"#5B5143",marginTop:12}}>{item.group}</div>
        <div style={{fontSize:51,lineHeight:1.22,fontWeight:900,marginTop:42,overflowWrap:"anywhere"}}>{split}</div>
        {item.usage && <div style={{fontSize:26,lineHeight:1.58,marginTop:24}}>{item.usage}</div>}
        <div style={{marginTop:"auto",fontFamily:"Consolas,monospace",fontSize:24}}>
          {item.width} × {item.height}<br/>{item.alpha ? "PNG / ALPHA" : "PNG"}
        </div>
      </div>
      <div style={{flex:1,minWidth:0,backgroundColor:substrates[background],position:"relative",
        border:"1px solid #9D917B",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
        <Img src={staticFile(`art/${item.id}.png`)}
          style={{width:"100%",height:"100%",objectFit:"contain"}}/>
      </div>
    </div>
    <div style={{borderTop:"2px solid",paddingTop:14,display:"flex",justifyContent:"space-between",
      fontSize:24,fontFamily:"Consolas,Microsoft YaHei,monospace"}}>
      <span>{item.id}.png</span><span>{String(index+1).padStart(2,"0")} / {String(total).padStart(2,"0")}</span>
    </div>
  </AbsoluteFill>;
}
function Review({background="paper"}:{background?:Background}) {
  const items = background==="paper"?art:art.filter(item=>item.alpha);
  return <AbsoluteFill style={{backgroundColor:PAPER}}>{items.map((item,i)=>
    <Sequence key={item.id} name={item.id+" "+item.title} from={i*HOLD} durationInFrames={HOLD}
      premountFor={15}>
      <Plate item={item} index={i} total={items.length} background={background}/>
    </Sequence>)}</AbsoluteFill>;
}
function Root(){
  const alphaFrames=Math.max(1,art.filter(item=>item.alpha).length)*HOLD;
  return <>
    <Composition id="LifeVictoryMV" component={Movie} durationInFrames={5146}
      width={1920} height={1080} fps={30}/>
    <Composition id="BlenderReview" component={CameraReview} durationInFrames={cameras.length*60}
      width={1920} height={1080} fps={30}/>
    <Composition id="ArtworkReview" component={Review} durationInFrames={Math.max(1,art.length)*HOLD}
      width={1920} height={1080} fps={30} defaultProps={{background:"paper" as Background}}/>
    <Composition id="CutoutsRed" component={Review} durationInFrames={alphaFrames}
      width={1920} height={1080} fps={30} defaultProps={{background:"red" as Background}}/>
    <Composition id="CutoutsBlack" component={Review} durationInFrames={alphaFrames}
      width={1920} height={1080} fps={30} defaultProps={{background:"black" as Background}}/>
  </>;
}
registerRoot(Root);
