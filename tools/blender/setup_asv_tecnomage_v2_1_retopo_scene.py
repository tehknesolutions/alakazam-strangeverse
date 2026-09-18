import bpy
from pathlib import Path

# ASV Tecnomago V2.1 — non-destructive retopo scene bootstrap.
# Set SOURCE to the Hunyuan-generated high-poly GLB before running.

SOURCE = Path(r"ASV-tecnomago-model-3D-01.glb")

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

for c in list(bpy.data.collections):
    if c.name != "Collection":
        bpy.data.collections.remove(c)

scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
scene.unit_settings.length_unit = 'METERS'

def ensure_collection(name):
    c = bpy.data.collections.get(name)
    if not c:
        c = bpy.data.collections.new(name)
        scene.collection.children.link(c)
    return c

collections = {
    "hp": ensure_collection("00_HP_SOURCE_LOCKED"),
    "body": ensure_collection("10_LP_BODY"),
    "head": ensure_collection("11_LP_HEAD"),
    "hair": ensure_collection("12_LP_HAIR"),
    "coat": ensure_collection("20_LP_COAT"),
    "gauntlet": ensure_collection("21_LP_GAUNTLET_NEXUS"),
    "legs": ensure_collection("22_LP_LEGS_BOOTS"),
    "detail": ensure_collection("30_LP_TIFERET_DETAILS"),
    "rig": ensure_collection("40_RIG"),
    "export": ensure_collection("90_EXPORT"),
}

bpy.ops.import_scene.gltf(filepath=str(SOURCE.resolve()))

hp_meshes = []
for o in list(scene.objects):
    if o.type != 'MESH':
        continue
    hp_meshes.append(o)
    o.name = "ASV_TECNOMAGO_HP_SOURCE"
    for uc in list(o.users_collection):
        uc.objects.unlink(o)
    collections["hp"].objects.link(o)
    o.hide_select = True
    o["ASV_ROLE"] = "HP_SOURCE_LOCKED"
    o["ASV_SOURCE"] = "Hunyuan3D 2.1"
    o["ASV_DO_NOT_EDIT"] = True
    o.display_type = 'SOLID'

for socket_name in [
    "SOCKET_WEAPON_R",
    "SOCKET_FOCUS_L",
    "SOCKET_CHEST",
    "SOCKET_BACK",
]:
    e = bpy.data.objects.new(socket_name, None)
    e.empty_display_type = 'PLAIN_AXES'
    e.empty_display_size = 0.08
    collections["rig"].objects.link(e)

print(f"ASV V2.1 retopo scene ready. Locked HP meshes: {len(hp_meshes)}")
