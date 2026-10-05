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
            loft("bronze",(x,0,0),[(193,22,23,0,0),(198,26,27,0,0),(215,23,24,0,0),(226,15,18,0,0),(230,5,7,0,0)],12),
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


def get_assets():
    """Return fresh dictionaries on each call; no engine imports or side effects."""
    return [marshal(),gearling()]


if __name__ == "__main__":
    import json
    print(json.dumps(get_assets(),indent=2))
