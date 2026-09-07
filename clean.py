import os
import re

# Folder tempat file script ini berada
ROOT_FOLDER = os.path.dirname(os.path.abspath(__file__))
ASSETS_FOLDER = os.path.join(ROOT_FOLDER, "assets")

# Folder media yang dibersihkan (hanya yang ada saja yang diproses)
TARGET_NAMES = ["audios", "images", "videos", "video", "audio"]

# Ekstensi yang dipertahankan
IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".ico", ".svg", ".avif", ".apng"}
VIDEO_EXTS = {".mp4", ".webm", ".ogv", ".mov", ".avi", ".mkv", ".m4v"}
AUDIO_EXTS = {".mp3", ".wav", ".ogg", ".oga", ".m4a", ".aac", ".flac", ".opus"}
ALLOWED_EXTS = IMAGE_EXTS | VIDEO_EXTS | AUDIO_EXTS


def snake_case(name):
    """Ubah nama menjadi snake_case."""
    name = name.strip()
    # Ganti semua karakter non-alphanumeric menjadi _
    name = re.sub(r'[^a-zA-Z0-9]+', '_', name)
    # Hilangkan _ berlebih
    name = re.sub(r'_+', '_', name)
    # Hilangkan _ di awal/akhir
    name = name.strip('_')
    return name.lower()


def unique_file_path(path):
    """Buat path file unik jika sudah ada (pertahankan ekstensi)."""
    folder = os.path.dirname(path)
    filename = os.path.basename(path)
    name, ext = os.path.splitext(filename)

    counter = 1
    new_path = path
    while os.path.exists(new_path):
        new_path = os.path.join(folder, f"{name}_{counter}{ext}")
        counter += 1
    return new_path


def unique_dir_path(path):
    """Buat path folder unik jika sudah ada."""
    counter = 1
    new_path = path
    while os.path.exists(new_path):
        new_path = f"{path}_{counter}"
        counter += 1
    return new_path


def get_target_dirs():
    """Kembalikan daftar folder media yang ada di dalam assets."""
    targets = []
    for name in TARGET_NAMES:
        p = os.path.join(ASSETS_FOLDER, name)
        if os.path.isdir(p):
            targets.append(p)
    return targets


print(f"Root Folder  : {ROOT_FOLDER}")
print(f"Assets Folder: {ASSETS_FOLDER}")

if not os.path.isdir(ASSETS_FOLDER):
    print("[ERROR] Folder assets tidak ditemukan. Batal.")
    raise SystemExit(1)

target_dirs = get_target_dirs()
if not target_dirs:
    print(f"[SKIP] Tidak ada folder {TARGET_NAMES} di dalam assets.")
else:
    print(f"Target: {', '.join(os.path.basename(d) for d in target_dirs)}")

renamed = 0
deleted = 0
kept = 0

# ======================================================
# STEP 1 - Rename folder bukan snake_case jadi snake_case
# (khusus di dalam assets/audios, assets/images, dst.)
# ======================================================

for target in target_dirs:
    for root, dirs, files in os.walk(target, topdown=False):
        for d in dirs:
            new_name = snake_case(d)
            if new_name == d or not new_name:
                continue

            old_path = os.path.join(root, d)
            new_path = os.path.join(root, new_name)
            if os.path.exists(new_path):
                new_path = unique_dir_path(new_path)

            try:
                os.rename(old_path, new_path)
                renamed += 1
                print(f"[DIR  ] {old_path} -> {new_path}")
            except Exception as e:
                print(f"[ERROR] {e}")

# ======================================================
# STEP 2 - Hapus file selain gambar, video, dan audio
# (hanya di dalam folder media, css/js tidak disentuh)
# ======================================================

for target in target_dirs:
    for root, dirs, files in os.walk(target):
        for file in files:
            _, ext = os.path.splitext(file)
            file_path = os.path.join(root, file)
            if ext.lower() in ALLOWED_EXTS:
                kept += 1
                continue
            try:
                os.remove(file_path)
                deleted += 1
                print(f"[FILE] Dihapus: {file_path}")
            except Exception as e:
                print(f"[ERROR] {e}")

print(f"\nSelesai. Folder di-rename: {renamed}, file dihapus: {deleted}, file dipertahankan: {kept}.")
