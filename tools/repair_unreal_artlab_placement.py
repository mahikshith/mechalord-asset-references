"""UE editor-only repair of tagged imports and owned kit axes. No reimport.

Preserves workshop animation, materials, other actors and original GLB files.
Run after the native builder/animation authoring. Parent launches the editor.
"""
from pathlib import Path
import importlib.util
import itertools
import json
import math
import traceback
import unreal as u

ROOT = Path(__file__).resolve().parents[1]
BASE = "/Game/MechalordArtLab"
MAP = BASE + "/Maps/L_ForgeWorkshop"
TAG = "MechalordArtLabGenerated"
REPORT_PATH = ROOT / "builds/unreal-artlab-placement.json"
EA = u.get_editor_subsystem(u.EditorAssetSubsystem)
ACT = u.get_editor_subsystem(u.EditorActorSubsystem)
LEVEL = u.get_editor_subsystem(u.LevelEditorSubsystem)
REPORT = {"status":"running","map":MAP,"characters":[],"kitRepairs":[],
          "physicsBodies":[],"warnings":[],"visualReviewPassed":False,"pieValidated":False}


def require(condition, message):
    if not condition:
        raise RuntimeError(message)


def xyz(vector):
    return [float(vector.x),float(vector.y),float(vector.z)]


def world_bounds(actors, imported=True):
    """Local visible mesh bounds transformed explicitly, avoiding physics bounds."""
    points=[]
    for actor in actors:
        for c in actor.get_components_by_class(u.MeshComponent):
            if not c.is_visible():
                continue
            if imported and isinstance(c,u.StaticMeshComponent):
                if not c.get_editor_property("static_mesh"):
                    continue
                lo,hi=c.get_local_bounds()
            elif imported and isinstance(c,u.SkeletalMeshComponent):
                mesh=c.get_skeletal_mesh_asset()
                if not mesh:
                    continue
                box=mesh.get_imported_bounds()
                origin,extent=box.origin,box.box_extent
                lo=u.Vector(origin.x-extent.x,origin.y-extent.y,origin.z-extent.z)
                hi=u.Vector(origin.x+extent.x,origin.y+extent.y,origin.z+extent.z)
            else:
                origin,extent,_=u.SystemLibrary.get_component_bounds(c)
                if extent.x+extent.y+extent.z<.001:
                    continue
                points.extend([[origin.x-extent.x,origin.y-extent.y,origin.z-extent.z],
                               [origin.x+extent.x,origin.y+extent.y,origin.z+extent.z]])
                continue
            t=c.get_world_transform()
            for x,y,z in itertools.product((lo.x,hi.x),(lo.y,hi.y),(lo.z,hi.z)):
                points.append(xyz(u.MathLibrary.transform_location(t,u.Vector(x,y,z))))
    require(points,"No visible mesh bounds")
    lo=[min(p[i] for p in points) for i in range(3)]
    hi=[max(p[i] for p in points) for i in range(3)]
    return {"min":lo,"max":hi,"size":[hi[i]-lo[i] for i in range(3)]}


def refresh(actors):
    for actor in actors:
        for c in actor.get_components_by_class(u.SkeletalMeshComponent):
            c.set_skinned_asset_and_update(c.get_skinned_asset(),False)


def repair_characters():
    all_actors=list(ACT.get_all_level_actors())
    plans=[("Commander",[0,-170,2],280,180),("Gearling",[-180,80,2],125,180),
           ("RustCrawler",[340,800,2],130,0),("CinderReaver",[-290,920,2],275,0),
           ("ForgeTyrant",[0,1830,2],630,0)]
    for name,location,height,yaw in plans:
        actors=[a for a in all_actors if u.Name(TAG) in a.get_editor_property("tags") and a.get_actor_label().startswith("ArtLab_"+name+"_")]
        require(actors,"Missing tagged imported character: "+name)
        ids={a.get_path_name() for a in actors}
        roots=[a for a in actors if not a.get_attach_parent_actor() or a.get_attach_parent_actor().get_path_name() not in ids]
        entry={"name":name,"actors":len(actors),"roots":[],"beforeGeometryBoundsCm":world_bounds(actors),"beforeComponentBoundsCm":world_bounds(actors,False)}
        for actor in roots:
            old=actor.get_actor_rotation()
            entry["roots"].append({"path":actor.get_path_name(),"beforePitchYawRoll":[old.pitch,old.yaw,old.roll]})
            # Imported glTF root is identity. Explicit yaw rotates about UE Z.
            require(actor.set_actor_rotation(u.Rotator(pitch=0,yaw=yaw,roll=0),False),"Root orientation failed")
        refresh(actors)
        box=world_bounds(actors)
        require(box["size"][2]>.01,"Invalid character height")
        factor=height/box["size"][2]
        origin=[(box["min"][i]+box["max"][i])/2 for i in range(3)]
        origin[2]=box["min"][2]
        for actor in roots:
            p=xyz(actor.get_actor_location())
            scale=actor.get_actor_scale3d()
            actor.set_actor_location(u.Vector(*[origin[i]+(p[i]-origin[i])*factor for i in range(3)]),False,True)
            actor.set_actor_scale3d(u.Vector(scale.x*factor,scale.y*factor,scale.z*factor))
        refresh(actors)
        box=world_bounds(actors)
        delta=[location[0]-(box["min"][0]+box["max"][0])/2,location[1]-(box["min"][1]+box["max"][1])/2,location[2]-box["min"][2]]
        for actor in roots:
            p=actor.get_actor_location()
            actor.set_actor_location(u.Vector(p.x+delta[0],p.y+delta[1],p.z+delta[2]),False,True)
        refresh(actors)
        final=world_bounds(actors)
        entry.update({"afterGeometryBoundsCm":final,"afterComponentBoundsCm":world_bounds(actors,False),
                      "targetHeightCm":height,"facingYawDegrees":yaw,
                      "groundingErrorCm":final["min"][2]-2,
                      "heightErrorCm":final["size"][2]-height})
        require(abs(entry["groundingErrorCm"])<.05,"Grounding failed for "+name)
        require(abs(entry["heightErrorCm"])<.1,"Height correction failed for "+name)
        for actor in roots:
            r=actor.get_actor_rotation()
            require(abs(r.pitch)<.01 and abs(r.roll)<.01,"Root is still tilted: "+name)
        if name=="Commander":
            idle=u.load_asset(BASE+"/Characters/Commander/commander/SkeletalMeshes/Idle")
            for actor in actors:
                for c in actor.get_components_by_class(u.SkeletalMeshComponent):
                    mesh=c.get_skeletal_mesh_asset()
                    if isinstance(idle,u.AnimSequence) and idle.get_editor_property("skeleton")==mesh.get_editor_property("skeleton"):
                        c.override_animation_data(idle,True,True,0,1)
                        c.set_update_animation_in_editor(True)
                        entry["idleAssigned"]=idle.get_path_name()
                        entry["animationObserved"]=False
        REPORT["characters"].append(entry)


def repair_geometry():
    spec=importlib.util.spec_from_file_location("mechalord_artlab_builder_helpers",ROOT/"tools/build_unreal_artlab.py")
    builder=importlib.util.module_from_spec(spec)
    spec.loader.exec_module(builder)  # __main__ guard prevents rebuilding the map.
    plans={
        "HandCannonHousing":[("cylinder",(0,0,0),(29,48,16),(0,0,90)),("bevel",(0,0,-24),(30,40,40,4),(0,0,0))],
        "HandCannonBarrel_PivotBase":[],
        "TurbineHousing":[("cylinder",(0,0,0),(78,70,24),(0,0,90)),("cylinder",(0,0,0),(93,12,24),(0,0,90))],
        "TurbineRotor":[("cylinder",(0,0,0),(23,85,16),(0,0,90))],
        "MachineArm":[("bevel",(0,0,70),(36,40,140,5),(0,0,0)),("cylinder",(0,0,0),(28,50,16),(90,0,0))],
        "JointPin":[("cylinder",(0,0,0),(22,46,16),(90,0,0))]}
    for i in range(6):
        angle=i*math.pi/3
        plans["HandCannonBarrel_PivotBase"].append(("cylinder",(math.cos(angle)*19,45,math.sin(angle)*19),(4.5,90,8),(0,0,90)))
    for i in range(8):
        angle=i*45
        plans["TurbineRotor"].append(("bevel",(math.cos(math.radians(angle))*47,0,math.sin(math.radians(angle))*47),(65,12,16,3),(-angle,0,0)))
    for name,shapes in plans.items():
        path=BASE+"/Kit/SM_"+name
        old=u.load_asset(path)
        require(isinstance(old,u.StaticMesh),"Missing owned kit asset: "+name)
        before=old.get_bounding_box()
        mesh=builder.native_mesh(name,shapes,force=True)
        after=mesh.get_bounding_box()
        REPORT["kitRepairs"].append({"path":mesh.get_path_name(),"beforeMin":xyz(before.min),"beforeMax":xyz(before.max),"afterMin":xyz(after.min),"afterMax":xyz(after.max),"trianglesLOD0":mesh.get_num_triangles(0),"simpleCollisionCount":builder.SME.get_simple_collision_count(mesh)})
        if name=="HandCannonBarrel_PivotBase":
            require(abs(after.min.y)<.05 and abs(after.max.y-90)<.05,"Barrels must extend Y0..90 from base pivot")
        if name=="TurbineRotor":
            require(after.max.y-after.min.y<90,"Turbine should be thin along rotation axis Y")
    for actor in ACT.get_all_level_actors():
        if u.Name(TAG) not in actor.get_editor_property("tags") or not actor.get_actor_label().startswith("ArtLab_PhysicsDebris_"):
            continue
        c=actor.get_component_by_class(u.StaticMeshComponent)
        body=c.get_editor_property("body_instance")
        enabled=bool(body.get_editor_property("simulate_physics"))
        REPORT["physicsBodies"].append({"actor":actor.get_path_name(),"savedSimulatePhysics":enabled,"editorIsSimulating":bool(c.is_simulating_physics()),"mobility":str(c.get_editor_property("mobility")),"testedInPIE":False})
        require(enabled,"Saved physics flag was disabled: "+actor.get_actor_label())


try:
    require(EA.does_asset_exist(MAP),"Workshop map missing")
    current=LEVEL.get_current_level()
    if current and str(current.get_outer().get_path_name()).startswith("/Game/"):
        require(LEVEL.save_current_level(),"Existing level could not be saved")
    require(LEVEL.load_level(MAP),"Workshop map could not load")
    require(LEVEL.save_current_level(),"Workshop could not be saved before repair")
    repair_characters()
    repair_geometry()
    require(LEVEL.save_current_level(),"Repaired workshop map did not save")
    REPORT["status"]="repaired"
    REPORT["mapSaved"]=True
except Exception as error:
    REPORT["status"]="failed"
    REPORT["error"]=str(error)
    REPORT["traceback"]=traceback.format_exc()
    u.log_error(REPORT["traceback"])
finally:
    REPORT_PATH.write_text(json.dumps(REPORT,indent=2),encoding="utf-8")
    u.log("Workshop placement repair: "+str(REPORT_PATH))
