"""Original articulated Mechalord villains, locally modelled in Blender.

This is procedural/manual geometry authoring, not image-to-3D inference. Inputs
are art direction and, when supplied, concept-reference images. No hosted jobs.
Run with Blender --background --python-exit-code 1 --python this_file.
"""
import bpy, math, json, random, sys
from pathlib import Path
from mathutils import Vector, Matrix

ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'assets/source/villains-v3'
EXPORT=ROOT/'assets/exports'
PREVIEW=ROOT/'assets/previews/villains-v3'
MANIFEST=ROOT/'assets/manifests/villains-v3'
COLORS={'Red':(.145,.009,.004,1),'Charcoal':(.004,.007,.011,1),
        'Bronze':(.185,.084,.023,1),'Amber':(.95,.14,.002,1),'Bone':(.39,.35,.26,1)}
MATERIALS={};PARTS={};PIVOTS={};PARENTS={};NODES={}

def reset(slug):
    global MATERIALS,PARTS,PIVOTS,PARENTS,NODES
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.context.scene.unit_settings.system='METRIC'
    bpy.context.scene.render.fps=30
    MATERIALS={};PARTS={};PIVOTS={};PARENTS={};NODES={}
    rng=random.Random(1409)
    for name,color in COLORS.items():
        mat=bpy.data.materials.new(name);mat.use_nodes=True
        bsdf=mat.node_tree.nodes.get('Principled BSDF')
        bsdf.inputs['Roughness'].default_value=.48 if name=='Bronze' else .68
        bsdf.inputs['Metallic'].default_value=.72 if name=='Bronze' else .58 if name=='Charcoal' else .16
        if name=='Amber':
            bsdf.inputs['Base Color'].default_value=color
            bsdf.inputs['Emission Color'].default_value=color
            bsdf.inputs['Emission Strength'].default_value=2.0
        else:
            size=256;image=bpy.data.images.new(slug+' '+name+' painted surface',width=size,height=size,alpha=False)
            pixels=[]
            for y in range(size):
                for x in range(size):
                    noise=rng.uniform(.84,1.10)
                    # Small worn paint streaks are part of an actual exported
                    # image texture rather than an unsupported shader network.
                    streak=((x*53+y*11)%997<3 and y%13<9)
                    c=[min(1,max(0,v*noise+(.09 if streak else 0))) for v in color[:3]]
                    pixels.extend((*c,1))
            image.pixels.foreach_set(pixels)
            image.filepath_raw=str(SOURCE/(slug+'-'+name.lower()+'.png'));image.file_format='PNG';image.save();image.pack()
            tex=mat.node_tree.nodes.new('ShaderNodeTexImage');tex.image=image
            mat.node_tree.links.new(tex.outputs['Color'],bsdf.inputs['Base Color'])
        MATERIALS[name]=mat

def component(name,pivot,parent=None):
    PARTS[name]=[];PIVOTS[name]=Vector(pivot);PARENTS[name]=parent

def finish(obj,name,mat,group,smooth=False):
    obj.name=name
    bpy.context.view_layer.objects.active=obj
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    obj.data.materials.append(MATERIALS[mat])
    if not obj.data.uv_layers:
        obj.data.uv_layers.new(name='SurfaceUV')
        for p in obj.data.polygons:
            for li in p.loop_indices:
                co=obj.data.vertices[obj.data.loops[li].vertex_index].co
                obj.data.uv_layers[0].data[li].uv=(co.x*.7+.5,co.z*.7+.5)
    obj.data.uv_layers[0].name='SurfaceUV'
    if smooth:
        for p in obj.data.polygons:p.use_smooth=True
    PARTS[group].append(obj)
    return obj

def box(name,loc,size,mat,group,bevel=.025,segments=2):
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc)
    obj=bpy.context.object;obj.scale=size
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    if bevel:
        mod=obj.modifiers.new('Cast edge radius','BEVEL');mod.width=bevel;mod.segments=segments
        bpy.ops.object.modifier_apply(modifier=mod.name)
        normals=obj.modifiers.new('Weighted face normals','WEIGHTED_NORMAL');normals.keep_sharp=True
        bpy.ops.object.modifier_apply(modifier=normals.name)
    return finish(obj,name,mat,group)

def ellipsoid(name,loc,size,mat,group,segments=16,rings=8):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments,ring_count=rings,radius=1,location=loc)
    obj=bpy.context.object;obj.scale=size
    return finish(obj,name,mat,group,True)

def dome(name,loc,size,mat,group,sides=20,rings=5):
    x,y,z=loc;rx,ry,rz=size;verts=[]
    for inner in [False,True]:
        for row in range(rings+1):
            theta=.025+(math.pi/2-.025)*row/rings
            for j in range(sides):
                a=j*math.tau/sides;t=.018 if inner else 0
                verts.append((x+(rx-t)*math.sin(theta)*math.cos(a),y+(ry-t)*math.sin(theta)*math.sin(a),z+(rz-t)*math.cos(theta)))
    faces=[];n=(rings+1)*sides
    for offset in [0,n]:
        for row in range(rings):
            for j in range(sides):
                face=(offset+row*sides+j,offset+row*sides+(j+1)%sides,offset+(row+1)*sides+(j+1)%sides,offset+(row+1)*sides+j)
                faces.append(tuple(reversed(face)) if offset else face)
    for row in [0,rings]:
        for j in range(sides):faces.append((row*sides+j,row*sides+(j+1)%sides,n+row*sides+(j+1)%sides,n+row*sides+j))
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update()
    obj=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(obj)
    return finish(obj,name,mat,group,True)

def cylinder(name,loc,radius,length,mat,group,axis='Z',sides=14):
    bpy.ops.mesh.primitive_cylinder_add(vertices=sides,radius=radius,depth=length,location=loc)
    obj=bpy.context.object
    if axis=='Y':obj.rotation_euler.x=math.pi/2
    elif axis=='X':obj.rotation_euler.y=math.pi/2
    return finish(obj,name,mat,group,True)

def torus(name,loc,major,minor,mat,group,axis='Z',sides=16,rings=5):
    bpy.ops.mesh.primitive_torus_add(major_segments=sides,minor_segments=rings,major_radius=major,minor_radius=minor,location=loc)
    obj=bpy.context.object
    if axis=='Y':obj.rotation_euler.x=math.pi/2
    elif axis=='X':obj.rotation_euler.y=math.pi/2
    return finish(obj,name,mat,group,True)

def beam(name,start,end,radius,mat,group,sides=10):
    v=Vector(end)-Vector(start)
    obj=cylinder(name,(Vector(start)+Vector(end))/2,radius,v.length,mat,group,sides=sides)
    obj.rotation_euler=v.to_track_quat('Z','Y').to_euler()
    return obj

def shell(name,levels,mat,group,center=(0,0),sides=16):
    vertices=[]
    for z,rx,ry in levels:
        vertices.extend((center[0]+rx*math.cos(i*math.tau/sides),center[1]+ry*math.sin(i*math.tau/sides),z) for i in range(sides))
    faces=[tuple(reversed(range(sides)))]
    for k in range(len(levels)-1):
        for j in range(sides):faces.append((k*sides+j,k*sides+(j+1)%sides,(k+1)*sides+(j+1)%sides,(k+1)*sides+j))
    faces.append(tuple((len(levels)-1)*sides+j for j in range(sides)))
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(vertices,[],faces);mesh.update()
    obj=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(obj)
    return finish(obj,name,mat,group,True)

def plate(name,points,y,depth,mat,group,bevel=.012):
    n=len(points);verts=[(x,yy,z) for yy in [y-depth/2,y+depth/2] for x,z in points]
    faces=[tuple(reversed(range(n))),tuple(range(n,n*2))]
    faces.extend((i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n))
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update()
    obj=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(obj)
    bpy.context.view_layer.objects.active=obj;obj.select_set(True)
    if bevel:
        mod=obj.modifiers.new('Armour rolled edges','BEVEL');mod.width=bevel;mod.segments=2
        bpy.ops.object.modifier_apply(modifier=mod.name)
        norm=obj.modifiers.new('Cast plate normals','WEIGHTED_NORMAL');norm.keep_sharp=True
        bpy.ops.object.modifier_apply(modifier=norm.name)
    return finish(obj,name,mat,group)

def tube(name,loc,outer,inner,length,mat,group,sides=10):
    x,y,z=loc;verts=[]
    for yy,r in [(y-length/2,outer),(y+length/2,outer),(y+length/2,inner),(y-length/2,inner)]:
        verts.extend((x+r*math.cos(a*math.tau/sides),yy,z+r*math.sin(a*math.tau/sides)) for a in range(sides))
    faces=[]
    for k in range(4):
        nk=(k+1)%4
        for i in range(sides):faces.append((k*sides+i,k*sides+(i+1)%sides,nk*sides+(i+1)%sides,nk*sides+i))
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update()
    obj=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(obj)
    return finish(obj,name,mat,group,True)

def horn(name,points,radii,mat,group,sides=8):
    vertices=[]
    for i,p in enumerate(points):
        tangent=Vector(points[min(i+1,len(points)-1)])-Vector(points[max(i-1,0)])
        if tangent.length<.0001:tangent=Vector((0,0,1))
        rotation=tangent.to_track_quat('Z','Y').to_matrix()
        for j in range(sides):vertices.append(Vector(p)+rotation@Vector((math.cos(j*math.tau/sides)*radii[i],math.sin(j*math.tau/sides)*radii[i],0)))
    faces=[tuple(reversed(range(sides)))]
    for i in range(len(points)-1):
        for j in range(sides):faces.append((i*sides+j,i*sides+(j+1)%sides,(i+1)*sides+(j+1)%sides,(i+1)*sides+j))
    faces.append(tuple((len(points)-1)*sides+j for j in range(sides)))
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(vertices,[],faces);mesh.update()
    obj=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(obj)
    return finish(obj,name,mat,group,True)

def rivets(center,radius,count,group,bolt=.024,axis='Y'):
    x,y,z=center
    for i in range(count):
        a=i*math.tau/count
        if axis=='Y':loc=(x+radius*math.cos(a),y,z+radius*math.sin(a))
        else:loc=(x+radius*math.cos(a),y+radius*math.sin(a),z)
        cylinder('Bronze armour rivet',loc,bolt,bolt*.75,'Bronze',group,axis,8)

def skull(center,scale,group='Head',horns=True,knight=False,faceMat='Bone'):
    x,y,z=center;s=scale
    ellipsoid('Armoured skull cranial dome',(x,y,z+.055*s),(.185*s,.15*s,.205*s),'Red',group,20,9)
    outline=[(x-.16*s,z+.09*s),(x-.14*s,z+.20*s),(x+.14*s,z+.20*s),(x+.16*s,z+.09*s),(x+.135*s,z-.025*s),(x+.105*s,z-.14*s),(x,z-.20*s),(x-.105*s,z-.14*s),(x-.135*s,z-.025*s)]
    plate('Skull bronze mask border',outline,y+.151*s,.045*s,'Bronze',group,.014*s)
    plate('Skull pale cast face',[(x+(xx-x)*.89,z+(zz-z)*.93) for xx,zz in outline],y+.176*s,.036*s,faceMat,group,.012*s)
    for sign in [-1,1]:
        eye=ellipsoid('Deep recessed skull eye',(x+sign*.083*s,y+.205*s,z+.043*s),(.070*s,.024*s,.047*s),'Charcoal',group,12,6)
        eye.rotation_euler.y=sign*.25
        glow=ellipsoid('Amber slit eye',(x+sign*.085*s,y+.231*s,z+.036*s),(.049*s,.011*s,.017*s),'Amber',group,12,5)
        glow.rotation_euler.y=sign*.27
        brow=box('Menacing skull brow',(x+sign*.087*s,y+.23*s,z+.09*s),(.141*s,.026*s,.028*s),faceMat,group,.01*s,1)
        brow.rotation_euler.y=sign*.21
    plate('Skull triangular nose cavity',[(x-.032*s,z+.015*s),(x+.032*s,z+.015*s),(x+.013*s,z-.062*s),(x-.013*s,z-.062*s)],y+.237*s,.012*s,'Charcoal',group,0)
    box('Skull mouth recess',(x,y+.209*s,z-.102*s),(.16*s,.028*s,.064*s),'Charcoal',group,.015*s,1)
    for i in range(6):
        box('Knight skull breathing grille' if knight else 'Individual skull tooth',(x+(i-2.5)*.027*s,y+.23*s,z-.106*s),(.010*s,.023*s,.091*s) if knight else (.020*s,.023*s,.042*s),'Charcoal' if knight else faceMat,group,.003*s,1)
    if knight:
        plate('Raised knight nasal ridge',[(x-.021*s,z+.17*s),(x+.021*s,z+.17*s),(x+.017*s,z-.15*s),(x,z-.19*s),(x-.017*s,z-.15*s)],y+.257*s,.020*s,faceMat,group,.003*s)
        plate('Knight helmet crest',[(x-.025*s,z+.16*s),(x+.025*s,z+.16*s),(x+.030*s,z+.27*s),(x,z+.38*s),(x-.03*s,z+.27*s)],y-.01*s,.13*s,faceMat,group,.006*s)
    plate('Skull lower armoured jaw',[(x-.10*s,z-.14*s),(x+.10*s,z-.14*s),(x+.075*s,z-.21*s),(x-.075*s,z-.21*s)],y+.172*s,.052*s,'Charcoal',group,.012*s)
    if horns:
        for sign in [-1,1]:
            horn('Swept horn bronze base',[(x+sign*.14*s,y-.025*s,z+.17*s),(x+sign*.24*s,y-.055*s,z+.27*s),(x+sign*.285*s,y-.11*s,z+.33*s),(x+sign*.28*s,y-.13*s,z+.40*s)], [.067*s,.051*s,.026*s,.004*s],'Bronze',group)
            horn('Horn red inset',[(x+sign*.15*s,y+.012*s,z+.20*s),(x+sign*.225*s,y-.026*s,z+.27*s),(x+sign*.26*s,y-.065*s,z+.31*s)], [.041*s,.029*s,.006*s],'Red',group)

def furnace(center,radius,group,ratio=1.45):
    x,y,z=center
    housing=cylinder('Chest furnace dark housing',(x,y,z),radius*1.21,radius*.35,'Charcoal',group,'Y',20);housing.scale.y=ratio
    bezel=torus('Chest furnace bronze bezel',(x,y+radius*.22,z),radius,.038*radius/.16,'Bronze',group,'Y',24,5);bezel.scale.y=ratio
    ellipsoid('Visible incandescent furnace heart',(x,y+radius*.15,z),(radius*.77,radius*.22,radius*.77*ratio),'Amber',group,20,8)
    for i in [-1,0,1]:
        beam('Furnace bronze cage grate',(x+i*radius*.35,y+radius*.45,z-radius*.70*ratio),(x+i*radius*.35,y+radius*.45,z+radius*.70*ratio),radius*.045,'Bronze',group,8)

def rotary(center,radius,length,group,barrels=6):
    x,y,z=center
    cylinder('Rotary cannon rear receiver',(x,y-length*.30,z),radius*1.5,length*.23,'Red',group,'Y',16)
    torus('Rotary cannon heavy collar',(x,y-length*.16,z),radius*1.39,radius*.16,'Bronze',group,'Y',18,5)
    for i in range(barrels):
        a=i*math.tau/barrels;xx=x+math.cos(a)*radius*.76;zz=z+math.sin(a)*radius*.76
        tube('Hollow rotary barrel '+str(i),(xx,y+length*.18,zz),radius*.30,radius*.20,length*.76,'Charcoal',group,10)
        tube('Bronze barrel muzzle '+str(i),(xx,y+length*.56,zz),radius*.35,radius*.22,length*.075,'Bronze',group,10)
        cylinder('Dark bore backplate '+str(i),(xx,y-length*.195,zz),radius*.19,.012,'Charcoal',group,'Y',10)
    torus('Barrel cluster forward brace',(x,y+length*.36,z),radius*1.20,radius*.115,'Bronze',group,'Y',18,5)
    cylinder('Central cannon axle',(x,y+length*.2,z),radius*.22,length*.68,'Bronze',group,'Y',12)
    rivets((x,y-length*.42,z),radius*1.23,8,group,radius*.095)

def reaver():
    reset('cinder-reaver-v3')
    component('Root',(0,0,0));component('Torso',(0,0,.99),'Root');component('Head',(0,0,1.58),'Torso')
    component('Arm_L',(-.40,0,1.43),'Torso');component('Arm_R',(.40,0,1.43),'Torso')
    component('Barrel_L',(-.69,.22,1.03),'Arm_L');component('Barrel_R',(.71,.37,1.04),'Arm_R')
    component('Pod_L',(-.25,-.12,1.4),'Torso');component('Pod_R',(.25,-.12,1.4),'Torso')
    shell('Exposed torsion waist',[(.83,.21,.15),(.94,.25,.16),(1.07,.24,.16)],'Charcoal','Torso')
    shell('Domed red breastplate',[(1.02,.22,.16),(1.13,.31,.21),(1.34,.34,.22),(1.48,.27,.20),(1.51,.19,.14)],'Red','Torso')
    torus('Bronze waist armour rim',(0,0,1.02),.23,.025,'Bronze','Torso',sides=18)
    for sign in [-1,1]:
        plate('Chest diagonal forged trim',[(sign*.10,1.50),(sign*.28,1.43),(sign*.31,1.20),(sign*.24,1.16),(sign*.18,1.31)],.206,.018,'Bronze','Torso',.009)
        for i in range(3):box('Angled rib vent',(sign*.225,.235,1.20-i*.06),(.078,.035,.018),'Charcoal','Torso',.004,1)
        beam('Torso braided supply hose',(sign*.21,-.16,1.32),(sign*.25,-.16,.92),.026,'Charcoal','Torso',12)
        torus('Hose brass coupler',(sign*.24,-.16,.95),.029,.008,'Bronze','Torso',sides=12,rings=4)
    furnace((0,.23,1.29),.125,'Torso')
    cylinder('Neck articulation',(0,0,1.56),.095,.12,'Charcoal','Head',sides=16)
    torus('Neck bronze collar',(0,0,1.54),.12,.019,'Bronze','Torso',sides=16)
    skull((0,0,1.74),1,'Head',False,True)
    for sign,side in [(-1,'L'),(1,'R')]:
        arm='Arm_'+side;x=sign*.43
        dome('Open cast shoulder shell '+side,(x,0,1.43),(.29,.235,.37),'Red',arm,20,5)
        rim=torus('Shoulder rolled bronze lip '+side,(x,0,1.435),.29,.024,'Bronze',arm,sides=20);rim.scale.y=.81
        plate('Raised shoulder armour facet '+side,[(x-.10,1.60),(x-.07,1.72),(x+.07,1.72),(x+.10,1.60),(x+.065,1.54),(x-.065,1.54)],.17,.033,'Red',arm,.012)
        for i in range(7):
            angle=(i/6)*math.pi
            cylinder('Shoulder bronze rim fastener '+side,(x+math.cos(angle)*.267,math.sin(angle)*.223,1.447),.017,.022,'Bronze',arm,sides=8)
        cylinder('Exposed shoulder bearing '+side,(x,.196,1.40),.088,.045,'Bronze',arm,'Y',16)
        cylinder('Dark shoulder axle '+side,(x,.224,1.40),.052,.018,'Charcoal',arm,'Y',12)
        shell('Upper arm ceramic plating '+side,[(1.14,.087,.08),(1.26,.12,.11),(1.40,.105,.09)],'Red',arm,(sign*.54,0),12)
        cylinder('Elbow rotary knuckle '+side,(sign*.60,0,1.13),.092,.22,'Charcoal',arm,'X',14)
        cylinder('Bronze elbow hinge '+side,(sign*.72,0,1.13),.063,.024,'Bronze',arm,'X',12)
        shell('Forearm layered armour '+side,[(.87,.10,.09),(1.02,.14,.12),(1.14,.105,.095)],'Red',arm,(sign*.65,0),12)
        beam('Arm piston chrome rod '+side,(sign*.59,-.10,1.30),(sign*.69,-.13,.94),.018,'Bronze',arm,10)
        cylinder('Forearm wrist locking cuff '+side,(sign*.67,0,.86),.10,.055,'Bronze',arm,sides=14)
        box('Mechanical clenched fist '+side,(sign*.67,.025,.80),(.15,.14,.14),'Charcoal',arm,.025,2)
        for i in range(3):box('Fist articulated knuckle '+side,(sign*.67+(i-1)*.045,.11,.80),(.040,.040,.080),'Bronze',arm,.01,1)
        component('Leg_'+side,(sign*.215,0,.93),'Root');component('Knee_'+side,(sign*.24,0,.49),'Leg_'+side);component('Foot_'+side,(sign*.24,0,.16),'Knee_'+side)
        shell('Hip cast thigh '+side,[(.56,.105,.12),(.71,.15,.145),(.88,.16,.15),(.96,.105,.105)],'Red','Leg_'+side,(sign*.225,0),16)
        plate('Thigh bronze fluting '+side,[(sign*.225-.07,.84),(sign*.225+.07,.84),(sign*.225+.06,.63),(sign*.225-.06,.60)],.155,.026,'Bronze','Leg_'+side,.015)
        cylinder('Knee hinge spindle '+side,(sign*.24,0,.49),.12,.26,'Charcoal','Knee_'+side,'X',16)
        ellipsoid('Red convex kneecap '+side,(sign*.24,.115,.49),(.118,.070,.11),'Red','Knee_'+side,16,7)
        cylinder('Knee gold bolt '+side,(sign*.39,0,.49),.054,.026,'Bronze','Knee_'+side,'X',12)
        shell('Flared cast shin '+side,[(.14,.14,.12),(.26,.145,.12),(.40,.12,.105),(.47,.11,.10)],'Red','Knee_'+side,(sign*.24,0),16)
        for yy in [-.08,.08]:beam('Shin exposed tendon '+side,(sign*.35,yy,.20),(sign*.35,yy,.43),.017,'Bronze','Knee_'+side,8)
        shell('Broad mechanical boot '+side,[(.02,.17,.25),(.065,.18,.25),(.13,.17,.22),(.20,.12,.14)],'Charcoal','Foot_'+side,(sign*.24,.085),16)
        shell('Boot red toe armour '+side,[(.075,.165,.20),(.13,.15,.20),(.175,.12,.15)],'Red','Foot_'+side,(sign*.24,.12),16)
        for i in range(3):box('Boot bronze toe strake '+side,(sign*.24+(i-1)*.074,.286,.105),(.045,.030,.048),'Bronze','Foot_'+side,.009,1)
    # Left shield is deliberately asymmetrical to the right rotary cannon.
    points=[(-1.01,1.29),(-.92,1.49),(-.60,1.49),(-.50,1.34),(-.53,.68),(-.93,.61),(-1.02,.77)]
    plate('Large curved shield bronze perimeter',points,.255,.10,'Bronze','Barrel_L',.027)
    plate('Layered shield dark face',[(-.96,1.28),(-.89,1.43),(-.63,1.43),(-.56,1.31),(-.58,.73),(-.90,.67),(-.96,.79)],.32,.055,'Charcoal','Barrel_L',.021)
    ellipsoid('Convex shield red central boss',(-.755,.35,1.09),(.17,.060,.31),'Red','Barrel_L',16,7)
    box('Shield furnace slit socket',(-.75,.414,1.06),(.082,.021,.49),'Charcoal','Barrel_L',.011,1)
    box('Shield long amber slit',(-.75,.428,1.06),(.035,.012,.43),'Amber','Barrel_L',.006,1)
    for x,z in [(-.89,1.24),(-.84,.97),(-.69,.81),(-.58,1.27)]:cylinder('Shield perimeter rivet',(x,.328,z),.021,.018,'Bronze','Barrel_L','Y',8)
    rotary((.71,.37,1.04),.145,.60,'Barrel_R')
    for sign,side in [(-1,'L'),(1,'R')]:
        cylinder('Rear exhaust muffler '+side,(sign*.25,-.20,1.37),.072,.35,'Charcoal','Pod_'+side,sides=12)
        torus('Exhaust bronze cap '+side,(sign*.25,-.20,1.55),.06,.012,'Bronze','Pod_'+side,sides=12,rings=4)

def tyrant():
    reset('forge-tyrant-v3')
    component('Root',(0,0,0));component('Torso',(0,0,2.28),'Root');component('Head',(0,0,3.43),'Torso')
    for sign,side in [(-1,'L'),(1,'R')]:
        component('Arm_'+side,(sign*.92,0,3.12),'Torso');component('Barrel_'+side,(sign*1.18,.76,2.59),'Arm_'+side)
        component('Pod_'+side,(sign*.99,-.10,3.40),'Torso')
        component('Leg_'+side,(sign*.51,0,1.94),'Root');component('Knee_'+side,(sign*.54,.07,1.09),'Leg_'+side);component('Foot_'+side,(sign*.55,.06,.32),'Knee_'+side)
    shell('Massive armoured abdomen',[(1.89,.46,.34),(2.19,.69,.46),(2.43,.75,.53)],'Charcoal','Torso',sides=20)
    shell('Domed red forge breastplate',[(2.28,.66,.44),(2.63,.87,.55),(3.05,.88,.56),(3.36,.68,.48),(3.46,.41,.31)],'Red','Torso',sides=24)
    torus('Forge heavy bronze belt',(0,0,2.23),.64,.057,'Bronze','Torso',sides=24,rings=6)
    furnace((0,.58,2.95),.31,'Torso')
    for sign in [-1,1]:
        plate('Broad chest cast bronze border',[(sign*.19,3.42),(sign*.66,3.25),(sign*.77,2.64),(sign*.61,2.43),(sign*.43,2.59),(sign*.48,3.12)],.51,.045,'Bronze','Torso',.019)
        plate('Chest red overplate',[(sign*.30,3.35),(sign*.60,3.21),(sign*.68,2.74),(sign*.56,2.60),(sign*.50,3.13)],.556,.065,'Red','Torso',.027)
        for i in range(4):box('Torso black radiator vent',(sign*.52,.598,2.78-i*.095),(.19,.037,.025),'Charcoal','Torso',.006,1)
        cylinder('Back furnace pressure tank',(sign*.44,-.49,2.94),.16,.83,'Charcoal','Torso',sides=16)
        for z in [2.61,3.27]:torus('Pressure tank bronze clamp',(sign*.44,-.49,z),.17,.029,'Bronze','Torso',sides=16)
        beam('Tank exposed bronze feed line',(sign*.41,-.57,2.48),(sign*.60,-.31,2.20),.042,'Bronze','Torso',12)
    cylinder('Tyrant articulated neck',(0,0,3.50),.19,.20,'Charcoal','Head',sides=20)
    torus('Tyrant neck protection collar',(0,0,3.48),.24,.038,'Bronze','Torso',sides=20)
    skull((0,.025,3.74),1.58,'Head',False,True,'Bronze')
    for sign in [-1,1]:
        horn('Tyrant crown side spire',[(sign*.18,-.035,3.97),(sign*.28,-.07,4.12),(sign*.26,-.085,4.28)],[.052,.038,.004],'Bronze','Head',8)
    for sign,side in [(-1,'L'),(1,'R')]:
        arm='Arm_'+side;x=sign*.97
        dome('Huge open cast pauldrons '+side,(x,0,3.14),(.54,.44,.59),'Red',arm,24,6)
        rim=torus('Rolled shoulder bronze skirt '+side,(x,0,3.14),.54,.037,'Bronze',arm,sides=24,rings=6);rim.scale.y=.81
        cylinder('Shoulder visible gear bearing '+side,(x,.398,3.08),.16,.072,'Charcoal',arm,'Y',20)
        torus('Shoulder bearing bronze ring '+side,(x,.443,3.08),.123,.025,'Bronze',arm,'Y',20)
        rivets((x,.449,3.08),.16,6,arm,.022)
        horn('Shoulder curved siege spike '+side,[(sign*1.16,-.09,3.34),(sign*1.36,-.15,3.49),(sign*1.50,-.24,3.64)], [.09,.058,.005],'Bronze',arm,10)
        shell('Massive upper arm '+side,[(2.54,.20,.19),(2.81,.26,.23),(3.12,.23,.22)],'Red',arm,(sign*1.16,0),18)
        cylinder('Upper arm exposed joint '+side,(sign*1.17,.14,2.56),.20,.51,'Charcoal',arm,'X',18)
        cylinder('Upper arm bronze hinge cap '+side,(sign*1.45,.14,2.56),.126,.038,'Bronze',arm,'X',16)
        ellipsoid('Cannon supporting forearm cast '+side,(sign*1.19,.35,2.63),(.28,.32,.23),'Red',arm,20,9)
        beam('Siege arm hydraulic piston '+side,(sign*1.31,-.1,3.00),(sign*1.36,.38,2.55),.049,'Charcoal',arm,12)
        beam('Siege arm piston bright shaft '+side,(sign*1.36,.38,2.55),(sign*1.38,.51,2.48),.031,'Bronze',arm,12)
        rotary((sign*1.18,.76,2.59),.277,1.10,'Barrel_'+side,6)
        # Independent rocket pod, with hollow sockets and inset warheads.
        pod='Pod_'+side
        podx=sign*.98;podz=3.74
        box('Rocket pod curved armour housing '+side,(podx,-.025,podz),(.66,.62,.56),'Red',pod,.11,3)
        box('Rocket pod charcoal faceplate '+side,(podx,.299,podz),(.56,.045,.45),'Charcoal',pod,.055,2)
        for col in range(3):
            for row in range(2):
                xx=podx+(col-1)*.176;zz=podz+(row-.5)*.185
                tube('Rocket launch socket '+side,(xx,.355,zz),.072,.051,.13,'Bronze',pod,10)
                ellipsoid('Amber rocket nose '+side,(xx,.305,zz),(.043,.078,.043),'Amber',pod,10,5)
        beam('Rocket pod swivel support '+side,(podx,-.01,3.38),(podx,-.02,3.55),.09,'Charcoal',pod,14)
        thigh='Leg_'+side;knee='Knee_'+side;foot='Foot_'+side;xx=sign*.53
        cylinder('Hip heavy rotating spindle '+side,(xx,0,1.93),.23,.44,'Bronze',thigh,'X',18)
        shell('Domed heavy thigh '+side,[(1.18,.21,.25),(1.46,.30,.29),(1.82,.33,.29),(2.02,.23,.23)],'Red',thigh,(xx,0),20)
        plate('Thigh forged shield rim '+side,[(xx-.23,1.77),(xx+.23,1.77),(xx+.23,1.45),(xx+.13,1.23),(xx-.16,1.24)],.307,.075,'Bronze',thigh,.034)
        plate('Thigh convex overplate '+side,[(xx-.19,1.72),(xx+.19,1.72),(xx+.18,1.46),(xx+.10,1.31),(xx-.12,1.32)],.36,.062,'Red',thigh,.035)
        cylinder('Knee articulated axle '+side,(xx,.07,1.08),.23,.55,'Charcoal',knee,'X',20)
        cylinder('Knee bronze outer cap '+side,(xx+sign*.30,.07,1.08),.146,.045,'Bronze',knee,'X',16)
        ellipsoid('Domed knee cast shield '+side,(xx,.255,1.10),(.24,.12,.23),'Red',knee,20,8)
        shell('Heavy layered shin '+side,[(.33,.28,.25),(.56,.29,.25),(.91,.24,.21),(1.04,.22,.20)],'Red',knee,(xx,.07),20)
        for i in [-1,1]:
            beam('Shin hydraulic sleeve '+side,(xx+i*.26,-.045,.47),(xx+i*.25,-.07,.83),.042,'Charcoal',knee,12)
            beam('Shin exposed hydraulic rod '+side,(xx+i*.25,-.07,.83),(xx+i*.23,-.07,1.0),.027,'Bronze',knee,10)
        shell('Siege boot cast foundation '+side,[(.025,.35,.46),(.12,.38,.48),(.28,.36,.41),(.40,.25,.29)],'Charcoal',foot,(xx,.17),20)
        shell('Siege red curved toe '+side,[(.13,.34,.36),(.23,.32,.37),(.35,.24,.28)],'Red',foot,(xx,.245),20)
        torus('Ankle locking bronze cuff '+side,(xx,.06,.40),.235,.034,'Bronze',foot,sides=20)
        for i in range(4):box('Siege boot bronze claw '+side,(xx+(i-1.5)*.13,.573,.168),(.085,.080,.16),'Bronze',foot,.022,2)

def assemble(height):
    bounds=[obj.matrix_world@Vector(co) for parts in PARTS.values() for obj in parts for co in obj.bound_box]
    bottom=min(p.z for p in bounds);top=max(p.z for p in bounds);scale=height/(top-bottom)
    # Normalize all geometry and pivots together before making the hierarchy.
    for parts in PARTS.values():
        for obj in parts:
            matrix=Matrix.Diagonal(Vector((scale,scale,scale,1)))@obj.matrix_world
            matrix.translation.z-=bottom*scale
            obj.matrix_world=matrix
            bpy.context.view_layer.objects.active=obj;obj.select_set(True)
            bpy.ops.object.transform_apply(location=False,rotation=True,scale=True)
            obj.select_set(False)
    normalized_pivots={name:Vector((pivot.x*scale,pivot.y*scale,(pivot.z-bottom)*scale)) for name,pivot in PIVOTS.items()}
    normalized_pivots['Root']=Vector((0,0,0))
    for name,pivot in normalized_pivots.items():
        node=bpy.data.objects.new(name,None);bpy.context.collection.objects.link(node)
        node.location=pivot
        node.empty_display_type='SPHERE';node.empty_display_size=.08*scale;NODES[name]=node
    bpy.context.view_layer.update()
    for name,parts in PARTS.items():
        node=NODES[name];parent=PARENTS[name]
        if parent:
            node.parent=NODES[parent];node.location=normalized_pivots[name]-normalized_pivots[parent]
            bpy.context.view_layer.update()
        if not parts:continue
        bpy.ops.object.select_all(action='DESELECT')
        for obj in parts:obj.select_set(True)
        bpy.context.view_layer.objects.active=parts[0];bpy.ops.object.join()
        obj=bpy.context.object;obj.name=name+'_Mesh'
        obj.data.validate(clean_customdata=False)
        matrix=obj.matrix_world.copy();obj.parent=node;obj.matrix_parent_inverse=Matrix.Identity(4);obj.matrix_world=matrix
        bpy.context.view_layer.update()
    return scale

def animate(slug=''):
    for clip,start in [('Idle',1),('Attack',61)]:
        for name in ['Torso','Head','Arm_L','Arm_R','Barrel_L','Barrel_R','Pod_L','Pod_R']:
            node=NODES[name];origin=node.location.copy();node.animation_data_create()
            action=bpy.data.actions.new(clip+'_'+name);node.animation_data.action=action
            for frame in range(1,61,5):
                t=(frame-1)/59;wave=math.sin(t*math.tau)
                node.location=origin;node.rotation_euler=(0,0,0)
                if name=='Torso':node.rotation_euler.x=wave*.014 if clip=='Idle' else wave*.035
                if name=='Head':node.rotation_euler.z=wave*.045
                if name.startswith('Arm_'):node.rotation_euler.x=wave*.021 if clip=='Idle' else -abs(wave)*.085
                if name.startswith('Barrel_') and clip=='Attack' and not ('reaver' in slug and name=='Barrel_L'):node.rotation_euler.y=t*math.tau*2
                if name.startswith('Pod_') and clip=='Attack':node.rotation_euler.x=-abs(wave)*.055
                node.keyframe_insert(data_path='rotation_euler',frame=frame)
            node.location=origin;node.rotation_euler=(0,0,0)
            node.keyframe_insert(data_path='rotation_euler',frame=60)
            node.animation_data.action=None
            track=node.animation_data.nla_tracks.new();track.name=clip
            strip=track.strips.new(clip,start,action);strip.action_frame_start=1;strip.action_frame_end=60
            strip.blend_type='REPLACE';strip.extrapolation='NOTHING'
    bpy.context.scene.frame_start=1;bpy.context.scene.frame_end=120;bpy.context.scene.frame_set(1)

def shared_atlas(slug):
    """Pack the original five surface styles into one material without baking.

    Paint images, roughness/metal parameters and emission have matching atlas
    regions. Each articulated node then has one primitive / one draw call.
    """
    names=list(COLORS);source_pixels={}
    for name,mat in MATERIALS.items():
        mat.use_fake_user=True
        image=next((n.image for n in mat.node_tree.nodes if n.type=='TEX_IMAGE'),None)
        if image:source_pixels[name]=list(image.pixels)
    width,height=768,512;channels={'base':[],'orm':[],'emission':[]}
    for y in range(height):
        for x in range(width):
            index=(y//256)*3+x//256
            name=names[index] if index<len(names) else 'Charcoal'
            if name in source_pixels:
                offset=((y%256)*256+x%256)*4;rgba=source_pixels[name][offset:offset+4]
            else:rgba=list(COLORS[name])
            channels['base'].extend(rgba)
            shader=MATERIALS[name].node_tree.nodes.get('Principled BSDF')
            channels['orm'].extend((1,shader.inputs['Roughness'].default_value,shader.inputs['Metallic'].default_value,1))
            channels['emission'].extend(COLORS['Amber'] if name=='Amber' else (0,0,0,1))
    images={}
    for kind,pixels in channels.items():
        image=bpy.data.images.new(slug+' atlas '+kind,width=width,height=height,alpha=False)
        if kind=='orm':image.colorspace_settings.name='Non-Color'
        image.pixels.foreach_set(pixels);image.filepath_raw=str(SOURCE/(slug+'-atlas-'+kind+'.png'))
        image.file_format='PNG';image.save();image.pack();images[kind]=image
    mat=bpy.data.materials.new(slug+' Shared Painted Atlas');mat.use_nodes=True
    nodes=mat.node_tree.nodes;links=mat.node_tree.links;shader=nodes.get('Principled BSDF')
    for kind,input_name in [('base','Base Color'),('emission','Emission Color')]:
        tex=nodes.new('ShaderNodeTexImage');tex.image=images[kind];links.new(tex.outputs['Color'],shader.inputs[input_name])
    shader.inputs['Emission Strength'].default_value=2
    orm=nodes.new('ShaderNodeTexImage');orm.image=images['orm'];split=nodes.new('ShaderNodeSeparateColor')
    links.new(orm.outputs['Color'],split.inputs['Color']);links.new(split.outputs['Green'],shader.inputs['Roughness']);links.new(split.outputs['Blue'],shader.inputs['Metallic'])
    for obj in [o for o in bpy.context.scene.objects if o.type=='MESH']:
        uv=obj.data.uv_layers[0]
        for poly in obj.data.polygons:
            slot_name=obj.data.materials[poly.material_index].name
            index=names.index(slot_name)
            for li in poly.loop_indices:
                u,v=uv.data[li].uv
                uv.data[li].uv=((index%3+(u%1)*.98+.01)/3,(index//3+(v%1)*.98+.01)/2)
            poly.material_index=0
        obj.data.materials.clear();obj.data.materials.append(mat)

def studio(slug,height):
    scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=24;scene.cycles.use_denoising=True
    scene.render.resolution_x=900;scene.render.resolution_y=1100;scene.render.resolution_percentage=100
    world=bpy.data.worlds.new('Warm charcoal studio');world.use_nodes=True;scene.world=world
    world.node_tree.nodes['Background'].inputs[0].default_value=(.055,.065,.08,1)
    world.node_tree.nodes['Background'].inputs[1].default_value=.25
    for name,pos,energy,size in [('Key',(-height*1.5,height*2,height*2.3),500*height, height*1.4),('Fill',(height*1.8,height,height),180*height,height),('Rim',(0,-height*1.7,height*1.8),450*height,height)]:
        data=bpy.data.lights.new(name,'AREA');data.energy=energy;data.size=size
        obj=bpy.data.objects.new(name,data);scene.collection.objects.link(obj);obj.location=pos
        obj.rotation_euler=(Vector((0,0,height*.52))-obj.location).to_track_quat('-Z','Y').to_euler()
    bpy.ops.mesh.primitive_plane_add(size=height*200,location=(0,0,-.01))
    floor=bpy.context.object;floor.name='Studio floor'
    mat=bpy.data.materials.new('Studio matte');mat.use_nodes=True
    mat.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value=(.018,.023,.031,1)
    mat.node_tree.nodes['Principled BSDF'].inputs['Roughness'].default_value=.92;floor.data.materials.append(mat)
    data=bpy.data.cameras.new('Villain camera');camera=bpy.data.objects.new('Villain camera',data);scene.collection.objects.link(camera)
    camera.location=(height*1.65,height*2.75,height*1.6)
    camera.rotation_euler=(Vector((0,.03,height*.5))-camera.location).to_track_quat('-Z','Y').to_euler()
    data.type='ORTHO';data.ortho_scale=height*1.32;scene.camera=camera
    scene.view_settings.view_transform='AgX';scene.render.image_settings.file_format='PNG'
    scene.render.filepath=str(PREVIEW/(slug+'.png'))
    bpy.ops.wm.save_as_mainfile(filepath=str(SOURCE/(slug+'.blend')))
    bpy.ops.render.render(write_still=True)

def output(slug,height):
    assemble(height);shared_atlas(slug);animate(slug)
    meshes=[obj for obj in bpy.context.scene.objects if obj.type=='MESH']
    source_triangles=0
    for obj in meshes:obj.data.calc_loop_triangles();source_triangles+=len(obj.data.loop_triangles)
    target=7800 if 'reaver' in slug else 17500
    ratio=min(1,target/source_triangles);mobile=[]
    for original in meshes:
        copy=original.copy();copy.data=original.data.copy();bpy.context.collection.objects.link(copy)
        copy.name=original.name.replace('_Mesh','_MobileMesh')
        bpy.ops.object.select_all(action='DESELECT');copy.select_set(True);bpy.context.view_layer.objects.active=copy
        if ratio<1:
            modifier=copy.modifiers.new('Mobile topology reduction','DECIMATE');modifier.ratio=ratio;modifier.use_collapse_triangulate=True
            bpy.ops.object.modifier_apply(modifier=modifier.name)
            copy.data.validate(clean_customdata=False)
        original.hide_render=True;original.hide_set(True);original.name=original.name.replace('_Mesh','_DetailedSourceMesh')
        mobile.append(copy)
    triangle_count=0
    for obj in mobile:obj.data.calc_loop_triangles();triangle_count+=len(obj.data.loop_triangles)
    bpy.ops.object.select_all(action='DESELECT')
    for node in NODES.values():node.select_set(True)
    for obj in mobile:obj.select_set(True)
    bpy.ops.export_scene.gltf(filepath=str(EXPORT/(slug+'.glb')),export_format='GLB',use_selection=True,
                             use_visible=True,export_animations=True,export_animation_mode='NLA_TRACKS',export_nla_strips=True)
    node_info={name:{'parent':PARENTS[name],'pivotBlenderMetres':[round(v,5) for v in node.matrix_world.translation]} for name,node in NODES.items()}
    report={'schema':1,'asset':slug,'route':'original local procedural Blender modelling; not TRELLIS conversion',
            'productionAccepted':False,'heightMetres':height,'triangles':triangle_count,'detailedSourceTriangles':source_triangles,'meshCount':len(mobile),'materials':1,
            'textures':3,'textureDimensions':[768,512],'estimatedDrawCallsPerInstance':len(mobile),
            'facing':'Blender +Y forward maps to glTF -Z; renderer rotates Y by pi to face camera +Z',
            'cannonSpin':'glTF local Z negative angle. Reaver Barrel_R only; Barrel_L holds its shield. Tyrant spins both barrels.',
            'cannonPivotsAligned':True,
            'nodes':node_info,'animationClips':['Idle','Attack'],'source':str(SOURCE/(slug+'.blend')),'glb':str(EXPORT/(slug+'.glb'))}
    (MANIFEST/(slug+'.json')).write_text(json.dumps(report,indent=2),encoding='utf8')
    print('VILLAIN_EXPORTED',slug,triangle_count,'triangles',flush=True)
    studio(slug,height)

def repair_rest(slug):
    global NODES
    path=SOURCE/(slug+'.blend');bpy.ops.wm.open_mainfile(filepath=str(path))
    report=json.loads((MANIFEST/(slug+'.json')).read_text(encoding='utf8'))
    bpy.context.scene.frame_set(1)
    NODES={name:bpy.data.objects[name] for name in report['nodes']}
    matrices={obj:obj.matrix_world.copy() for obj in bpy.context.scene.objects if obj.type=='MESH' and 'Mesh' in obj.name}
    if 'reaver' in slug:
        scale=report['nodes']['Arm_R']['pivotBlenderMetres'][0]/.4
        delta=Vector((.03,.04,-.03))*scale
        # Repair old generated scenes once; keep re-running idempotent.
        if not report.get('cannonPivotsAligned'):
            report['nodes']['Barrel_R']['pivotBlenderMetres']=list(Vector(report['nodes']['Barrel_R']['pivotBlenderMetres'])+delta)
    else:
        scale=report['nodes']['Arm_R']['pivotBlenderMetres'][0]/.92
        if not report.get('cannonPivotsAligned'):
            for side,sign in [('L',-1),('R',1)]:
                delta=Vector((sign*.03,.12,-.09))*scale
                report['nodes']['Barrel_'+side]['pivotBlenderMetres']=list(Vector(report['nodes']['Barrel_'+side]['pivotBlenderMetres'])+delta)
    for name,node in NODES.items():
        node.animation_data_clear()
        parent=report['nodes'][name]['parent']
        world=Vector(report['nodes'][name]['pivotBlenderMetres'])
        node.location=world-Vector(report['nodes'][parent]['pivotBlenderMetres']) if parent else world
        node.rotation_euler=(0,0,0)
    bpy.context.view_layer.update()
    for obj,matrix in matrices.items():obj.matrix_world=matrix
    bpy.context.view_layer.update();animate(slug)
    bpy.ops.object.select_all(action='DESELECT')
    for node in NODES.values():node.select_set(True)
    for obj in bpy.context.scene.objects:
        if obj.name.endswith('_MobileMesh'):obj.select_set(True)
    bpy.ops.export_scene.gltf(filepath=str(EXPORT/(slug+'.glb')),export_format='GLB',use_selection=True,
                             use_visible=True,export_animations=True,export_animation_mode='NLA_TRACKS',export_nla_strips=True)
    bpy.ops.wm.save_as_mainfile(filepath=str(path))
    report['cannonPivotsAligned']=True
    report['cannonSpin']='glTF local Z negative angle. Reaver Barrel_R only; Barrel_L holds its shield. Tyrant spins both barrels.'
    (MANIFEST/(slug+'.json')).write_text(json.dumps(report,indent=2),encoding='utf8')
    print('REST_PIVOTS_REPAIRED',slug,flush=True)

def validate_exports():
    import struct,hashlib
    reports=[]
    for slug in ['cinder-reaver-v3','forge-tyrant-v3']:
        data=(EXPORT/(slug+'.glb')).read_bytes();length,kind=struct.unpack_from('<II',data,12)
        gltf=json.loads(data[20:20+length]);nodes={n.get('name'):n for n in gltf['nodes']}
        expected=json.loads((MANIFEST/(slug+'.json')).read_text(encoding='utf8'))
        for name in ['Torso','Head','Arm_L','Arm_R','Barrel_R','Pod_L','Pod_R','Leg_L','Leg_R']:
            assert any(abs(v)>.001 for v in nodes[name].get('translation',[])),(slug,name,'missing rest translation')
        assert len(gltf['meshes'])==14 and len(gltf['materials'])==1
        assert all(len(m['primitives'])==1 for m in gltf['meshes'])
        triangles=sum(gltf['accessors'][p['indices']]['count']//3 for m in gltf['meshes'] for p in m['primitives'])
        assert triangles==expected['triangles']
        assert sorted(a['name'] for a in gltf['animations'])==['Attack','Idle']
        bpy.ops.wm.read_factory_settings(use_empty=True)
        bpy.ops.import_scene.gltf(filepath=str(EXPORT/(slug+'.glb')))
        for obj in bpy.context.scene.objects:
            if obj.animation_data:obj.animation_data_clear()
        bpy.context.view_layer.update()
        points=[o.matrix_world@Vector(v) for o in bpy.context.scene.objects if o.type=='MESH' for v in o.bound_box]
        low=min(p.z for p in points);high=max(p.z for p in points)
        assert abs(high-low-expected['heightMetres'])<.01,(slug,'height',high-low)
        assert abs(low)<.005,(slug,'ground',low)
        report={'asset':slug,'status':'pass','triangles':triangles,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest(),
                'meshes':14,'materialCount':1,'drawCallsPerInstance':14,'clips':['Idle','Attack'],
                'heightMetres':round(high-low,5),'groundOffsetMetres':round(low,5),'restTranslationsVerified':True,
                'scope':'Binary inspection and Blender reimport, not physical-device performance'}
        reports.append(report)
    (MANIFEST/'export-validation.json').write_text(json.dumps({'schema':1,'status':'pass','assets':reports},indent=2),encoding='utf8')
    print('VILLAIN_VALIDATION_PASS',json.dumps(reports),flush=True)

if __name__=='__main__':
    for directory in [SOURCE,EXPORT,PREVIEW,MANIFEST]:directory.mkdir(parents=True,exist_ok=True)
    if '--validate-only' in sys.argv:validate_exports()
    elif '--repair-rest' in sys.argv:
        repair_rest(sys.argv[sys.argv.index('--repair-rest')+1])
    else:
        only=sys.argv[sys.argv.index('--only')+1] if '--only' in sys.argv else 'all'
        if only in ['all','reaver']:reaver();output('cinder-reaver-v3',2)
        if only in ['all','tyrant']:tyrant();output('forge-tyrant-v3',4.5)
