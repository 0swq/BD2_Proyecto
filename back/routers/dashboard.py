import os
from datetime import datetime
from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordBearer

from core.servicios.File_service import File_service
from core.servicios.Log_service import Log_service
from core.servicios.Ingresos_boveda_service import Ingresos_boveda_service
from core.servicios.Token_service import decode_token

router = APIRouter(
    prefix="/dashboard",
    tags=["dashboard"]
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")


@router.post("/resumen_mes_lineas")
def resumen_mes_lineas(token: str = Depends(oauth2_scheme)):
    user_id = decode_token(token)
    Logs = Log_service().listar_por_UsuarioID(user_id)

    datetimes = []
    for i in Logs:
        if i["descripcion"].startswith("Se encriptó y"):
            fecha = i.get("fecha_hora")

            # MongoDB devuelve datetime directamente
            if isinstance(fecha, datetime):
                datetimes.append(fecha)
            # Por si acaso viene como string
            elif isinstance(fecha, str):
                try:
                    datetimes.append(datetime.strptime(fecha, "%Y-%m-%d %H:%M:%S"))
                except:
                    pass

    ahora = datetime.now()
    mes_actual = ahora.month
    año_actual = ahora.year

    dias = {}
    for d in datetimes:
        if d.month == mes_actual and d.year == año_actual:
            dia = d.day
            dias[dia] = dias.get(dia, 0) + 1

    dias_ordenados = sorted(dias.items())
    labels = [f"{dia}" for dia, _ in dias_ordenados]
    valores = [cantidad for _, cantidad in dias_ordenados]

    return {"labels": labels, "data": valores}

@router.post("/resumen_tipo_pie")
def resumen_tipo_pie(token: str = Depends(oauth2_scheme)):
    user_id = decode_token(token)
    archivos = File_service().listar_por_ID(user_id)

    resultado = {}
    for i in archivos:
        nombre, extension = os.path.splitext(i["filename"])
        extension = extension.lower() or "sin_extension"
        resultado[extension] = resultado.get(extension, 0) + 1

    return resultado


@router.post("/log_general")
def obtener_logs(token: str = Depends(oauth2_scheme)):
    user_id = decode_token(token)
    logs = Log_service().listar_por_UsuarioID(user_id)
    real = []
    for i in logs:
        real.append({
            "ID_Log": i["ID_Log"],
            "descripcion": i["descripcion"],
            "tipo": i["tipo"],
            "fecha_hora": i["fecha_hora"],
        })

    return {"success": True, "logs": real}


@router.post("/log_especifico")
def obtener_logs_especificos(id_solicitado: str, token: str = Depends(oauth2_scheme)):
    logs = Log_service().listar_por_UsuarioID(id_solicitado)
    real = []
    for i in logs:
        real.append({
            "ID_Log": i["ID_Log"],
            "descripcion": i["descripcion"],
            "tipo": i["tipo"],
            "fecha_hora": i["fecha_hora"],
        })

    return {"success": True, "logs": real}


@router.post("/log_ingresos_boveda")
def obtener_logs_ingresos(token: str = Depends(oauth2_scheme)):
    user_id = decode_token(token)
    validos = []
    ingresos = Ingresos_boveda_service().listar_por_ID(user_id)
    for i in ingresos:
        validos.append({
            "ID_Ingreso_boveda":i["ID_Ingreso_boveda"],
            "fecha_hora": i["fecha_hora"],
            "aceptacion":i["aceptacion"],
            "resultado":i["resultado"]
        })
    return {"success": True, "ingresos": validos}

@router.post("/espacio_usado")
def obtener_espacio_usado(token: str = Depends(oauth2_scheme)):
    user_id = decode_token(token)
    total = 0
    file = File_service().listar_por_ID(user_id)
    for i in file:
        if i["ubicacion"].lower()=="nube":
            total = total + i["tamano"]
    return {"success": True, "total": total}
