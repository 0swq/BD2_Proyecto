import os

from fastapi import APIRouter
from starlette.responses import JSONResponse

from core.entidades.Log import LogSQL, LogNOSQL, Log
from core.entidades.Usuario import UsuarioSQL, UsuarioNOSQL, Usuario
from core.servicios import Token_service
import uuid

from core.servicios.Encriptar_service import hashearContra, evaluarHash
from core.servicios.Log_service import Log_service
from core.servicios.Usuario_service import Usuario_service
from datetime import datetime

router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)


@router.post("/registro")
async def registro(datos: dict):
    try:
        usuario_existente = Usuario_service().verificar_email_existe(datos["email"])
        if usuario_existente:
            return {"success": False, "error": "Email ya registrado"}

        ID_Usuario = str(uuid.uuid4())
        salt = os.urandom(16)
        contrasena_hash = hashearContra(datos["contrasena"], salt)
        rol ="Admin" if len(Usuario_service().listar())==0 else "Usuario"
        # Crear usuario
        usuario = Usuario(
            ID_Usuario=ID_Usuario,
            nombres=datos["nombres"],
            apellidos=datos["apellidos"],
            contrasena_hash=contrasena_hash,
            contrasena_salt=salt,
            email=datos["email"],
            fecha_registro=datetime.now(),
            rol=rol,
            estado="Activo",
            foto_perfil="default.jpeg"
        )
        log = Log(
            ID_Log=str(uuid.uuid4()),
            id_usuario=ID_Usuario,
            descripcion=f"Cuenta creada - ID: {ID_Usuario}",
            tipo="Creación",
            fecha_hora=datetime.now()
        )

        Usuario_service().crear(usuario)
        Log_service().crear(log)
        return {
            "success": True,
            "id_usuario": ID_Usuario
        }
    except KeyError as e:
        return {"success": False, "error": f"Campo faltante: {str(e)}"}
    except Exception as e:
        print(f"Error en registro: {str(e)}")
        import traceback
        print("Error detallado en registro:")
        traceback.print_exc()
        return {"success": False, "error": str(e)}


# routers/auth.py
@router.post("/login")
async def login(datos: dict):
    try:
        usuario = Usuario_service().obtener_por_email(datos["email"])
        if not usuario:
            return {"success": False, "error": "El usuario no existe"}

        if usuario["estado"] != "Activo":
            return {"success": False, "error": "Cuenta suspendida o inactiva"}

        if not evaluarHash(
                datos["contrasena"],
                usuario["contrasena_hash"],
                usuario["contrasena_salt"]
        ):
            log = Log(
                ID_Log=str(uuid.uuid4()),
                id_usuario=usuario["ID_Usuario"],
                descripcion=f"Intento de login fallido - {datos['email']}",
                tipo="Login",
                fecha_hora=datetime.now()
            )
            Log_service().crear(log)

            return {"success": False, "error": "Datos incorrectos"}

        # token
        token = Token_service.crear_token(user_id=usuario["ID_Usuario"])

        log = Log(
            ID_Log=str(uuid.uuid4()),
            id_usuario=usuario["ID_Usuario"],
            descripcion=f"Login exitoso - {datos['email']}",
            tipo="Login",
            fecha_hora=datetime.now()
        )
        Log_service().crear(log)

        return {
            "success": True,
            "token": token
        }

    except KeyError as e:
        return {"success": False, "error": f"Campo requerido: {str(e)}"}
    except Exception as e:
        print(f"Error en login: {str(e)}")
        return {"success": False, "error": "Error al iniciar sesión"}
