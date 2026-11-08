"""BL-10 reference geometry. Untextured approval model; face points along +Z."""
import bpy, math
from mathutils import Vector

def build(parent):
    made=[]
    def register(o,name):
        o.name=name;o.parent=parent;o['layer']='medal';o['reference_draft']=True
        o.data.materials.clear();made.append(o);return o
    def mesh(name,verts,faces):
        data=bpy.data.meshes.new(name);data.from_pydata(verts,[],faces);data.update()
        o=bpy.data.objects.new(name,data);bpy.context.scene.collection.objects.link(o)
        return register(o,name)
    def cylinder(name,r,depth,z):
        bpy.ops.mesh.primitive_cylinder_add(vertices=96,radius=r,depth=depth,location=(0,0,z))
        o=register(bpy.context.object,name)
        bevel=o.modifiers.new('Rounded minted edge','BEVEL');bevel.width=.0018;bevel.segments=3
        o.modifiers.new('Weighted corner normals','WEIGHTED_NORMAL');return o
    def curve(name,points,radius):
        data=bpy.data.curves.new(name,'CURVE');data.dimensions='3D';data.bevel_depth=radius;data.bevel_resolution=3
        s=data.splines.new('POLY');s.points.add(len(points)-1)
        for p,v in zip(s.points,points):p.co=(*v,1)
        o=bpy.data.objects.new(name,data);bpy.context.scene.collection.objects.link(o);return register(o,name)
    cylinder('Reference medal disc',.15,.018,.015)
    cylinder('Inset medal face',.142,.005,.025)
    for r,z,t in [(.147,.027,.0025),(.137,.029,.0012)]:
        curve('Raised concentric border',[(r*math.cos(i*math.tau/128),r*math.sin(i*math.tau/128),z) for i in range(129)],t)
    # Ten alternating triangular facets, with a genuine raised central apex.
    outline=[((.107 if i%2==0 else .047)*math.cos(math.pi/2+i*math.pi/5),
              .014+(.107 if i%2==0 else .047)*math.sin(math.pi/2+i*math.pi/5),.030 if i%2 else .033) for i in range(10)]
    verts=[(0,.014,.050)]+outline+[(x,y,.028) for x,y,z in outline]
    faces=[(0,1+i,1+(i+1)%10) for i in range(10)]
    faces += [(1+i,11+i,11+(i+1)%10,1+(i+1)%10) for i in range(10)]+[tuple(range(20,10,-1))]
    mesh('Faceted raised five-point star',verts,faces)
    # Two curved laurel sprigs, with individually modeled pointed, folded leaves.
    for side in [-1,1]:
        def stem(a):return Vector((side*.118*math.sin(a),-.118*math.cos(a),.031))
        curve('Laurel curved stem', [tuple(stem(.08+i*1.95/48)) for i in range(49)],.0014)
        for j in range(9):
            a=.19+j*.205;origin=stem(a)
            tangent=Vector((side*math.cos(a),math.sin(a),0))
            radial=Vector((side*math.sin(a),-math.cos(a),0))
            for edge in [-1,1]:
                direction=(tangent+radial*edge*.65).normalized();normal=Vector((-direction.y,direction.x,0))
                length=.029+(1-j/9)*.006;width=.0065
                v=[]
                for k in range(7):
                    t=k/6;mid=origin+direction*(length*t);spread=width*math.sin(math.pi*t)**.8
                    v.extend([tuple(mid-normal*spread),tuple(mid+Vector((0,0,.0045*math.sin(math.pi*t)))),tuple(mid+normal*spread)])
                f=[]
                for k in range(6):
                    n=k*3;f.extend([(n,n+3,n+4,n+1),(n+1,n+4,n+5,n+2)])
                o=mesh('Laurel pointed leaf',v,f)
                solid=o.modifiers.new('Leaf relief thickness','SOLIDIFY');solid.thickness=.0008
    # Latest reference: a compact flat buckle and a broad folded ribbon above it.
    def rounded_loop(width,height,radius,z):
        points=[]
        for cx,cy,start in [(width/2-radius,height/2-radius,0),(-width/2+radius,height/2-radius,90),(-width/2+radius,-height/2+radius,180),(width/2-radius,-height/2+radius,270)]:
            for j in range(9):
                a=math.radians(start+j*90/8)
                points.append((cx+radius*math.cos(a),.163+cy+radius*math.sin(a),z))
        return points
    outer=rounded_loop(.17,.05,.009,.029);inner=rounded_loop(.144,.027,.005,.029)
    n=len(outer);verts=outer+inner+[(x,y,.019) for x,y,z in outer+inner];faces=[]
    for i in range(n):
        j=(i+1)%n
        faces.extend([(i,j,n+j,n+i),(2*n+i,3*n+i,3*n+j,2*n+j),
                      (i,2*n+i,2*n+j,j),(n+i,n+j,3*n+j,3*n+i)])
    buckle=mesh('Flat rounded suspension buckle',verts,faces)
    bevel=buckle.modifiers.new('Buckle softened edges','BEVEL');bevel.width=.001;bevel.segments=2
    buckle.modifiers.new('Buckle weighted normals','WEIGHTED_NORMAL')
    # A continuous strip returns behind the bar, curls around it, then extends up.
    path=[(.225,.013),(.200,.013),(.180,.013),(.168,.014),(.160,.017),(.157,.022),(.160,.028),(.167,.034)]
    path += [(.175+i*.325/40,.034+.003*math.sin(i*math.pi/40)) for i in range(41)]
    verts=[];cols=17
    for k,(y,z) in enumerate(path):
        for i in range(cols):
            u=-1+2*i/(cols-1);x=.070*u
            fold=.0025*math.sin(u*math.pi*1.6+.4)*math.sin(math.pi*max(0,(y-.167)/.333))
            verts.append((x,y,z+fold))
    faces=[(k*cols+i,(k+1)*cols+i,(k+1)*cols+i+1,k*cols+i+1) for k in range(len(path)-1) for i in range(cols-1)]
    ribbon=mesh('Wide folded upper ribbon',verts,faces)
    for p in ribbon.data.polygons:p.use_smooth=True
    solid=ribbon.modifiers.new('Ribbon cloth thickness','SOLIDIFY');solid.thickness=.0012
    # Small rolled edges are geometry only; woven material remains deferred.
    for side in [-1,1]:
        curve('Ribbon rolled edge',[(side*.070,y,z+.0025*math.sin(side*math.pi*1.6+.4)*math.sin(math.pi*max(0,(y-.167)/.333))) for y,z in path[6:]],.0007)
    return made
