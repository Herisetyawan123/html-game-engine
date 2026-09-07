import os
import re
import shutil

# Root folder = lokasi script
ROOT_FOLDER = os.path.dirname(os.path.abspath(__file__))


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


def unique_path(path):
    """Buat path unik jika sudah ada."""
    folder = os.path.dirname(path)
    filename = os.path.basename(path)

    name, ext = os.path.splitext(filename)

    counter = 1
    new_path = path

    while os.path.exists(new_path):
        new_path = os.path.join(folder, f"{name}_{counter}{ext}")
        counter += 1

    return new_path


print(f"Root Folder : {ROOT_FOLDER}")

# ======================================================
# STEP 1 - Pindahkan PNG dari folder PNG
# ======================================================

for root, dirs, files in os.walk(ROOT_FOLDER, topdown=False):
    for d in dirs:
        if d.lower() == "png":
            png_folder = os.path.join(root, d)

            for item in os.listdir(png_folder):
                source = os.path.join(png_folder, item)

                if os.path.isfile(source) and item.lower().endswith(".png"):
                    dest = os.path.join(root, item)
                    dest = unique_path(dest)

                    shutil.move(source, dest)
                    print(f"[MOVE] {source} -> {dest}")

            try:
                os.rmdir(png_folder)
                print(f"[DELETE] {png_folder}")
            except OSError:
                print(f"[SKIP] Folder tidak kosong: {png_folder}")

# ======================================================
# STEP 2 - Rename semua file PNG
# ======================================================

for root, dirs, files in os.walk(ROOT_FOLDER):

    for file in files:
        if file.lower().endswith(".png"):

            old_path = os.path.join(root, file)

            name, ext = os.path.splitext(file)

            new_name = snake_case(name) + ext.lower()

            if new_name != file:

                new_path = os.path.join(root, new_name)
                new_path = unique_path(new_path)

                os.rename(old_path, new_path)

                print(f"[FILE ] {file} -> {os.path.basename(new_path)}")

# ======================================================
# STEP 3 - Rename semua folder
# ======================================================

for root, dirs, files in os.walk(ROOT_FOLDER, topdown=False):

    for d in dirs:

        old_path = os.path.join(root, d)

        new_name = snake_case(d)

        if new_name != d:

            new_path = os.path.join(root, new_name)
            new_path = unique_path(new_path)

            os.rename(old_path, new_path)

            print(f"[DIR  ] {d} -> {os.path.basename(new_path)}")

print("\nSelesai.")
