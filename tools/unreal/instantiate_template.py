"""Create game/SideAssault from Unreal 5.8's C++ Third Person template (all
variants, including Variant_SideScrolling), the way the New Project dialog
does: copy, rename TP_ThirdPerson -> SideAssault in names and code, mount the
shared content packs, and redirect the old script package for the template's
Blueprints.

Run from the repo root: python tools/unreal/instantiate_template.py
"""
import os, re, shutil, sys

ENGINE = r'C:\Program Files\Epic Games\UE_5.8'
TPL = os.path.join(ENGINE, 'Templates', 'TP_ThirdPerson')
RES = os.path.join(ENGINE, 'Templates', 'TemplateResources', 'High')
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
DST = os.path.join(ROOT, 'game', 'SideAssault')
OLD, NEW = 'TP_ThirdPerson', 'SideAssault'
TEXT = ('.cpp', '.h', '.ini', '.cs')
SKIP_FILES = {'TemplateDefs.ini', 'config.ini', 'Manifest.json', 'contents.txt'}


def sub(text):
    text = text.replace(OLD.upper(), NEW.upper()).replace(OLD.lower(), NEW.lower())
    return re.sub(re.escape(OLD), NEW, text, flags=re.I)


def copy_tree(src, dst, rename=True):
    for d, _, files in os.walk(src):
        rel = os.path.relpath(d, src)
        if rel.split(os.sep)[0] in ('Media', 'Binaries', 'Intermediate', 'Saved'):
            continue
        out_dir = os.path.join(dst, sub(rel) if rename else rel)
        os.makedirs(out_dir, exist_ok=True)
        for f in files:
            if f in SKIP_FILES or f.endswith('.uproject') or (f.endswith('.png') and rel == '.'):
                continue
            s = os.path.join(d, f)
            t = os.path.join(out_dir, sub(f) if rename else f)
            if rename and f.endswith(TEXT):
                with open(s, encoding='utf-8-sig') as fh:
                    data = fh.read()
                with open(t, 'w', encoding='utf-8', newline='') as fh:
                    fh.write(sub(data))
            else:
                shutil.copy2(s, t)


def main():
    src_dir = os.path.join(DST, 'Source')
    if os.path.isdir(src_dir):
        shutil.rmtree(src_dir)  # replace the earlier minimal skeleton
    copy_tree(TPL, DST)
    for pack in ('LevelPrototyping', 'Characters', 'Input'):
        copy_tree(os.path.join(RES, pack, 'Content'), os.path.join(DST, 'Content', pack), rename=False)
    eng = os.path.join(DST, 'Config', 'DefaultEngine.ini')
    with open(eng, encoding='utf-8') as fh:
        data = fh.read()
    if '[/Script/Engine.Engine]' not in data or f'/Script/{OLD}' not in data:
        data += (f'\n[/Script/Engine.Engine]\n'
                 f'+ActiveGameNameRedirects=(OldGameName="/Script/{OLD}",NewGameName="/Script/{NEW}")\n'
                 f'+ActiveGameNameRedirects=(OldGameName="{OLD}",NewGameName="/Script/{NEW}")\n')
    with open(eng, 'w', encoding='utf-8', newline='') as fh:
        fh.write(data)
    print('instantiated', DST)


if __name__ == '__main__':
    main()
