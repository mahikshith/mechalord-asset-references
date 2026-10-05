"""Fresh, deterministic native-world construction specs; no Unreal calls/imports.

Centimetres, front -Y, Z up. Shape p and part pivots are absolute asset-space
coordinates. r always means named Unreal [pitch, yaw, roll], never positional
Rotator construction. Tube/cone native Z is centred; roll=90 points it toward -Y.
Each part is a deliberately modelled assembly, not a separate actor per shape.
The builder converts shapes to pivot-local space and preserves articulation.
"""
from math import cos, sin, pi

ART_DIRECTION = {
    "palette": "Dark blue slate floors, warm bronze structure, teal machinery; ivory confined to small armour plates.",
    "floor": "Continuous dark deck, thin raised maintenance hatches and noncoplanar engineered seams; no checkerboard tile grid.",
    "silhouette": "Octagonal suspended islands, offset tapered supports, vertical reactor banks and a broad citadel bowl.",
    "rhythm": "Asymmetrical large landmarks with quiet gaps; tiny random clutter is deliberately excluded.",
    "play_space": "Route centre remains open. Structural machinery sits outside the central +/-350cm travel strip.",
    "articulation": "Robot arm shoulder/forearm/claw, pressure-vessel turbine and launcher turret/barrels retain explicit pivots.",
    "camera": "Portrait overview places the commander near the lower quarter; separate oblique inspection views show real depth.",
    "scope": "Detailed native master meshes with rounded equipment, fasteners and hydraulic/conduit assemblies; mobile reduction follows visual acceptance.",
}


def shape(kind, mat, p, r=(0, 0, 0), **values):
    return dict(type=kind, mat=mat, p=list(p), r=list(r), **values)


def bevel(mat, p, size, edge=4, r=(0, 0, 0)):
    return shape("bevel", mat, p, r, size=list(size), bevel=edge)


def loft(mat, p, rings, segments=8, r=(0, 0, 0)):
    return shape("loft", mat, p, r, rings=[list(v) for v in rings], segments=segments)


def egg(mat, p, size, r=(0, 0, 0), segments=12, rings=6):
    return shape("ellipsoid", mat, p, r, size=list(size), segments=segments, rings=rings)


def tube(mat, p, outer, inner, length, r=(0, 0, 0), segments=12):
    return shape("tube", mat, p, r, outer=outer, inner=inner, length=length, segments=segments)


def cone(mat, p, bottom, top, length, r=(0, 0, 0), segments=8):
    return shape("cone", mat, p, r, radii=[bottom, top], length=length, segments=segments)


def part(name, shapes, pivot=(0, 0, 0), parent=None):
    return dict(id=name, parent=parent, pivot=list(pivot), shapes=shapes)


def distant_works_assets():
    """Architectural silhouettes, deliberately separated from the battle deck.

    These are single merged static assemblies. Tiered roofs, projecting service
    decks and broad volumes make an industrial skyline rather than a pole fence.
    """
    building = [
        # A continuous load-bearing core descends beyond the visible/fog layer.
        # The narrower section leaves a credible base overhang, without an
        # exposed floating building bottom. It remains in this merged master.
        loft("dark", (0, 0, 0), [(-5800, 225, 212, 0, 0),
             (-1550, 243, 220, 0, 0), (45, 267, 232, 0, 0)], 8),
        bevel("steel", (-258, 40, -2770), (54, 375, 5580), 12),
        bevel("steel", (258, 40, -2770), (54, 375, 5580), 12),
        bevel("bronze", (0, 0, -1120), (600, 516, 56), 10),
        bevel("bronze", (0, 0, -3240), (548, 484, 48), 9),
        bevel("dark", (0, 0, 155), (740, 640, 310), 32),
        loft("teal", (0, 0, 0), [(270, 325, 275, 0, 0),
             (1000, 300, 248, -28, 12), (1140, 242, 218, -52, 20)], 8),
        bevel("bronze", (-35, 12, 1080), (628, 550, 40), 12),
        bevel("dark", (-105, 65, 1400), (385, 365, 580), 27),
        loft("steel", (-105, 65, 0), [(1640, 198, 190, 0, 0),
             (1750, 150, 152, -28, 10), (1770, 148, 150, -28, 10)], 8),
        bevel("bronze", (0, 318, 675), (820, 240, 43), 12),
        bevel("dark", (185, -238, 1190), (360, 250, 165), 14),
        bevel("steel", (360, 20, 645), (92, 420, 590), 16),
        cone("teal", (266, 80, 1340), 95, 80, 1060, segments=24),
        tube("bronze", (266, 80, 1830), 116, 70, 38, segments=24),
        cone("dark", (266, 80, 1880), 74, 65, 63, segments=24),
    ]
    # Architectural glazing is small and non-emissive; machinery remains the focus.
    for z in (470, 840):
        for x in (-200, -62, 76):
            building += [bevel("dark", (x, 273, z), (100, 19, 120), 5),
                         bevel("cyan", (x, 285, z), (77, 10, 88), 3)]
    for x in (-325, 325):
        building += [bevel("bronze", (x, 270, 650), (32, 48, 730), 5),
                     tube("steel", (x, 270, 696), 13, 8, 900, segments=24)]
    for z in (334, 1000, 1530):
        building += [bevel("steel", (-100, 260 if z < 1200 else 254, z),
                           (420 if z < 1200 else 220, 22, 23), 4)]
    # The forward service deck has a real perimeter, with openings near its centre.
    for x in (-345, -160, 170, 350):
        building.append(tube("bronze", (x, 402, 741), 10, 6, 115, segments=16))
    for x in (-255, 260):
        building.append(tube("steel", (x, 402, 798), 9, 5, 194,
                             r=(0, 90, 90), segments=16))
    # Rear heat-exchanger slats silhouette from the oblique inspection view.
    for z in range(410, 890, 80):
        building.append(bevel("steel", (-325, -8, z), (35, 310, 18), 3))

    gallery = [bevel("dark", (0, 0, 0), (2200, 270, 95), 17),
               bevel("steel", (0, 0, 235), (2200, 270, 63), 12),
               bevel("teal", (0, 0, 130), (2140, 214, 170), 14)]
    # Two offset chambers and strong end trusses, not evenly repeated pillars.
    for x, y, z, width in ((-745, -25, 215, 425), (650, 30, 300, 520)):
        gallery += [bevel("dark", (x, y, z), (width, 345, 330), 23),
                    bevel("bronze", (x, y, z + 181), (width + 70, 400, 32), 7)]
    for x in (-1020, 1020):
        gallery += [bevel("bronze", (x, 0, -275), (112, 210, 460), 15),
                    bevel("steel", (x * .86, 0, -160), (390, 125, 45), 5,
                          r=(35 if x > 0 else -35, 0, 0)),
                    # Integral end piers meet the gallery's existing trusses
                    # and continue below the fog, instead of hanging in space.
                    loft("dark", (x, 0, 0), [(-7000, 93, 130, 0, 0),
                         (-1900, 79, 119, 0, 0), (-380, 79, 106, 0, 0)], 8),
                    bevel("bronze", (x, 0, -1640), (200, 294, 42), 8),
                    bevel("steel", (x, 0, -3600), (193, 282, 36), 7)]
    for x in (-400, -170, 80, 320):
        gallery.append(bevel("cyan", (x, 116, 126), (145, 12, 67), 4))
    for x in (-1090, 1090):
        gallery.append(tube("steel", (x, -7, 160), 28, 18, 480, segments=24))
    return [asset("DistantFoundryWorks", "Tiered foundry and service-stack skyline", 7712,
                  [part("architecture", building)]),
            asset("DistantTransferGallery", "Elevated industrial transfer gallery", 7497,
                  [part("architecture", gallery)])]


def asset(name, label, height, parts, category="environment"):
    return dict(name=name, label=label, category=category, height_cm=height, parts=parts)


def fastener(p, radius=4, r=(0, 0, 0), mat="steel"):
    return cone(mat, p, radius, radius, 3.5, r=r, segments=6)


def hatch(x, y, width, depth, top=.8):
    # A shallow frame and inset sit at different heights above the original deck.
    # No second full-size floor cap or coplanar broad surface is introduced.
    items = [bevel("steel", (x, y, top - .35), (width, depth, .7), 3),
             bevel("dark", (x, y, top + .18), (width - 13, depth - 13, .65), 2),
             bevel("bronze", (x + width * .31, y, top + .7), (7, 34, 1.4), 2)]
    for dx in (-width * .43, width * .43):
        for dy in (-depth * .43, depth * .43):
            items.append(fastener((x + dx, y + dy, top + 1.8), 3.2))
    return items


def rail_run(x, y, length, z=0):
    # Real round-section posts, sockets and two separated bars. Short modules
    # leave deliberate inspection gaps instead of an uninterrupted fence.
    items = []
    for dy in (-length * .43, length * .43):
        items += [bevel("bronze", (x, y + dy, z + 4), (35, 38, 8), 4),
                  cone("steel", (x, y + dy, z + 53), 5.5, 5.5, 98, segments=16),
                  tube("bronze", (x, y + dy, z + 88), 9, 5.5, 12, segments=16)]
        for dx in (-10, 10):
            items.append(fastener((x + dx, y + dy, z + 10), 3))
    for height, radius in ((101, 5.5), (55, 3.5)):
        items.append(tube("steel", (x, y, z + height), radius, max(1, radius - 1.6), length,
                          r=(0, 0, 90), segments=20))
    return items


def enrich_assets(assets):
    """Engineered detail on the same part graph, preserving layouts and cameras."""
    by_name = {a["name"]: a for a in assets}
    deck = by_name["SuspendedIsland"]["parts"][0]["shapes"]
    deck += hatch(-232, 78, 182, 226) + hatch(227, -95, 154, 190)
    # Inboard of the octagonal edge and entirely outside the central +/-350cm.
    deck += rail_run(-479, 10, 188) + rail_run(474, -44, 144)
    for x, y, length in ((-355, -115, 190), (354, 80, 150)):
        deck.append(bevel("steel", (x, y, .28), (3.5, length, .56), 1))
    for side in (-1, 1):
        for y in (-180, 140):
            deck.append(bevel("steel", (side * 430, y, -44), (150, 42, 45), 5))
            for dz in (-60, -36):
                deck.append(fastener((side * 510, y + 22, dz), 6, r=(0, 0, 90)))
    by_name["SuspendedIsland"]["height_cm"] = 223
    joint = by_name["SpineConnector"]["parts"][0]["shapes"]
    joint += hatch(-210, 25, 135, 152, top=-.2)
    # Outboard brackets support rails without narrowing the original route.
    for side in (-1, 1):
        joint.append(bevel("steel", (side * 365, 0, -17), (72, 220, 24), 4))
        joint += rail_run(side * 365, -23 if side < 0 else 30, 228 if side < 0 else 156, z=-1)
    by_name["SpineConnector"]["height_cm"] = 151
    support = by_name["TaperedButtress"]["parts"][0]["shapes"]
    for side in (-1, 1):
        support += [tube("bronze", (42, side * 82, -182), 22, 13, 220, segments=24),
                    cone("steel", (57, side * 82, -356), 10, 10, 264, segments=24),
                    tube("steel", (42, side * 82, -91), 27, 21, 14, segments=24),
                    tube("steel", (42, side * 82, -275), 27, 21, 14, segments=24),
                    bevel("dark", (45, side * 82, -423), (72, 45, 58), 6)]
        for x in (-22, 22):
            support.append(fastener((45 + x, side * 106, -423), 5, r=(0, 0, 90)))
    trench = by_name["SunkenRoute"]["parts"][0]["shapes"]
    trench += hatch(-251, 112, 192, 306) + hatch(260, -210, 155, 236)
    for side in (-1, 1):
        trench += rail_run(side * 495, -295 if side < 0 else 270, 205)
        trench += [tube("bronze", (side * 510, 0, 55), 11, 6, 980, r=(0, 0, 90), segments=24)]
        for y in (-410, -190, 150, 410):
            trench += [bevel("steel", (side * 503, y, 54), (42, 17, 40), 3),
                       fastener((side * 503, y - 12, 61), 4, r=(0, 0, 90))]
    bank = by_name["ReactorBank"]["parts"][0]["shapes"]
    bank += [bevel("dark", (-147, -105, 227), (28, 280, 250), 8),
             bevel("steel", (-156, -255, 226), (19, 18, 254), 3),
             bevel("steel", (-156, 45, 226), (19, 18, 254), 3)]
    for z in range(126, 340, 27):
        bank.append(bevel("steel", (-165, -105, z), (18, 274, 8), 2))
    for y in (-255, 45):
        for z in (122, 226, 336):
            bank.append(fastener((-172, y, z), 5, r=(90, 0, 0)))
    bank += [tube("bronze", (19, -450, 332), 17, 10, 430, segments=24),
             tube("steel", (19, -450, 127), 22, 17, 13, segments=24),
             tube("steel", (19, -450, 532), 22, 17, 13, segments=24)]
    tank = by_name["PressureVessel"]["parts"][0]["shapes"]
    tank += [tube("bronze", (141, 12, 258), 14, 8, 314, segments=32),
             tube("steel", (141, 12, 112), 23, 14, 18, segments=24),
             tube("steel", (141, 12, 404), 23, 14, 18, segments=24),
             tube("bronze", (-40, -104, 402), 31, 20, 20, r=(0, 0, 90), segments=32),
             egg("dark", (-40, -120, 402), (39, 9, 39), segments=24, rings=12)]
    for i in range(8):
        a = i * pi / 4
        tank.append(fastener((cos(a) * 61, -151, 240 + sin(a) * 61), 4.5, r=(0, 0, 90)))
    stack = by_name["CoolingStack"]["parts"][0]["shapes"]
    for z in (105, 150, 195, 240):
        stack += [bevel("dark", (0, -103, z), (102, 16, 27), 3),
                  bevel("steel", (0, -114, z), (96, 8, 7), 2)]
    stack += [tube("bronze", (145, 0, 228), 16, 9, 318, segments=24),
              bevel("steel", (144, 0, 70), (62, 61, 21), 4),
              bevel("steel", (144, 0, 384), (62, 61, 21), 4)]
    arm = by_name["ArticulatedServiceArm"]
    arm["parts"][0]["shapes"] += [tube("steel", (0, 0, 83), 82, 70, 13, segments=24)]
    for i in range(8):
        a = i * pi / 4
        arm["parts"][0]["shapes"].append(fastener((cos(a) * 79, sin(a) * 79, 53), 5))
    arm["parts"][1]["shapes"] += [tube("dark", (37, -124, 241), 8, 4, 180, r=(0, 0, 90), segments=20)]
    arm["parts"][2]["shapes"] += [tube("bronze", (24, -309, 278), 11, 6, 110, r=(0, 0, 45), segments=24),
                                   cone("steel", (24, -355, 324), 6, 6, 81, r=(0, 0, 45), segments=24)]
    gate = by_name["RelicGate"]["parts"][0]["shapes"]
    for side in (-1, 1):
        for z in (128, 237, 336):
            gate.append(bevel("steel", (side * 411, 0, z), (102, 144, 18), 5))
        for z in (183, 290):
            gate += [bevel("bronze", (side * 405, -70, z), (68, 17, 56), 5),
                     bevel("dark", (side * 405, -81, z), (46, 9, 34), 3)]
            for x in (-22, 22):
                gate.append(fastener((side * 405 + x, -90, z), 4, r=(0, 0, 90)))
    for x in (-335, -230, -110, 110, 230, 335):
        gate.append(fastener((x, -62, 423), 6, r=(0, 0, 90)))
    arena = by_name["CitadelBowl"]["parts"][0]["shapes"]
    arena += hatch(-510, 255, 255, 335) + hatch(510, -450, 228, 310)
    for x, y, length in ((-865, 25, 220), (858, -80, 190), (-848, -460, 150)):
        arena += rail_run(x, y, length)
    for x in (-740, 740):
        arena.append(bevel("steel", (x, -150, .3), (4, 340, .6), 1))
    door = by_name["ReactorBulkhead"]["parts"][0]["shapes"]
    for side in (-1, 1):
        for z in (160, 300, 720, 850):
            door += [bevel("steel", (side * 200, -175, z), (62, 18, 64), 6),
                     fastener((side * 200, -188, z), 8, r=(0, 0, 90))]
    launcher = by_name["RelicLauncher"]
    launcher["parts"][0]["shapes"] += [bevel("dark", (0, 88, 82), (83, 15, 28), 3)]
    for x in (-31, -16, 0, 16, 31):
        launcher["parts"][0]["shapes"].append(bevel("steel", (x, 98, 82), (5, 9, 26), 1))
    for x in (-55, 55):
        for y in (-78, -28):
            launcher["parts"][0]["shapes"].append(fastener((x, y, 100), 4))
    # Keep architecture octagonal, but render round machinery as round machinery.
    for a in assets:
        for p in a["parts"]:
            for s in p["shapes"]:
                if s["type"] in ("tube", "cone") and s.get("segments", 0) > 6:
                    s["segments"] = max(24, s["segments"])
                elif s["type"] == "ellipsoid":
                    s["segments"] = max(24, s["segments"])
                    s["rings"] = max(12, s["rings"])
                elif s["type"] == "loft" and a["name"] in ("PressureVessel", "CoolingStack"):
                    s["segments"] = 32
    return assets


def get_assets():
    assets = []
    # Wide quiet top, faceted underside and readable bronze rim: a floating island.
    deck = [loft("dark", (0, 0, 0), [(-112, 400, 392, 0, 0), (-84, 540, 500, 0, 0),
            (-24, 570, 520, 0, 0), (-8, 550, 504, 0, 0), (0, 550, 504, 0, 0)]),
            loft("bronze", (0, 0, 0), [(-29, 574, 523.2, 0, 0), (-18, 574, 523.2, 0, 0)])]
    for side in (-1, 1):
        for y in (-230, 190):
            deck += [bevel("teal", (side * 515, y, 7), (22, 155, 14), 3),
                     bevel("bronze", (side * 525, y, -54), (38, 170, 54), 5)]
    assets.append(asset("SuspendedIsland", "Suspended octagonal deck island", 126, [part("island", deck)]))
    connector = [bevel("dark", (0, 0, -25), (700, 480, 48), 16)]
    for x in (-342, 342):
        connector += [bevel("bronze", (x, 0, -8), (18, 465, 38), 4),
                      bevel("teal", (x, 0, 16), (12, 250, 12), 3)]
    assets.append(asset("SpineConnector", "Sculpted narrow suspension joint", 62, [part("joint", connector)]))
    buttress = [loft("steel", (0, 0, 0), [(-520, 38, 42, 72, 0), (-360, 50, 52, 48, 0),
                (-190, 77, 70, 20, 0), (-35, 110, 95, 0, 0)], segments=6),
                bevel("bronze", (0, 0, -45), (250, 205, 48), 10),
                bevel("dark", (56, 0, -382), (135, 145, 28), 8),
                loft("teal", (0, 0, 0), [(-350, 18, 20, 48, -54), (-90, 18, 20, 8, -82)], segments=6)]
    assets.append(asset("TaperedButtress", "Offset tapered suspension buttress", 520, [part("support", buttress)]))
    trench = [bevel("dark", (0, 0, -36), (1040, 1100, 72), 18)]
    for x in (-485, 485):
        trench += [bevel("rust", (x, 0, 38), (58, 1070, 76), 7),
                   bevel("cyan", (x - (14 if x > 0 else -14), 0, 79), (9, 620, 7), 2)]
    assets.append(asset("SunkenRoute", "Continuous sunken reactor route", 154, [part("trench", trench)]))
    bank = [loft("dark", (0, 0, 0), [(0, 110, 470, 0, 0), (350, 120, 465, -12, 0),
            (560, 80, 400, -35, -20), (620, 52, 330, -40, -30)], segments=8),
            bevel("steel", (-118, -90, 240), (28, 400, 235), 8),
            bevel("bronze", (-127, -90, 380), (28, 420, 25), 4),
            bevel("teal", (-122, 220, 250), (32, 170, 370), 6),
            bevel("dark", (-145, 215, 250), (24, 130, 270), 5)]
    for z in (125, 225, 325):
        bank.append(bevel("cyan", (-161, 215, z), (7, 86, 10), 2))
    assets.append(asset("ReactorBank", "Faceted vertical reactor retaining bank", 620, [part("bank", bank)]))
    tank = [loft("steel", (0, 0, 0), [(0, 108, 100, 0, 0), (40, 128, 120, 0, 0),
            (410, 116, 110, 12, 0), (530, 66, 64, 16, 0)], segments=12),
            egg("teal", (14, 0, 495), (150, 150, 100)),
            tube("bronze", (0, 0, 76), 135, 112, 24),
            tube("bronze", (12, 0, 388), 127, 110, 24),
            bevel("dark", (0, -110, 230), (96, 45, 160), 8),
            egg("amber", (0, -138, 240), (58, 12, 58))]
    rotor = [cone("bronze", (0, -144, 240), 19, 15, 24, r=(0, 0, 90))]
    for i in range(6):
        a = i * pi / 3
        rotor.append(egg("steel", (cos(a) * 38, -143, 240 + sin(a) * 38), (48, 10, 17), r=(-i * 60, 0, 0)))
    assets.append(asset("PressureVessel", "Offset pressure vessel with exposed fan", 545,
        [part("vessel", tank), part("fan", rotor, (0, -144, 240), "vessel")]))
    cooling = [loft("steel", (0, 0, 0), [(0, 125, 100, 0, 0), (320, 104, 90, 0, 0),
               (430, 135, 120, 0, 0), (460, 100, 85, 0, 0)], segments=8),
               tube("dark", (0, 0, 432), 138, 101, 32)]
    for z in (95, 155, 215, 275):
        cooling.append(tube("bronze", (0, 0, z), 125 - z * .045, 96 - z * .025, 12, segments=8))
    cooling += [bevel("teal", (-105, -15, 120), (22, 96, 100), 4),
                bevel("amber", (-118, -35, 132), (8, 38, 52), 2)]
    assets.append(asset("CoolingStack", "Flared open cooling stack", 460, [part("stack", cooling)]))
    arm_base = [loft("dark", (0, 0, 0), [(0, 105, 95, 0, 0), (50, 92, 82, 0, 0),
                (175, 65, 60, 0, 0), (210, 54, 50, 0, 0)], segments=8),
                tube("bronze", (0, 0, 48), 104, 80, 18), egg("teal", (0, 0, 207), (102, 100, 86))]
    upper = [egg("bronze", (0, 0, 225), (82, 90, 82)),
             bevel("steel", (0, -128, 225), (48, 240, 48), 8),
             bevel("teal", (0, -128, 256), (24, 174, 13), 3),
             egg("bronze", (0, -252, 225), (76, 76, 76))]
    fore = [bevel("steel", (0, -318, 288), (36, 180, 40), 6, r=(0, 0, -45)),
            bevel("bronze", (0, -318, 288), (52, 112, 16), 4, r=(0, 0, -45)),
            egg("teal", (0, -382, 353), (62, 65, 62))]
    tool = [bevel("dark", (0, -400, 353), (65, 50, 50), 6)]
    for x in (-32, 32):
        tool += [bevel("bronze", (x, -430, 348), (15, 85, 25), 4),
                 bevel("steel", (x * .7, -470, 333), (26, 26, 42), 3)]
    tool.append(egg("cyan", (0, -463, 353), (17, 22, 17)))
    assets.append(asset("ArticulatedServiceArm", "Four-part articulated maintenance arm", 388,
        [part("base", arm_base), part("shoulder", upper, (0, 0, 225), "base"),
         part("forearm", fore, (0, -252, 225), "shoulder"), part("claw", tool, (0, -382, 353), "forearm")]))
    gate = []
    for side in (-1, 1):
        gate += [loft("dark", (side * 415, 0, 0), [(0, 62, 83, 0, 0), (75, 53, 70, 0, 0),
                 (330, 43, 62, -side * 15, 0), (425, 32, 54, -side * 32, 0)], segments=6),
                 bevel("bronze", (side * 418, 0, 70), (132, 145, 24), 7),
                 bevel("cyan", (side * 380, -42, 272), (14, 13, 198), 3)]
    gate += [bevel("steel", (0, 0, 423), (804, 116, 64), 18),
             bevel("teal", (0, -61, 419), (305, 15, 58), 7),
             egg("amber", (0, -74, 421), (92, 15, 44)),
             loft("bronze", (0, 0, 0), [(443, 55, 46, 0, 0), (495, 18, 24, 0, 0)], segments=6)]
    assets.append(asset("RelicGate", "Faceted relic arch with clear open passage", 495, [part("arch", gate)]))
    door = [loft("dark", (0, 0, 0), [(0, 700, 150, 0, 0), (850, 635, 110, 0, 0),
            (1080, 450, 95, 0, 0)], segments=8)]
    for x in (-390, 390):
        door += [bevel("bronze", (x, -132, 470), (130, 80, 890), 18),
                 bevel("teal", (x, -179, 500), (55, 18, 610), 7)]
    door += [bevel("steel", (0, -133, 470), (525, 70, 895), 24),
             bevel("dark", (0, -174, 465), (390, 12, 730), 12),
             tube("bronze", (0, -204, 580), 133, 94, 28, r=(0, 0, 90), segments=12),
             egg("amber", (0, -222, 580), (140, 18, 140))]
    assets.append(asset("ReactorBulkhead", "Massive sealed reactor bulkhead", 1080, [part("bulkhead", door)]))
    citadel = [loft("dark", (0, 0, 0), [(-190, 900, 1120, 0, 0), (-115, 1090, 1320, 0, 0),
               (-18, 1070, 1300, 0, 0), (0, 1040, 1270, 0, 0)], segments=12),
               loft("bronze", (0, 0, 0), [(-100, 1096, 1326, 0, 0), (-75, 1096, 1326, 0, 0)], segments=12)]
    for x in (-880, 880):
        for y in (-550, 270):
            citadel += [bevel("bronze", (x, y, -8), (95, 225, 40), 10),
                        bevel("teal", (x - (42 if x > 0 else -42), y, 10), (20, 130, 18), 4)]
    assets.append(asset("CitadelBowl", "Broad twelve-sided citadel battle bowl", 218, [part("arena", citadel)]))
    spire = [loft("dark", (0, 0, 0), [(0, 105, 140, 0, 0), (420, 85, 95, 15, 0),
             (750, 58, 60, 35, -18), (940, 10, 16, 45, -35)], segments=6),
             bevel("bronze", (0, -112, 305), (50, 32, 390), 6),
             bevel("redglow", (15, -91, 615), (18, 13, 182), 3),
             tube("steel", (18, 0, 510), 95, 62, 22, segments=6)]
    assets.append(asset("CitadelSpire", "Leaning armored citadel spire", 940, [part("spire", spire)]))
    coil = [bevel("dark", (0, 0, 23), (185, 230, 46), 10),
            tube("bronze", (0, 0, 82), 71, 38, 78, r=(0, 0, 90), segments=16),
            tube("rubber", (0, 0, 82), 76, 59, 54, r=(0, 0, 90), segments=16),
            bevel("teal", (-73, 0, 54), (20, 140, 52), 5)]
    assets.append(asset("CableDrum", "Heavy cable drum and asymmetric cradle", 160, [part("drum", coil)]))
    # Four independently movable assemblies. Forward barrel lengths run -Y.
    chassis = [loft("dark", (0, 0, 0), [(0, 102, 122, 0, 0), (36, 111, 135, 0, 0),
               (90, 76, 91, 0, 0)], segments=8),
               bevel("ivory", (0, -58, 74), (143, 120, 48), 10),
               bevel("teal", (0, 60, 79), (127, 82, 48), 9)]
    for x in (-98, 98):
        for y in (-76, 76):
            chassis += [egg("rubber", (x, y, 33), (36, 69, 64)),
                        egg("bronze", (x * 1.16, y, 33), (12, 40, 40))]
    turret = [cone("bronze", (0, 0, 108), 65, 49, 34),
              egg("dark", (0, 0, 158), (128, 127, 106)),
              bevel("ivory", (0, 10, 192), (95, 98, 44), 9),
              egg("cyan", (0, -69, 164), (29, 12, 29))]
    yoke = [bevel("steel", (-57, -25, 164), (25, 77, 65), 6),
            bevel("steel", (57, -25, 164), (25, 77, 65), 6),
            egg("bronze", (-58, -44, 176), (28, 52, 52)),
            egg("bronze", (58, -44, 176), (28, 52, 52))]
    barrels = [tube("bronze", (0, -45, 176), 46, 28, 28, r=(0, 0, 90))]
    for i in range(4):
        a = pi / 4 + i * pi / 2
        x, z = cos(a) * 24, 176 + sin(a) * 24
        barrels += [tube("steel", (x, -127, z), 13, 7, 165, r=(0, 0, 90)),
                    tube("bronze", (x, -192, z), 16, 10, 25, r=(0, 0, 90)),
                    egg("cyan", (x, -211, z), (11, 7, 11))]
    assets.append(asset("RelicLauncher", "Relic-powered four-barrel siege launcher", 224,
        [part("chassis", chassis), part("turret", turret, (0, 0, 106), "chassis"),
         part("yoke", yoke, (0, -44, 176), "turret"),
         part("barrels", barrels, (0, -45, 176), "yoke")], "weapon"))
    assets += distant_works_assets()
    return enrich_assets(assets)


def place(asset_name, label, p, r=(0, 0, 0), scale=(1, 1, 1)):
    return dict(asset=asset_name, label=label, p=list(p), r=list(r), scale=list(scale))


def camera(name, p, target, fov):
    return dict(name=name, p=list(p), target=list(target), fov=fov, aspect=9 / 16)


def legion(z, y=280):
    # Static first-view staging; gameplay simulation will own real formations.
    units = [place("RelicMarshal", "Commander", (0, y, z))]
    for i, x in enumerate((-135, -45, 45, 135)):
        units.append(place("GearlingSentinel", "Legion_%02d" % i, (x, y + 135, z)))
    return units


def get_levels():
    levels = []
    p = legion(140)
    for i, (x, y) in enumerate(((0, 220), (-70, -860), (70, -1940), (0, -3020))):
        p.append(place("SuspendedIsland", "SkyIsland_%d" % i, (x, y, 140)))
        # Supports lean outward and are offset in depth, rather than paired rails.
        p.append(place("TaperedButtress", "LeftSuspension_%d" % i, (x - 490, y - 210, 105), r=(0, -18, 0)))
        p.append(place("TaperedButtress", "RightSuspension_%d" % i, (x + 490, y + 170, 105), r=(0, 162, 0)))
    for i, y in enumerate((-320, -1400, -2480)):
        p.append(place("SpineConnector", "SuspensionSpine_%d" % i, (0, y, 140)))
    p += [place("RelicGate", "SkyforgeRelicArch", (-20, -1030, 140)),
          place("ArticulatedServiceArm", "LeftBridgeMaintenance", (-805, -1270, 150), r=(0, -60, 0)),
          place("PressureVessel", "SkyPressureNorth", (900, -2480, -20)),
          place("CoolingStack", "SkyCoolingSouth", (-850, -450, 80), scale=(.85, .85, .85)),
          place("CableDrum", "SkyCableCradle", (700, -820, 135)),
          place("RelicLauncher", "SkyforgeLauncher", (-820, 180, 140), r=(0, 10, 0)),
          place("RustCrawler", "SkyScoutLeft", (-210, -1650, 140)),
          place("RustCrawler", "SkyScoutRight", (235, -2100, 140)),
          place("ArcWarden", "SkyforgeElite", (0, -2830, 140)),
          place("CitadelSpire", "FarSkyBeacon", (865, -3420, -10), scale=(.65, .65, .65))]
    levels.append(dict(name="SkyforgeViaduct", label="Skyforge Viaduct",
        description="Suspended octagonal islands overlap into a narrow spine. Offset buttresses, a lone maintenance arm and distant machinery reveal the height without fencing the battle route.",
        placements=p, cameras=[camera("SkyforgePortrait", (75, 1690, 1780), (0, -1030, 175), 34),
                              camera("SkyforgeOblique", (2150, 520, 1780), (-35, -1320, 20), 48)]))
    p = legion(-180, 290)
    for i, y in enumerate((220, -850, -1920)):
        p.append(place("SunkenRoute", "TrenchRun_%d" % i, (0, y, -180)))
    for i, (x, y, yaw) in enumerate(((700, -320, 0), (-720, -1000, 180), (730, -1760, 0), (-760, -2430, 180))):
        p.append(place("ReactorBank", "ReactorBank_%d" % i, (x, y, -80), r=(0, yaw, 0)))
    p += [place("PressureVessel", "TrenchMainPressure", (-1010, -260, -170), scale=(1.2, 1.2, 1.2)),
          place("CoolingStack", "TrenchExhaust", (1040, -1660, -180), scale=(1.3, 1.3, 1.3)),
          place("ArticulatedServiceArm", "TrenchRepairArm", (775, 100, -120), r=(0, 70, 0)),
          place("RelicGate", "TrenchRelicArch", (0, -1090, -180)),
          place("ReactorBulkhead", "SealedReactorDoor", (0, -2860, -180)),
          place("CableDrum", "TrenchCableOne", (-650, -1720, -150)),
          place("CableDrum", "TrenchCableTwo", (665, -2350, -150), r=(0, 35, 0)),
          place("RelicLauncher", "TrenchLauncher", (-730, 400, -150), r=(0, -12, 0)),
          place("RustCrawler", "TrenchScout", (-225, -690, -180)),
          place("ArcWarden", "TrenchSentinel", (230, -2080, -180))]
    levels.append(dict(name="ReactorTrench", label="Reactor Trench",
        description="A continuous dark route cuts below towering reactor banks. Different bank silhouettes alternate by position, while pressure equipment stays above and outside the playable trench.",
        placements=p, cameras=[camera("TrenchPortrait", (-80, 1700, 1500), (0, -980, -125), 34),
                              camera("TrenchLowSurvey", (-2050, 600, 700), (50, -1320, 60), 51)]))
    p = legion(170, 260)
    p += [place("SuspendedIsland", "CitadelArrival", (0, 190, 170)),
          place("SpineConnector", "CitadelThreshold", (0, -405, 170), scale=(1.12, 1.3, 1)),
          place("CitadelBowl", "CoreArena", (0, -1640, 170)),
          place("ForgeColossus", "CitadelBoss", (0, -2110, 170)),
          place("ArcWarden", "CitadelGuard", (-340, -1350, 170)),
          place("RustCrawler", "CitadelScout", (285, -930, 170)),
          place("RelicGate", "CitadelArrivalArch", (0, -570, 170)),
          place("RelicLauncher", "CitadelSiegeLauncher", (-720, 370, 170), r=(0, -7, 0)),
          place("ArticulatedServiceArm", "CitadelForgeArm", (1160, -1760, 170), r=(0, 45, 0)),
          place("PressureVessel", "CitadelFuelReservoir", (-1190, -2050, 0), scale=(1.45, 1.45, 1.45)),
          place("CoolingStack", "CitadelCoolingTower", (1170, -2710, 0), scale=(1.2, 1.2, 1.2)),
          place("ReactorBulkhead", "CitadelRearSeal", (0, -3220, 90), scale=(1.25, 1.1, 1.12))]
    for i, (x, y, size) in enumerate(((-970, -800, .8), (1070, -1080, .9), (-1080, -2790, 1.05), (1050, -3050, 1.15))):
        p.append(place("CitadelSpire", "CitadelSpire_%d" % i, (x, y, 120), r=(0, -12 if x < 0 else 18, 0), scale=(size, size, size)))
    for i, (x, y) in enumerate(((-520, 80), (490, -100), (-940, -2380))):
        p.append(place("TaperedButtress", "CitadelFoundation_%d" % i, (x, y, 130), r=(0, i * 110, 0), scale=(1.2, 1.2, 1.2)))
    levels.append(dict(name="CoreCitadel", label="Core Citadel",
        description="A narrow arrival opens into a heavy twelve-sided battle bowl. The giant boss anchors the far half, with asymmetric spires and a sealed rear reactor framing its silhouette instead of covering the lane.",
        placements=p, cameras=[camera("CitadelPortrait", (110, 1680, 1480), (0, -1110, 225), 37),
                              camera("CitadelBossThreeQuarter", (1780, -210, 1050), (0, -1770, 420), 47)]))
    # A shared gameplay floor reference: characters and deck tops are Z=0.
    # Preserve the deliberate suspended/sunken relationships and camera views.
    for level, ground in zip(levels, (140, -180, 170)):
        for placement in level["placements"]:
            placement["p"][2] -= ground
            if placement["asset"] in ("RustCrawler", "ArcWarden", "ForgeColossus", "ReactorBulkhead"):
                placement["r"][1] = (placement["r"][1] + 180) % 360
        for view in level["cameras"]:
            view["p"][2] -= ground
            view["target"][2] -= ground
        # Machinery is founded on independent towers descending into the fog,
        # rather than floating unsupported beside the battle route.
        for equipment in list(level["placements"]):
            if equipment["asset"] in ("PressureVessel","CoolingStack","CableDrum","ArticulatedServiceArm","RelicLauncher"):
                x,y,z=equipment["p"]
                level["placements"].append(place("TaperedButtress",equipment["label"]+"_Foundation",
                    (x,y,z+72),scale=(1.3,1.3,3)))
    # Background silhouettes occupy a separate far-depth layer. The lower roofs
    # and centre gap stay behind the terminal enemies, never inside their route.
    skylines = (
        [("DistantFoundryWorks", "SkyWorksWest", (-1070, -4850, -520), (0, -9, 0), (1.1, 1, 1.28)),
         ("DistantFoundryWorks", "SkyWorksEast", (1000, -5540, -630), (0, 15, 0), (.82, 1.12, 1.03)),
         ("DistantTransferGallery", "SkyTransferHorizon", (0, -5790, 1160), (0, -6, 0), (1.05, 1, 1))],
        [("DistantFoundryWorks", "TrenchFarCooling", (-1100, -4410, -850), (0, -24, 0), (1.26, 1.14, 1.45)),
         ("DistantFoundryWorks", "TrenchFarProcessing", (1030, -5050, -400), (0, 28, 0), (.92, 1.1, 1.03)),
         ("DistantTransferGallery", "TrenchTransferHorizon", (100, -5500, 1380), (0, 9, 0), (1.3, 1, 1))],
        [("DistantFoundryWorks", "CitadelWestIndustry", (-1360, -4990, -800), (0, -13, 0), (1.3, 1.12, 1.58)),
         ("DistantFoundryWorks", "CitadelEastIndustry", (1290, -5690, -600), (0, 21, 0), (1.18, 1.23, 1.21)),
         ("DistantTransferGallery", "CitadelTransferHorizon", (-100, -6210, 1740), (0, -5, 0), (1.45, 1.2, 1.12))],
    )
    for level, skyline in zip(levels, skylines):
        for name, label, position, rotation, scaling in skyline:
            level["placements"].append(place(name, label, position, rotation, scaling))
    return levels
