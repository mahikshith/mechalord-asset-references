"""New original character construction specs; no Unreal calls or imported meshes.

Centimetres, front -Y, ground Z=0. Shape positions and part pivots are absolute
asset coordinates. Sizes are full extents; loft rings are local [z,rx,ry,cx,cy].
Tube/cone length is centred on the shape position along local Z. Rotation tuples
are explicitly [pitch (Y), yaw (Z), roll (X)] in degrees. Parent builder converts
absolute geometry to joint-local coordinates, retaining these mechanical pivots.
These are manual interpretations of the original concepts, not image conversion.
"""
from math import cos, sin, radians


def shape(kind, mat, p, r=(0, 0, 0), **params):
    return dict(type=kind, mat=mat, p=list(p), r=list(r), **params)


def bevel(mat, p, size, b=2, r=(0, 0, 0)):
    return shape("bevel", mat, p, r, size=list(size), bevel=b)


def egg(mat, p, size, segments=12, rings=6, r=(0, 0, 0)):
    return shape("ellipsoid", mat, p, r, size=list(size), segments=segments, rings=rings)


def loft(mat, p, rings, segments=12, r=(0, 0, 0)):
    return shape("loft", mat, p, r, rings=[list(v) for v in rings], segments=segments)


def tube(mat, p, outer, inner, length, segments=12, r=(0, 0, 0)):
    return shape("tube", mat, p, r, outer=outer, inner=inner, length=length, segments=segments)


def cone(mat, p, bottom, top, length, segments=12, r=(0, 0, 0)):
    return shape("cone", mat, p, r, radii=[bottom, top], length=length, segments=segments)


def part(name, parent, pivot, shapes):
    return dict(id=name, parent=parent, pivot=list(pivot), shapes=shapes)


def marshal():
    # Waist-to-collar cuirass: flared chest, inset enamel abdomen, forward keel.
    parts = [part("Torso", None, (0, 0, 149), [
        loft("dark", (0, 0, 0), [(130,23,18,0,0),(155,30,20,0,0),(185,41,25,0,0),(208,34,21,0,0)], 12),
        loft("teal", (0,-2,0), [(137,24,18,0,0),(152,28,21,0,0),(172,35,24,0,0),(191,33,23,0,0)], 12),
        loft("ivory", (0,-4,0), [(154,19,23,0,0),(169,32,26,0,0),(189,41,27,0,0),(208,34,23,0,0),(214,28,20,0,0)], 16),
        loft("bronze", (0,-4,0), [(208,34.5,23.5,0,0),(211,33,22.5,0,0),(214,28.5,20.5,0,0)], 12),
        # Sternum plates taper into waist; reactor axis faces camera (-Y).
        bevel("bronze", (0,-32,189), (13,4,45), 2),
        bevel("teal", (0,-34.4,189), (8,1.4,40), 1),
        tube("bronze", (0,-34,186), 14,10,7,16,(0,0,90)),
        tube("dark", (0,-38,186), 10,7.5,2,12,(0,0,90)),
        egg("cyan", (0,-39.5,186), (14,5,14),12,5),
        bevel("bronze", (-18,-32,186), (11,3,4), 1),
        bevel("bronze", (18,-32,186), (11,3,4), 1),
        loft("bronze", (0,0,0), [(129,26,20,0,0),(134,27,21,0,0),(138,25,19,0,0)],12),
        # Shield-shaped hanging tabard uses tapered rounded loft, not a cube.
        loft("bronze", (0,-25,0), [(94,2,2,0,0),(101,11,3,0,0),(122,15,4,0,0),(136,15,4,0,0)],8),
        loft("teal", (0,-29,0), [(99,1,1,0,0),(106,9,1.4,0,0),(124,12,1.4,0,0),(134,12,1.4,0,0)],8),
        cone("steel", (0,0,217), 10,9,8,12),
        # Rear enamel battery case stays readable in the actual chase camera.
        bevel("ivory", (0,24,182), (47,12,50),5),
        bevel("teal", (0,31,182), (30,4,34),3),
        bevel("cyan", (0,33.5,184), (4,1,20),.5),
    ])]
    parts.append(part("Head", "Torso", (0,0,219), [
        loft("ivory", (0,0,0), [(220,14,15,0,0),(228,20,19,0,0),(249,21,20,0,0),(261,18,18,0,0),(270,9,11,0,0),(273,2,4,0,0)],16),
        # Horizontal visor and vertical face keel are distinct solid layers.
        bevel("bronze", (0,-20.5,248), (38,4,11),3),
        bevel("dark", (0,-23,248), (34,2,7),2),
        bevel("cyan", (-9,-24.2,248), (13,1,2),.6,r=(-7,0,0)),
        bevel("cyan", (9,-24.2,248), (13,1,2),.6,r=(7,0,0)),
        bevel("dark", (0,-21.5,232), (5,3,23),1),
        bevel("bronze", (0,-22.5,265), (7,3,14),1),
        loft("bronze", (0,1,0), [(268,4,10,0,0),(280,3,9,0,0),(282,2,7,0,0)],8),
        loft("teal", (0,-.5,0), [(270,2.6,8,0,0),(279,1.9,7,0,0)],8),
    ]))
    for sign, side in ((1,"L"),(-1,"R")):
        # Shoulder pauldrons have an outer bronze rolled rim and inset enamel dome.
        x=sign*48
        parts.append(part("UpperArm"+side,"Torso",(x,0,205),[
            egg("dark",(x,0,199),(34,34,34),12,6),
            loft("bronze",(x,0,0),[(193,22,23,0,0),(198,26,27,0,0),(202,25,26,0,0)],12),
            loft("ivory",(x,-1,0),[(197,22,24,0,0),(202,24,25,0,0),(216,21,22,0,0),(225,13,16,0,0),(229,4,6,0,0)],12),
            egg("teal",(x,-23,214),(29,5,24),10,5),
            bevel("bronze",(x,-27,213),(3,2,13),.8),
            bevel("bronze",(x,-27,212),(12,2,3),.8),
            loft("ivory",(sign*54,0,0),[(160,13,14,0,0),(166,17,17,0,0),(184,16,17,0,0),(192,12,13,0,0)],10),
            tube("bronze",(sign*71,0,202),10,6,4,10,(90,0,0)),
        ]))
        parts.append(part("Forearm"+side,"UpperArm"+side,(sign*58,0,159),[
            cone("dark",(sign*58,0,159),11,11,20,10,(90,0,0)),
            tube("bronze",(sign*69,0,159),11,7.5,4,10,(90,0,0)),
            loft("ivory",(sign*61,-1,0),[(121,12,12,0,0),(127,16,15,0,0),(145,19,17,0,0),(153,14,14,0,0)],12),
            loft("teal",(sign*61,-15,0),[(125,5,2,0,0),(131,8,3,0,0),(146,9,3,0,0),(151,5,2,0,0)],8),
            bevel("bronze",(sign*61,-19,138),(3,2,24),1),
            tube("bronze",(sign*62,0,121),12,8.5,5,10),
        ]))
        hands=[egg("steel",(sign*62,-1,111),(18,13,19),8,4)]
        for finger in range(3):
            hands.extend([
                bevel("dark",(sign*62+(finger-1)*5,-7,103),(4,5,10),1,r=(18,0,0)),
                bevel("bronze",(sign*62+(finger-1)*5,-10,100),(4,4,4),.8),
            ])
        hands.append(bevel("dark",(sign*73,-1,109),(5,6,12),1,r=(0,0,sign*25)))
        parts.append(part("Hand"+side,"Forearm"+side,(sign*62,0,118),hands))
        parts.append(part("Thigh"+side,"Torso",(sign*23,0,130),[
            egg("dark",(sign*24,0,121),(26,29,29),10,5),
            loft("ivory",(sign*25,0,0),[(81,13,14,0,0),(91,18,18,0,0),(114,21,21,0,0),(127,16,18,0,0)],12),
            loft("bronze",(sign*41,0,0),[(111,4,17,0,0),(129,8,20,0,0),(133,5,17,0,0)],8),
            loft("teal",(sign*25,-18,0),[(88,5,2,0,0),(108,9,3,0,0),(119,7,3,0,0)],8),
        ]))
        parts.append(part("Shin"+side,"Thigh"+side,(sign*26,0,77),[
            cone("dark",(sign*26,0,78),12,12,26,10,(90,0,0)),
            tube("bronze",(sign*41,0,78),11,7,4,10,(90,0,0)),
            egg("bronze",(sign*26,-17,78),(29,9,29),12,5),
            egg("ivory",(sign*26,-22,79),(25,6,25),12,5),
            loft("ivory",(sign*26,0,0),[(19,15,16,0,0),(25,18,18,0,0),(46,16,17,0,0),(65,19,18,0,0),(72,14,14,0,0)],12),
            loft("bronze",(sign*26,-17,0),[(26,7,2,0,0),(54,7,2,0,0),(65,8,2,0,0)],8),
            loft("teal",(sign*26,-19.5,0),[(28,4.5,1,0,0),(52,4.5,1,0,0),(63,5,1,0,0)],8),
        ]))
        parts.append(part("Foot"+side,"Shin"+side,(sign*26,0,20),[
            bevel("rubber",(sign*26,-9,3),(37,49,6),4),
            loft("bronze",(sign*26,-9,0),[(3,18,23,0,0),(8,20,25,0,0),(11,18,24,0,0)],12),
            loft("ivory",(sign*26,-9,0),[(8,17,22,0,0),(16,17,22,0,0),(24,12,15,0,4),(27,8,9,0,7)],12),
            tube("bronze",(sign*44,2,21),8,5,4,10,(90,0,0)),
        ]))
    # Compact forearm relic crossbow; forward-facing emitter and raised bow tips.
    wx=-64
    parts.append(part("Weapon","ForearmR",(wx,-18,137),[
        loft("teal",(wx,-24,0),[(119,8,8,0,0),(129,11,10,0,0),(151,10,9,0,0),(161,7,7,0,0)],10),
        bevel("ivory",(wx-9,-25,141),(6,20,33),2),
        bevel("ivory",(wx+9,-25,141),(6,20,33),2),
        tube("bronze",(wx,-35,145),7,4.5,25,12,(0,0,90)),
        cone("dark",(wx,-47.5,145),4.5,4.5,3,10,(0,0,90)),
        cone("cyan",(wx,-49.5,145),3,3,2,10,(0,0,90)),
        bevel("bronze",(wx,-29,132),(37,6,5),1),
        bevel("bronze",(wx-22,-33,137),(7,5,20),1,r=(-26,0,0)),
        bevel("bronze",(wx+22,-33,137),(7,5,20),1,r=(26,0,0)),
        bevel("cyan",(wx,-31,156),(5,2,10),1),
    ]))
    return dict(name="RelicMarshal",label="Relic Marshal — newly forged",category="character",height_cm=282,parts=parts)


def gearling():
    # A genuine two-wheel carriage: wide axle, rounded shield hull, no humanoid legs.
    parts=[part("GearlingHull",None,(0,0,54),[
        loft("dark",(0,0,0),[(25,18,17,0,0),(38,32,27,0,0),(67,35,30,0,0),(98,27,25,0,0)],10),
        loft("ivory",(0,-4,0),[(21,6,7,0,0),(34,24,22,0,0),(60,33,29,0,0),(83,33,30,0,0),(99,23,23,0,0),(107,14,17,0,0)],12),
        # Layered tapered front shield, bronze keel, black face and cyan eyes.
        loft("bronze",(0,-32,0),[(24,2,1.5,0,0),(40,12,3,0,0),(63,22,4,0,0),(74,23,4,0,0)],8),
        loft("teal",(0,-36,0),[(29,1,1,0,0),(42,9,1.5,0,0),(63,19,1.5,0,0),(69,19,1.5,0,0)],8),
        bevel("bronze",(0,-39,51),(4,2.5,39),1),
        bevel("bronze",(0,-33,85),(53,5,22),5),
        bevel("dark",(0,-36,85),(46,3,16),4),
        egg("cyan",(-13,-38,85),(4,2,10),8,4),
        egg("cyan",(13,-38,85),(4,2,10),8,4),
        cone("bronze",(0,0,108),17,15,6,12),
        cone("dark",(0,0,114),11,11,6,10),
        cone("steel",(0,0,41),9,9,106,10,(90,0,0)),
        egg("ivory",(0,28,65),(51,18,49),12,6),
        bevel("teal",(0,38,66),(32,4,27),3),
        bevel("cyan",(0,40.5,69),(18,1,3),.6),
    ])]
    for sign,side in ((1,"L"),(-1,"R")):
        # Curved armor cheek above each axle, distinct from the cylindrical wheel.
        parts[0]["shapes"].extend([
            loft("bronze",(sign*28,1,0),[(68,10,22,0,0),(89,14,26,0,0),(105,10,20,0,0),(110,3,8,0,0)],8),
            loft("ivory",(sign*28,-1,0),[(72,9,21,0,0),(89,12,23,0,0),(103,8,17,0,0),(107,2,7,0,0)],8),
            egg("teal",(sign*30,-22,95),(17,4,16),8,4),
            egg("bronze",(sign*32,-25,94),(5,3,5),8,3),
        ])
        x=sign*50
        wheel=[tube("rubber",(x,0,40),40,25,20,12,(90,0,0)),
               tube("bronze",(x+sign*9,0,40),40,28,3,12,(90,0,0)),
               tube("teal",(x,0,40),40,37,14,12,(90,0,0)),
               tube("dark",(x+sign*10,0,40),26,11,2,10,(90,0,0)),
               cone("bronze",(x+sign*12,0,40),13,11,8,10,(90,0,0)),
               cone("steel",(x+sign*17,0,40),6,6,5,8,(90,0,0))]
        for angle in range(0,360,60):
            a=radians(angle)
            wheel.append(egg("bronze",(x+sign*11.2,32*sin(a),40+32*cos(a)),(3,5,5),6,3))
        # Three radial spokes are real geometry behind the bronze wheel ring.
        for angle in (0,60,120):
            wheel.append(bevel("steel",(x+sign*10.5,0,40),(3,7,47),1,r=(0,0,angle)))
        parts.append(part("Wheel"+side,"GearlingHull",(x,0,40),wheel))
    parts.append(part("Turret","GearlingHull",(0,0,113),[
        cone("bronze",(0,0,118),15,12,8,10),
        loft("teal",(0,0,0),[(122,10,15,0,0),(136,14,19,0,0),(145,11,16,0,0)],10),
        bevel("ivory",(-12,-2,133),(6,25,23),2),
        bevel("ivory",(12,-2,133),(6,25,23),2),
        tube("bronze",(-17,0,132),9,5,4,10,(90,0,0)),
        tube("bronze",(17,0,132),9,5,4,10,(90,0,0)),
        bevel("bronze",(0,-19,138),(77,6,7),2),
        bevel("bronze",(-37,-13,139),(8,18,13),2,r=(0,-13,0)),
        bevel("bronze",(37,-13,139),(8,18,13),2,r=(0,13,0)),
        bevel("steel",(0,5,145),(74,2,2),.5),
        cone("steel",(0,-32,138),3,3,34,8,(0,0,90)),
        cone("bronze",(0,-54,138),6,0,12,6,(0,0,90)),
        bevel("cyan",(0,-20,147),(5,4,3),.5),
    ]))
    return dict(name="GearlingSentinel",label="Gearling Sentinel — newly forged",category="character",height_cm=149,parts=parts)


def add_bolts(shapes, points, radius=1.6):
    for p in points:
        shapes.append(egg("bronze",p,(radius*2,2.2,radius*2),12,6))


def refine_marshal():
    """Authored master: fuller silhouette and mechanical assembly, not a LOD."""
    a=marshal(); by={p["id"]:p for p in a["parts"]}
    torso=by["Torso"]["shapes"]
    # Fuller sculpted breastplate replaces the previous simple funnel profile.
    torso[2]=loft("ivory",(0,-3,0),[(151,21,20,0,0),(159,30,25,0,0),
        (172,39,29,0,0),(187,44,30,0,0),(201,41,27,0,0),(213,32,23,0,0)],32)
    torso.extend([
        tube("bronze",(0,0,216),30,22,7,32),
        tube("dark",(0,0,218),22,13,5,32),
        tube("ivory",(0,0,218),29,24,4,32),
        # Narrow secondary steel bezel makes the lens read recessed in the shell.
        tube("steel",(0,-39.2,186),11,8.4,1.6,32,(0,0,90)),
        egg("cyan",(0,-40.2,186),(11,2,11),24,12),
        loft("ivory",(0,-27,0),[(135,12,3,0,0),(146,22,5,0,0),(158,27,5,0,0)],24),
    ])
    # Lateral layered rib edges and waist pistons flank the enamel abdomen.
    for s in(-1,1):
        for z,x in((143,23),(151,27),(159,30)):
            torso.append(loft("dark",(s*x,0,z),[(-1,3,18,0,0),(1,3,18,0,0)],24))
        torso.extend([
            cone("steel",(s*21,10,149),3,3,22,24),
            tube("bronze",(s*21,10,142),5,3.3,9,24),
            loft("bronze",(s*33,-19,0),[(167,2,3,0,0),(180,2.3,3,0,0),(199,1.7,2,0,0)],20),
        ])
    # Replace the old rectangular battery with a purposeful twin cooling housing.
    torso[15:18]=[
        loft("steel",(0,29,0),[(154,21,8,0,0),(169,26,11,0,0),(196,24,11,0,0),(207,17,8,0,0)],24),
        loft("ivory",(0,36,0),[(161,18,5,0,0),(174,22,7,0,0),(197,20,7,0,0),(205,13,4,0,0)],24),
        tube("bronze",(0,45,183),11,7.5,4,32,(0,0,90)),
        egg("cyan",(0,47.5,183),(13,3,13),24,12),
    ]
    for s in(-1,1):
        torso.append(loft("teal",(s*23,31,0),[(157,6,8,0,0),(170,8,10,0,0),(196,7,9,0,0),(201,4,6,0,0)],24))
        for z in(170,177,184,191):
            torso.append(bevel("dark",(s*24,41,z),(8,2,2),.6))
    # Helmet visor no longer protrudes as a frame/sign. Split curved ivory cheeks
    # border a recessed optical band and a long knightly nasal keel.
    head=by["Head"]["shapes"]
    head[0]=loft("ivory",(0,0,0),[(220,14,16,0,0),(227,19,20,0,0),
        (239,22,21,0,0),(254,22,21,0,0),(265,17,17,0,1),(273,7,9,0,1)],32)
    head[1:6]=[
        bevel("dark",(0,-21.2,247),(37,2.5,8),1.8),
        bevel("cyan",(-10,-22.8,248),(13,1,2.2),.5,r=(-10,0,0)),
        bevel("cyan",(10,-22.8,248),(13,1,2.2),.5,r=(10,0,0)),
        loft("bronze",(0,-21,0),[(222,2,1,0,0),(244,2.2,1.5,0,0),(256,1,1,0,0)],12),
        loft("ivory",(0,-23,0),[(222,1,1,0,0),(245,1.4,1.4,0,0),(256,.5,.5,0,0)],12),
    ]
    for s in(-1,1):
        head.extend([
            loft("ivory",(s*10,-19,0),[(221,5,3,0,1),(235,9,5,0,0),(242,8,3,0,0)],24),
            tube("bronze",(s*22.5,1,249),12,8.5,5,32,(90,0,0)),
            tube("dark",(s*26,1,249),8,5,3,24,(90,0,0)),
            cone("steel",(s*28,1,249),4,4,2,24,(90,0,0)),
            bevel("bronze",(s*15,-19.5,231),(3,2,17),.8,r=(s*12,0,0)),
        ])
    for s,side in((1,"L"),(-1,"R")):
        upper=by["UpperArm"+side];upper["pivot"]=[s*53,0,207]
        sh=upper["shapes"];x=s*53
        sh[1:6]=[
            loft("bronze",(x,0,0),[(194,31,30,0,0),(199,35,34,0,0),(204,34,33,0,0)],32),
            loft("ivory",(x,0,0),[(199,32,31,0,0),(207,34,33,0,0),(222,29,28,0,0),(233,19,21,0,0),(238,6,9,0,0)],32),
            egg("dark",(x,-29,219),(39,5,34),24,10),
            egg("bronze",(x,-31.6,219),(37,3,32),24,10),
            egg("teal",(x,-33.4,219),(33,2.5,28),24,10),
        ]
        sh.extend([
            tube("steel",(s*75,0,202),10,7.3,2,24,(90,0,0)),
            cone("bronze",(s*77,0,202),6.5,6.5,3,24,(90,0,0)),
            loft("bronze",(s*30,0,0),[(199,2.5,27,0,0),(211,3,29,0,0),(226,2,23,0,0)],24),
            loft("teal",(s*34,0,0),[(202,3,27,0,0),(214,3,28,0,0),(229,2,21,0,0)],24),
            bevel("bronze",(x,-36,219),(4,1.5,17),1),
            bevel("bronze",(x,-36,218),(16,1.5,4),1),
        ])
        add_bolts(sh,[(x-12,-34,209),(x+12,-34,209)],1.3)
        # Four steel joints behind the elbow and an actual wrist bearing stack.
        fore=by["Forearm"+side]["shapes"]
        fore.extend([
            cone("steel",(s*58,0,159),7,7,27,24,(90,0,0)),
            tube("bronze",(s*73,0,159),10,6,3,24,(90,0,0)),
            loft("dark",(s*61,-16,0),[(124,8,2,0,0),(142,11,3,0,0),(151,7,2,0,0)],24),
            loft("teal",(s*61,-19,0),[(127,5,1.4,0,0),(141,8,2,0,0),(148,5,1.4,0,0)],24),
            tube("dark",(s*62,0,118),9,6,5,24),
            tube("steel",(s*62,0,120),10,6.8,2,24),
        ])
        for dx in(-6,6):
            fore.append(cone("steel",(s*61+dx,12,137),2.2,2.2,25,20))
        # Four individually modeled curled fingers, joint bearings and knuckle caps.
        hands=[egg("dark",(s*62,-1,110),(20,15,19),24,12),
               egg("ivory",(s*62,5,112),(19,5,15),24,10)]
        for i in range(4):
            fx=s*62+(i-1.5)*4.7
            hands.extend([
                egg("bronze",(fx,-4,106),(4.2,5,4.2),16,8),
                cone("steel",(fx,-6.5,102),1.7,1.9,7,16,r=(0,0,-22)),
                egg("dark",(fx,-9,99),(4,5,4),16,8),
                cone("steel",(fx,-10.5,97),1.5,1.6,5,16,r=(0,0,-38)),
                egg("bronze",(fx,-12,95),(3.6,3.4,3.2),16,8),
            ])
        hands.extend([egg("dark",(s*74,-2,110),(5,6,12),16,8,r=(0,s*20,0)),
                      egg("bronze",(s*74,-6,105),(5,5,5),16,8)])
        by["Hand"+side]["shapes"]=hands
        thigh=by["Thigh"+side]["shapes"]
        thigh[1]=loft("ivory",(s*25,0,0),[(81,15,16,0,0),(92,20,21,0,0),
            (111,22,23,0,0),(123,19,21,0,0),(128,15,17,0,0)],32)
        thigh.extend([tube("bronze",(s*39,2,123),10,7,4,24,(90,0,0)),
                      cone("steel",(s*42,2,123),5.5,5.5,3,24,(90,0,0))])
        shin=by["Shin"+side]["shapes"]
        shin.extend([
            tube("dark",(s*26,-20.5,78),13.5,10,2,32,(0,0,90)),
            tube("bronze",(s*26,0,24),18,14.5,5,32),
            tube("dark",(s*26,0,20),14,10,4,24),
        ])
        for dx in(-10,10):
            shin.append(cone("steel",(s*26+dx,10,45),2,2,35,20))
        add_bolts(shin,[(s*26-9,-19,31),(s*26+9,-19,31)],1.2)
        foot=by["Foot"+side]["shapes"]
        for dx in(-10,0,10):
            foot.append(bevel("bronze",(s*26+dx,-30,9),(8,6,9),1.4))
    # Reconstruct crossbow with swept curved limbs, limb tips, paired capacitors,
    # tension cords, a long rail emitter and independently recoiling internals.
    w=by["Weapon"];wx=-64
    w["shapes"]=[
        loft("dark",(wx,-23,0),[(118,7,7,0,0),(127,12,11,0,0),(150,12,11,0,0),(166,8,7,0,0)],24),
        loft("teal",(wx,-27,0),[(126,10,8,0,0),(147,11,9,0,0),(162,7,6,0,0)],24),
        loft("ivory",(wx-10,-27,0),[(121,3,8,0,0),(134,4,10,0,0),(154,3,9,0,0),(164,2,5,0,0)],20),
        loft("ivory",(wx+10,-27,0),[(121,3,8,0,0),(134,4,10,0,0),(154,3,9,0,0),(164,2,5,0,0)],20),
        tube("steel",(wx,-43,143),6.5,4,39,32,(0,0,90)),
        tube("bronze",(wx,-64,143),8,4,6,32,(0,0,90)),
        egg("cyan",(wx,-67.5,143),(6,2,6),24,12),
        # Axis Z rotated to X: ring centre Y creates the swept bow curve.
        loft("bronze",(wx,-38,132),[(-33,3,3,0,-9),(-26,3.8,4,0,-4),(-15,4,4.5,0,0),
            (0,4,5,0,2),(15,4,4.5,0,0),(26,3.8,4,0,-4),(33,3,3,0,-9)],24,r=(90,0,0)),
        bevel("steel",(wx,-28,132),(60,1.4,1.4),.4),
        bevel("bronze",(wx,-30,155),(6,8,22),1),
        bevel("cyan",(wx,-35,156),(4,2,14),.6),
    ]
    for dx in(-15,15):
        w["shapes"].extend([cone("bronze",(wx+dx,-22,145),4,4,24,24),
                             cone("cyan",(wx+dx,-22,147),2.6,2.6,16,24),
                             tube("dark",(wx+dx,-22,157),4.2,2.7,3,24)])
    a["label"]="Relic Marshal — detailed authored master"
    return a


def refine_gearling():
    a=gearling();by={p["id"]:p for p in a["parts"]};h=by["GearlingHull"]["shapes"]
    # Visor hugs the domed hull instead of floating as a rectangular sign.
    h[5:9]=[bevel("steel",(0,-34.8,85),(49,3,18),4),
        bevel("dark",(0,-36.5,85),(44,1.5,14),3),
        egg("cyan",(-13,-38,85),(3.8,1.5,8.5),20,10),
        egg("cyan",(13,-38,85),(3.8,1.5,8.5),20,10)]
    h[1]=loft("ivory",(0,-3,0),[(22,8,9,0,0),(36,25,24,0,0),(57,34,30,0,0),
        (79,35,31,0,0),(96,29,26,0,0),(107,19,19,0,0)],28)
    h.extend([tube("bronze",(0,0,110),19,12,4,28),
              tube("dark",(0,0,113),13,9,3,24),
              loft("ivory",(0,-28,0),[(77,26,3,0,0),(96,29,4,0,0),(102,23,3,0,0)],24)])
    add_bolts(h,[(-21,-37,76),(21,-37,76)],1.4)
    for s,side in((1,"L"),(-1,"R")):
        x=s*50;wheel=by["Wheel"+side]["shapes"]
        # Coincident radius40 teal/rubber surfaces caused Z fighting in the old
        # render. A smaller rubber core sits underneath separate outer enamel.
        wheel[0]=tube("rubber",(x,0,40),38.8,25,21,32,(90,0,0))
        wheel[1]=tube("bronze",(x+s*10,0,40),40,28,3,32,(90,0,0))
        wheel[2]=tube("teal",(x,0,40),40,37.8,16,32,(90,0,0))
        wheel[3]=tube("dark",(x+s*11.8,0,40),26.5,11,2,28,(90,0,0))
        # Radial panel seam slots and thin axle-bearing rings are actual geometry.
        for angle in range(0,360,45):
            q=radians(angle); y=40.05*sin(q);z=40+40.05*cos(q)
            wheel.append(bevel("dark",(x,y,z),(16,1.3,1.4),.35,r=(0,0,-angle)))
        wheel.extend([tube("steel",(x+s*16,0,40),10,6.5,2,24,(90,0,0)),
                      tube("bronze",(x-s*17,0,40),19,10,9,28,(90,0,0)),
                      tube("dark",(x-s*24,0,40),14,8,5,24,(90,0,0))])
        # Slight axle lift keeps the inset-looking outer seam ribs at ground zero.
        by["Wheel"+side]["pivot"][2]+=.75
        for q in wheel:q["p"][2]+=.75
        h.extend([tube("bronze",(s*32,0,42),16,10,9,28,(90,0,0)),
                  cone("steel",(s*34,0,42),8,8,12,24,(90,0,0))])
    turret=by["Turret"]["shapes"]
    turret.extend([
        loft("bronze",(0,-20,138),[(-40,2.5,3,0,-4),(-28,3,3,0,-1),(-12,3,3,0,1),
            (12,3,3,0,1),(28,3,3,0,-1),(40,2.5,3,0,-4)],20,r=(90,0,0)),
        tube("steel",(0,-28,138),4,2.5,28,24,(0,0,90)),
        cone("bronze",(0,-53,138),5,0,17,16,(0,0,90)),
        bevel("bronze",(0,-6,149),(14,13,4),1.5),
    ])
    a["height_cm"]=151;a["label"]="Gearling Sentinel — detailed wheeled master"
    return a


def aegis_vanguard():
    """A broad asymmetric guardian: tower shield, crown helm, rotary arm cannon."""
    # Reuse faction joint/foot engineering, replace silhouette-defining armor.
    a=refine_marshal();by={p["id"]:p for p in a["parts"]}
    a["name"]="AegisVanguard";a["label"]="Aegis Vanguard — bulwark champion";a["height_cm"]=306
    by["Torso"]["shapes"]=[
        loft("dark",(0,0,0),[(132,28,23,0,0),(167,46,31,0,0),(205,52,34,0,0),(222,41,27,0,0)],32),
        loft("teal",(0,-4,0),[(147,31,24,0,0),(173,46,30,0,0),(205,50,31,0,0),(222,39,25,0,0)],32),
        loft("ivory",(0,-29,0),[(153,18,5,0,0),(178,31,7,0,0),(205,35,7,0,0),(219,22,5,0,0)],28),
        tube("bronze",(0,0,225),32,23,6,32),
        tube("bronze",(0,-39,192),17,11,6,32,(0,0,90)),
        egg("cyan",(0,-42,192),(17,3,17),24,12),
        loft("bronze",(0,-28,0),[(94,4,3,0,0),(121,23,5,0,0),(143,23,5,0,0)],24),
        loft("ivory",(0,-34,0),[(101,2,1,0,0),(123,18,2,0,0),(140,18,2,0,0)],24),
        loft("steel",(0,35,0),[(156,26,10,0,0),(181,30,12,0,0),(215,23,9,0,0)],28),
    ]
    for s in(-1,1):
        by["Torso"]["shapes"].extend([
            loft("bronze",(s*38,-20,0),[(163,3,4,0,0),(195,4,5,0,0),(217,3,4,0,0)],24),
            tube("bronze",(s*19,45,182),8,5,6,24,(0,0,90)),
            egg("cyan",(s*19,49,182),(8,2,8),20,10)])
    by["Head"]["pivot"]=[0,0,229]
    by["Head"]["shapes"]=[
        loft("ivory",(0,0,0),[(229,17,17,0,0),(249,24,21,0,0),(269,23,21,0,0),(282,16,16,0,0),(290,6,8,0,0)],32),
        bevel("dark",(0,-23,265),(39,2,7),1.5),
        bevel("cyan",(0,-24.5,265),(30,1,2.3),.6),
        loft("bronze",(0,-24,0),[(233,2,1.4,0,0),(277,3,2,0,0),(291,2,1,0,0)],16),
        loft("teal",(0,4,0),[(285,5,10,0,0),(302,4,8,0,0),(306,2,5,0,0)],24),
    ]
    for s,side in((1,"L"),(-1,"R")):
        # Translate arm chains outwards; retain exact absolute-coordinate contract.
        for pid in("UpperArm","Forearm","Hand"):
            p=by[pid+side];p["pivot"][0]+=s*12;p["pivot"][2]+=6
            for q in p["shapes"]:q["p"][0]+=s*12;q["p"][2]+=6
        x=s*67
        by["UpperArm"+side]["shapes"]=[
            egg("dark",(x,0,210),(39,40,39),28,14),
            loft("bronze",(x,0,0),[(204,33,33,0,0),(210,38,36,0,0),(213,37,35,0,0)],32),
            loft("teal",(x,0,0),[(210,35,34,0,0),(228,36,34,0,0),(244,25,25,0,0),(252,9,13,0,0)],32),
            loft("ivory",(x,-31,0),[(214,23,3,0,0),(235,24,4,0,0),(244,14,3,0,0)],24),
            tube("bronze",(s*93,0,217),12,8,6,28,(90,0,0)),
            loft("ivory",(s*68,0,0),[(166,15,16,0,0),(181,19,20,0,0),(204,17,18,0,0)],28),
        ]
    # Replace relic crossbow completely: six hollow bores on a rotating cassette.
    a["parts"]=[p for p in a["parts"] if p["id"]!="Weapon"]
    a["parts"].append(part("Weapon","ForearmR",(-76,-18,144),[
        loft("teal",(-76,-18,0),[(121,13,13,0,0),(141,17,17,0,0),(166,14,14,0,0)],28),
        tube("bronze",(-76,-35,146),18,13,10,32,(0,0,90)),
        bevel("ivory",(-95,-21,144),(9,26,37),3),
        bevel("ivory",(-57,-21,144),(9,26,37),3),
    ]))
    rotor=[tube("dark",(-76,-47,146),15,11,4,32,(0,0,90)),
           tube("bronze",(-76,-78,146),16,12.5,5,32,(0,0,90))]
    for i in range(6):
        ang=radians(i*60);x=-76+9*cos(ang);z=146+9*sin(ang)
        rotor.extend([tube("steel",(x,-58,z),3.8,2.3,43,24,(0,0,90)),
                      tube("bronze",(x,-82,z),4.5,2.3,5,24,(0,0,90))])
    a["parts"].append(part("CannonRotor","Weapon",(-76,-35,146),rotor))
    shield=[loft("bronze",(92,-35,0),[(64,3,4,0,0),(86,31,7,0,0),(177,35,8,0,0),(215,26,7,0,0),(224,8,4,0,0)],28),
        loft("ivory",(92,-44,0),[(75,2,2,0,0),(94,25,3,0,0),(177,28,4,0,0),(209,20,3,0,0),(216,6,2,0,0)],28),
        loft("teal",(92,-48,0),[(91,2,1,0,0),(113,16,2,0,0),(174,18,2,0,0),(195,10,1,0,0)],24),
        tube("bronze",(92,-52,163),14,10,4,32,(0,0,90)),
        egg("cyan",(92,-54,163),(14,2,14),24,12),
        bevel("bronze",(92,-52,130),(5,3,53),1.3),
    ]
    for x in(69,115):
        add_bolts(shield,[(x,-47,102),(x,-47,188)],1.7)
    a["parts"].append(part("Shield","ForearmL",(74,-14,156),shield))
    return a


def authored_master(asset, troop=False):
    """Smooth source geometry only. Later runtime LODs must be explicitly derived."""
    for p in asset["parts"]:
        for s in p["shapes"]:
            kind=s["type"]
            if kind=="ellipsoid":
                diameter=max(s["size"])
                s["segments"]=(24 if troop else 32) if diameter>=18 else (16 if diameter<9 else 24)
                s["rings"]=(10 if troop else 14) if diameter>=18 else (6 if diameter<9 else 10)
            elif kind in("tube","cone"):
                radius=s["outer"] if kind=="tube" else max(s["radii"])
                s["segments"]=32 if radius>=9 else 20
            elif kind=="loft":
                s["segments"]=32 if max(max(v[1:3]) for v in s["rings"])>=12 else 24
                # Catmull-Rom radius profiles round authored shoulders; narrow
                # trim bands retain their endpoints and their separate seam gaps.
                rings=s["rings"];dense=[]
                for k,(left,right) in enumerate(zip(rings,rings[1:])):
                    steps=2
                    before=rings[max(0,k-1)];after=rings[min(len(rings)-1,k+2)]
                    for i in range(steps):
                        t=i/steps;row=[left[0]+(right[0]-left[0])*t]
                        for j in range(1,5):
                            v=.5*(2*left[j]+(right[j]-before[j])*t+
                                (2*before[j]-5*left[j]+4*right[j]-after[j])*t*t+
                                (-before[j]+3*left[j]-3*right[j]+after[j])*t*t*t)
                            row.append(max(.05,v) if j in(1,2) else v)
                        dense.append(row)
                dense.append(rings[-1]);s["rings"]=dense
    return asset


def get_assets():
    """Fresh detailed source masters; manual original-reference interpretations."""
    return [authored_master(refine_marshal()),authored_master(refine_gearling(),True),
            authored_master(aegis_vanguard())]


if __name__ == "__main__":
    import json
    print(json.dumps(get_assets(),indent=2))
