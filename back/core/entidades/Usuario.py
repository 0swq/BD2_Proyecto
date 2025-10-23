from typing import Optional
from datetime import date, datetime
from pydantic import BaseModel, EmailStr


class Usuario(BaseModel):
    ID_Usuario: int
    nombres: Optional[str] = None
    apellidos: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    foto_perfil: Optional[str] = None
    contraseña_hash: Optional[str] = None
    email: Optional[EmailStr] = None
    fecha_registro: Optional[datetime] = None
    rol: Optional[str] = None
    estado: Optional[str] = None

    def __str__(self):
        return ', '.join(f"{k}: {v}" for k, v in vars(self).items())
