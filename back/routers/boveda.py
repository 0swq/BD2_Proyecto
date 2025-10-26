# routers/boveda.py
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.security import OAuth2PasswordBearer
from typing import List
from jose import jwt, JWTError
from datetime import datetime, timedelta

# Router
router = APIRouter(
    prefix="/boveda",
    tags=["Bóveda"]
)

# Seguridad JWT
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
SECRET_KEY = "clave_super_secreta"
ALGORITHM = "HS256"

#Extrae usuario
def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        ID_usuario = payload.get("sub")
        if ID_usuario is None:
            raise HTTPException(status_code=401, detail="Token inválido")
        return ID_usuario
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")

@router.post("/acceder")
def acceder_boveda(foto: UploadFile = File(...), user_id: int = Depends(get_current_user)):
    """
    Simula reconocimiento facial.
    Devuelve True si coincidencia >= 95%
    """
    porcentaje = 96  # aquí pondrías tu lógica real
    if porcentaje >= 95:
        return {"acceso": True, "token_boveda": "token_temporal"}
    else:
        return {"acceso": False, "token_boveda": None}
