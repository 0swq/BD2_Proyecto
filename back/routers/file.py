import os
import uuid
from datetime import datetime
from pathlib import Path

from fastapi import BackgroundTasks, Form, UploadFile, File, Depends, HTTPException, status, APIRouter
from fastapi.responses import FileResponse
from fastapi.security import OAuth2PasswordBearer

from core.entidades.Log import Log
from core.servicios.Encriptar_service import (
    hashearContra,
    encriptar,
    eliminar_archivo,
    evaluarHash,
    desencriptar
)
from core.servicios.File_service import File_service
from core.servicios.Log_service import Log_service
from core.servicios.Token_service import decode_token
from core.servicios.Usuario_service import Usuario_service
from core.entidades.File import File as FileEntity

router = APIRouter(
    prefix="/archivo",
    tags=["archivo"]
)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")


@router.get("/obtener_espacio_restante")
async def obtener_espacio_restante(token: str = Depends(oauth2_scheme)):
    user_id = decode_token(token)
    files = File_service().listar_por_ID(user_id)
    espacio_usado = 0
    for i in files:
        if i["tamano"]:
            espacio_usado += i["tamano"]
    return {"success": True, "espacio_usado": espacio_usado}


@router.post("/encriptar")
async def encriptar_archivo(
        background_tasks: BackgroundTasks,
        tipo: str = Form(...),
        contraseña: str = Form(...),
        archivo: UploadFile = File(...),
        token: str = Depends(oauth2_scheme)
):
    print(tipo, archivo, contraseña)
    carpeta = "Recursos/temp"
    user_id = decode_token(token)
    extension = Path(archivo.filename).suffix.lstrip(".")
    contenido = await archivo.read()
    tamaño_archivo = len(contenido)

    espacio_info = await obtener_espacio_restante(token)
    espacio_usado = espacio_info["espacio_usado"]

    ESPACIO_MAXIMO = 53687091200

    if espacio_usado + tamaño_archivo > ESPACIO_MAXIMO:
        raise HTTPException(
            status_code=507,
            detail=f"Espacio insuficiente."
        )

    ruta = os.path.join(carpeta, f"{user_id}_{archivo.filename}")
    with open(ruta, "wb") as f:
        f.write(contenido)

    salt = os.urandom(16)
    contraseña_hasheada = hashearContra(contraseña, salt)

    path_final = await encriptar(ruta, contraseña)

    file = FileEntity(
        ID_File=str(uuid.uuid4()),
        filename=archivo.filename,
        ubicacion=tipo,
        path=path_final,
        tamano=tamaño_archivo,
        fecha_subida=datetime.now(),
        tipo_medio=extension,
        id_usuario=user_id,
        contrasena_hash=contraseña_hasheada,
        contrasena_salt=salt
    )

    print("Creando file")
    try:
        File_service().crear(file)
    except Exception as e:
        raise e

    if tipo == "Local":
        Log_service().crear(
            Log(
                ID_Log=str(uuid.uuid4()),
                descripcion=f"Se encriptó y descargó el archivo '{archivo.filename}' (local)",
                tipo="Creación",
                fecha_hora=datetime.now(),
                id_usuario=user_id
            )
        )

        background_tasks.add_task(eliminar_archivo, path_final)

        nombre_sin_extension = os.path.splitext(archivo.filename)[0]
        nombre_descarga = f"{nombre_sin_extension}.ficure"

        print(f"Nombre descarga: {nombre_descarga}")

        response = FileResponse(
            path=path_final,
            media_type="application/octet-stream"
        )

        response.headers["Content-Disposition"] = f'attachment; filename={nombre_descarga}'

        print(f"🔹 Header establecido: {response.headers.get('Content-Disposition')}")

        return response
    else:
        Log_service().crear(
            Log(
                ID_Log=str(uuid.uuid4()),
                descripcion=f"Se encriptó y guardó el archivo '{archivo.filename}' en la nube",
                tipo="Creación",
                fecha_hora=datetime.now(),
                id_usuario=user_id
            )
        )
        return {"success": True, "message": "Archivo encriptado correctamente"}


@router.post("/desencriptar/local")
async def desencriptar_archivo_local(background_tasks: BackgroundTasks, contraseña: str = Form(...),
                                     ID_File: str = Form(...), archivo: UploadFile = File(...),
                                     token: str = Depends(oauth2_scheme)):
    user_id = decode_token(token)
    usuario = Usuario_service().obtener(user_id)
    file = File_service().obtener(ID_File)
    if not file:
        raise HTTPException(status_code=404, detail="Archivo no encontrado")

    if not evaluarHash(contraseña, file["contrasena_hash"], file["contrasena_salt"]):
        raise HTTPException(status_code=403, detail="Contraseña incorrecta")

    nombre, extension = os.path.splitext(file["filename"])
    ruta_desencriptada = desencriptar(
        path=file["path"],
        contraseña=contraseña,
        extension=extension
    )

    background_tasks.add_task(eliminar_archivo, ruta_desencriptada)

    Log_service().crear(
        Log(
            ID_Log=str(uuid.uuid4()),
            id_usuario=user_id,
            descripcion=f"Se desencriptó el archivo local {file['filename']}",
            tipo="Solicitud",
            fecha_hora=datetime.now()
        )
    )

    return FileResponse(
        ruta_desencriptada,
        filename=file["filename"],
        media_type="application/octet-stream"
    )


@router.post("/desencriptar/nube")
async def desencriptar_archivo_nube(
        background_tasks: BackgroundTasks,
        contraseña: str = Form(...),
        ID_File: str = Form(...),
        token: str = Depends(oauth2_scheme)
):
    user_id = decode_token(token)
    file = File_service().obtener(ID_File)

    if not file:
        raise HTTPException(status_code=404, detail="Archivo no encontrado")

    if not evaluarHash(contraseña, file["contrasena_hash"], file["contrasena_salt"]):
        raise HTTPException(status_code=403, detail="Contraseña incorrecta")

    nombre, extension = os.path.splitext(file["filename"])
    ruta_desencriptada = await desencriptar(
        path=file["ubicacion"],
        contraseña=contraseña,
        extension=extension
    )

    Log_service().crear(
        Log(
            ID_Log=str(uuid.uuid4()),
            id_usuario=user_id,
            descripcion=f"Se desencriptó el archivo de nube {file['filename']}",
            tipo="Solicitud",
            fecha_hora=datetime.now()
        )
    )

    background_tasks.add_task(eliminar_archivo, ruta_desencriptada)

    return FileResponse(
        ruta_desencriptada,
        filename=file["filename"],
        media_type="application/octet-stream"
    )


@router.delete("/eliminar")
async def eliminar_archivo_endpoint(ID_File: str = Form(...), token: str = Depends(oauth2_scheme)):
    user_id = decode_token(token)
    file = File_service().obtener(ID_File)

    if not file:
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    if file["id_usuario"] != user_id:
        raise HTTPException(
            status_code=403,
            detail="No tienes permiso para eliminar este archivo"
        )

    File_service().eliminar(ID_File)

    Log_service().crear(
        Log(
            ID_Log=str(uuid.uuid4()),
            id_usuario=user_id,
            descripcion=f"Se eliminó el archivo {file['filename']}",
            tipo="Eliminación",
            fecha_hora=datetime.now()
        )
    )

    return {"success": True, "message": "Archivo eliminado correctamente"}


@router.post("/listar")
async def obtener_registros_archivos(token: str = Depends(oauth2_scheme)):
    user_id = decode_token(token)
    archivos = File_service().listar_por_ID(user_id)

    return {
        "success": True,
        "archivos": archivos
    }
