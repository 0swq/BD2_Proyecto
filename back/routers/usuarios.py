import json
import os
import shutil
import tempfile
import uuid
from datetime import datetime
import re
import unicodedata
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.params import Depends
from fastapi.security import OAuth2PasswordBearer
from core.entidades.Datos_biometricos import Datos_Biometricos
from core.entidades.Log import Log
from core.entidades.Usuario import Usuario
from core.servicios.Datos_biometricos_service import Datos_biometricos_service
from core.servicios.Encriptar_service import evaluarHash, hashearContra
from core.servicios.Log_service import Log_service
from core.servicios.Reconocimiento_service import extraer_vector
from core.servicios.Token_service import decode_token
from core.servicios.Usuario_service import Usuario_service

router = APIRouter(
    prefix="/usuarios",
    tags=["usuarios"]
)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")


@router.get("/perfil")
async def perfil(token: str = Depends(oauth2_scheme)):
    user_id = decode_token(token)
    print(user_id)
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado"
        )

    usuario = Usuario_service().obtener(user_id)
    print(f"Usuario encontrado: {usuario}")
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    return {"success": True,
            "usuario": {
                "nombres": usuario["nombres"],
                "apellidos": usuario["apellidos"],
                "foto_perfil": usuario["foto_perfil"],
                "email": usuario["email"],
                "fecha_registro": usuario["fecha_registro"],
                "rol": usuario["rol"],
                "estado": usuario["estado"]}
            }


@router.post("/obtener_registro_biometrico")
def get_registro_biometrico(token: str = Depends(oauth2_scheme)):
    user_id = decode_token(token)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado"
        )

    dato_biometrico = Datos_biometricos_service().listar_por_ID(user_id)
    print(f"Dato biométrico obtenido: {dato_biometrico}")
    print(f"Tipo: {type(dato_biometrico)}")

    # Manejar diferentes tipos de respuesta
    # Si es None o lista vacía, no existe registro
    if not dato_biometrico or (isinstance(dato_biometrico, list) and len(dato_biometrico) == 0):
        return {
            "success": True,
            "existe": False,
            "ultimo_cambio": None
        }

    # Si es una lista con elementos, tomar el primer elemento
    if isinstance(dato_biometrico, list):
        if len(dato_biometrico) > 1:
            print(
                f"⚠️ ADVERTENCIA: Se encontraron {len(dato_biometrico)} registros biométricos para el usuario {user_id}")
        dato_biometrico = dato_biometrico[0]

    # Ahora dato_biometrico debe ser un diccionario
    if not isinstance(dato_biometrico, dict):
        print(f"ERROR: dato_biometrico no es un diccionario: {type(dato_biometrico)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al obtener datos biométricos"
        )

    # Obtener la fecha
    fecha = dato_biometrico.get("ultima_actualizacion")
    if not fecha:
        return {
            "success": True,
            "existe": True,
            "ultimo_cambio": None
        }

    # Convertir fecha a timestamp en milisegundos
    return {
        "success": True,
        "existe": True,
        "ultimo_cambio": int(fecha.timestamp() * 1000)
    }


@router.post("/cambiar_contrasena")
async def cambiar_contraseña(datos: dict, token: str = Depends(oauth2_scheme)):
    contrasena_vieja = datos["contrasena_vieja"]
    contrasena_nueva = datos["contrasena_nueva"]
    user_id = decode_token(token)
    usuario = Usuario_service().obtener(user_id)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    if not evaluarHash(contrasena_vieja, usuario["contrasena_hash"], usuario["contrasena_salt"]):
        raise HTTPException(status_code=400, detail="La contraseña anterior no coincide")
    nuevo_salt = os.urandom(16)
    nuevo_hash = hashearContra(contrasena_nueva, nuevo_salt)
    usuario["contrasena_salt"] = nuevo_salt
    usuario["contrasena_hash"] = nuevo_hash
    actualizado = Usuario_service().modificar(usuario)
    if not actualizado:
        raise HTTPException(status_code=400, detail="Error al actualizar la contraseña")
    return {"success": True, "mensaje": "Contraseña actualizada correctamente"}


@router.post("/cambiar_foto_perfil")
async def cambiar_foto_perfil(archivo: UploadFile = File(...), token: str = Depends(oauth2_scheme)):
    carpeta = "Recursos/fotos_perfil"
    os.makedirs(carpeta, exist_ok=True)
    user_id = decode_token(token)
    usuario = Usuario_service().obtener(user_id)

    filename = archivo.filename
    filename = unicodedata.normalize('NFKD', filename).encode('ascii', 'ignore').decode('ascii')
    filename = re.sub(r'[^\w\s.-]', '', filename).strip().replace(' ', '_')

    foto_anterior_nombre = usuario.get('foto_perfil') if isinstance(usuario, dict) else usuario.foto_perfil

    nombre = f"{user_id}_{filename}"
    ruta_nueva = os.path.join(carpeta, nombre)

    contenido = await archivo.read()
    with open(ruta_nueva, "wb") as f:
        f.write(contenido)

    if isinstance(usuario, dict):
        usuario["foto_perfil"] = nombre
    else:
        usuario.foto_perfil = nombre

    if foto_anterior_nombre and foto_anterior_nombre != "default.jpeg":
        foto_anterior_ruta = os.path.join(carpeta, foto_anterior_nombre)
        if os.path.exists(foto_anterior_ruta):
            try:
                os.remove(foto_anterior_ruta)
            except Exception as e:
                print(f"No se pudo eliminar la foto anterior: {e}")

    try:
        Usuario_service().modificar(usuario)
    except Exception as e:
        if os.path.exists(ruta_nueva):
            os.remove(ruta_nueva)
        raise HTTPException(status_code=500, detail=f"Error al actualizar la base de datos: {e}")

    return {
        "success": True,
        "mensaje": "Foto de perfil actualizada correctamente",
        "ruta": nombre
    }


@router.post("/registrar_biometrico")
async def registrar_biometrico(token: str = Depends(oauth2_scheme), foto: UploadFile = File(...)):
    user_id = decode_token(token)
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido o expirado")

    dato_biometrico_ultimo = Datos_biometricos_service().listar_por_ID(user_id)

    print(f"dato_biometrico_ultimo type: {type(dato_biometrico_ultimo)}")
    print(f"dato_biometrico_ultimo value: {dato_biometrico_ultimo}")
    print(f"dato_biometrico_ultimo bool: {bool(dato_biometrico_ultimo)}")

    extension = foto.filename.split('.')[-1]
    with tempfile.NamedTemporaryFile(delete=False, suffix=f".{extension}") as temp_img:
        shutil.copyfileobj(foto.file, temp_img)
        temp_path = temp_img.name

    vector_lista = extraer_vector(temp_path)
    vector_json = json.dumps(vector_lista)
    if not dato_biometrico_ultimo:
        # Crear nuevo
        nuevo_dato = {
            "ID_Datos_biometricos": str(uuid.uuid4()),
            "vector": vector_json,
            "ultima_actualizacion": datetime.now(),
            "id_usuario": user_id,
        }
        nuevo_dato = Datos_Biometricos(**nuevo_dato)
        Datos_biometricos_service().crear(nuevo_dato)

        tipo = "Creación"
        descripcion = "Nuevo dato biométrico registrado correctamente"

    else:
        # Modificar existente
        print(f"Intentando modificar: {dato_biometrico_ultimo}")  # ← LOG

        dato_biometrico_ultimo["vector"] = vector_json
        dato_biometrico_ultimo["ultima_actualizacion"] = datetime.now()

        resultado_modificacion = Datos_biometricos_service().modificar(dato_biometrico_ultimo)
        print(f"Resultado de modificación: {resultado_modificacion}")  # ← LOG

        tipo = "Modificación"
        descripcion = "Dato biométrico actualizado correctamente"

    # Registrar log
    log = Log(
        ID_Log=str(uuid.uuid4()),
        id_usuario=user_id,
        descripcion=descripcion,
        tipo=tipo,
        fecha_hora=datetime.now()
    )

    Log_service().crear(log)
    os.remove(temp_path)

    return {
        "success": True,
        "mensaje": descripcion,
        "tipo": tipo,
        "fecha": datetime.now().isoformat()
    }


@router.post("/obtener_registro_biometrico")
def get_registro_biometrico(token: str = Depends(oauth2_scheme)):
    user_id = decode_token(token)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado"
        )

    dato_biometrico = Datos_biometricos_service().listar_por_ID(user_id)
    print(f"Dato biométrico obtenido: {dato_biometrico}")
    print(f"Tipo: {type(dato_biometrico)}")

    # Si no existe registro, devolver que no existe
    if not dato_biometrico:
        return {
            "success": True,
            "existe": False,
            "ultimo_cambio": None
        }

    # Si existe, devolver los datos
    fecha = dato_biometrico.get("ultima_actualizacion")
    if not fecha:
        # Si por alguna razón no tiene fecha, devolver None
        return {
            "success": True,
            "existe": True,
            "ultimo_cambio": None
        }

    # Convertir fecha a timestamp en milisegundos
    return {
        "success": True,
        "existe": True,
        "ultimo_cambio": int(fecha.timestamp() * 1000)
    }


@router.post("/log")
def crear_log(datos: dict, token: str = Depends(oauth2_scheme)):
    user_id = decode_token(token)
    log = Log(
        ID_Log=str(uuid.uuid4()),
        id_usuario=user_id,
        descripcion=datos["desc"],
        tipo=datos["tipo"],
        fecha_hora=datetime.now()
    )
    Log_service().crear(log)
    return {"success": True}


@router.put("/actualizar")
def actualizar(datos: dict, token: str = Depends(oauth2_scheme)):
    user_id = decode_token(token)
    user_viejo = Usuario_service().obtener(user_id)
    user_dict = user_viejo.dict() if hasattr(user_viejo, "dict") else user_viejo

    for key, value in datos.items():
        if key in user_dict:
            user_dict[key] = value


    Usuario_service().modificar(user_dict)

    return {"success": True, "mensaje": "Datos actualizados"}
