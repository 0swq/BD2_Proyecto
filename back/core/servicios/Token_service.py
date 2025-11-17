from fastapi import HTTPException, status
from jose import jwt, JWTError
from datetime import datetime, timedelta

from core.servicios.Usuario_service import Usuario_service

KEY = "12SDADASWDQSCASFQWDSWQ3"
ALGORITMO = "HS256"


def crear_token(user_id: str, expira_en: int = 1):
    payload = {
        "sub": user_id,
        "exp": datetime.utcnow() + timedelta(hours=expira_en)
    }
    token = jwt.encode(payload, KEY, algorithm=ALGORITMO)
    return token


def decode_token(token: str):
    print("Decode")
    try:
        payload = jwt.decode(token, KEY, algorithms=[ALGORITMO])
        print("payload:", payload)
        user_id = payload["sub"]
        print(f"extraido del token:  {user_id}")
        if user_id is not None:
            user_id = str(user_id)
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido o expirado"
            )
        return user_id
    except JWTError:
        print(JWTError)
        return None
