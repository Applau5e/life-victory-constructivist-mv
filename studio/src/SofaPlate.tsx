import React, {type CSSProperties} from 'react';
import {BlenderLayer} from './Blender';
import arms from './s12-arm-projection.json';
import {INK, layer} from './kit';

/** Repair only the arm caps in front of the cushion (world Y <= -0.4005).
 * Keep the original inner side surfaces and their cushion occlusion intact.
 * Camera-projected caps remove baked depth conflicts without an image render.
 */
export function SofaPlate({frame, style}: {frame: number; style?: CSSProperties}) {
  const polygons = arms[Math.max(0, Math.min(arms.length - 1, Math.round(frame)))];
  return <div data-sofa-depth-fix="projected-front-caps" style={{...layer, ...style}}>
    <BlenderLayer camera="04_A" frame={frame} style={{width:'100%', height:'100%'}}/>
    <svg viewBox="0 0 1920 1080" style={{position:'absolute', inset:0, width:'100%', height:'100%'}}>
      {polygons.map((points, i) => <polygon key={i} fill={INK}
        points={points.map(point => point.join(',')).join(' ')}/>)}
    </svg>
  </div>;
}
