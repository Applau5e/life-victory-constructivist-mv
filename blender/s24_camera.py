"""Strict storyboard B: continuous water / toilet / platform / tower reveal.
C1 Hermite segments are joined cubic Beziers with shared interior tangents.
"""
import bpy, math
from mathutils import Vector, Matrix
from bpy_extras.object_utils import world_to_camera_view

def s24_board_corners(tx):
    # Compatibility only; S24 no longer displays this board.
    return [(x,4,z) for x,z in [(tx-5,31),(tx-1,31),(tx-1,33),(tx-5,33)]]

def cubic_value(frame, values, times=(1,60,150,240)):
    slopes=[(values[i+1]-values[i])/(times[i+1]-times[i]) for i in range(3)]
    tangent=[0.0]*4
    for i in (1,2):
        a,b=slopes[i-1],slopes[i]
        if a*b>0:
            h0,h1=times[i]-times[i-1],times[i+1]-times[i]
            w0,w1=2*h1+h0,h1+2*h0
            tangent[i]=(w0+w1)/(w0/a+w1/b)
    i=next(i for i in range(3) if times[i]<=frame<=times[i+1])
    h=times[i+1]-times[i];t=(frame-times[i])/h
    return ((2*t**3-3*t*t+1)*values[i]+(t**3-2*t*t+t)*h*tangent[i]
            +(-2*t**3+3*t*t)*values[i+1]+(t**3-t*t)*h*tangent[i+1])

def look_rotation(horizontal, pitch):
    hx,hy=horizontal
    forward=Vector((hx*math.cos(pitch),hy*math.cos(pitch),math.sin(pitch)))
    right=Vector((hy,-hx,0));up=right.cross(forward)
    return Matrix((right,up,-forward)).transposed().to_quaternion()

def _configure_s24_camera_b2(tx):
    scene=bpy.context.scene;camera=scene.camera
    if camera is None:
        bpy.ops.object.camera_add();camera=bpy.context.object;scene.camera=camera
    camera.name='Camera';camera.animation_data_clear();camera.data.animation_data_clear()
    camera.rotation_mode='QUATERNION';camera.data.type='PERSP'
    camera.data.clip_start=.01;camera.data.clip_end=600
    camera.data.shift_x=0;camera.data.shift_y=0
    water=Vector((tx,0,31.84));pitch_end=math.radians(15)
    end_out=Vector((24-tx,-76,0)).normalized();end_horizontal=(-end_out.x,-end_out.y)
    # The actual base and porcelain are the vertical silhouette extremes.
    scene.frame_set(240);deps=bpy.context.evaluated_depsgraph_get();bounds=[]
    for obj in scene.objects:
        if obj.name.startswith('Stepped foundation') or obj.get('layer')=='toilet':
            evaluated=obj.evaluated_get(deps);mesh=evaluated.to_mesh()
            if mesh:
                bounds.extend(evaluated.matrix_world@v.co for v in mesh.vertices)
                evaluated.to_mesh_clear()
    def endpoint(distance):
        camera.location=(tx+end_out.x*distance,end_out.y*distance,3)
        camera.rotation_quaternion=look_rotation(end_horizontal,pitch_end)
        camera.data.lens=35;camera.data.shift_y=0;bpy.context.view_layer.update()
        y=[(1-world_to_camera_view(scene,camera,p).y)*1080 for p in bounds]
        return min(y),max(y)
    lo,hi=50.,120.
    for _ in range(24):
        mid=(lo+hi)/2;y0,y1=endpoint(mid)
        if y1-y0>810:lo=mid
        else:hi=mid
    distance=(lo+hi)/2;y0,y1=endpoint(distance)
    # Lens shift keeps the crown below the title without changing the +15deg axis.
    end_shift=(230-y0)/1920
    end_location=Vector((tx+end_out.x*distance,end_out.y*distance,3))
    water_angle=math.atan2(water.z-end_location.z,distance)
    end_water_y=.5+math.tan(water_angle-pitch_end)/(2*math.tan(math.atan((36*1080/1920)/(2*35))))
    positions=[(tx,0,31.99),(tx+1.95,-7.9,35.4),(17,-20,37),tuple(end_location)]
    water_positions=[.5,.463,.68,end_water_y]
    previous=None
    for frame in range(1,241):
        location=Vector([cubic_value(frame,[p[axis] for p in positions]) for axis in range(3)])
        lens=cubic_value(frame,[85,50,35,35]);water_y=cubic_value(frame,water_positions)
        horizontal=Vector((water.x-location.x,-location.y,0));length=horizontal.length
        if length<1e-9:horizontal=Vector((-1.95,7.9,0)).normalized()
        else:horizontal.normalize()
        half_vfov=math.atan((camera.data.sensor_width*1080/1920)/(2*lens))
        pitch=math.atan2(water.z-location.z,length)-math.atan((water_y-.5)*2*math.tan(half_vfov))
        rotation=look_rotation((horizontal.x,horizontal.y),pitch)
        if previous is not None and previous.dot(rotation)<0:rotation.negate()
        previous=rotation.copy()
        camera.location=location;camera.rotation_quaternion=rotation;camera.data.lens=lens
        camera.data.shift_y=cubic_value(frame,[0,0,0,end_shift])
        camera.keyframe_insert(data_path='location',frame=frame)
        camera.keyframe_insert(data_path='rotation_quaternion',frame=frame)
        camera.data.keyframe_insert(data_path='lens',frame=frame)
        camera.data.keyframe_insert(data_path='shift_y',frame=frame)
    scene['s24_camera_revision']='strict-storyboard-B-v2'
    scene['s24_final_distance']=distance;scene['s24_final_shift_y']=end_shift
    return camera

from mathutils import Quaternion

# The first reveal is a true Z-only lift. The approved B2 track is retained
# unchanged from frame 60 onward, including every outgoing Bezier handle.
def _hermite(frame, start, end, first, last, first_slope=0., last_slope=0.):
    h=end-start;t=(frame-start)/h
    return ((2*t**3-3*t*t+1)*first+(t**3-2*t*t+t)*h*first_slope
            +(-2*t**3+3*t*t)*last+(t**3-t*t)*h*last_slope)

def _camera_curves(owner):
    animation=owner.animation_data;action=animation.action
    if hasattr(action,'fcurves'):
        return list(action.fcurves)
    return [curve for layer in action.layers for strip in layer.strips
            for curve in strip.channelbag(animation.action_slot).fcurves]

def configure_s24_camera(tx):
    camera=_configure_s24_camera_b2(tx);scene=bpy.context.scene
    curves=_camera_curves(camera)+_camera_curves(camera.data)
    preserved=[]
    for curve in curves:
        for key in curve.keyframe_points:
            if key.co.x>=60:
                preserved.append((key,key.co.copy(),key.handle_left.copy(),key.handle_right.copy()))
    def scalar_tangent(values):
        # This is the exact shared analytic B2 Hermite tangent at frame 60.
        a=(values[1]-values[0])/59;b=(values[2]-values[1])/90
        return 0. if a*b<=0 else (239+208)/(239/a+208/b)
    scene.frame_set(60)
    end=camera.location.copy();end_lens=camera.data.lens
    dx=end.x-tx;dy=end.y;radius=math.hypot(dx,dy);azimuth=math.atan2(dy,dx)
    mx=scalar_tangent([tx,tx+1.95,17]);my=scalar_tangent([0,-7.9,-20])
    mz=scalar_tangent([31.99,35.4,37]);ml=scalar_tangent([85,50,35])
    mr=(dx*mx+dy*my)/radius;ma=(dx*my-dy*mx)/(radius*radius)
    stage_end=24;stage_z=36.9;stage_lens=55.;stage_z_speed=.03;stage_lens_speed=-.13
    end_distance=math.hypot(radius,end.z-31.84)
    end_distance_speed=(radius*mr+(end.z-31.84)*mz)/end_distance
    for frame in range(1,60):
        if frame<=stage_end:
            location=Vector((tx,0,_hermite(frame,1,stage_end,31.99,stage_z,0,stage_z_speed)))
            lens=_hermite(frame,1,stage_end,85,stage_lens,0,stage_lens_speed)
            angle=azimuth;pitch=-math.pi/2
        else:
            radial=_hermite(frame,stage_end,60,0,radius,0,mr)
            angle=_hermite(frame,stage_end,60,azimuth,azimuth,0,ma)
            # Interpolate camera-water distance, then solve height on that arc.
            # This prevents a brief push-in while the dolly begins to move.
            distance=_hermite(frame,stage_end,60,stage_z-31.84,end_distance,stage_z_speed,end_distance_speed)
            z=31.84+math.sqrt(max(0,distance*distance-radial*radial))
            location=Vector((tx+radial*math.cos(angle),radial*math.sin(angle),z))
            lens=_hermite(frame,stage_end,60,stage_lens,end_lens,stage_lens_speed,ml)
            water_y=_hermite(frame,stage_end,60,.5,.463,0,0)
            half_vfov=math.atan((camera.data.sensor_width*1080/1920)/(2*lens))
            pitch=math.atan2(31.84-z,radial)-math.atan((water_y-.5)*2*math.tan(half_vfov))
        camera.location=location
        rotation=look_rotation((-math.cos(angle),-math.sin(angle)),pitch)
        # Square the overhead view to the toilet's model axes; return smoothly
        # to the approved unrolled B2 view before the exact frame-60 join.
        roll_progress=max(0.,min(1.,(frame-stage_end)/(60-stage_end)))
        roll_ease=roll_progress**3*(10-15*roll_progress+6*roll_progress**2)
        roll=-(math.pi/2+azimuth)*(1-roll_ease)
        camera.rotation_quaternion=rotation@Quaternion((0,0,1),roll)
        camera.data.lens=lens;camera.data.shift_y=0
        camera.keyframe_insert(data_path='location',frame=frame)
        camera.keyframe_insert(data_path='rotation_quaternion',frame=frame)
        camera.data.keyframe_insert(data_path='lens',frame=frame)
        camera.data.keyframe_insert(data_path='shift_y',frame=frame)
    for key,co,left,right in preserved:
        key.handle_left_type='FREE';key.handle_right_type='FREE'
        key.co=co;key.handle_right=right;key.handle_left=left
        if co.x==60:
            # Exact C1 at the join while leaving the B2 outgoing segment intact.
            slope=(right.y-co.y)/(right.x-co.x)
            key.handle_left=(left.x,co.y+(left.x-co.x)*slope)
    for curve in curves:curve.update()
    scene['s24_camera_revision']='strict-storyboard-B-v4'
    scene['s24_vertical_until']=stage_end
    return camera
