import {useEffect,useState} from 'react';
import {cancelRender,continueRender,delayRender,getStaticFiles,staticFile} from 'remotion';

const fonts = [
  ['Victory Title', 'fonts/站酷高端黑.ttf'],
  ['Victory Caption', 'fonts/SourceHanSansCN-Bold.otf'],
  ['Victory Numeral', 'fonts/BebasNeue.ttf'],
] as const;

let loading:Promise<void>|undefined;
async function loadFonts(){
  if(!loading){
    const available = new Set(getStaticFiles().map(({name}) => name));
    const missing = fonts.filter(([, file]) => !available.has(file));
    if (missing.length) {
      throw new Error(`缺少本地字体。请将字体放到 ${missing.map(([, file]) => `studio/public/${file}`).join('、')}。下载入口见 docs/BUILD.md。`);
    }
    loading=Promise.all(fonts.map(async ([family,file])=>{
      const face=new FontFace(family,`url("${staticFile(file)}")`,{weight:'100 1000'});
      document.fonts.add(await face.load());
    })).then(()=>undefined);
  }
  return loading;
}
export function MovieFonts(){
  const [handle]=useState(()=>delayRender('Loading local MV fonts'));
  useEffect(()=>{loadFonts().then(()=>continueRender(handle)).catch(cancelRender);},[handle]);
  return null;
}
