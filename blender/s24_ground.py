"""Registered horizontal ground and actual bottom footprint for camera B."""
import math
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view

def ground_projection(scene):
    base=scene.objects.get('Stepped foundation')
    world=[base.matrix_world@v.co for v in base.data.vertices]
    ground_z=min(v.z for v in world)
    ring=sorted((v for v in world if abs(v.z-ground_z)<1e-5),key=lambda v:math.atan2(v.y-base.location.y,v.x-base.location.x))
    def project(v):
        q=world_to_camera_view(scene,scene.camera,v)
        return [round(q.x*1920,4),round((1-q.y)*1080,4)]
    footprint=[project(v) for v in ring]
    xs=[p[0] for p in footprint];ys=[p[1] for p in footprint]
    forward=scene.camera.matrix_world.to_quaternion()@Vector((0,0,-1))
    pitch=math.asin(max(-1,min(1,forward.z)))
    horizon=None if abs(math.cos(pitch))<1e-6 else round(540+1920*scene.camera.data.lens/scene.camera.data.sensor_width*math.tan(pitch)+1920*scene.camera.data.shift_y,4)
    return {'footprint':footprint,'center':project(Vector((base.location.x,base.location.y,ground_z))),
            'horizonY':horizon,'groundZ':round(ground_z,4),
            'bounds':{'left':min(xs),'top':min(ys),'right':max(xs),'bottom':max(ys)},
            'inFrame':max(xs)>=0 and min(xs)<=1920 and max(ys)>=0 and min(ys)<=1080}
