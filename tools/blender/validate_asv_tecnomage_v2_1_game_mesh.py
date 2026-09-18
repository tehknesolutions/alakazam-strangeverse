import bpy

TARGET_MIN = 50000
TARGET_MAX = 65000

objects = [
    o for o in bpy.context.scene.objects
    if o.type == 'MESH' and not o.get("ASV_DO_NOT_EDIT", False)
]

depsgraph = bpy.context.evaluated_depsgraph_get()
triangles = 0
issues = []

for o in objects:
    eo = o.evaluated_get(depsgraph)
    mesh = eo.to_mesh()
    triangles += sum(max(0, len(p.vertices) - 2) for p in mesh.polygons)

    if len(o.data.uv_layers) == 0:
        issues.append(f"{o.name}: missing UV map")

    if len(o.data.materials) == 0:
        issues.append(f"{o.name}: no material assigned")

    eo.to_mesh_clear()

if triangles > TARGET_MAX:
    issues.append(f"LOD0 exceeds triangle budget by {triangles - TARGET_MAX}")
elif triangles < TARGET_MIN and objects:
    issues.append(f"LOD0 is below working target by {TARGET_MIN - triangles}; verify silhouette/detail was not over-reduced")

print("ASV TECNOMAGO V2.1 GAME-MESH QA")
print("Objects:", len(objects))
print("Triangles:", triangles)
print("Target:", TARGET_MIN, "-", TARGET_MAX)

if issues:
    print("ISSUES:")
    for issue in issues:
        print("-", issue)
else:
    print("PASS: geometry / UV / material budget gate")
