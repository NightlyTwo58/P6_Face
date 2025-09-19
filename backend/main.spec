# -*- mode: python ; coding: utf-8 -*-

models_path = 'c:\\users\\xuena\\appdata\\local\\programs\\python\\python39\\lib\\site-packages'
models_dir = 'C:\\Users\\xuena\\AppData\\Local\\Programs\\Python\\Python39\\Lib\\site-packages\\face_recognition_models\\models'

a = Analysis(
    ['run.py'],
    pathex=['C:\\Users\\xuena\\OneDrive\\Documents\\GitHub\\P6_Face\\backend'],
    binaries=[],
    datas=[('static', 'static'), ('data', 'data'), (f'{models_dir}\\dlib_face_recognition_resnet_model_v1.dat','face_recognition_models/models'),
        (f'{models_dir}\\shape_predictor_5_face_landmarks.dat', 'face_recognition_models/models'),
        (f'{models_dir}\\shape_predictor_68_face_landmarks.dat', 'face_recognition_models/models'),
        (f'{models_dir}\\mmod_human_face_detector.dat', 'face_recognition_models/models')
    ],
    hiddenimports=[
        'uvicorn',
        'fastapi',
        'uvicorn.workers',
        'starlette.routing',
        'PIL._imaging',
        'dlib',
        'face_recognition_models',
        'main'
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
