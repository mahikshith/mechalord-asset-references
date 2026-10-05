"""Original Mechalord enemy geometry specifications; no engine or asset imports.

Centimetres, X lateral, front -Y, Z up; soles at Z=0. Shape p values are
absolute asset space, while part pivots describe articulation centres.
The native builder owns mesh generation, actual triangle counts and review.
"""
from math import cos, sin, pi


def shape(kind, mat, p, r=None, **dimensions):
    return dict(type=kind, mat=mat, p=list(p), r=list(r or (0, 0, 0)), **dimensions)


def bevel(mat, p, size, radius=4, r=None):
    return shape("bevel", mat, p, r, size=list(size), bevel=radius)


def ellipsoid(mat, p, size, r=None, segments=12, rings=8):
    return shape("ellipsoid", mat, p, r, size=list(size), segments=segments, rings=rings)


def loft(mat, rings, segments=12, p=(0, 0, 0), r=None):
    return shape("loft", mat, p, r, rings=[list(v) for v in rings], segments=segments)


def tube(mat, p, outer, inner, length, r=None, segments=12):
    return shape("tube", mat, p, r, outer=outer, inner=inner, length=length, segments=segments)


def cone(mat, p, bottom, top, length, r=None, segments=10):
    return shape("cone", mat, p, r, radii=[bottom, top], length=length, segments=segments)


def part(name, parent, pivot, shapes):
    return dict(id=name, parent=parent, pivot=list(pivot), shapes=shapes)


# r is Unreal Rotator [pitch,yaw,roll]. Roll +90 turns local +Z toward -Y.
FRONT = (0, 0, 90)
SIDE = (90, 0, 0)


def collar(mat, p, outer, inner, length, facing=FRONT):
    return tube(mat, p, outer, inner, length, facing)


def studs(points, radius=2.4):
    return [ellipsoid("bronze", p, (radius*2, radius*1.1, radius*2), segments=8, rings=4)
            for p in points]


def rust_crawler():
    """Low predatory turret on exposed linked tracks; rust is its faction colour."""
    parts = []
    chassis = [
        bevel("dark", (0, 10, 43), (100, 118, 51), 10),
        loft("rust", [(53,44,53,0,6),(70,51,56,0,5),(86,42,42,0,13)], 8),
        bevel("bronze", (0,-50,58), (78,10,42), 6, (12,0,0)),
        bevel("rust", (0,-56,61), (65,5,30), 3, (12,0,0)),
        bevel("steel", (0,61,53), (68,13,36), 4),
        bevel("dark", (0,69,55), (44,6,22), 3),
        collar("steel", (0,8,85), 26,17,9, (0,0,0)),
    ]
    for x in (-24,-12,0,12,24):
        chassis.append(bevel("dark", (x,72,56), (4,5,20), 1))
    chassis += studs([(-24,-59,61),(24,-59,61)])
    parts.append(part("Chassis", None, (0,0,43), chassis))
    # 12 distinct links per side describe a rounded capsule, not a wheel.
    for sign, suffix in ((-1,"L"),(1,"R")):
        x=sign*66
        track=[bevel("rubber", (x,4,37), (30,146,70),12),
               bevel("rust", (x+sign*17,6,41), (8,107,53),9)]
        for y in (-47,6,57):
            track += [tube("bronze", (x+sign*22,y,39), 19,12,5,SIDE),
                      ellipsoid("dark", (x+sign*25,y,39),(5,22,22),segments=8,rings=4)]
        for i in range(12):
            a=2*pi*i/12
            y=4+68*cos(a); z=37+32*sin(a)
            angle=a*180/pi+90
            track.append(bevel("steel",(x,y,z),(34,28,9),2,(0,0,angle)))
        parts.append(part("Track_"+suffix,"Chassis",(x,4,37),track))
    turret=[
        loft("dark",[(91,38,34,0,7),(114,45,38,0,7),(133,37,33,0,11)],10),
        loft("rust",[(117,40,34,0,8),(141,36,30,0,9),(151,22,22,0,12)],8),
        bevel("rust",(-39,10,119),(15,61,34),5, (0,-12,0)),
        bevel("rust",(39,10,119),(15,61,34),5, (0,12,0)),
        bevel("dark",(0,-27,132),(56,8,16),3),
        bevel("bronze",(0,-34,124),(67,7,12),3),
        bevel("amber",(-15,-32,134),(7,2,8),1),
        bevel("amber",(15,-32,134),(7,2,8),1),
        bevel("bronze",(0,4,151),(10,39,4),1),
    ]
    parts.append(part("Turret","Chassis",(0,8,91),turret))
    cannon=[collar("bronze",(0,-33,110),25,19,14),
            tube("steel",(0,-65,110),19,13,60,FRONT),
            collar("bronze",(0,-96,110),24,13,9),
            collar("dark",(0,-91,110),13,9,8)]
    parts.append(part("Cannon","Turret",(0,-33,110),cannon))
    return dict(name="RustCrawler",label="Rust Crawler — breach scout",category="character",
                height_cm=154,parts=parts)


def arc_warden():
    """Ivory-faced heavy knight with a shield and deep recessed arc reactor."""
    parts=[]
    parts.append(part("Pelvis",None,(0,0,141),[
        bevel("dark",(0,5,140),(70,51,42),9),
        loft("bronze",[(149,37,25,0,0),(165,46,29,0,0)],8),
        loft("rust",[(112,16,10,0,-27),(149,28,12,0,-28),(161,24,10,0,-26)],6),
        bevel("bronze",(0,-40,139),(6,4,35),1)]))
    torso=[loft("dark",[(163,33,29,0,4),(199,51,34,0,2),(237,53,32,0,7)],12),
           loft("rust",[(172,38,24,0,0),(202,56,31,0,0),(238,48,30,0,4)],10),
           bevel("bronze",(0,-33,235),(91,13,14),4,(-12,0,0)),
           collar("dark",(0,-30,201),29,21,10),
           collar("bronze",(0,-38,201),25,20,6),
           ellipsoid("amber",(0,-34,201),(35,9,35),segments=16,rings=8),
           bevel("steel",(0,31,202),(43,14,55),7)]
    # Vertical reactor cage has no spokes, tire or wheel hub.
    for x in (-13,0,13):torso.append(bevel("steel",(x,-43,201),(4,5,34),1))
    torso += studs([(-39,-33,223),(39,-33,223),(-33,-32,180),(33,-32,180)])
    parts.append(part("Torso","Pelvis",(0,0,169),torso))
    head=[ellipsoid("dark",(0,3,268),(46,39,51)),
          loft("ivory",[(243,18,14,0,-2),(265,27,20,0,0),(290,20,17,0,2),(305,4,5,0,0)],6),
          bevel("dark",(0,-21,271),(44,6,10),2),
          bevel("redglow",(-11,-25,271),(11,2,4),1,(0,-13,0)),
          bevel("redglow",(11,-25,271),(11,2,4),1,(0,13,0)),
          loft("ivory",[(247,8,4,0,-20),(280,6,5,0,-24),(295,2,3,0,-16)],4),
          bevel("bronze",(-18,-20,253),(8,8,18),2),
          bevel("bronze",(18,-20,253),(8,8,18),2)]
    parts.append(part("Head","Torso",(0,2,244),head))
    for sign,suffix in ((-1,"L"),(1,"R")):
        x=sign*31
        leg=[ellipsoid("dark",(x,4,122),(39,38,35)),
             loft("rust",[(82,19,19,x,1),(108,24,23,x,0),(133,21,20,x,4)],8),
             bevel("bronze",(x,-20,111),(33,7,37),4),
             ellipsoid("dark",(x,0,78),(36,38,35)),
             tube("bronze",(x,-20,78),17,11,5,FRONT),
             loft("rust",[(22,22,18,x,0),(46,22,21,x,0),(75,18,18,x,1)],8),
             bevel("bronze",(x,-20,47),(29,7,43),4),
             bevel("dark",(x,-10,11),(49,69,22),6),
             bevel("rust",(x,-26,20),(45,36,23),5),
             bevel("steel",(x,-41,8),(42,8,14),2)]
        parts.append(part("Leg_"+suffix,"Pelvis",(x,3,138),leg))
        ax=sign*65
        arm=[ellipsoid("dark",(ax,3,222),(41,44,40)),
             loft("rust",[(211,25,26,ax,0),(238,33,31,ax,0),(256,13,17,ax,5)],10),
             bevel("bronze",(ax,-28,232),(40,8,13),3),
             bevel("steel",(ax,0,191),(27,28,48),5),
             ellipsoid("dark",(ax,-1,168),(29,30,30))]
        parts.append(part("Arm_"+suffix,"Torso",(ax,0,223),arm))
    shield=[loft("bronze",[(59,25,7,96,-25),(89,45,9,96,-25),(213,44,9,96,-25),(249,23,7,96,-25)],6),
            loft("rust",[(68,20,5,96,-37),(96,37,6,96,-37),(210,36,6,96,-37),(239,19,5,96,-37)],6),
            bevel("dark",(96,-44,154),(12,5,143),3),
            bevel("amber",(96,-48,154),(5,2,120),1),
            bevel("bronze",(96,-45,215),(45,5,8),2)]
    shield += studs([(68,-44,105),(124,-44,105),(68,-44,207),(124,-44,207)])
    parts.append(part("Shield_R","Arm_R",(69,-11,165),shield))
    gun=[ellipsoid("dark",(-65,-6,146),(42,42,45)),
         collar("bronze",(-65,-33,149),23,17,9),
         tube("steel",(-65,-55,149),17,11,38,FRONT),
         collar("bronze",(-65,-76,149),21,11,8),
         bevel("rust",(-65,1,149),(47,37,41),7),
         bevel("amber",(-88,-3,152),(3,18,6),1)]
    parts.append(part("Cannon_L","Arm_L",(-65,-7,164),gun))
    return dict(name="ArcWarden",label="Arc Warden — shield elite",category="character",
                height_cm=307,parts=parts)


def forge_colossus():
    """Six-metre forged knight; cannon/jet/leg groups support future destruction."""
    parts=[]
    pelvis=[loft("dark",[(244,67,46,0,10),(283,78,50,0,9),(316,59,46,0,7)],12),
            loft("bronze",[(302,69,47,0,4),(325,81,51,0,4)],10),
            loft("rust",[(216,22,11,0,-49),(292,46,15,0,-49),(314,38,13,0,-48)],6),
            bevel("bronze",(0,-64,267),(10,5,65),2)]
    parts.append(part("Pelvis",None,(0,7,280),pelvis))
    torso=[loft("dark",[(317,68,47,0,8),(375,99,62,0,4),(448,105,61,0,4),(486,83,50,0,10)],16),
           loft("rust",[(323,73,45,0,1),(382,110,58,0,0),(441,108,57,0,0),(480,84,48,0,6)],12),
           bevel("bronze",(0,-49,478),(160,19,22),6,(0,0,-15)),
           # Small arc lens recessed in chest armor; no full-face grille or spokes.
           collar("dark",(0,-58,401),43,30,14),
           ellipsoid("cyan",(0,-65,401),(54,14,56),segments=16,rings=10),
           ellipsoid("ivory",(0,-73,402),(27,5,29),segments=12,rings=8),
           bevel("steel",(-65,-47,406),(60,18,99),9,(0,-12,0)),
           bevel("steel",(65,-47,406),(60,18,99),9,(0,12,0)),
           loft("dark",[(331,19,9,0,-45),(354,37,11,0,-47),(367,32,10,0,-46)],6),
           bevel("steel",(0,61,400),(105,26,116),8)]
    # Three disconnected retaining tabs touch the outer socket, never cross the lens.
    for x,z,angle in ((34,421,-30),(-34,421,30),(0,362,0)):
        torso.append(bevel("bronze",(x,-70,z),(14,7,11),2,(angle,0,0)))
    torso += studs([(x,-54,z) for x in(-76,76) for z in(357,448)],4)
    for sign in(-1,1):
        for z in(346,362,378):torso.append(bevel("dark",(sign*85,-35,z),(28,9,6),2,(0,sign*18,0)))
    parts.append(part("Torso","Pelvis",(0,7,321),torso))
    head=[ellipsoid("dark",(0,5,519),(107,77,73),segments=12,rings=8),
          loft("steel",[(486,35,25,0,-1),(517,52,34,0,1),(546,45,30,0,5),(561,24,19,0,8)],8),
          bevel("dark",(0,-35,519),(86,9,13),3),
          bevel("redglow",(-22,-41,520),(23,3,4),1,(-12,0,0)),
          bevel("redglow",(22,-41,520),(23,3,4),1,(12,0,0)),
          bevel("steel",(-26,-39,535),(44,12,12),3,(-12,0,0)),
          bevel("steel",(26,-39,535),(44,12,12),3,(12,0,0)),
          loft("dark",[(485,24,10,0,-26),(503,34,12,0,-30),(512,27,11,0,-31)],6),
          bevel("steel",(0,-42,506),(12,9,27),3),
          bevel("bronze",(-41,-25,501),(9,10,21),3),
          bevel("bronze",(41,-25,501),(9,10,21),3)]
    for sign in(-1,1):
        head += [cone("steel",(sign*44,5,554),10,2,32,(0,0,sign*-28)),
                 cone("steel",(sign*27,-33,486),6,1,17,(0,0,180))]
    parts.append(part("Head","Torso",(0,6,486),head))
    for sign,suffix in((-1,"L"),(1,"R")):
        x=sign*62
        leg=[ellipsoid("dark",(x,8,266),(71,72,71)),
             loft("rust",[(170,35,32,x,9),(214,42,36,x,7),(275,37,33,x,8)],10),
             bevel("bronze",(x,-31,229),(61,12,65),7),
             bevel("rust",(x,-39,232),(43,6,44),5),
             ellipsoid("dark",(x,4,153),(69,70,61)),
             tube("bronze",(x,-33,153),28,19,8,FRONT),
             ellipsoid("steel",(x,-35,153),(29,8,29),segments=10,rings=6),
             loft("steel",[(41,30,24,x,5),(87,29,27,x,6),(144,27,25,x,7)],10),
             loft("rust",[(45,37,27,x,0),(92,35,29,x,1),(139,27,26,x,2)],8),
             bevel("bronze",(x,-29,91),(49,10,67),6),
             bevel("dark",(x,-14,18),(90,121,36),9),
             loft("rust",[(9,44,57,x,-16),(28,45,54,x,-13),(50,31,38,x,-6)],8),
             bevel("bronze",(x,-70,18),(69,10,25),3)]
        for dx in(-23,0,23):leg.append(bevel("steel",(x+dx,-71,12),(17,14,20),2))
        for dx in(-24,24):
            leg += [tube("bronze",(x+dx,24,114),7,4,89,(0,0,0),8),
                    cone("steel",(x+dx,24,123),4,4,76,segments=8)]
        parts.append(part("Leg_"+suffix,"Pelvis",(x,8,281),leg))
        ax=sign*133
        upper=[ellipsoid("dark",(ax,9,443),(78,81,79)),
               loft("rust",[(421,51,45,ax,4),(470,64,53,ax,6),(510,47,38,ax,9),(525,17,20,ax,12)],12),
               bevel("bronze",(ax,-42,457),(93,13,22),5),
               bevel("bronze",(ax+sign*52,5,459),(10,69,47),4),
               bevel("steel",(ax,5,383),(43,44,81),6),
               ellipsoid("dark",(ax,0,337),(59,59,58))]
        for dz in(-13,13):upper.append(bevel("bronze",(ax,-34,457+dz),(70,7,5),1))
        parts.append(part("UpperArm_"+suffix,"Torso",(sign*105,4,450),upper))
        fore=[loft("steel",[(283,36,32,ax,-5),(331,39,34,ax,-4),(363,28,26,ax,-2)],10),
              loft("rust",[(288,43,35,ax,-5),(330,44,37,ax,-5),(359,29,28,ax,-3)],8),
              bevel("bronze",(ax,-41,328),(66,10,40),5),
              bevel("dark",(ax,-46,328),(45,5,17),2),
              bevel("amber",(ax,-50,328),(27,3,7),1)]
        parts.append(part("Forearm_"+suffix,"UpperArm_"+suffix,(ax,1,337),fore))
        # Five truly hollow tubes: their bore remains empty, not a dark cap.
        cannon=[collar("bronze",(ax,-35,291),48,38,19),
                bevel("dark",(ax,-3,291),(84,68,74),9),
                collar("steel",(ax,-68,291),45,34,11)]
        for i in range(5):
            a=2*pi*i/5+pi/2; bx=ax+24*cos(a); bz=291+24*sin(a)
            cannon += [tube("steel",(bx,-82,bz),13,8.5,80,FRONT,12),
                       tube("bronze",(bx,-121,bz),16,8.5,10,FRONT,12)]
        cannon.append(tube("dark",(ax,-81,291),10,6,83,FRONT,10))
        parts.append(part("Cannon_"+suffix,"Forearm_"+suffix,(ax,-8,303),cannon))
        jetx=sign*73
        jet=[loft("steel",[(324,28,27,jetx,78),(359,33,32,jetx,83),(438,32,32,jetx,83),(473,21,21,jetx,82)],12),
             bevel("rust",(jetx,112,404),(44,15,81),5),
             tube("bronze",(jetx,83,331),29,21,18,(0,0,0)),
             tube("dark",(jetx,83,325),21,14,16,(0,0,0)),
             ellipsoid("amber",(jetx,83,322),(23,23,6),segments=12,rings=5)]
        parts.append(part("Jet_"+suffix,"Torso",(jetx,62,420),jet))
    return dict(name="ForgeColossus",label="Forge Colossus — ancient siege knight",
                category="character",height_cm=615,parts=parts)


def get_assets():
    """Fresh dictionaries each call; safe for native builder and offline inspection."""
    return [detail_enemy(asset) for asset in [rust_crawler(),arc_warden(),forge_colossus()]]


def detail_enemy(asset):
    """Authoring masters: smooth cast shells over an exposed mechanical chassis.

    These are source meshes, not a claim of a measured mobile shipping budget.
    Components remain independently pivoted for animation and future breakage.
    """
    parts={p['id']:p for p in asset['parts']}
    if asset['name']=='ForgeColossus':
        torso=parts['Torso']['shapes']
        # Sloped breast plates flank the inset lens. No wheel, spokes or grille.
        for sign in (-1,1):
            torso += [loft('rust',[(391,25,8,sign*62,-58),(436,35,14,sign*58,-58),(470,28,10,sign*44,-49)],20),
                      bevel('bronze',(sign*66,-68,441),(49,5,8),2,(0,sign*15,sign*9)),
                      bevel('dark',(sign*74,-61,397),(26,5,49),2),
                      bevel('steel',(sign*90,13,401),(11,74,105),3)]
            for z in (382,393,404,415):
                torso.append(bevel('bronze',(sign*75,-65,z),(20,4,3),.8))
            for z in (340,352,364):
                torso.append(bevel('steel',(sign*38,-48,z),(45,9,7),2,(0,sign*12,0)))
            torso += studs([(sign*90,-51,445),(sign*72,-66,430),(sign*39,-65,452)],3.2)
        torso += [tube('steel',(0,7,484),44,31,18,segments=32),
                  tube('bronze',(0,7,493),40,31,6,segments=32)]
        head=parts['Head']['shapes']
        head += [loft('rust',[(527,9,5,0,-34),(554,10,7,0,-23),(586,1,3,0,1)],8),
                 bevel('bronze',(0,-45,503),(8,3,27),1)]
        for sign in (-1,1):
            head += [loft('steel',[(484,8,8,sign*30,-20),(501,14,12,sign*38,-23),(524,11,9,sign*45,-16)],12),
                     tube('bronze',(sign*49,6,520),14,9,10,SIDE,24),
                     ellipsoid('steel',(sign*55,6,520),(6,15,15),segments=24,rings=12)]
            for z in (488,494,500):
                head.append(bevel('dark',(sign*23,-40,z),(17,3,2),.5,(0,sign*12,0)))
        for sign,suffix in ((-1,'L'),(1,'R')):
            ax=sign*133; x=sign*62
            upper=parts['UpperArm_'+suffix]['shapes']
            upper += [loft('bronze',[(443,54,47,ax,4),(452,59,49,ax,4),(461,60,50,ax,5)],28),
                      loft('rust',[(453,56,46,ax,5),(482,62,51,ax,6),(511,44,36,ax,9),(525,16,19,ax,12)],28),
                      tube('steel',(ax+sign*45,8,410),19,12,12,SIDE,28)]
            upper += studs([(ax+dx,-45,472) for dx in (-29,0,29)],3)
            for dx in (-22,22):
                upper += [cone('steel',(ax+dx,0,388),7,7,66,segments=24),
                          tube('bronze',(ax+dx,0,401),11,7.5,28,segments=24)]
            fore=parts['Forearm_'+suffix]['shapes']
            for dx in (-25,25):
                fore += [bevel('bronze',(ax+dx,-40,320),(8,11,56),2),
                         ellipsoid('steel',(ax+dx,-48,341),(7,4,7),segments=16,rings=8)]
            gun=parts['Cannon_'+suffix]['shapes']
            gun += [tube('bronze',(ax,-98,291),47,40,9,FRONT,36)]
            for i in range(10):
                a=i*2*pi/10
                gun.append(bevel('rust',(ax+47*cos(a),-53,291+47*sin(a)),(9,36,9),2))
            leg=parts['Leg_'+suffix]['shapes']
            for z,width in ((207,51),(220,57),(245,55)):
                leg.append(bevel('dark',(x,-39,z),(width,3,3),.6))
            leg += [loft('rust',[(139,19,8,x,-39),(153,30,10,x,-39),(171,22,8,x,-37)],20),
                    bevel('bronze',(x,-37,87),(8,5,64),1.5)]
            leg += studs([(x+dx,-36,z) for dx in (-19,19) for z in (64,114)],2.8)
            for y in (-49,-33,-17):
                leg.append(bevel('dark',(x,y,40),(53,3,3),.7))
            # Raised rocket pods read as real independent weapons in silhouette.
            px=sign*153
            pod=[bevel('dark',(px,42,525),(92,92,107),10),
                 bevel('rust',(px,32,532),(86,79,105),9),
                 bevel('bronze',(px,-13,532),(88,8,99),6),
                 bevel('dark',(px,-19,532),(72,5,85),4)]
            for dx in (-21,21):
                for dz in (-29,0,29):
                    pod += [tube('steel',(px+dx,-25,532+dz),13,9,12,FRONT,24),
                            cone('amber',(px+dx,-28,532+dz),8,3,8,FRONT,20)]
            pod += studs([(px+dx,-19,532+dz) for dx in (-37,37) for dz in (-41,41)],2.7)
            asset['parts'].append(part('RocketPod_'+suffix,'Torso',(px,45,491),pod))
            jet=parts['Jet_'+suffix]['shapes']
            for z in range(357,443,14):
                jet.append(tube('bronze',(sign*73,83,z),33,29,3,segments=28))
        asset['height_cm']=587
    elif asset['name']=='RustCrawler':
        chassis=parts['Chassis']['shapes']
        for sign in (-1,1):
            chassis += [bevel('bronze',(sign*32,-44,76),(5,27,4),1),
                        tube('steel',(sign*27,43,91),10,6,26,segments=20)]
            for y in (-37,5,46):
                parts['Track_'+('L' if sign<0 else 'R')]['shapes'] += [tube('steel',(sign*92,y,39),15,9,4,SIDE,24)]
        turret=parts['Turret']['shapes']
        for x in (-21,-7,7,21):
            turret.append(bevel('dark',(x,34,143),(5,20,3),.7))
        turret += studs([(x,-32,118) for x in (-28,28)],2)
        parts['Cannon']['shapes'] += [tube('bronze',(0,-64,110),22,18,5,FRONT,28)]
    elif asset['name']=='ArcWarden':
        for suffix,sign in (('L',-1),('R',1)):
            parts['Arm_'+suffix]['shapes'] += [tube('bronze',(sign*67,0,211),15,10,9,SIDE,24)]
            for z in (43,54,65):
                parts['Leg_'+suffix]['shapes'].append(bevel('dark',(sign*31,-25,z),(22,3,3),.7))
        for z in (111,131,171,191):
            parts['Shield_R']['shapes'] += [bevel('bronze',(96,-43,z),(57,4,4),1)]
    # Increase curvature resolution only on cast shells; bevel panels stay hard.
    for p in asset['parts']:
        for s in p['shapes']:
            if s['type']=='ellipsoid':
                s['segments']=max(s['segments'],24);s['rings']=max(s['rings'],12)
            elif s['type'] in ('tube','cone'):
                s['segments']=max(s['segments'],24)
            elif s['type']=='loft' and s['segments']>=8:
                s['segments']=max(s['segments'],28)
                source=s['rings']; smooth=[]
                for a,b in zip(source,source[1:]):
                    for i in range(3):
                        t=i/3; q=t*t*(3-2*t)
                        smooth.append([a[0]+(b[0]-a[0])*t]+[a[j]+(b[j]-a[j])*q for j in range(1,5)])
                s['rings']=smooth+[source[-1]]
    return asset


