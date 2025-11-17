import json
import os
import shutil
import tempfile
import uuid
from datetime import datetime

import numpy as np
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, BackgroundTasks
from fastapi.params import Depends
from fastapi.security import OAuth2PasswordBearer

from core.entidades.Datos_biometricos import Datos_Biometricos
from core.servicios import Encriptar_service
from core.servicios.Datos_biometricos_service import Datos_biometricos_service
from core.servicios.Encriptar_service import evaluarHash, hashearContra
from core.servicios.Ingresos_boveda_service import Ingresos_boveda_service
from core.servicios.Reconocimiento_service import comparar, extraer_vector
from core.servicios.Token_service import decode_token
from core.servicios.Usuario_service import Usuario_service
from core.entidades.Ingresos_boveda import Ingreso_Boveda

router = APIRouter(
    prefix="/boveda",
    tags=["boveda"]
)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")


@router.post("/ingresar")
async def ingresar(
        token: str = Depends(oauth2_scheme),
        file: UploadFile = File(...),
):
    user_id = decode_token(token)

    usuario = Usuario_service().obtener(user_id)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp_img:
        shutil.copyfileobj(file.file, temp_img)
        temp_path = temp_img.name

    # Extraer vector
    vector1 = extraer_vector(temp_path)
    datosBio = Datos_biometricos_service().listar_por_ID(user_id)
    datosBio = datosBio[0]
    datosBio = json.loads(datosBio["vector"])
    vector2 = np.array(datosBio)
    aceptacion = comparar(vector1, vector2)

    aceptacion_float = float(aceptacion)
    entro = bool(aceptacion_float >= 20)

    ingreso = Ingreso_Boveda(
        ID_Ingreso_boveda=str(uuid.uuid4()),
        fecha_hora=datetime.now(),
        aceptacion=entro,
        resultado=f"{aceptacion_float:.2f}%",  # ✅ String formateado
        id_usuario=user_id
    )

    Ingresos_boveda_service().crear(ingreso)
    os.remove(temp_path)
    return {
        "success": True,
        "usuario": str(usuario.get("nombres", "Usuario")),
        "similitud": round(aceptacion_float, 2),  # ✅ Redondear a 2 decimales
        "coincide": entro
    }

