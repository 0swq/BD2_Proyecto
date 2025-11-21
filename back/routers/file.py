import json
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
        datos: str = Form(...),
        archivo: UploadFile = File(...),
        token: str = Depends(oauth2_scheme)
):
    try:
        datos = json.loads(datos)
    except Exception as e:
        raise HTTPException(status_code=400, detail="Formato 'datos' inválido")

    tipo = datos.get("tipo")
    contrasena = datos.get("contrasena")

    user_id = decode_token(token)
    extension = Path(archivo.filename).suffix.lstrip(".")
    contenido = await archivo.read()
    tamaño_archivo = len(contenido)

    espacio_info = await obtener_espacio_restante(token)
    espacio_usado = espacio_info["espacio_usado"]
    ESPACIO_MAXIMO = 53687091200

    if espacio_usado + tamaño_archivo > ESPACIO_MAXIMO:
        raise HTTPException(status_code=507, detail="Espacio insuficiente")

    carpeta = "Recursos/temp"
    ruta = os.path.join(carpeta, f"{user_id}_{archivo.filename}")

    with open(ruta, "wb") as f:
        f.write(contenido)

    # Generar UUID ANTES de encriptar
    file_id = str(uuid.uuid4())

    salt = os.urandom(16)
    contraseña_hasheada = hashearContra(contrasena, salt)

    # Pasar el ID al encriptar
    path_final = await encriptar(ruta, contrasena, file_id)

    file = FileEntity(
        ID_File=file_id,  # Usar el mismo ID
        filename=archivo.filename,
        ubicacion=tipo,
        path=path_final.replace("\\", "/") if tipo == "Nube" else None,
        tamano=tamaño_archivo,
        fecha_subida=datetime.now(),
        tipo_medio=extension,
        id_usuario=user_id,
        contrasena_hash=contraseña_hasheada,
        contrasena_salt=salt
    )

    File_service().crear(file)

    if tipo == "Local":
        Log_service().crear(
            Log(
                ID_Log=str(uuid.uuid4()),
                descripcion=f"Se encriptó y descargó '{archivo.filename}' (local)",
                tipo="Creación",
                fecha_hora=datetime.now(),
                id_usuario=user_id
            )
        )

        background_tasks.add_task(eliminar_archivo, path_final)
        nombre_sin_extension = os.path.splitext(archivo.filename)[0]
        nombre_descarga = f"{nombre_sin_extension}.ficure"

        response = FileResponse(path=path_final, media_type="application/octet-stream")
        response.headers["Content-Disposition"] = f'attachment; filename={nombre_descarga}'
        return response
    else:
        Log_service().crear(
            Log(
                ID_Log=str(uuid.uuid4()),
                descripcion=f"Se encriptó y guardó '{archivo.filename}' (nube)",
                tipo="Creación",
                fecha_hora=datetime.now(),
                id_usuario=user_id
            )
        )
        return {"success": True, "message": "Archivo encriptado correctamente"}


@router.post("/desencriptar/local")
async def desencriptar_archivo_local(
        background_tasks: BackgroundTasks,
        datos: str = Form(...),
        archivo: UploadFile = File(...),
        token: str = Depends(oauth2_scheme)
):
    try:
        datos = json.loads(datos)
    except Exception as e:
        raise HTTPException(status_code=400, detail="Formato 'datos' inválido")

    contrasena = datos["contrasena"]
    ID_File = datos["ID_File"]
    user_id = decode_token(token)
    file = File_service().obtener(ID_File)

    if not file:
        raise HTTPException(status_code=404, detail="Archivo no encontrado")

    if file["id_usuario"] != user_id:
        raise HTTPException(status_code=403, detail="No autorizado")

    if not evaluarHash(contrasena, file["contrasena_hash"], file["contrasena_salt"]):
        raise HTTPException(status_code=403, detail="Contraseña incorrecta")

    carpeta = "Recursos/temp"
    os.makedirs(carpeta, exist_ok=True)
    nombre_unico = f"{user_id}_{uuid.uuid4()}_{archivo.filename}"
    ruta_temporal = os.path.join(carpeta, nombre_unico)

    contenido = await archivo.read()
    with open(ruta_temporal, "wb") as f:
        f.write(contenido)

    if not os.path.exists(ruta_temporal):
        raise HTTPException(status_code=500, detail="Error al guardar archivo temporal")

    nombre, extension = os.path.splitext(file["filename"])

    try:
        ruta_desencriptada = await desencriptar(
            path=ruta_temporal,
            contraseña=contrasena,
            extension=extension,
            id_esperado=ID_File  # Validar el UUID
        )
    except ValueError as e:
        if os.path.exists(ruta_temporal):
            os.remove(ruta_temporal)
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        if os.path.exists(ruta_temporal):
            os.remove(ruta_temporal)
        raise HTTPException(status_code=500, detail=f"Error al desencriptar: {str(e)}")

    background_tasks.add_task(eliminar_archivo, ruta_temporal)
    background_tasks.add_task(eliminar_archivo, ruta_desencriptada)

    Log_service().crear(
        Log(
            ID_Log=str(uuid.uuid4()),
            id_usuario=user_id,
            descripcion=f"Desencriptó archivo local {file['filename']}",
            tipo="Solicitud",
            fecha_hora=datetime.now()
        )
    )

    response = FileResponse(
        path=ruta_desencriptada,
        media_type="application/octet-stream"
    )
    response.headers["Content-Disposition"] = f'attachment; filename="{file["filename"]}"'

    return response


@router.post("/desencriptar/nube")
async def desencriptar_archivo_nube(
        background_tasks: BackgroundTasks,
        datos: dict,
        token: str = Depends(oauth2_scheme)
):
    ID_File = datos["ID_File"]
    contrasena = datos["contrasena"]
    user_id = decode_token(token)
    file = File_service().obtener(ID_File)

    if not file:
        raise HTTPException(status_code=404, detail="Archivo no encontrado")

    if file["id_usuario"] != user_id:
        raise HTTPException(status_code=403, detail="No autorizado")

    if not evaluarHash(contrasena, file["contrasena_hash"], file["contrasena_salt"]):
        raise HTTPException(status_code=403, detail="Contraseña incorrecta")

    nombre, extension = os.path.splitext(file["filename"])

    try:
        ruta_desencriptada = await desencriptar(
            path=file["path"],
            contraseña=contrasena,
            extension=extension,
            id_esperado=ID_File  # Validar el UUID
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al desencriptar: {str(e)}")

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
async def eliminar_archivo_endpoint(datos: dict, token: str = Depends(oauth2_scheme)):
    user_id = decode_token(token)

    ID_File = datos.get("ID_File")
    contrasena = datos.get("contrasena")

    if not ID_File:
        raise HTTPException(status_code=400, detail="ID_File es requerido")

    if not contrasena:
        raise HTTPException(status_code=400, detail="Contraseña es requerida")

    file = File_service().obtener(ID_File)

    if not file:
        raise HTTPException(status_code=404, detail="Archivo no encontrado")

    if file["id_usuario"] != user_id:
        raise HTTPException(status_code=403, detail="No tienes permiso para eliminar este archivo")

    if not evaluarHash(contrasena, file["contrasena_hash"], file["contrasena_salt"]):
        raise HTTPException(status_code=403, detail="Contraseña incorrecta")

    if file.get("ubicacion") == "Nube" and file.get("path"):
        try:
            if os.path.exists(file["path"]):
                os.remove(file["path"])
        except Exception as e:
            print(f"Error al eliminar archivo físico: {e}")

    File_service().eliminar(ID_File)

    Log_service().crear(
        Log(
            ID_Log=str(uuid.uuid4()),
            id_usuario=user_id,
            descripcion=f"Se eliminó el archivo {file['filename']}",
            tipo="Eliminar",
            fecha_hora=datetime.now()
        )
    )

    return {"success": True, "message": "Archivo eliminado correctamente"}


@router.post("/listar")
async def obtener_registros_archivos(token: str = Depends(oauth2_scheme)):
    user_id = decode_token(token)
    archivos = File_service().listar_por_ID(user_id)
    temp = []

    for ar in archivos:
        temp.append({
            "ID_File": ar["ID_File"],
            "filename": ar["filename"],
            "ubicacion": ar["ubicacion"],
            "path": ar["path"],
            "tamano": ar["tamano"],
            "fecha_subida": ar["fecha_subida"],
            "tipo_medio": ar["tipo_medio"],
        })

    return {
        "success": True,
        "archivos": temp
    }