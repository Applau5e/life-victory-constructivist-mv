"""Build animated, editable camera scenes. Run with Blender in background mode."""
import bpy, math, random, json, sys
from pathlib import Path
from mathutils import Vector
from math import sin, cos, pi, radians
ROOT=Path(__file__).resolve().parent
if str(ROOT) not in sys.path:sys.path.insert(0,str(ROOT))
PUBLIC=ROOT.parent/'studio'/'public'
R='#D52B1E'; D='#8E1B14'; I='#141210'; P='#EDE3CC'; G='#D9A93A'; O='#C9A45C'; GR='#8C857A'
TAU=2*pi
def linear(c):
    u=int(c,16)/255
    return u/12.92 if u<=.04045 else ((u+.055)/1.055)**2.4
def rgba(c): return tuple(linear(c[i:i+2]) for i in (1,3,5))+(1,)
def mat(color,finish='toon'):
    name=color+finish
    if bpy.data.materials.get(name):return bpy.data.materials[name]
    m=bpy.data.materials.new(name);m.diffuse_color=rgba(color);m.use_nodes=True
    n=m.node_tree.nodes;n.clear();links=m.node_tree.links
    out=n.new('ShaderNodeOutputMaterial')
    if finish in ['ceramic','metal','water','enamel']:
        s=n.new('ShaderNodeBsdfPrincipled');s.inputs['Base Color'].default_value=rgba(color)
        s.inputs['Roughness'].default_value={'ceramic':.08,'metal':.25,'water':.05,'enamel':.2}[finish]
        s.inputs['Metallic'].default_value=float(finish=='metal');s.inputs['Coat Weight'].default_value=.5
        if finish=='water':
            wave=n.new('ShaderNodeTexWave');wave.inputs['Scale'].default_value=3
            bump=n.new('ShaderNodeBump');bump.inputs['Strength'].default_value=.07
            links.new(wave.outputs['Fac'],bump.inputs['Height']);links.new(bump.outputs['Normal'],s.inputs['Normal'])
    else:
        s=n.new('ShaderNodeEmission');s.inputs[0].default_value=rgba(color)
        if finish=='toon':
            # Normal-based constant bands are compatible with both Cycles and EEVEE.
            geom=n.new('ShaderNodeNewGeometry');dot=n.new('ShaderNodeVectorMath');dot.operation='DOT_PRODUCT'
            dot.inputs[1].default_value=(-.5,-.45,.74);links.new(geom.outputs['Normal'],dot.inputs[0])
            ramp=n.new('ShaderNodeValToRGB');ramp.color_ramp.interpolation='CONSTANT'
            ramp.color_ramp.elements[0].color=rgba({R:D,P:'#C9C0AA',O:GR}.get(color,color))
            ramp.color_ramp.elements[1].position=.15;ramp.color_ramp.elements[1].color=rgba(color)
            hi=ramp.color_ramp.elements.new(.83);hi.color=rgba({R:'#E8584A',P:P}.get(color,color))
            links.new(dot.outputs['Value'],ramp.inputs['Fac']);links.new(ramp.outputs[0],s.inputs[0])
    links.new(s.outputs[0],out.inputs[0]);return m
def tag(obj,name,color,finish='toon'):
    obj.name=name;obj['layer']=LAYER
    if color:obj.data.materials.append(mat(color,finish))
    return obj
def cube(name,p,size,c,bevel=0):
    bpy.ops.mesh.primitive_cube_add(size=1,location=p);o=tag(bpy.context.object,name,c)
    for v in o.data.vertices:
        for i in range(3):v.co[i]*=size[i]
    if bevel:
        m=o.modifiers.new('Edge bevel','BEVEL');m.width=bevel;m.segments=3
    return o
def mesh(name,v,f,c,finish='toon'):
    data=bpy.data.meshes.new(name);data.from_pydata(v,[],f);data.update()
    obj=bpy.data.objects.new(name,data);bpy.context.scene.collection.objects.link(obj);return tag(obj,name,c,finish)
def cyl(name,p,r,h,c,vertices=48,finish='toon'):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices,radius=r,depth=h,location=p)
    return tag(bpy.context.object,name,c,finish)
def paths(name,lines,width,c):
    curve=bpy.data.curves.new(name,'CURVE');curve.dimensions='3D';curve.bevel_depth=width;curve.bevel_resolution=0;curve.resolution_u=1
    for line in lines:
        s=curve.splines.new('POLY');s.points.add(len(line)-1)
        for pt,xyz in zip(s.points,line):pt.co=(*xyz,1)
    o=bpy.data.objects.new(name,curve);bpy.context.scene.collection.objects.link(o);return tag(o,name,c)
def ring(name,p,rx,ry,t,c):
    o=paths(name,[[ (rx*cos(i*TAU/96),ry*sin(i*TAU/96),0) for i in range(97)]],t,c);o.location=p;return o
def wedge(name,p,length,width,height):
    v=[(-length/2,-width/2,-height/2),(-length/2,width/2,-height/2),(-length/2,width/2,height/2),(-length/2,-width/2,height/2),(length/2,0,0)]
    o=mesh(name,v,[(0,3,2,1),(0,1,4),(1,2,4),(2,3,4),(3,0,4)],R);o.location=p;return o
def key(o,attr,f,val):
    setattr(o,attr,val);o.keyframe_insert(data_path=attr,frame=f)
def camkeys(track,lens=50,ortho=None):
    bpy.ops.object.camera_add();camera=bpy.context.object;bpy.context.scene.camera=camera;camera.name='Camera'
    camera.data.clip_start=.01;camera.data.clip_end=600
    if ortho:camera.data.type='ORTHO';camera.data.ortho_scale=ortho
    for f,loc,target,*focal in track:
        key(camera,'location',f,loc);rot=(Vector(target)-Vector(loc)).to_track_quat('-Z','Y').to_euler()
        key(camera,'rotation_euler',f,rot);key(camera.data,'lens',f,focal[0] if focal else lens)
    return camera
def setup(id,shot,end,rate=30,cycles=False):
    global LAYER
    s=bpy.context.scene;s.name=f'BL-{id:02d}_{shot}';s.frame_end=end;s.render.fps=rate
    s.render.engine='CYCLES' if cycles else 'BLENDER_EEVEE'
    s.cycles.samples=8;s.cycles.use_denoising=True
    if hasattr(s,'eevee') and hasattr(s.eevee,'taa_render_samples'):s.eevee.taa_render_samples=4
    s.render.resolution_x=1920;s.render.resolution_y=1080;s.render.resolution_percentage=100;s.render.film_transparent=True
    s.view_settings.view_transform='Standard';s.view_settings.look='None';s.render.image_settings.file_format='PNG';s.render.image_settings.color_mode='RGBA'
    s.render.image_settings.compression=12;s.world=bpy.data.worlds.new('Paper studio');s.world.use_nodes=True
    bg=s.world.node_tree.nodes.get('Background');bg.inputs[0].default_value=(.8,.78,.7,1);bg.inputs[1].default_value=.55
    bpy.ops.object.light_add(type='SUN',location=(-6,-6,9));lamp=bpy.context.object;lamp.rotation_euler=(radians(36),radians(-36),0);lamp.data.energy=3
    LAYER='main';return s
def ratchet(o,period,end):
    i=0
    while 1+i*period<=end:
        a=1+i*period;key(o,'rotation_euler',a,(0,0,i*pi/2));key(o,'rotation_euler',a+10,(0,0,(i+1)*pi/2));i+=1
def tower(shot):
    global LAYER
    end={'A':120,'B':240,'C':240,'D':30}[shot];setup(1,shot,end,cycles=shot=='B');LAYER='tower'
    def pos(t,a,r=None):
        radius=6-4.8*t if r is None else r
        return (30*t*math.tan(radians(23))+radius*cos(a),radius*sin(a),30*t)
    for i in range(3):cyl('Stepped foundation',(0,0,.19*i),7.6-.45*i,.38,I)
    for k in (0,pi):
        paths('Four-turn main helical girder',[[pos(i/320,i/320*TAU*4+k) for i in range(321)]],.22,R)
        paths('Continuous inclined spine',[[pos(0,k),pos(1,k)]],.34,R)
    braces=[]
    for z in range(30):
        for j in range(8):
            a=j*TAU/8;b=(j+1)*TAU/8
            braces.extend([[pos(z/30,a),pos(z/30,b)],[pos(z/30,a),pos((z+1)/30,b)],[pos(z/30,b),pos((z+1)/30,a)]])
    paths('Horizontal and crossed bracing',braces,.075,D)
    for idx,(t,size,period) in enumerate([(.19,4,58.537),(.45,3,29.268),(.65,2.5,14.634),(.82,1.5,117.074)]):
        p=pos(t,0,0)
        if idx==0:o=cube('Suspended cube',p,(size,)*3,P)
        if idx==1:
            bpy.ops.mesh.primitive_cone_add(vertices=4,radius1=size*.72,depth=size,location=p);o=tag(bpy.context.object,'Pyramid',R)
        if idx==2:o=cyl('Rotating cylinder',p,size*.5,size,I)
        if idx==3:
            rings=[(i*pi/2/12) for i in range(13)];v=[(size*cos(a)*cos(j*TAU/32),size*cos(a)*sin(j*TAU/32),size*sin(a)) for a in rings for j in range(32)]
            o=mesh('Hemisphere',v,[(i*32+j,i*32+(j+1)%32,(i+1)*32+(j+1)%32,(i+1)*32+j) for i in range(12) for j in range(32)],P);o.location=p
        ratchet(o,period,end)
    tx=pos(1,0,0)[0];cyl('Platform',(tx,0,30),1.9,.32,R);cube('Plinth',(tx,0,30.48),(1.65,1.8,.7),P)
    LAYER='toilet';profile=[(.34,0),(.43,.12),(.29,.4),(.34,.64),(.64,.76),(.77,1.13),(.73,1.25),(.61,1.26),(.50,1.03),(.38,.86)]
    v=[(tx+.83*r*cos(j*TAU/64),r*sin(j*TAU/64),30.83+h) for r,h in profile for j in range(64)]
    bowl=mesh('Lathed porcelain bowl',v,[(i*64+j,i*64+(j+1)%64,(i+1)*64+(j+1)%64,(i+1)*64+j) for i in range(len(profile)-1) for j in range(64)],'#F3EFE6','ceramic')
    for p in bowl.data.polygons:p.use_smooth=True
    ring('Porcelain seat',(tx,0,32.12),.57,.72,.065,P)
    tank=cube('Cistern',(tx,.78,32.22),(1.12,.43,.94),P,.08);tank.data.materials[0]=mat('#F3EFE6','ceramic')
    water=cyl('Still water',(tx,0,31.83),.46,.02,I,64,'water');water.scale.x=.83
    if shot=='A':camkeys([(1,(0,-8,1),(4,0,13)),(end,(5,-9,13),(9,0,25))],18)
    if shot=='B':
        from s24_camera import configure_s24_camera
        configure_s24_camera(tx)
    if shot=='C':camkeys([(min(240,1+i*30),(6+48*sin(i*pi/12),-48*cos(i*pi/12),3+5*i/8),(6,0,16.1)) for i in range(9)],24)
    if shot=='D':camkeys([(1,(5,-58,18),(6,0,16)),(30,(21,-54,18),(6,0,16))],ortho=69)
def splash(shot):
    global LAYER
    setup(7,shot,180,60);rng=random.Random(113);LAYER='water'
    cyl('Black water',(0,0,0),4,.05,I,96,'flat');LAYER='wedge'
    o=wedge('Falling wedge',(0,0,0),1.3,.46,.4);o.rotation_euler.y=pi/2
    for f,z in [(1,5),(40,.71),(43,-.25),(48,-1)]:key(o,'location',f,(0,0,z))
    LAYER='crown'
    for j in range(24):
        a=j*TAU/24;h=1.5*rng.uniform(.8,1.2)
        o=mesh('Crown blade',[(.36,-.12,0),(.43,.13,0),(.78,0,h),(.55,0,.3)],[(0,1,2),(1,3,2),(3,0,2)],P);o.rotation_euler.z=a
        for f,sz in [(1,0),(41,0),(44,1),(61,0)]:key(o,'scale',f,(sz,)*3)
    LAYER='droplets'
    for j in range(40):
        a=rng.random()*TAU;dist=rng.uniform(.6,2.9);height=rng.uniform(.5,2)
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1,radius=rng.uniform(.04,.10));o=tag(bpy.context.object,'Ink drop',P)
        for t in (0,.25,.5,.75,1):
            key(o,'location',41+t*30,(dist*t*cos(a),dist*t*sin(a),4*t*(1-t)*height))
        for f,sc in [(1,0),(41,0),(42,1),(69,1),(71,0)]:key(o,'scale',f,(sc,)*3)
    LAYER='ripples'
    for j in range(6):
        o=ring('Expanding ripple',(0,0,.05),1,1,.014,P);a=46+5*j
        for f,s in [(1,0),(a-1,0),(a,.2),(a+60,8),(a+61,0)]:key(o,'scale',f,(s,s,1))
    if shot=='A':camkeys([(1,(0,-15,5.46),(0,0,.65))],50)
    elif shot=='B':camkeys([(1,(0,-.001,16),(0,0,0))],ortho=15)
    else:camkeys([(1,(0,-.001,28),(0,0,0))],85)
    bpy.context.scene.timeline_markers.new('FREEZE_FRAME',frame=40)

def stage(shot):
    global LAYER
    setup(2,shot,348);LAYER='bg'
    for x in [-2.2,2.2]:
        for dx in [-1,1]:cube('Timber upright',(x+dx,1.4,3),(.2,.2,6),O)
        cube('Lintel',(x,1.4,5.9),(2.2,.2,.2),O)
    for x in [-2.2,2.2]:cube('Black portal',(x,1.65,3), (1.8,.16,5.8),I)
    cyl('Throne',(0,0,.225),.5,.45,P);ring('Seat',(0,0,.47),.47,.52,.05,P)
    cube('Throne back',(0,.47,.68),(.92,.23,.92),P)
    LAYER='ramp'
    ramp=cube('Stage ramp',(6.25,0,2.27),(3.45,.8,.14),R);ramp.rotation_euler.y=-pi/6
    LAYER='bg'
    for x in [3.65,4.3]:cube('Ladder upright',(x,1.1,2.5),(.10,.10,5),I)
    for j in range(12):cube('Rung',(3.975,1.1,.3+j*.39),(.7,.10,.08),I)
    disc=cyl('Clock',(0,1.2,4.4),.71,.15,P);disc.rotation_euler.x=pi/2
    LAYER='gear';teeth=12;v=[]
    for j in range(teeth*4):
        a=j*TAU/(teeth*4);r=2 if j%4 in (1,2) else 1.72
        v.append((r*cos(a),0,r*sin(a)))
    n=len(v);v.extend([(1.38*cos(i*TAU/n),0,1.38*sin(i*TAU/n)) for i in range(n)])
    wheel=mesh('12-tooth cog',v,[(i,(i+1)%n,n+(i+1)%n,n+i) for i in range(n)],R);wheel.location=(-2.3,.5,2.4)
    wheel.modifiers.new('Plate thickness','SOLIDIFY').thickness=.18
    hub=cyl('Axle',(0,0,0),.31,.35,I);hub.rotation_euler.x=pi/2;hub.parent=wheel
    for i in range(6):
        a=i*pi/3;spoke=cube('Wheel spoke',(.86*cos(a),0,.86*sin(a)),(1.30,.13,.17),R)
        spoke.rotation_euler.y=-a;spoke.parent=wheel
    angle=0
    for j in range(18):
        f=1+14.634*j
        key(wheel,'rotation_euler',f,(0,radians(angle),0))
        angle+=30 if j<8 else max(0,30-(j-8)*5)
        key(wheel,'rotation_euler',f+5,(0,radians(angle),0))
    camkeys([(1,(0,-16.3,1.1),(0,0,2.88))],50)
def door(shot):
    setup(3,shot,88 if shot=='B' else 36)
    for x in [-.68,.68]:cube('Red jamb',(x,0,1.25),(.15,.18,2.5),R)
    cube('Lintel',(0,0,2.47),(1.5,.18,.15),R)
    pivot=bpy.data.objects.new('Hinge',None);bpy.context.scene.collection.objects.link(pivot);pivot.location=(-.6,0,0)
    leaf=cube('Black leaf',(.6,0,1.2),(1.2,.10,2.4),I);leaf.parent=pivot
    handle=cyl('Porcelain handle',(1.05,-.12,1.12),.065,.20,P);handle.rotation_euler.x=pi/2;handle.parent=pivot
    keys={'A':[(1,0),(10,0),(18,70),(24,70),(28,0),(30,3),(32,0)],'Open':[(1,0),(11,90),(36,90)],
          'B':[(1+j*29+d,a) for j in range(3) for d,a in [(0,0),(9,15),(16,0)]]}[shot]
    for f,a in keys:key(pivot,'rotation_euler',f,(0,0,radians(a)))
    camkeys([(1,(1.5,-5.7,1.55) if shot!='B' else (5,-.7,1.5),(0,0,1.2))],35,5 if shot=='B' else None)
def sofa(shot):
    setup(4,shot,132)
    cube('Hard shadow',(.20,.13,.015),(2.4,1.1,.025),I)
    cube('Seat',(0,0,.37),(2,.8,.4),R,.02);cube('Back',(0,.36,.65),(2,.2,.6),I,.02)
    # A 12mm front offset prevents the arm and red seat fronts from z-fighting.
    for x in [-.95,.95]:cube('Arm',(x,-.012,.55),(.2,.8,.6),I,.02)
    camkeys([(1,(.48,-4.2,1.2),(0,0,.48)),(132,(2,-13,5),(0,0,.48))],35)
def wall(shot):
    end={'A':222,'A2':30,'B':120}[shot];setup(5,shot,end)
    # Build a single editable brick mesh, with actual open joints.
    verts=[];faces=[]
    for row in range(24):
        for col in range(13):
            start=max(-3,-3+col*.5-(row%2)*.25);stop=min(3,-3+(col+1)*.5-(row%2)*.25)
            if stop-start<=.02:continue
            idx=len(verts)
            verts.extend([(x,y,z) for z in [row*.25+.01,(row+1)*.25-.01] for y in [-.5,.5] for x in [start+.01,stop-.01]])
            faces.extend([tuple(idx+j for j in f) for f in [(0,2,3,1),(4,5,7,6),(0,1,5,4),(1,3,7,5),(2,6,7,3),(0,4,6,2)]])
    bricks=mesh('Brickwork',verts,faces,P)
    mortar=cube('Mortar',(0,.02,3) if shot=='B' else (0,0,3),(5.98,.90,5.98) if shot=='B' else (5.974,.998,5.974),I)
    w=wedge('Red ram',(-4,-2.25,2.7),4,1.2,.8)
    cr=paths('Hairline fractures',[[(0,0,0),(.14,0,.27),(.10,0,.53),(.35,0,.82)],[(.10,0,.53),(-.25,0,.65),(-.38,0,.92)]],.017 if shot=='B' else .009,I)
    if shot=='B':
        # S36 keeps its original, quiet frontal reprise unchanged.
        w.rotation_euler.z=.45
        for f,x in [(1,-5.2),(20,-1.7),(21,-1.80),(22,-1.72),(end,-1.52)]:key(w,'location',f,(x,-1.40,2.7))
        cr.location=(.03,-.515,2.7)
        for f,s in [(1,0),(90,.04),(end,1)]:key(cr,'scale',f,(s,1,s))
        camkeys([(1,(0,-22,3),(0,0,3))],35,35)
    else:
        # Front face is now X=-0.5: the +X ram presses into its normal,
        # rather than sliding parallel to the old Y=-0.5 facade.
        bricks.rotation_euler.z=mortar.rotation_euler.z=-pi/2
        cr.rotation_euler.z=-pi/2;cr.location=(-.503,0,2.7)
        if shot=='A':
            for f,x in [(1,-6),(20,-2.5),(21,-2.56),(22,-2.5)]:key(w,'location',f,(x,0,2.7))
            for f in [1,20,21,22]:key(w,'scale',f,(1,1,1))
            for n in range(1,15):
                beat=round(22+n*14.634)
                if beat>end:break
                # The rear advances 0.02m per beat while the acute tip stays
                # on X=-0.5: compress the ram instead of burying its point.
                for f,step in [(beat-1,n-1),(min(end,beat+2),n)]:
                    advance=.02*step
                    key(w,'location',f,(-2.5+advance/2,0,2.7))
                    key(w,'scale',f,(1-advance/4,1,1))
            for f,sz in [(1,0),(20,.04),(162,1.087),(end,1.087)]:key(cr,'scale',f,(sz,1,sz))
            camkeys([(1,(-12.5,-12,5.8),(-2.7,0,3.05))],35)
        else:
            for f,advance in [(1,.18),(15,.20),(30,.22)]:
                key(w,'location',f,(-2.5+advance/2,0,2.7))
                key(w,'scale',f,(1-advance/4,1,1))
            for f,sz in [(1,1.087),(30,1.17)]:key(cr,'scale',f,(sz,1,sz))
            camkeys([(1,(-4.5,-4,3.5),(-.5,0,3.0))],85)
def gate(shot):
    end=144 if shot=='A' else 120;setup(6,shot,end)
    def member(name,x,z,w,h):
        o=cube(name,point(x,z),(w,1,h),I)
        o.rotation_euler.y=-rot
        return o
    for j in range(8):
        y=j*6;rot=j*radians(7.5)
        def point(x,z):return (x*cos(rot)-z*sin(rot),y,5+x*sin(rot)+z*cos(rot))
        for x in (-3.5,3.5):member(f'Gate {j+1:02d} upright',x,-.5,1,9)
        beam=member(f'Gate {j+1:02d} lintel',0,4.5,8,1)
        if j==0:
            # The rear of this blank enamel mount meets the flat front face of the lintel at Y=-0.5.
            panel=cube('Gate 01 | entrance inscription panel',(0,-.535,9.5),(4.8,.07,.91),'#34302B')
            panel['purpose']='Flat front for Remotion 鬼门关; only the entrance carries an inscription.'
            panel.parent=beam
            panel.matrix_parent_inverse=beam.matrix_world.inverted()
        if j%2:paths('Arch insert',[[point(3.5*cos(a*pi/40),1+3.5*sin(a*pi/40)) for a in range(41)]],.23,I)
        else:paths('Diagonal supports',[[point(-4,1),point(-1,5)],[point(4,1),point(1,5)]],.32,D)
        for x in [-5.6,5.6]:
            cyl('Piston body',(x,y,1.8),.62,3.6,R)
            rod=cyl('Piston rod',(x,y,3.6),.32,2.4,P)
            for f in range(1,end+9,7):key(rod,'location',f,(x,y,3.6+.56*sin(f/14.634*TAU)))
        if j<3:
            disc=cyl('Gauge',(-4.7,y,5),.95,.16,P);disc.rotation_euler.x=pi/2
            paths('Gauge marks',[[(-4.7+.73*cos(a),y-.1,5+.73*sin(a)),(-4.7+.88*cos(a),y-.1,5+.88*sin(a))] for a in [k*pi/12 for k in range(13)]],.025,I)
            paths('Gauge needle',[[(-4.7,y-.14,5),(-4.14,y-.14,5.53)]],.06,R)
    camera=camkeys([(1,(0 if shot=='A' else -1.2,-20,3.8),(0,10,4)),(end,(.8,49,4),(0,75,1.8))],22)
    camera.rotation_mode='XYZ'
    for f,r in [(1,0),(end,30)]:camera.rotation_euler.y=radians(r);camera.keyframe_insert(data_path='rotation_euler',index=1,frame=f)
    leader=wedge('Leading wedge',(0,0,-3),.95,.36,.32);leader.parent=camera;leader.rotation_euler.y=pi/2
    if shot=='B':
        rng=random.Random(301)
        for i in range(300):
            o=bpy.data.objects.new('Fleet wedge',leader.data);bpy.context.scene.collection.objects.link(o);o['layer']='main'
            x,y,z=rng.uniform(-3.7,3.7),rng.uniform(-20,30),rng.uniform(1,7.4);o.rotation_euler.z=pi/2;o.scale=(rng.uniform(.3,1.5),)*3
            key(o,'location',1,(x,y,z));key(o,'location',end,(x,y+71,z))
    from bpy_extras.object_utils import world_to_camera_view
    # Local panel face, TL/TR/BR/BL. Store homogeneous pixel coordinates so CSS
    # preserves perspective even when the sign is partly beyond the frame.
    s=bpy.context.scene;track=[]
    for f in range(1,end+1):
        s.frame_set(f)
        q=[world_to_camera_view(s,camera,panel.matrix_world@Vector((x,-.035,z)))
           for x,z in [(-2.4,.455),(2.4,.455),(2.4,-.455),(-2.4,-.455)]]
        if (min(p.z for p in q)<=camera.data.clip_start or max(p.x for p in q)<=0 or
            min(p.x for p in q)>=1 or max(p.y for p in q)<=0 or min(p.y for p in q)>=1):
            track.append(None);continue
        track.append([[round(p.x*1920,5),round((1-p.y)*1080,5),round(p.z,7)] for p in q])
    (ROOT.parent/'studio/src'/f'gate-panel-{shot}.json').write_text(json.dumps(track,separators=(',',':')),encoding='utf-8')
    cyl('Exit pool',(0,58,0),5,.1,I)

def mountain(shot):
    end=120 if shot=='C' else 60;setup(8,shot,end)
    if shot!='B':
        for x,y,scale in [(0,0,1),(-3,1,.62),(3.3,2,.49)]:
            rings=[(0,5),(2.9,2.1),(4.15,.81),(5,.28)]
            verts=[(x+r*scale*cos(j*TAU/7),y+r*scale*sin(j*TAU/7),(h+(.22*sin(j*2) if h==4.15 else 0))*scale)
                   for h,r in rings for j in range(7)]
            faces=[(k*7+j,k*7+(j+1)%7,(k+1)*7+j) for k in range(3) for j in range(7)]
            faces += [(k*7+(j+1)%7,(k+1)*7+(j+1)%7,(k+1)*7+j) for k in range(3) for j in range(7)]
            o=mesh('Folded mountain',verts,faces,R);o.data.materials.append(mat(P))
            for i,poly in enumerate(o.data.polygons):poly.material_index=int((i%21)//7==2)
        if shot=='A':cube('Summit platform',(-.9,-.15,4.52),(1.3,.9,.14),P)
        else:cube('Summit platform',(0,0,4.97),(2.7,1.25,.12),P)
    if shot!='A':
        z=5 if shot=='C' else 0
        for n,(x,h,c) in enumerate([(-1.1,.8,I),(0,1.2,R),(1.1,.5,I)]):
            cube('Podium',(x,0,z+h/2),(1.08,.9,h),c)
            bpy.ops.object.text_add(location=(x-.18,-.46,z+.10),rotation=(pi/2,0,0));txt=tag(bpy.context.object,'Rank',P)
            txt.data.body=['2','1','3'][n];txt.data.size=.53
    if shot=='A':camkeys([(1,(1,-8,.85),(0,0,3.4)),(60,(.5,-7,1.4),(0,0,4.1))],24)
    if shot=='B':camkeys([(1,(0,-8,1.7),(0,0,1.55))],50)
    if shot=='C':camkeys([(1,(1,-12,.4),(0,0,2.9)),(60,(0,-6.9,6.8),(0,0,6.65)),(120,(0,-6.9,6.8),(0,0,6.65))],32)
def flush(shot):
    setup(9,shot,90)
    top=bpy.data.objects.new('Vortex motion',None);bpy.context.scene.collection.objects.link(top)
    for k,c in enumerate([R,P]):
        v=[]
        for j in range(321):
            t=j/320;r=.10+4*t;a=t*TAU*2.3+k*pi
            for shift in [-.23,.23]:v.append(((r+shift*t)*cos(a),(r+shift*t)*sin(a),-.7*(1-t)**2))
        ribbon=mesh('Spiral ribbon',v,[(2*j,2*j+1,2*j+3,2*j+2) for j in range(320)],c);ribbon.parent=top
    cyl('Drain',(0,0,-.72),.18,.02,I)
    for i in range(10):key(top,'rotation_euler',1+10*i,(0,0,-(i+i*i/10)*pi*.4))
    for f,sz in [(1,1),(75,1),(90,.006)]:key(top,'scale',f,(sz,)*3)
    camkeys([(1,(0,-.001,11),(0,0,0))],50)
def medal(shot):
    global LAYER
    setup(10,shot,210,cycles=True);LAYER='water'
    surf=cube('Reflective water',(0,0,-.06),(8,8,.1),I);surf.data.materials[0]=mat(I,'water')
    for x in [-1,1]:
        bpy.ops.object.light_add(type='AREA',location=(x,-.3,1));light=bpy.context.object;light.data.energy=28;light.data.shape='RECTANGLE';light.data.size=.24;light.data.size_y=1.6
        light.rotation_euler=(-light.location).to_track_quat('-Z','Y').to_euler()
    LAYER='medal';parent=bpy.data.objects.new('Medal float',None);bpy.context.scene.collection.objects.link(parent)
    # User reference revision: geometry approval first; materials are deferred.
    from medal_reference import build as build_reference_medal
    build_reference_medal(parent)
    for f in range(1,212,7):key(parent,'location',f,(0,0,.011*sin(f*TAU/117)))
    key(parent,'rotation_euler',1,(0,0,0));key(parent,'rotation_euler',210,(0,0,radians(15)))
    LAYER='ripples'
    for i in range(3):
        o=ring('Wavelet',(0,0,.003),1,1,.003,P)
        for f in range(1,212,3):
            r=.19+.48*((f/120+i/3)%1);key(o,'scale',f,(r,r,1))
    cam=camkeys([(1+30*i,(.72*sin(i*pi/21),-.72*cos(i*pi/21),.43),(0,.065,.026)) for i in range(8)],50)
    cam.data.dof.use_dof=True;cam.data.dof.focus_distance=.82;cam.data.dof.aperture_fstop=2.8
def stadium(shot):
    sys.path.insert(0,str(ROOT))
    from stadium_spec import build as build_stadium
    build_stadium(shot,setup,camkeys,key,mesh,mat)

def city(shot):
    global LAYER
    setup(12,shot,120 if shot=='A' else 1);rng=random.Random(12);LAYER='city'
    for j in range(7):
        x=-15+j*5;y=rng.uniform(-1,3);w=rng.uniform(2,4);h=rng.uniform(2,5)
        for k in range(3):cube('Stepped block',(x,y,h*(.5+.37*k)),(w*(1-.2*k),3*(1-.2*k),h*(1-.2*k)),P if j%3 else I)
        if j%2==0:
            for k in range(4):
                v=[(x+k*.7+a,y+b,h+z) for b in [-1.45,1.45] for a,z in [(0,0),(.7,0),(.7,.66)]]
                mesh('Sawtooth factory roof',v,[(0,1,2),(3,5,4),(0,3,4,1),(1,4,5,2),(2,5,3,0)],P)
        if j<5:cyl('Smokestack',(x+.9,y,3.6),.29,7.2,I)
    for x in [-8,9]:
        lines=[]
        for j in range(18):
            for direction in [-1,1]:
                a=j*TAU/18;b=a+direction*2.25
                lines.append([(x+1.6*cos(a),1.6*sin(a),0),(x+.86*cos(b),.86*sin(b),10)])
        paths('Shukhov lattice',lines,.047,I)
    LAYER='wires';paths('Overhead conductors',[[(-22+j*11/24,-1,7-.9*sin(j*pi/24)+k*.22) for j in range(25)] for k in range(3)],.038,I)
    camkeys([(1,(2,-23,1),(0,0,6)),(120,(1,-19,1.4),(0,0,6))] if shot=='A' else [(1,(0,-105,7),(0,0,6))],20 if shot=='A' else 135)

BUILD=[tower,stage,door,sofa,wall,gate,splash,mountain,flush,medal,stadium,city]
SHOTS=['ABCD','A',['A','Open','B'],'A',['A','A2','B'],'AB',['A','B','Perspective'],'ABC','A','A',['A','Rise'],'AB']
def build(id,shot):
    bpy.ops.wm.read_factory_settings(use_empty=True);BUILD[id-1](shot)
    scene=bpy.context.scene;scene.frame_set(1)
    dest=ROOT/'scenes';dest.mkdir(exist_ok=True)
    bpy.context.preferences.filepaths.save_version=0
    bpy.ops.wm.save_as_mainfile(filepath=str(dest/(scene.name+'.blend')))
if __name__=='__main__':
    for spec in sys.argv[sys.argv.index('--')+1:]:
        number,_,cams=spec.partition(':');id=int(number)
        for shot in cams.split(',') if cams else SHOTS[id-1]:build(id,shot)
