# -*- mode: python ; coding: utf-8 -*-

models_dir = 'C:\\Users\\xuena\\AppData\\Local\\Programs\\Python\\Python39\\Lib\\site-packages\\face_recognition_models\\models'
project_path = 'C:\\Users\\xuena\\OneDrive\\Documents\\GitHub\\P6_Face\\backend'

a = Analysis(
    ['main.py'],
    pathex=[project_path],
    binaries=[],
    datas=[
        ('static', 'static'),
        ('data', 'data'),
        # Face Recognition models
        (f'{models_dir}\\dlib_face_recognition_resnet_model_v1.dat','face_recognition_models/models'),
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
        'PyQt5',
        'PyQt5.QtCore',
        'PyQt5.QtWidgets',
        'PyQt5.QtWebEngineWidgets',
        'PyQt5.QtWebEngineCore',
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
    name='CFace',
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

coll = COLLECT(
    exe,
    a.binaries,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='CFace_Desktop'
)