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
        # One legible sequence: settle -> aim/fire -> recover -> impact/brace ->
        # victorious weapon lift -> settle. Upper-body joints share its cadence.
        if part_id == "Torso":
            return {"Location.Z":rise(.7),
                    "Rotation.X":[(0,0),(30,0),(48,-1),(72,-1),(90,0),
                                  (104,0),(108,3),(118,-1.5),(136,0),(156,-1),
                                  (180,-1),(208,0),(240,0)],
                    "Rotation.Z":[(0,0),(30,0),(48,-2),(72,-2),(90,0),
                                  (136,0),(156,-3),(180,-3),(208,0),(240,0)]}
        if part_id == "Head":
            return {"Rotation.Z":[(0,0),(18,5),(32,0),(48,-5),(72,-5),
                                  (90,0),(108,2),(136,0),(156,-4),(180,-4),(208,0),(240,0)],
                    "Rotation.X":[(0,0),(104,0),(108,3),(120,0),(150,0),
                                  (168,-3),(180,-3),(208,0),(240,0)]}
        if part_id.startswith("UpperArm"):
            if part_id.endswith("R"):
                return {"Rotation.X":[(0,0),(30,0),(48,-8),(52,-8),(55,-6),
                                      (64,-8),(72,-8),(90,0),(104,0),(118,-6),
                                      (136,0),(156,-24),(180,-24),(208,0),(240,0)]}
            return {"Rotation.X":[(0,0),(36,0),(48,-3),(72,-3),(90,0),
                                  (104,0),(118,-9),(136,0),(156,-6),(180,-6),(208,0),(240,0)],
                    "Rotation.Y":[(0,0),(136,0),(156,4),(180,4),(208,0),(240,0)]}
        if part_id.startswith("Forearm"):
            if part_id.endswith("R"):
                return {"Rotation.X":[(0,0),(30,0),(48,-26),(52,-26),(55,-23),
                                      (64,-26),(72,-26),(90,0),(104,0),(118,-12),
                                      (136,0),(156,-32),(180,-32),(208,0),(240,0)]}
            return {"Rotation.X":[(0,0),(36,0),(48,-7),(72,-7),(90,0),
                                  (104,0),(118,-16),(136,0),(156,-10),(180,-10),(208,0),(240,0)]}
        if part_id.startswith("Hand"):
            return {"Rotation.X":[(0,0),(104,0),(118,-3),(136,0),(240,0)]}
        if part_id.startswith("Thigh"):
            return {"Rotation.X":wave(.8 if part_id.endswith("L") else -.8,2)}
        if part_id.startswith("Shin"):
            return {"Rotation.X":wave(-.6 if part_id.endswith("L") else .6,2)}
        if part_id.startswith("Foot"):
            return {"Rotation.X":wave(-.2 if part_id.endswith("L") else .2,2)}
        if part_id == "Weapon":
            # Counter-rotation keeps the crossbow facing forward as the arm aims;
            # the victorious pose deliberately raises the complete assembly.
            return {"Location.Y":[(0,0),(48,0),(52,-.7),(55,4.2),(63,1),
                                  (72,0),(240,0)],
                    "Rotation.X":[(0,0),(30,0),(48,34),(52,34),(55,29),
                                  (64,34),(72,34),(90,0),(104,0),(118,18),
                                  (136,0),(156,30),(180,30),(208,0),(240,0)]}
    elif asset_name == "AegisVanguard":
        if part_id == "Torso":
            return {"Location.Z":rise(.8),
                    "Rotation.X":[(0,0),(54,0),(72,-1),(108,-1),(138,0),
                                  (162,2),(174,-1.5),(204,0),(240,0)]}
        if part_id == "Head":
            return {"Rotation.Z":[(0,0),(36,-5),(72,0),(108,3),(138,0),(240,0)]}
        if part_id == "UpperArmL":
            return {"Rotation.X":[(0,0),(54,0),(72,-3),(108,-3),(138,0),
                                  (162,-6),(186,-6),(216,0),(240,0)]}
        if part_id == "ForearmL":
            return {"Rotation.X":[(0,0),(54,0),(72,-12),(108,-12),(138,0),
                                  (162,-18),(186,-18),(216,0),(240,0)]}
        if part_id == "Shield":
            return {"Rotation.X":[(0,0),(54,0),(72,10),(108,10),(138,0),
                                  (162,14),(186,14),(216,0),(240,0)],
                    "Location.Y":[(0,0),(154,0),(162,-2),(166,2),(174,0),(240,0)]}
        if part_id == "UpperArmR":
            return {"Rotation.X":[(0,0),(24,0),(42,-8),(96,-8),(126,0),(240,0)]}
        if part_id == "ForearmR":
            return {"Rotation.X":[(0,0),(24,0),(42,-20),(96,-20),(126,0),(240,0)]}
        if part_id == "Weapon":
            return {"Rotation.X":[(0,0),(24,0),(42,28),(96,28),(126,0),(240,0)],
                    "Location.Y":[(0,0),(48,0),(52,4),(58,0),(72,0),(76,4),(82,0),(240,0)]}
        if part_id == "CannonRotor":
            # Gatling cassette rotates around the actual front-facing Y axle.
            return {"Rotation.Y":[(0,0),(24,0),(42,120),(96,840),(126,1080),(240,1080)]}
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
        # Staged presentation, not constant limb flapping: scan, brace/cannon
        # burst, recover, jet lift with folded legs, rocket salvo, power down.
        if part_id == "Pelvis":
            return {"Location.Z":[(0,0),(120,0),(130,9),(145,36),(178,36),
                                  (190,26),(206,7),(216,0),(240,0)],
                    "Rotation.Z":[(0,0),(30,-1.5),(42,-1.5),(90,0),
                                  (120,0),(145,1.5),(178,1.5),(216,0),(240,0)]}
        if part_id == "Torso":
            return {"Rotation.X":[(0,0),(30,0),(46,-1.5),(54,-1.5),(57,-.6),
                                  (64,-1.5),(67,-.6),(76,-1.5),(79,-.6),
                                  (100,0),(132,0),(146,-1),(178,-1),(208,0),(240,0)]}
        if part_id == "Head":
            return {"Rotation.Z":[(0,0),(26,-6),(46,-6),(82,0),(104,5),
                                  (120,0),(146,-4),(166,4),(184,4),(216,0),(240,0)],
                    "Rotation.X":[(0,0),(132,0),(148,2),(178,2),(208,0),(240,0)]}
        if part_id.startswith("UpperArm_"):
            return {"Rotation.X":[(0,0),(30,0),(46,-5),(82,-5),(104,0),
                                  (132,0),(148,2),(178,2),(208,0),(240,0)],
                    "Rotation.Y":[(0,0),(30,0),(46,2 if part_id.endswith("L") else -2),
                                  (82,2 if part_id.endswith("L") else -2),(104,0),(240,0)]}
        if part_id.startswith("Forearm_"):
            return {"Rotation.X":[(0,0),(30,0),(46,-7),(82,-7),(104,0),
                                  (132,0),(148,-3),(178,-3),(208,0),(240,0)]}
        if part_id.startswith("Leg_"):
            # Legs fold only after root clearance increases; both unfold before
            # the last 0cm root key so the original feet return to their ground.
            return {"Rotation.X":[(0,0),(120,0),(132,-3),(146,-10),(178,-10),
                                  (190,-7),(206,-1),(214,0),(240,0)]}
        if part_id.startswith("Jet_"):
            return {"Rotation.X":[(0,0),(120,0),(132,3),(146,2),(178,2),
                                  (192,1),(210,0),(240,0)]}
        if part_id.startswith("Cannon_"):
            delay=0 if part_id.endswith("L") else 3
            kick=[(0,0),(40,0),(46,-1.8)]
            for f in(54,66,78):
                kick.extend([(f+delay,9),(f+delay+3,2),(f+delay+7,0)])
            kick.extend([(104,0),(240,0)])
            return {"Location.Y":kick,
                    "Rotation.X":[(0,0),(30,0),(46,13.5),(82,13.5),(104,0),
                                  (132,0),(148,2),(178,2),(208,0),(240,0)]}
        if part_id.startswith("RocketPod_"):
            delay=0 if part_id.endswith("L") else 6
            return {"Rotation.X":[(0,0),(126,0),(145,9),(178,9),(202,0),(240,0)],
                    "Rotation.Z":[(0,0),(126,0),(145,3 if part_id.endswith("L") else -3),
                                  (178,3 if part_id.endswith("L") else -3),(202,0),(240,0)],
                    "Location.Y":[(0,0),(149+delay,0),(152+delay,3.5),
                                  (157+delay,0),(163+delay,0),(166+delay,3.5),
                                  (171+delay,0),(196,0),(240,0)]}
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
