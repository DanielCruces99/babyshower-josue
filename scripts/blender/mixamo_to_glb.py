# Junta los FBX de Mixamo de un personaje en un solo GLB con una animación por archivo.
# Lo ejecuta scripts/mixamo-to-glb.mjs:
#   blender -b --factory-startup -P mixamo_to_glb.py -- <carpeta_fbx> <salida.glb>
# El modelo sale del FBX indicado en modelo.txt (dentro de la carpeta) o, si no existe, del más pesado.
# De los demás FBX solo se toma la animación; sus mallas se descartan.
# El nombre de cada clip es el nombre del archivo (Idle.fbx → "Idle").
import os
import sys

import bpy

src_dir, out_path = sys.argv[sys.argv.index('--') + 1:][:2]
fbx_files = sorted(f for f in os.listdir(src_dir) if f.lower().endswith('.fbx'))
if not fbx_files:
    sys.exit(f'No hay .fbx en {src_dir}')
model_txt = os.path.join(src_dir, 'modelo.txt')
if os.path.exists(model_txt):
    with open(model_txt, encoding='utf-8') as f:
        base_file = f.read().strip()
    if base_file not in fbx_files:
        sys.exit(f'modelo.txt apunta a {base_file}, que no está en {src_dir}')
else:
    base_file = max(fbx_files, key=lambda f: os.path.getsize(os.path.join(src_dir, f)))

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.scene.render.fps = 30  # Mixamo exporta a 30 fps


def import_fbx(filename):
    before = set(bpy.data.objects)
    bpy.ops.import_scene.fbx(filepath=os.path.join(src_dir, filename), ignore_leaf_bones=True, automatic_bone_orientation=False)
    objects = [o for o in bpy.data.objects if o not in before]
    armature = next(o for o in objects if o.type == 'ARMATURE')
    action = armature.animation_data.action if armature.animation_data else None
    if action is None:
        sys.exit(f'{filename} no trae animación')
    action.name = os.path.splitext(filename)[0]
    action.use_fake_user = True
    return objects, armature, action


_, armature, base_action = import_fbx(base_file)
actions = [base_action]
for filename in fbx_files:
    if filename == base_file:
        continue
    objects, _, action = import_fbx(filename)
    actions.append(action)
    for obj in objects:
        bpy.data.objects.remove(obj, do_unlink=True)

# Cada acción va en su propia pista NLA; el exportador crea una animación glTF por pista.
armature.animation_data.action = None
for action in actions:
    track = armature.animation_data.nla_tracks.new()
    track.name = action.name
    strip = track.strips.new(action.name, int(action.frame_range[0]), action)
    if hasattr(strip, 'action_slot') and strip.action_slot is None and len(action.slots):
        strip.action_slot = action.slots[0]

os.makedirs(os.path.dirname(out_path), exist_ok=True)
bpy.ops.export_scene.gltf(
    filepath=out_path,
    export_format='GLB',
    export_animation_mode='NLA_TRACKS',
    export_force_sampling=True,
    export_morph=False,
)
summary = ', '.join(f'{a.name} ({(a.frame_range[1] - a.frame_range[0]) / 30:.2f} s)' for a in actions)
print(f'GLB_OK {out_path} · base: {base_file} · clips: {summary}')
