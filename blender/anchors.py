"""Export contact points in composition pixels using the actual animated camera."""
import bpy,json
from pathlib import Path
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view
root=Path(__file__).resolve().parent
points={'BL-02_A':(0,0,.48),'BL-04_A':(0,-.05,.57),'BL-08_A':(-.9,-.15,4.59),
        'BL-08_B':(0,0,1.20),'BL-08_C':(0,0,6.20)}
result={}
for shot,point in points.items():
    bpy.ops.wm.open_mainfile(filepath=str(root/'scenes'/(shot+'.blend')))
    scene=bpy.context.scene; coords=[]
    for f in range(1,scene.frame_end+1):
        scene.frame_set(f)
        base=world_to_camera_view(scene,scene.camera,Vector(point))
        head=world_to_camera_view(scene,scene.camera,Vector(point)+Vector((0,0,1)))
        coords.append([round(base.x*1920,2),round((1-base.y)*1080,2),round((head.y-base.y)*1080,2)])
    result[shot]=coords
(root.parent/'studio/src/anchors.json').write_text(json.dumps(result,separators=(',',':')))
