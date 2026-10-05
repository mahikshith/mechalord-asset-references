"""Restrained rigid-joint inspection loops for the newly authored characters.

No editor calls. get_motion returns additive offsets to the modeled rest pose.
240 frames / 30 fps = eight seconds. Location channels are centimetres;
Rotation.X/Y/Z are Unreal roll/pitch/yaw in degrees, respectively. Every track
starts and ends at rest except rotating axles, whose revolutions close geometrically.
These are asset-workshop demonstration loops, not authoritative gameplay attacks.
Use linear interpolation for wheel/fan/barrel rotation and recoil (no angle wrapping).
"""


def wave(peak, count=1):
    """Quarter-cycle keys with an exact rest seam and modest mechanical cadence."""
    keys=[]
    stride=240//count
    for cycle in range(count):
        base=cycle*stride
        keys.extend([(base,0),(base+stride//4,peak),
                     (base+stride//2,0),(base+3*stride//4,-peak)])
    keys.append((240,0))
    return keys


def rise(peak):
    return [(0,0),(30,peak*.5),(60,peak),(90,peak*.5),(120,0),
            (150,peak*.5),(180,peak),(210,peak*.5),(240,0)]


def recoil(distance=3, pretravel=0):
    # Forward spool is -Y; true recoil travels +Y, opposite the muzzle direction.
    return [(0,0),(44,0),(52,-pretravel),(54,distance),(62,distance*.25),
            (76,0),(164,0),(172,-pretravel),(174,distance),
            (182,distance*.25),(196,0),(240,0)]


def get_motion(asset_name, part_id):
    """Return independent fresh channel lists; unknown asset/part is stationary."""
    if asset_name == "RelicMarshal":
        if part_id == "Torso":
            return {"Location.Z":rise(.65),"Rotation.Z":wave(.6),"Rotation.X":wave(.45,2)}
        if part_id == "Head":
            return {"Rotation.Z":[(0,0),(36,0),(72,-9),(108,-9),
                                  (144,0),(180,9),(216,4),(240,0)]}
        if part_id.startswith("UpperArm"):
            sign=1 if part_id.endswith("L") else -1
            return {"Rotation.X":wave(sign*1.8,2),"Rotation.Y":wave(sign*.7)}
        if part_id.startswith("Forearm"):
            if part_id.endswith("R"):
                return {"Rotation.X":[(0,0),(44,0),(52,-4),(54,4),
                                      (70,0),(164,0),(172,-4),(174,4),(190,0),(240,0)]}
            return {"Rotation.X":wave(-1.2,2)}
        if part_id.startswith("Hand"):
            return {"Rotation.X":wave(.8,2)}
        if part_id.startswith("Thigh"):
            return {"Rotation.X":wave(.8 if part_id.endswith("L") else -.8,2)}
        if part_id.startswith("Shin"):
            return {"Rotation.X":wave(-.6 if part_id.endswith("L") else .6,2)}
        if part_id.startswith("Foot"):
            return {"Rotation.X":wave(-.2 if part_id.endswith("L") else .2,2)}
        if part_id == "Weapon":
            return {"Location.Y":recoil(2.8,.7)}
    elif asset_name == "GearlingSentinel":
        if part_id == "GearlingHull":
            return {"Location.Z":rise(.45),"Rotation.X":wave(.6,2)}
        if part_id in ("WheelL","WheelR"):
            # Both axle vectors are world X: same roll means coherent forward travel.
            return {"Rotation.X":[(f,720*f/240) for f in range(0,241,30)]}
        if part_id == "Turret":
            return {"Rotation.Z":wave(14),"Location.Y":recoil(1.3,.35)}
    elif asset_name == "RustCrawler":
        if part_id == "Chassis":
            return {"Location.Z":rise(.4),"Rotation.X":wave(.45,4)}
        if part_id == "Turret":
            return {"Rotation.Z":wave(11),"Rotation.X":wave(.7,2)}
        if part_id == "Cannon":
            return {"Location.Y":recoil(4,1)}
        # A whole capsule track must not rotate like a wheel. Individual links
        # require a later belt driver; the rigid track group remains stationary.
    elif asset_name == "ArcWarden":
        if part_id == "Pelvis":
            return {"Location.Z":rise(.8),"Rotation.Z":wave(.6)}
        if part_id == "Torso":
            return {"Rotation.X":wave(.55,2)}
        if part_id == "Head":
            return {"Rotation.Z":wave(7)}
        if part_id.startswith("Arm_"):
            return {"Rotation.X":wave(1.1 if part_id.endswith("L") else -.7,2)}
        if part_id == "Shield_R":
            return {"Rotation.Z":wave(1.4),"Rotation.X":wave(.7,2)}
        if part_id == "Cannon_L":
            return {"Location.Y":recoil(3.2,.7)}
    elif asset_name == "ForgeColossus":
        if part_id == "Pelvis":
            # Entire model rises together; feet only hover a few cm for inspection.
            return {"Location.Z":rise(5),"Rotation.Z":wave(1.1)}
        if part_id == "Torso":
            return {"Rotation.X":wave(.55,2)}
        if part_id == "Head":
            return {"Rotation.Z":wave(5)}
        if part_id.startswith("UpperArm_"):
            return {"Rotation.X":wave(1.3 if part_id.endswith("L") else -1.3,2),
                    "Rotation.Y":wave(.8 if part_id.endswith("L") else -.8)}
        if part_id.startswith("Forearm_"):
            return {"Rotation.X":wave(-1.2,2)}
        if part_id.startswith("Leg_"):
            return {"Rotation.X":wave(.8 if part_id.endswith("L") else -.8,2)}
        if part_id.startswith("Jet_"):
            return {"Rotation.X":wave(1.8,2),
                    "Rotation.Y":wave(1.1 if part_id.endswith("L") else -1.1)}
        if part_id.startswith("Cannon_"):
            return {"Location.Y":recoil(7,1.8),"Rotation.X":wave(.5,2)}
    elif asset_name == "ArticulatedServiceArm":
        if part_id == "base":
            return {"Rotation.Z":wave(3)}
        if part_id == "shoulder":
            # The 252cm boom lies along -Y; roll raises it around the shoulder X axle.
            return {"Rotation.X":[(0,0),(30,0),(66,-5),(96,-5),(126,0),
                                  (156,3),(186,3),(216,0),(240,0)]}
        if part_id == "forearm":
            # Small counter-flex avoids the impression of a single rigid crane.
            return {"Rotation.X":[(0,0),(30,0),(66,8),(96,8),(126,0),
                                  (156,-4),(186,-4),(216,0),(240,0)]}
        if part_id == "claw":
            # There is one modeled claw assembly, not independently modeled jaws;
            # rotate the tool wrist instead of inventing nonexistent gripper joints.
            return {"Rotation.X":[(0,0),(54,0),(78,-6),(96,-6),(120,0),
                                  (162,0),(180,5),(198,5),(222,0),(240,0)],
                    "Rotation.Z":wave(3)}
    elif asset_name == "RelicLauncher":
        if part_id == "turret":
            return {"Rotation.Z":[(0,0),(30,-5),(54,-5),(90,0),
                                  (150,5),(174,5),(210,0),(240,0)]}
        if part_id == "yoke":
            return {"Rotation.Z":wave(1.2),
                    "Rotation.X":[(0,0),(36,-2),(54,-2),(84,0),
                                  (156,-2),(174,-2),(204,0),(240,0)]}
        if part_id == "barrels":
            # Axis is local Y because geometry was rolled 90deg from native Z.
            return {"Rotation.Y":[(f,720*f/240) for f in range(0,241,30)],
                    "Location.Y":recoil(5,1)}
    elif asset_name == "PressureVessel" and part_id == "fan":
        # Exposed fan lies in XZ, axle faces -Y: pitch/Y rotation, never roll/X.
        return {"Rotation.Y":[(f,1440*f/240) for f in range(0,241,30)]}
    return {}
