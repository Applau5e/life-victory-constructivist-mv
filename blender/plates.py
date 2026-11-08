"""Generate the Blender plates read by the Remotion composition."""

import argparse
import hashlib
import json
import os
from pathlib import Path
import shutil
import struct
import sys

import bpy
from bpy_extras.object_utils import world_to_camera_view
from mathutils import Vector

ROOT = Path(__file__).resolve().parent
MANIFEST = ROOT.parent / "studio/src/blender-plates.json"
OUT = ROOT.parent / "studio/public/blender"
SCENES = ROOT / "scenes"
LAYERS = json.loads(MANIFEST.read_text(encoding="utf-8"))
PRODUCTION_MODELS = {"04_A": "04_A-production", "10_A": "10_A-production"}
SAMPLE_FRAMES = {
    "01_B/production-b4": (1, 24, 60),
    "07_A/crown": (42,),
    "07_A/droplets": (42,),
    "07_A/ripples": (46,),
    "07_B/crown": (42,),
    "07_B/droplets": (42,),
    "07_B/ripples": (46,),
    "10_A/production-brass": (1, 205),
}


def png_ready(path, size):
    try:
        with path.open("rb") as file:
            head = file.read(26)
            file.seek(-12, os.SEEK_END)
            tail = file.read(12)
    except OSError:
        return False
    return (
        len(head) == 26 and head[:8] == b"\x89PNG\r\n\x1a\n"
        and head[16:24] == struct.pack(">II", *size) and head[25] == 6
        and tail == b"\x00\x00\x00\x00IEND\xaeB\x60\x82"
    )


def size_for(camera):
    return (2880, 1620) if camera == "01_Poster" else (1920, 1080)


def plate_path(camera, layer, frame):
    return OUT / f"BL-{camera}" / layer / f"{frame:04d}.png"


def render_border(scene, objects):
    scene.render.use_border = False
    if scene.render.engine != "CYCLES":
        return
    projected = [
        world_to_camera_view(scene, scene.camera, obj.matrix_world @ Vector(corner))
        for obj in objects for corner in obj.bound_box
    ]
    if not projected or any(point.z <= scene.camera.data.clip_start for point in projected):
        return
    x0 = max(0, min(point.x for point in projected) - .01)
    x1 = min(1, max(point.x for point in projected) + .01)
    y0 = max(0, min(point.y for point in projected) - .01)
    y1 = min(1, max(point.y for point in projected) + .01)
    if x1 <= x0 or y1 <= y0 or (x1 - x0) * (y1 - y0) > .90:
        return
    scene.render.use_border = True
    scene.render.use_crop_to_border = False
    scene.render.border_min_x, scene.render.border_max_x = x0, x1
    scene.render.border_min_y, scene.render.border_max_y = y0, y1


def visual_state(scene, objects):
    values = []
    for obj in (scene.camera, *objects):
        values.extend(v for row in obj.matrix_world for v in row)
        if obj.type == "MESH" and obj.data.shape_keys:
            values.extend(key.value for key in obj.data.shape_keys.key_blocks)
    values.extend((scene.camera.data.lens, scene.camera.data.ortho_scale))
    return hashlib.sha256(struct.pack(f"{len(values)}f", *values)).digest()


def open_scene(path):
    bpy.ops.wm.open_mainfile(filepath=str(path), load_ui=False, use_scripts=False)
    missing = [
        item.filepath
        for item in (*bpy.data.images, *bpy.data.fonts, *bpy.data.libraries)
        if getattr(item, "source", None) in (None, "FILE") and item.filepath
        and not getattr(item, "packed_file", None) and item.filepath != "<builtin>"
        and not Path(bpy.path.abspath(item.filepath)).is_file()
    ]
    if missing:
        raise RuntimeError(f"{path.name}: missing resources {missing}")
    return bpy.context.scene


def setup(scene, size, args):
    render = scene.render
    render.resolution_x, render.resolution_y = size
    render.resolution_percentage = 100
    render.image_settings.file_format = "PNG"
    render.image_settings.color_mode = "RGBA"
    render.film_transparent = True
    render.use_border = False
    render.threads_mode = "FIXED"
    render.threads = args.threads
    render.use_persistent_data = True
    if scene.render.engine != "CYCLES":
        return
    if args.device == "CPU":
        scene.cycles.device = "CPU"
        return
    prefs = bpy.context.preferences.addons["cycles"].preferences
    prefs.compute_device_type = args.device
    prefs.refresh_devices()
    if not any(device.type == args.device for device in prefs.devices):
        raise RuntimeError(f"No Cycles {args.device} device is available")
    for device in prefs.devices:
        device.use = device.type == args.device
    scene.cycles.device = "GPU"


def select_layer(scene, camera, layer):
    solids = [obj for obj in scene.objects if obj.type in {"MESH", "CURVE", "FONT"}]
    if layer in {"production", "production-brass", "wallfix"}:
        return [obj for obj in solids if not obj.hide_render]
    if layer == "production-b4":
        for obj in solids:
            obj.hide_render = False
        return solids
    if layer == "wallonly":
        for name in ("Red ram", "Hairline fractures"):
            scene.objects[name].hide_render = True
        return [obj for obj in solids if not obj.hide_render]
    if camera == "02_A":
        ramp = scene.objects["Stage ramp"]
        ramp.location.x, ramp.location.z = (2.45, 1.02) if layer == "ramp" else (6.25, 2.27)
    for obj in solids:
        group = obj.get("layer")
        visible = (
            group == layer
            or (camera in {"01_C", "01_D"} and layer == "tower")
            or (layer == "city_cream" and group == "city")
            or (layer == "bg_s08" and group == "bg" and obj.name != "Black portal right")
        )
        obj.hide_render = not visible
    return [obj for obj in solids if not obj.hide_render]


def render_frame(scene, output, size, border_objects=None):
    output.parent.mkdir(parents=True, exist_ok=True)
    temporary = output.with_name(f".{output.stem}-{os.getpid()}.png")
    if border_objects is not None:
        render_border(scene, border_objects)
    scene.render.filepath = str(temporary)
    try:
        bpy.ops.render.render(write_still=True)
        if not png_ready(temporary, size):
            raise RuntimeError(f"Blender did not produce a complete RGBA PNG for {output.name}")
        os.replace(temporary, output)
    finally:
        temporary.unlink(missing_ok=True)


def cache_identity(directory, model, args):
    directory.mkdir(parents=True, exist_ok=True)
    digest = hashlib.sha256()
    for path in (model, Path(__file__), MANIFEST):
        digest.update(path.read_bytes())
    digest.update(f"{bpy.app.version_string}/{args.device}".encode())
    key = digest.hexdigest()
    stamp = directory / ".source-hash"
    if stamp.is_file() and stamp.read_text(encoding="utf-8") == key:
        return
    if any(directory.glob("[0-9][0-9][0-9][0-9].png")):
        raise RuntimeError(f"Render inputs changed. Move the old generated directory first: {directory}")
    stamp.write_text(key, encoding="utf-8")


def render_camera(camera, args):
    model = SCENES / f"BL-{PRODUCTION_MODELS.get(camera, camera)}.blend"
    size = size_for(camera)
    for layer, count in LAYERS[camera].items():
        output = plate_path(camera, layer, 1).parent
        cache_identity(output, model, args)
        samples = SAMPLE_FRAMES.get(f"{camera}/{layer}", (1,))
        frames = samples if args.sample else range(1, count + 1)
        if all(png_ready(plate_path(camera, layer, frame), size) for frame in frames):
            print(f"READY {camera}/{layer} {len(frames)}", flush=True)
            continue
        scene = open_scene(model)
        setup(scene, size, args)
        visible = select_layer(scene, camera, layer)
        # Preserve independent production renders for the revised Cycles and wall passes.
        reuse = layer not in {"production-b4", "production-brass", "wallfix"}
        border = None if layer in {"production", "production-brass", "wallonly", "wallfix"} else visible
        seen = {}
        for frame in frames:
            path = plate_path(camera, layer, frame)
            scene.frame_set(frame)
            bpy.context.view_layer.update()
            state = visual_state(scene, visible) if reuse else None
            if not png_ready(path, size):
                if state in seen:
                    path.unlink(missing_ok=True)
                    try:
                        os.link(seen[state], path)
                    except OSError:
                        shutil.copyfile(seen[state], path)
                else:
                    render_frame(scene, path, size, border)
            if reuse:
                seen[state] = path
        print(f"READY {camera}/{layer} {len(frames)}", flush=True)


def previews(cameras, args):
    for camera in cameras:
        if camera == "01_Poster":
            continue
        size = (1920, 1080)
        output = OUT / "previews" / f"BL-{camera}.png"
        scene = open_scene(SCENES / f"BL-{camera}.blend")
        setup(scene, size, args)
        frame = 1 if camera.startswith("06_") else 44 if camera.startswith("07_") else (
            scene.frame_end if camera == "01_B" else max(1, scene.frame_end // 2)
        )
        scene.frame_set(frame)
        render_frame(scene, output, size)
        print(f"READY preview/{camera}", flush=True)


def verify(cameras):
    missing = []
    count = 0
    for camera in cameras:
        for layer, length in LAYERS[camera].items():
            for frame in range(1, length + 1):
                path = plate_path(camera, layer, frame)
                if not png_ready(path, size_for(camera)):
                    missing.append(path.relative_to(OUT).as_posix())
                count += 1
    print(f"VERIFIED {count - len(missing)}/{count} PNG headers and terminators", flush=True)
    if missing:
        raise RuntimeError("Missing or invalid plates (first ten): " + ", ".join(missing[:10]))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--sample", action="store_true", help="Render representative frames at full size.")
    mode.add_argument("--previews", action="store_true", help="Render stills for BlenderReview.")
    mode.add_argument("--verify", action="store_true", help="Verify all required plates exist.")
    mode.add_argument("--check-models", action="store_true", help="Open every model and check external file references.")
    parser.add_argument("--camera", action="append", help="Camera ID without BL-, e.g. 01_B. May repeat.")
    parser.add_argument("--threads", type=int, default=6)
    parser.add_argument("--device", choices=("CPU", "CUDA", "OPTIX", "HIP", "ONEAPI", "METAL"), default="CPU")
    args = parser.parse_args(sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else [])
    if args.threads < 1:
        parser.error("--threads must be positive")
    if args.check_models:
        for path in sorted(SCENES.glob("*.blend")):
            open_scene(path)
            print(f"MODEL_OK {path.name}", flush=True)
        return
    cameras = args.camera or (
        [path.stem[3:] for path in sorted(SCENES.glob("BL-*.blend")) if not path.stem.endswith("-production")]
        if args.previews else list(LAYERS)
    )
    if args.previews:
        previews(cameras, args)
        return
    unknown = set(cameras) - LAYERS.keys()
    if unknown:
        parser.error("Unknown production cameras: " + ", ".join(sorted(unknown)))
    if args.verify:
        verify(cameras)
        return
    OUT.mkdir(parents=True, exist_ok=True)
    lock = OUT / ".render-lock"
    with lock.open("x", encoding="utf-8") as file:
        file.write(str(os.getpid()))
    try:
        for camera in cameras:
            render_camera(camera, args)
        if not args.sample:
            verify(cameras)
    finally:
        lock.unlink()


if __name__ == "__main__":
    main()
