# -*- mode: python ; coding: utf-8 -*-

models_path = 'c:\\users\\xuena\\appdata\\local\\programs\\python\\python39\\lib\\site-packages'

a = Analysis(
    ['main.py'],
    pathex=['C:\\Users\\xuena\\OneDrive\\Documents\\GitHub\\P6_Face\\backend'],
    binaries=[],
    datas=[('static', 'static'), ('data', 'data'), (models_path, 'face_recognition_models/models')],
    hiddenimports=[
        'uvicorn',
        'fastapi',
        'uvicorn.workers',
        'starlette.routing',
        'PIL._imaging',
        'dlib',
        'face_recognition_models'
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
    optimize=0,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.datas,
    [],
    name='main',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
