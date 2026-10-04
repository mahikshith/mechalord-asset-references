"""Run with UE 5.8 editor Python. Authors only /Game/MechalordArtLab.

No C++ build, network services, or generation. Saves native assets/map and a
truthful manifest. This is an asset/physics inspection scene, not the game.
"""
from pathlib import Path
import json
import math
import traceback
import unreal as u

ROOT = Path(__file__).resolve().parents[1]
BASE = "/Game/MechalordArtLab"
MAP = BASE + "/Maps/L_ForgeWorkshop"
TAG = "MechalordArtLabGenerated"
REPORT_PATH = ROOT / "builds/unreal-artlab.json"
A = u.AssetToolsHelpers.get_asset_tools()
EA = u.get_editor_subsystem(u.EditorAssetSubsystem)
ACT = u.get_editor_subsystem(u.EditorActorSubsystem)
LEVEL = u.get_editor_subsystem(u.LevelEditorSubsystem)
SME = u.get_editor_subsystem(u.StaticMeshEditorSubsystem)
REPORT = {"status": "running", "engine": u.SystemLibrary.get_engine_version(),
          "map": MAP, "assets": [], "imports": [], "warnings": [],
          "geometryRoutes": {}, "physicsBodies": [], "cameras": [],
          "runtimeImplemented": False, "androidValidated": False,
          "visualReviewPassed": False, "axes": "X horizontal, Y forward, Z up; centimetres"}


def warn(message):
    REPORT["warnings"].append(str(message))
    u.log_warning("ArtLab: " + str(message))


def optional(obj, name, value):
    try:
        obj.set_editor_property(name, value)
        return True
    except Exception as error:
        warn(name + ": " + str(error))
        return False


def existing(path):
    return u.load_asset(path) if EA.does_asset_exist(path) else None


def save(asset):
    if not EA.save_loaded_asset(asset, only_if_is_dirty=False):
        raise RuntimeError("Asset save failed: " + asset.get_path_name())
    return asset


def create(name, folder, klass, factory):
    asset = existing(folder + "/" + name)
    if asset:
        return asset
    EA.make_directory(folder)
    asset = A.create_asset(name, folder, klass, factory)
    if not asset:
        raise RuntimeError("Could not create " + folder + "/" + name)
    return asset


def rgb(hex_value):
    return u.LinearColor(*[((hex_value >> s) & 255) / 255.0 for s in (16, 8, 0)], 1)


def vec(values):
    return u.Vector(*values)


def xyz(value):
    return [float(value.x), float(value.y), float(value.z)]


def material_parent(textured=False, lit=False):
    name = "M_ArtLabPainted" if textured else "M_ArtLabSurface" if lit else "M_ArtLabUnlit"
    path = BASE + "/Materials/" + name
    found = existing(path)
    if found:
        return found
    # Search our material library before creating the small parameterised parent.
    REPORT.setdefault("materialSearches", []).append([str(path) for path in EA.list_assets(BASE + "/Materials", recursive=True)])
    m = create(name, BASE + "/Materials", u.Material, u.MaterialFactoryNew())
    m.set_editor_property("shading_model", u.MaterialShadingModel.MSM_DEFAULT_LIT if lit else u.MaterialShadingModel.MSM_UNLIT)
    color = u.MaterialEditingLibrary.create_material_expression(m, u.MaterialExpressionVectorParameter, -500, 0)
    color.set_editor_property("parameter_name", "Tint")
    color.set_editor_property("group", "Paint")
    color.set_editor_property("default_value", u.LinearColor(1, 1, 1, 1))
    out = color
    if textured:
        texture = u.MaterialEditingLibrary.create_material_expression(m, u.MaterialExpressionTextureSampleParameter2D, -500, 180)
        texture.set_editor_property("parameter_name", "Albedo")
        texture.set_editor_property("group", "Paint")
        texture.set_editor_property("texture", u.load_asset("/Engine/EngineResources/WhiteSquareTexture"))
        multiply = u.MaterialEditingLibrary.create_material_expression(m, u.MaterialExpressionMultiply, -180, 0)
        u.MaterialEditingLibrary.connect_material_expressions(color, "", multiply, "A")
        u.MaterialEditingLibrary.connect_material_expressions(texture, "RGB", multiply, "B")
        out = multiply
    if not u.MaterialEditingLibrary.connect_material_property(out, "", u.MaterialProperty.MP_BASE_COLOR if lit else u.MaterialProperty.MP_EMISSIVE_COLOR):
        raise RuntimeError("Material graph did not connect")
    if lit:
        rough = u.MaterialEditingLibrary.create_material_expression(m, u.MaterialExpressionScalarParameter, -300, 300)
        rough.set_editor_property("parameter_name", "Roughness")
        rough.set_editor_property("default_value", .8)
        u.MaterialEditingLibrary.connect_material_property(rough, "", u.MaterialProperty.MP_ROUGHNESS)
    u.MaterialEditingLibrary.recompile_material(m)
    return save(m)


def material(name, color=0xffffff, textured=None, lit=False):
    m = create("MI_" + name, BASE + "/Materials", u.MaterialInstanceConstant, u.MaterialInstanceConstantFactoryNew())
    u.MaterialEditingLibrary.set_material_instance_parent(m, material_parent(bool(textured), lit))
    u.MaterialEditingLibrary.set_material_instance_vector_parameter_value(m, "Tint", rgb(color))
    if textured:
        u.MaterialEditingLibrary.set_material_instance_texture_parameter_value(m, "Albedo", textured)
    return save(m)


def transform(location=(0, 0, 0), rotation=(0, 0, 0)):
    return u.Transform(location=vec(location), rotation=u.Rotator(pitch=rotation[0], yaw=rotation[1], roll=rotation[2]), scale=u.Vector(1, 1, 1))


def native_mesh(name, shapes, force=False):
    """Native GeometryScript produces a reusable StaticMesh with centimetre pivots."""
    path = BASE + "/Kit/SM_" + name
    found = existing(path)
    if found and not force:
        REPORT["geometryRoutes"][name] = "existing generated StaticMesh reused; measured in assets report"
        return found
    EA.make_directory(BASE + "/Kit")
    try:
        mesh = u.DynamicMesh()
        options = u.GeometryScriptPrimitiveOptions()
        primitive = u.GeometryScript_Primitives
        for shape in shapes:
            kind, location, dimensions, rotation = shape
            t = transform(location, rotation)
            if kind == "box":
                primitive.append_box(mesh, options, t, *dimensions, origin=u.GeometryScriptPrimitiveOriginMode.CENTER)
            elif kind == "cylinder":
                primitive.append_cylinder(mesh, options, t, dimensions[0], dimensions[1], radial_steps=dimensions[2], origin=u.GeometryScriptPrimitiveOriginMode.CENTER)
            elif kind == "bevel":
                # Real closed chamfered faces; lower/top rings make bevel edges.
                width, length, height, bevel = dimensions
                def ring(w, l, z):
                    c = min(bevel * 2, w / 5, l / 5)
                    return [u.Vector(x, y, z) for x, y in [(-w/2+c,-l/2),(w/2-c,-l/2),(w/2,-l/2+c),(w/2,l/2-c),(w/2-c,l/2),(-w/2+c,l/2),(-w/2,l/2-c),(-w/2,-l/2+c)]]
                rings = [ring(width-2*bevel, length-2*bevel, -height/2), ring(width, length, -height/2+bevel), ring(width, length, height/2-bevel), ring(width-2*bevel, length-2*bevel, height/2)]
                primitive.append_triangulated_polygon3d(mesh, options, t, list(reversed(rings[0])))
                primitive.append_triangulated_polygon3d(mesh, options, t, rings[-1])
                for lower, upper in zip(rings[:-1], rings[1:]):
                    for i in range(8):
                        j = (i + 1) % 8
                        primitive.append_triangulated_polygon3d(mesh, options, t, [lower[i], lower[j], upper[j], upper[i]])
            else:
                raise ValueError(kind)
        if found:
            result = u.GeometryScript_AssetUtils.copy_mesh_to_static_mesh(mesh, found, u.GeometryScriptCopyMeshToAssetOptions(), u.GeometryScriptMeshWriteLOD())
            if isinstance(result, tuple) and result[-1] != u.GeometryScriptOutcomePins.SUCCESS:
                raise RuntimeError("GeometryScript replacement failed: " + str(result))
            asset = found
            SME.remove_collisions(asset)
        else:
            settings = u.GeometryScriptCreateNewStaticMeshAssetOptions()
            settings.set_editor_property("enable_nanite", False)
            settings.set_editor_property("enable_collision", True)
            result = u.GeometryScript_NewAssetUtils.create_new_static_mesh_asset_from_mesh(mesh, path, settings)
            asset = result[0] if isinstance(result, tuple) else result
        if not isinstance(asset, u.StaticMesh):
            raise RuntimeError("GeometryScript did not return StaticMesh: " + str(result))
        SME.add_simple_collisions(asset, u.ScriptCollisionShapeType.BOX)
        REPORT["geometryRoutes"][name] = "native GeometryScript closed bevel/polygon primitives"
        return save(asset)
    except Exception as error:
        if found:
            raise RuntimeError("Existing kit mesh replacement failed: " + name + ": " + str(error))
        warn("Native mesh " + name + " failed: " + str(error))
        # A genuine native asset remains editable; report the lower-fidelity fallback.
        fallback = EA.duplicate_asset("/Engine/BasicShapes/Cube", path)
        if not fallback:
            raise RuntimeError("Mesh generation and fallback failed for " + name)
        REPORT["geometryRoutes"][name] = "fallback unit cube; layered actor assembly, not requested bevel mesh"
        return save(fallback)


def tag(actor, label, folder="Arena"):
    actor.set_actor_label("ArtLab_" + label)
    actor.set_editor_property("tags", [u.Name(TAG)])
    actor.set_folder_path(u.Name("MechalordArtLab/" + folder))
    return actor


def spawn(mesh, label, position, scale=(1, 1, 1), rotation=(0, 0, 0), paint=None, movable=False):
    actor = tag(ACT.spawn_actor_from_class(u.StaticMeshActor, vec(position), u.Rotator(pitch=rotation[0], yaw=rotation[1], roll=rotation[2])), label)
    c = actor.static_mesh_component
    c.set_mobility(u.ComponentMobility.MOVABLE if movable else u.ComponentMobility.STATIC)
    c.set_static_mesh(mesh)
    actor.set_actor_scale3d(vec(scale))
    if paint:
        c.set_material(0, paint)
    return actor


def bounds(actors):
    lo = [float("inf")] * 3
    hi = [-float("inf")] * 3
    measured = 0
    for actor in actors:
        center, extent = actor.get_actor_bounds(False)
        if extent.x + extent.y + extent.z < .001:
            continue
        measured += 1
        for i, (c, e) in enumerate(zip(xyz(center), xyz(extent))):
            lo[i] = min(lo[i], c-e)
            hi[i] = max(hi[i], c+e)
    if not measured:
        raise RuntimeError("Imported scene contains no measurable mesh bounds")
    return {"min": lo, "max": hi, "size": [hi[i]-lo[i] for i in range(3)]}


def import_character(filename, name, location, height, yaw):
    source = ROOT / "delivery/playable" / filename
    before = {actor.get_path_name() for actor in ACT.get_all_level_actors()}
    folder = BASE + "/Characters/" + name
    EA.make_directory(folder)
    manager = u.InterchangeManager.get_interchange_manager_scripted()
    params = u.ImportAssetParameters()
    params.set_editor_property("is_automated", True)
    params.set_editor_property("replace_existing", True)
    success = manager.import_scene(folder, u.InterchangeManager.create_source_data(str(source)), params)
    imported = [actor for actor in ACT.get_all_level_actors() if actor.get_path_name() not in before]
    if not success or not imported:
        raise RuntimeError("Interchange scene import returned no actors: " + name)
    initial = bounds(imported)
    factor = height / initial["size"][2]
    center = [(initial["min"][i]+initial["max"][i])/2 for i in range(3)]
    center[2] = initial["min"][2]
    ids = {actor.get_path_name() for actor in imported}
    top = [actor for actor in imported if not actor.get_attach_parent_actor() or actor.get_attach_parent_actor().get_path_name() not in ids]
    angle = math.radians(yaw)
    for actor in top:
        p = xyz(actor.get_actor_location())
        x, y, z = [(p[i]-center[i])*factor for i in range(3)]
        actor.set_actor_location(u.Vector(location[0]+x*math.cos(angle)-y*math.sin(angle), location[1]+x*math.sin(angle)+y*math.cos(angle), location[2]+z), False, False)
        r = actor.get_actor_rotation()
        actor.set_actor_rotation(u.Rotator(pitch=r.pitch, yaw=r.yaw+yaw, roll=r.roll), False)
        old = actor.get_actor_scale3d()
        actor.set_actor_scale3d(u.Vector(old.x*factor, old.y*factor, old.z*factor))
    objects = [u.load_asset(path) for path in EA.list_assets(folder, recursive=True)]
    textures = [o for o in objects if isinstance(o, u.Texture2D)]
    for texture in textures:
        optional(texture, "max_texture_size", 1024 if name in ("Commander", "ForgeTyrant") else 512)
        save(texture)
    paint_cache = {}
    for i, actor in enumerate(imported):
        tag(actor, name + "_" + str(i), "Characters")
        for c in actor.get_components_by_class(u.MeshComponent):
            for slot in range(c.get_num_materials()):
                original = c.get_material(slot)
                texture = None
                if isinstance(original, u.MaterialInstanceConstant):
                    for item in original.get_editor_property("texture_parameter_values"):
                        info = item.get_editor_property("parameter_info")
                        if "base" in str(info.name).lower() or "color" in str(info.name).lower():
                            texture = item.get_editor_property("parameter_value")
                            break
                if not texture and len(textures) == 1:
                    texture = textures[0]
                if texture:
                    key = texture.get_path_name()
                    if key not in paint_cache:
                        paint_cache[key] = material(name + "_Paint_" + str(len(paint_cache)), textured=texture)
                    c.set_material(slot, paint_cache[key])
                else:
                    warn(name + ": retained native imported material in slot " + str(slot) + "; no base-color texture identified")
    # Refresh the skinned bounds before the final grounding measurement.
    for actor in imported:
        for c in actor.get_components_by_class(u.SkeletalMeshComponent):
            c.set_skinned_asset_and_update(c.get_skinned_asset(), False)
    current = bounds(imported)
    offset = [location[0]-(current["min"][0]+current["max"][0])/2, location[1]-(current["min"][1]+current["max"][1])/2, location[2]-current["min"][2]]
    for actor in top:
        p = actor.get_actor_location()
        actor.set_actor_location(u.Vector(p.x+offset[0],p.y+offset[1],p.z+offset[2]),False,True)
    final = bounds(imported)
    REPORT["imports"].append({"name": name, "source": str(source), "sceneImportSucceeded": bool(success), "actors": len(imported), "assetPaths": [o.get_path_name() for o in objects if o], "sourceBoundsCm": initial, "placedBoundsCm": final, "targetHeightCm": height, "facingYaw": yaw, "animationsPlayed": False})
    return imported


def arena():
    floor = material("FloorSlate", 0x263840, lit=True)
    steel = material("PaintSteel", 0x35454e)
    dark = material("PaintGunmetal", 0x17232c)
    ivory = material("PaintIvory", 0xbdbba9)
    bronze = material("PaintBronze", 0x9d783d)
    cyan = material("TraceCyan", 0x258b9d)
    amber = material("ReactorAmber", 0xc37e33)
    deck = native_mesh("Deck_400x800", [("bevel",(0,0,-15),(400,800,30,5),(0,0,0))])
    plate = native_mesh("ArmorPlate", [("bevel",(0,0,0),(120,160,16,4),(0,0,0))])
    beam = native_mesh("RailBeam", [("bevel",(0,0,0),(18,800,25,3),(0,0,0))])
    post = native_mesh("RailPost", [("bevel",(0,0,60),(24,30,120,4),(0,0,0)),("box",(0,0,0),(45,55,12),(0,0,0))])
    support = native_mesh("DeckSupport", [("bevel",(0,0,-140),(65,80,260,7),(0,0,0)),("box",(0,0,-20),(110,100,28),(0,0,0))])
    turbine = native_mesh("TurbineHousing", [("cylinder",(0,0,0),(78,70,24),(0,0,90)),("cylinder",(0,0,0),(93,12,24),(0,0,90))])
    rotor_shapes = [("cylinder",(0,0,0),(23,85,16),(0,0,90))]
    for i in range(8):
        angle = i*45
        rotor_shapes.append(("bevel",(math.cos(math.radians(angle))*47,0,math.sin(math.radians(angle))*47),(65,12,16,3),(-angle,0,0)))
    rotor = native_mesh("TurbineRotor", rotor_shapes)
    arm = native_mesh("MachineArm", [("bevel",(0,0,70),(36,40,140,5),(0,0,0)),("cylinder",(0,0,0),(28,50,16),(90,0,0))])
    cannon = native_mesh("HandCannonHousing", [("cylinder",(0,0,0),(29,48,16),(0,0,90)),("bevel",(0,0,-24),(30,40,40,4),(0,0,0))])
    barrels = []
    for i in range(6):
        angle = i*math.pi/3
        barrels.append(("cylinder",(math.cos(angle)*19,45,math.sin(angle)*19),(4.5,90,8),(0,0,90)))
    barrel = native_mesh("HandCannonBarrel_PivotBase", barrels)
    pin = native_mesh("JointPin", [("cylinder",(0,0,0),(22,46,16),(90,0,0))])
    strip = native_mesh("TraceStrip", [("box",(0,0,0),(6,660,1),(0,0,0))])
    # Track top is Z=0, true native kit assets repeat on a 400x800cm grid.
    for x in (-400,0,400):
        for row in range(4):
            y = row*800-200
            spawn(deck,"Deck_%s_%s"%(x,row),(x,y,0),paint=floor)
            spawn(strip,"Trace_%s_%s"%(x,row),(x+175,y,1),paint=cyan)
    for side in (-1,1):
        for row in range(4):
            y = row*800-200
            spawn(beam,"UpperRail_%s_%s"%(side,row),(side*615,y,112),paint=bronze)
            spawn(beam,"LowerRail_%s_%s"%(side,row),(side*615,y,54),paint=steel)
            for off in (-350,350):
                spawn(post,"Post_%s_%s_%s"%(side,row,off),(side*615,y+off,0),paint=steel)
                spawn(support,"Support_%s_%s_%s"%(side,row,off),(side*520,y+off,-20),paint=dark)
            spawn(turbine,"TurbineHousing_%s_%s"%(side,row),(side*810,y,210),paint=dark)
            spawn(rotor,"TurbineRotor_%s_%s"%(side,row),(side*810,y-48,210),paint=bronze,movable=True)
            for h in (110,290):
                spawn(plate,"FactoryPanel_%s_%s_%s"%(side,row,h),(side*800,y+240,h),rotation=(0,0,90),paint=steel)
    for side in (-1,1):
        base = (side*760,1550,190)
        spawn(arm,"MachineArmBase_%s"%side,base,paint=steel)
        spawn(arm,"MachineArmFore_%s"%side,(side*690,1550,320),rotation=(0,0,side*45),paint=bronze)
        spawn(pin,"MachineArmPivot_%s"%side,(side*760,1550,325),paint=amber)
    # Native, independently editable cannon parts have documented rotation pivots.
    spawn(cannon,"HandCannonHousing_Showcase",(-420,-400,110),paint=ivory,movable=True)
    spawn(barrel,"HandCannonRotor_Showcase",(-420,-400,110),paint=bronze,movable=True)
    REPORT["handCannon"] = {"housing": cannon.get_path_name(), "barrel": barrel.get_path_name(), "barrelPivot": "local origin at barrel base; barrels extend +Y; rotate local Y", "previewOnly": True}
    # A fenced side bay shows actual Chaos rigid bodies, not per-troop physics.
    spawn(deck,"PhysicsBayFloor",(860,-450,-10),scale=(.8,.65,1),paint=floor)
    for i in range(6):
        actor = spawn(plate,"PhysicsDebris_%s"%i,(810+(i%2)*90,-600+(i//2)*100,70+i*42),scale=(.45,.45,.8),paint=bronze if i%2 else steel,movable=True)
        c = actor.static_mesh_component
        c.set_collision_profile_name("PhysicsActor")
        c.set_simulate_physics(True)
        c.set_enable_gravity(True)
        c.set_linear_damping(.8)
        c.set_angular_damping(1.1)
        REPORT["physicsBodies"].append({"actor": actor.get_path_name(), "movable": True, "simulationEnabled": bool(c.is_simulating_physics()), "testedInPIE": False})


def camera_and_lights():
    camera = tag(ACT.spawn_actor_from_class(u.CameraActor, u.Vector(0,-1850,1850)), "PortraitInspectionCamera", "Cameras")
    target = u.Vector(0,850,170)
    rotation = u.MathLibrary.find_look_at_rotation(camera.get_actor_location(), target)
    camera.set_actor_rotation(rotation, False)
    c = camera.get_component_by_class(u.CameraComponent)
    if not c:
        raise RuntimeError("CameraActor has no CameraComponent")
    c.set_editor_property("aspect_ratio", 9/16)
    c.set_editor_property("constrain_aspect_ratio", True)
    c.set_editor_property("field_of_view", 39)
    settings = c.get_editor_property("post_process_settings")
    optional(settings,"override_auto_exposure_min_brightness",True)
    optional(settings,"override_auto_exposure_max_brightness",True)
    optional(settings,"auto_exposure_min_brightness",1.0)
    optional(settings,"auto_exposure_max_brightness",1.0)
    optional(settings,"override_auto_exposure_bias",True)
    optional(settings,"auto_exposure_bias",0.0)
    optional(settings,"override_bloom_intensity",True)
    optional(settings,"bloom_intensity",.08)
    c.set_editor_property("post_process_settings",settings)
    c.set_editor_property("post_process_blend_weight",1.0)
    optional(camera,"auto_activate_for_player",u.AutoReceiveInput.PLAYER0)
    # Inspection lighting is intentionally small; no outdoor sky system/fog.
    sun = tag(ACT.spawn_actor_from_class(u.DirectionalLight, u.Vector(0,0,1400), u.Rotator(pitch=-55,yaw=-35,roll=0)),"WorkshopKey", "Lighting")
    sun.light_component.set_intensity(700)
    sun.light_component.set_light_color(u.LinearColor(.80,.88,1,1))
    for i,(position,color) in enumerate([((-450,600,900),u.LinearColor(.28,.62,.85,1)),((400,1900,850),u.LinearColor(1,.52,.18,1))]):
        light = tag(ACT.spawn_actor_from_class(u.PointLight,vec(position)),"WorkshopFill_%s"%i,"Lighting")
        light.light_component.set_intensity(3500)
        light.light_component.set_light_color(color)
        light.light_component.set_editor_property("attenuation_radius",1100)
        light.light_component.set_cast_shadows(False)
    u.EditorLevelLibrary.set_level_viewport_camera_info(camera.get_actor_location(),rotation)
    REPORT["cameras"].append({"actor":camera.get_path_name(),"position":xyz(camera.get_actor_location()),"target":xyz(target),"aspectRatio":9/16,"horizontalFovDegrees":39,"captured":False})


def run():
    # Save current work before loading our isolated generated map.
    current = LEVEL.get_current_level()
    if current:
        outer_path = str(current.get_outer().get_path_name())
        if outer_path.startswith("/Game/") and not LEVEL.save_current_level():
            raise RuntimeError("Existing persistent level could not be saved; stopping before changing maps")
    EA.make_directory(BASE + "/Maps")
    if existing(MAP):
        if not LEVEL.load_level(MAP):
            raise RuntimeError("Could not load ArtLab map")
        for actor in list(ACT.get_all_level_actors()):
            if u.Name(TAG) in actor.get_editor_property("tags"):
                ACT.destroy_actor(actor)
    elif not LEVEL.new_level(MAP):
        raise RuntimeError("Could not create isolated ArtLab map")
    arena()
    plans = [("commander.glb","Commander",(0,-170,2),280,180),
             ("troop.glb","Gearling",(-180,80,2),125,180),
             ("crawler.glb","RustCrawler",(340,800,2),130,0),
             ("cinder-reaver.glb","CinderReaver",(-290,920,2),275,0),
             ("forge-tyrant.glb","ForgeTyrant",(0,1830,2),630,0)]
    for filename,name,location,height,yaw in plans:
        try:
            import_character(filename,name,location,height,yaw)
        except Exception as error:
            warn("Character import " + name + ": " + str(error))
    camera_and_lights()
    if not LEVEL.save_current_level():
        raise RuntimeError("Map save failed")
    assets = []
    for path in EA.list_assets(BASE,recursive=True):
        obj = u.load_asset(path)
        if not obj:
            continue
        save(obj)
        entry = {"path":obj.get_path_name(),"class":obj.get_class().get_name()}
        if isinstance(obj,u.StaticMesh):
            try:
                box = obj.get_bounding_box()
                entry["localBoundsCm"] = {"min":xyz(box.min),"max":xyz(box.max)}
                entry["trianglesLOD0"] = obj.get_num_triangles(0)
                entry["simpleCollisionCount"] = SME.get_simple_collision_count(obj)
            except Exception as error:
                entry["measurementError"] = str(error)
        assets.append(entry)
    REPORT["assets"] = assets
    REPORT["generatedActorCount"] = sum(u.Name(TAG) in actor.get_editor_property("tags") for actor in ACT.get_all_level_actors())
    REPORT["status"] = "authored_with_warnings" if REPORT["warnings"] else "authored"
    REPORT["mapSaved"] = True


if __name__ == "__main__":
    try:
        run()
    except Exception as error:
        REPORT["status"] = "failed"
        REPORT["error"] = str(error)
        REPORT["traceback"] = traceback.format_exc()
        u.log_error(REPORT["traceback"])
    finally:
        REPORT_PATH.parent.mkdir(parents=True,exist_ok=True)
        REPORT_PATH.write_text(json.dumps(REPORT,indent=2),encoding="utf-8")
        u.log("ArtLab report: " + str(REPORT_PATH))
