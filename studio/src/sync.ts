// Spectral-flux peaks measured at 10 ms hops in the supplied MP3.
// Beat grid phase is 0.01 s, equivalent to frame 0 at 30 fps.
export const FPS=30, BEAT=60/123*FPS, OFFSET=0;
export const beatFrame=(n:number)=>Math.round(OFFSET+n*BEAT);
export const SYNC={
  ha:1625,chorus1:1852,bandBack1:2312,chorus2:3205,bandBack2:3659,
  outro1:4147,finalHit:5012,
  first:{start:2220,stop:25,hitA:34,hitB:49},
  second:{start:3570,stop:23,hitA:30,hitB:45},
} as const;
