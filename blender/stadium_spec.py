"""BL-11 construction per section 5. The three O-02 mattes own the geometry."""
import json, math, random
from pathlib import Path
import bpy
from mathutils import Vector

ROOT=Path(__file__).resolve().parent
INK='#141210'; PAPER='#EDE3CC'; GREY='#8C857A'; RED='#D52B1E'
UNIT=160
def xyz(p,z):return ((p[0]-512)/UNIT,(768-p[1])/UNIT,z)
def mix(p,q,t):return tuple(x*(1-t)+y*t for x,y in zip(p,q))
def resize_inward(line,d):
    result=[]
    for i,p in enumerate(line):
        a=line[(i-1)%len(line)];b=line[(i+1)%len(line)];dx=b[0]-a[0];dy=b[1]-a[1];l=math.hypot(dx,dy) or 1
        result.append((p[0]-dy*d/l,p[1]+dx*d/l))
    return result

def build(shot,setup,camkeys,key,mesh,mat):
    scene=setup(11,shot,90)
    plan=json.loads((ROOT/'stadium-o02.json').read_text())
    field,seat,rim=plan['field'],plan['seat'],plan['rim']
    n=len(seat);rng=random.Random(11)
    def slab(name,outline,z0,z1,color):
        n=len(outline);v=[xyz(p,z) for z in (z0,z1) for p in outline]
        faces=[tuple(reversed(range(n,2*n)))]+[(i,i+n,(i+1)%n+n,(i+1)%n) for i in range(n)]
        return mesh(name,v,faces,color,'flat')
    def band(name,inside,outside,z0,z1,color,indices):
        v=[];faces=[]
        for j in indices:
            k=(j+1)%len(inside);offset=len(v)
            pts=[inside[j],outside[j],outside[k],inside[k]]
            v.extend(xyz(p,z) for z in (z1,z0) for p in pts)
            faces.extend(tuple(offset+a for a in face) for face in [(3,2,1,0),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)])
        return mesh(name,v,faces,color)
    def rect(name,x0,y0,x1,y1,z0,z1,color):
        return slab(name,[(x0,y0),(x1,y0),(x1,y1),(x0,y1)],z0,z1,color)
    def contour(f):return [mix(a,b,f) for a,b in zip(field,seat)]
    def guide(name,points,z):
        path=bpy.data.curves.new(name,'CURVE');path.dimensions='3D';path.twist_mode='Z_UP'
        s=path.splines.new('POLY');s.points.add(len(points)-1);s.use_cyclic_u=True
        for pt,p in zip(s.points,points):pt.co=(*xyz(p,z),1)
        obj=bpy.data.objects.new(name,path);scene.collection.objects.link(obj)
        return obj
    def coping(index,line,z):
        # The repeated coping blocks follow the actual measured curve, independently editable per tier.
        path=guide(f'Tier {index:02d} profile | O-02',line,z)
        length=sum(math.dist(line[j-1],p) for j,p in enumerate(line))/UNIT
        count=144;step=length/count;half=.009
        verts=[(x,y,zz) for zz in (0,.007) for y in (-half,half) for x in (0,step*.985)]
        o=mesh(f'Tier {index:02d} / arrayed coping stones',verts,[(0,1,3,2),(4,6,7,5),(0,4,5,1),(2,3,7,6),(0,2,6,4),(1,5,7,3)],GREY)
        ar=o.modifiers.new('Array · perimeter segments','ARRAY');ar.count=count;ar.use_relative_offset=False;ar.use_constant_offset=True;ar.constant_offset_displace=(step,0,0)
        cv=o.modifiers.new('Curve · O-02 tier profile','CURVE');cv.object=path;cv.deform_axis='POS_X'
    slab('One-piece concrete foundation / O-02 outer silhouette',plan['outline'],-.15,.018,PAPER)
    slab('Field / exact O-02-water outline',field,.019,.035,INK)
    # The photo's narrowed shoulder is the shared concourse, continuous under both stands.
    # Traverse the actual contour, including the re-entrant corners beside the tank.
    rim=plan['outline']
    winding=sum(a[0]*b[1]-b[0]*a[1] for a,b in zip(rim,rim[1:]+rim[:1]))
    if winding<0:rim=list(reversed(rim))
    inner_rim=resize_inward(rim,13)
    band('Continuous red outer roof',inner_rim,rim,.017,.65,RED,range(len(rim)))
    band('Outer roof ink outline',resize_inward(rim,1.8),rim,.65,.657,INK,range(len(rim)))
    inner_seat=resize_inward(seat,12)
    band('Red seat canopy',inner_seat,seat,.10,.53,RED,range(n))
    band('Seat canopy keyline',resize_inward(seat,2.0),seat,.53,.537,INK,range(n))
    sectors=12
    def aisle(index):return min(index%(n/sectors),(n/sectors)-index%(n/sectors))<1.65
    seated=[j for j in range(n) if not aisle(j+.5)]
    access=[j for j in range(n) if aisle(j+.5)]
    seeds=[];radii=[]
    def spectators(line,z,spacing):
        dist=[0.]
        for j,p in enumerate(line):dist.append(dist[-1]+math.dist(p,line[(j+1)%n]))
        import bisect
        count=int(dist[-1]/spacing)
        for k in range(count):
            d=(k+.32)*dist[-1]/count;j=bisect.bisect_right(dist,d)-1
            if aisle(j+.5):continue
            f=(d-dist[j])/max(.01,dist[j+1]-dist[j]);x,y=mix(line[j],line[(j+1)%n],f)
            seeds.append(xyz((x+rng.uniform(-.6,.6),y+rng.uniform(-.6,.6)),z+.008))
            radii.append(2.4/UNIT*rng.uniform(.70,1.30))
    def tier_contour(t):return [mix(a,b,t) for a,b in zip(field,inner_seat)]
    for k in range(10):
        z=.085+.043*k;lo=k/10;hi=(k+1)/10
        band(f'Tier {k+1:02d} / paper concrete',tier_contour(lo),tier_contour(hi),.025,z,PAPER,seated)
        band(f'Tier {k+1:02d} / radial stairs',tier_contour(lo),tier_contour(hi),.025,z-.015,PAPER,access)
        coping(k+1,tier_contour(hi),z)
        for s in ([.32] if k==3 else [.27,.73]):spectators(tier_contour(lo+.1*s),z,7.1)
    # Main grandstand occupies the tank. The walking deck joins it to the ring inside the O-02 neck.
    rect('Concourse to rear seat sector',343,449,671,715,.018,.22,PAPER)
    for k in range(7):
        y=474+k*32;z=.373-k*.024
        # Three flights separated by cream longitudinal aisles, anchored into the rear terrace.
        for left,right in [(308,423),(442,570),(589,709)]:
            rect(f'Connecting flight {k+1} / nosing',left,y,right,y+30,.025,z,PAPER)
            rect('Printed riser edge',left,y+27,right,y+30,z,z+.003,INK)
    for x1,x2 in [(185,304),(713,830)]:
        rect('Retracted access bay',x1,460,x2,508,.027,.18,INK)
    rect('Raised main stand deck',124,86,897,449,.018,.38,PAPER)
    for r in range(3):
        y0=98+112*r;z=.65-.082*r
        for c in range(3):
            x0=139+253*c
            rect(f'Main stand block {r+1}-{c+1}',x0,y0,x0+238,y0+100,.38,z,PAPER)
            for m in range(9):
                for k in range(28):
                    x=x0+5+(k+.25*(m%2))*8.2;y=y0+7+m*10.4
                    seeds.append(xyz((x,y),z+.012));radii.append(2.6/UNIT*rng.uniform(.70,1.30))
    for x in [238,502,766]:rect('Main concourse entry',x-16,432,x+16,485,.23,.43,PAPER)
    data=bpy.data.meshes.new('Audience scatter sites');data.from_pydata(seeds,[],[]);data.update()
    obj=bpy.data.objects.new('Audience • Geometry Nodes',data);scene.collection.objects.link(obj);obj['layer']='main'
    radii_attr=data.attributes.new('seat_radius','FLOAT','POINT');radii_attr.data.foreach_set('value',radii)
    tree=bpy.data.node_groups.new('BL-11 | seated crowd and hit2b','GeometryNodeTree')
    tree.interface.new_socket(name='Geometry',in_out='INPUT',socket_type='NodeSocketGeometry')
    tree.interface.new_socket(name='Geometry',in_out='OUTPUT',socket_type='NodeSocketGeometry')
    nodes=tree.nodes;links=tree.links;ip=nodes.new('NodeGroupInput');out=nodes.new('NodeGroupOutput')
    ico=nodes.new('GeometryNodeMeshIcoSphere');ico.inputs['Radius'].default_value=1
    material=nodes.new('GeometryNodeSetMaterial');material.inputs['Material'].default_value=mat(INK,'flat')
    links.new(ico.outputs['Mesh'],material.inputs['Geometry'])
    radius=nodes.new('GeometryNodeInputNamedAttribute');radius.data_type='FLOAT';radius.inputs['Name'].default_value='seat_radius'
    strength=nodes.new('ShaderNodeValue');strength.label='hit2b · 0 → 1 → 0'
    for f,val in [(1,0),(46,0),(49,1),(52,0)]:strength.outputs[0].default_value=val;strength.outputs[0].keyframe_insert(data_path='default_value',frame=f)
    fac=nodes.new('ShaderNodeMath');fac.operation='MULTIPLY_ADD';fac.inputs[1].default_value=.3;fac.inputs[2].default_value=1;links.new(strength.outputs[0],fac.inputs[0])
    size=nodes.new('ShaderNodeMath');size.operation='MULTIPLY';links.new(radius.outputs['Attribute'],size.inputs[0]);links.new(fac.outputs[0],size.inputs[1])
    inst=nodes.new('GeometryNodeInstanceOnPoints');links.new(ip.outputs['Geometry'],inst.inputs['Points']);links.new(material.outputs['Geometry'],inst.inputs['Instance']);links.new(size.outputs[0],inst.inputs['Scale'])
    links.new(inst.outputs['Instances'],out.inputs['Geometry'])
    obj.modifiers.new('Audience instances','NODES').node_group=tree
    # Expose the same pulse to the frame-deduplication pass as an animated object property.
    for f,v in [(1,0),(46,0),(49,1),(52,0)]:
        obj['crowd_pulse']=v;obj.keyframe_insert(data_path='["crowd_pulse"]',frame=f)
    scene.timeline_markers.new('hit2b',frame=46)
    ortho=1920/(700/1024*UNIT)
    cam=camkeys([(1,(0,0,15),(0,0,0))],ortho=ortho)
    cam.animation_data_clear();cam.rotation_euler=(0,0,0)
    if shot=='Rise':
        scene.timeline_markers.new('Orthographic match',frame=1).camera=cam
        bpy.ops.object.camera_add();rise=bpy.context.object;rise.name='Perspective · climb and roll 45°'
        rise.data.lens=180;rise.data.clip_end=500;distance=ortho*rise.data.lens/36
        for f,t in [(2,0),(24,.17),(52,.57),(90,1)]:
            tilt=math.radians(12)*t;spin=math.pi/4*t;dist=distance*(1+1.5*t)
            key(rise,'location',f,(dist*math.sin(tilt)*math.sin(spin),-dist*math.sin(tilt)*math.cos(spin),dist*math.cos(tilt)))
            key(rise,'rotation_euler',f,(tilt,0,spin))
        scene.timeline_markers.new('Perspective ascent',frame=2).camera=rise
    scene['model_revision']='BL11-section5-O02';scene['audience_count']=len(seeds)
